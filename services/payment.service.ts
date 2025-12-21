import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import type { PaymentInput } from '@/lib/validators'
import { triggerN8NWebhook } from '@/lib/n8n-webhook'

// ============== CUSTOMER INVOICE SERVICE ==============

export async function createCustomerInvoice(saleOrderId: string) {
    const order = await prisma.saleOrder.findUnique({
        where: { id: saleOrderId },
        include: { paymentTerm: true, invoice: true },
    })

    if (!order) throw new Error('Sale order not found')
    if (order.status === 'DRAFT') throw new Error('Order must be confirmed first')
    if (order.invoice) throw new Error('Invoice already exists for this order')

    // Calculate due date based on payment term
    const dueDate = new Date()
    if (order.paymentTerm?.name) {
        const days = parseInt(order.paymentTerm.name) || 0
        dueDate.setDate(dueDate.getDate() + days)
    }

    const invoice = await prisma.customerInvoice.create({
        data: {
            invoiceNumber: generateOrderNumber('INV'),
            orderId: saleOrderId,
            customerId: order.customerId,
            dueDate,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            totalAmount: order.totalAmount,
        },
        include: {
            customer: true,
            order: { include: { lines: { include: { product: true } } } },
        },
    })

    if (invoice) {
        await triggerN8NWebhook({
            trigger_type: 'invoice_generated',
            customer_name: invoice.customer.name,
            customer_email: [invoice.customer.email],
            order_id: invoice.order.orderNumber,
            payment_status: invoice.status,
            order_total: invoice.totalAmount,
            invoice_link: `https://lystre.com/invoice/${invoice.id}.pdf`,
            year: new Date().getFullYear(),
        })
    }

    return invoice
}

export async function getCustomerInvoice(id: string) {
    return prisma.customerInvoice.findUnique({
        where: { id },
        include: {
            customer: true,
            order: {
                include: {
                    lines: { include: { product: true } },
                    paymentTerm: true,
                },
            },
            payments: true,
        },
    })
}

// ============== VENDOR BILL SERVICE ==============

export async function createVendorBill(purchaseOrderId: string, dueDate: Date) {
    const order = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { bill: true },
    })

    if (!order) throw new Error('Purchase order not found')
    if (order.status === 'DRAFT') throw new Error('Order must be confirmed first')
    if (order.bill) throw new Error('Bill already exists for this order')

    const bill = await prisma.vendorBill.create({
        data: {
            billNumber: generateOrderNumber('BILL'),
            orderId: purchaseOrderId,
            vendorId: order.vendorId,
            dueDate,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            totalAmount: order.totalAmount,
        },
        include: {
            vendor: true,
            order: { include: { lines: { include: { product: true } } } },
        },
    })

    return bill
}

export async function getVendorBill(id: string) {
    return prisma.vendorBill.findUnique({
        where: { id },
        include: {
            vendor: true,
            order: { include: { lines: { include: { product: true } } } },
            payments: true,
        },
    })
}

// ============== PAYMENT SERVICE ==============

export async function registerPayment(data: PaymentInput) {
    // Start a transaction
    const payment = await prisma.$transaction(async (tx) => {
        // Create payment record
        const newPayment = await tx.payment.create({
            data: {
                amount: data.amount,
                method: data.method,
                paymentType: data.paymentType,
                partnerType: data.partnerType,
                date: new Date(data.date),
                note: data.note,
                customerInvoiceId: data.customerInvoiceId,
                vendorBillId: data.vendorBillId,
            },
        })

        // Update invoice/bill status
        if (data.customerInvoiceId) {
            const invoice = await tx.customerInvoice.findUnique({
                where: { id: data.customerInvoiceId },
            })

            if (!invoice) throw new Error('Invoice not found')

            const newPaidAmount = invoice.paidAmount + data.amount
            const status =
                newPaidAmount >= invoice.totalAmount
                    ? 'PAID'
                    : newPaidAmount > 0
                        ? 'PARTIAL'
                        : 'UNPAID'

            await tx.customerInvoice.update({
                where: { id: data.customerInvoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status,
                    paidOn: status === 'PAID' ? new Date() : null,
                },
            })

            // If fully paid, update sale order status
            if (status === 'PAID') {
                await tx.saleOrder.update({
                    where: { id: invoice.orderId },
                    data: { status: 'PAID' },
                })
            }
        }

        if (data.vendorBillId) {
            const bill = await tx.vendorBill.findUnique({
                where: { id: data.vendorBillId },
            })

            if (!bill) throw new Error('Bill not found')

            const newPaidAmount = bill.paidAmount + data.amount
            const status =
                newPaidAmount >= bill.totalAmount
                    ? 'PAID'
                    : newPaidAmount > 0
                        ? 'PARTIAL'
                        : 'UNPAID'

            await tx.vendorBill.update({
                where: { id: data.vendorBillId },
                data: {
                    paidAmount: newPaidAmount,
                    status,
                    paidOn: status === 'PAID' ? new Date() : null,
                },
            })

            // If fully paid, update purchase order status
            if (status === 'PAID') {
                await tx.purchaseOrder.update({
                    where: { id: bill.orderId },
                    data: { status: 'PAID' },
                })
            }
        }

        return newPayment
    })

    // Trigger webhook for payment
    if (payment && payment.customerInvoiceId) {
        // Fetch invoice to get details for webhook
        const invoice = await prisma.customerInvoice.findUnique({
            where: { id: payment.customerInvoiceId },
            include: { customer: true, order: true },
        })

        if (invoice) {
            await triggerN8NWebhook({
                trigger_type: 'payment_received',
                customer_name: invoice.customer.name,
                customer_email: [invoice.customer.email],
                order_id: invoice.order.orderNumber,
                order_total: payment.amount, // Amount paid in this transaction
                year: new Date().getFullYear(),
            })
        }
    }

    return payment
}

// ============== EARLY PAYMENT DISCOUNT ==============

export function calculateEarlyPaymentDiscount(
    invoice: {
        invoiceDate: Date
        totalAmount: number
        subtotal: number
    },
    paymentTerm: {
        earlyPaymentDiscount: boolean
        discountPercentage: number | null
        discountDays: number | null
        discountComputation: string | null
    } | null,
    paymentDate: Date
): { eligible: boolean; discountAmount: number; finalAmount: number } {
    if (!paymentTerm || !paymentTerm.earlyPaymentDiscount) {
        return { eligible: false, discountAmount: 0, finalAmount: invoice.totalAmount }
    }

    const daysSinceInvoice = Math.floor(
        (paymentDate.getTime() - invoice.invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceInvoice <= (paymentTerm.discountDays || 0)) {
        const baseAmount =
            paymentTerm.discountComputation === 'total_amount'
                ? invoice.totalAmount
                : invoice.subtotal

        const discountAmount = (baseAmount * (paymentTerm.discountPercentage || 0)) / 100
        const finalAmount = invoice.totalAmount - discountAmount

        return { eligible: true, discountAmount, finalAmount }
    }

    return { eligible: false, discountAmount: 0, finalAmount: invoice.totalAmount }
}

// ============== PAYMENT STATS ==============

export async function getPaymentStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [customerPayments, vendorPayments] = await Promise.all([
        prisma.payment.aggregate({
            where: {
                partnerType: 'customer',
                createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
            _count: true,
        }),
        prisma.payment.aggregate({
            where: {
                partnerType: 'vendor',
                createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
            _count: true,
        }),
    ])

    return {
        customerPayments: {
            amount: customerPayments._sum.amount || 0,
            count: customerPayments._count,
        },
        vendorPayments: {
            amount: vendorPayments._sum.amount || 0,
            count: vendorPayments._count,
        },
    }
}
