import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validators'
import { getPaginationParams } from '@/lib/utils'
import { triggerN8NWebhook } from '@/lib/n8n-webhook'

// GET /api/payments
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        const where: Record<string, unknown> = {}
        const partnerType = searchParams.get('partnerType')
        if (partnerType) where.partnerType = partnerType

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customerInvoice: { include: { customer: true } },
                    vendorBill: { include: { vendor: true } },
                },
            }),
            prisma.payment.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: payments,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Payments fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch payments' },
            { status: 500 }
        )
    }
}

// POST /api/payments - Register payment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = paymentSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { amount, method, paymentType, partnerType, date, note, customerInvoiceId, vendorBillId } = validation.data

        // Validate invoice/bill exists if provided
        let validatedInvoiceId = null
        let validatedBillId = null

        if (customerInvoiceId) {
            // Try to find by ID first, then by invoice number
            let invoice = await prisma.customerInvoice.findUnique({
                where: { id: customerInvoiceId },
            })
            if (!invoice) {
                // Try to find by invoice number
                invoice = await prisma.customerInvoice.findFirst({
                    where: { invoiceNumber: customerInvoiceId },
                })
            }
            if (!invoice) {
                return NextResponse.json(
                    { success: false, message: 'Invoice not found. Please enter a valid invoice ID or invoice number.' },
                    { status: 400 }
                )
            }
            validatedInvoiceId = invoice.id
        }

        if (vendorBillId) {
            // Try to find by ID first, then by bill number
            let bill = await prisma.vendorBill.findUnique({
                where: { id: vendorBillId },
            })
            if (!bill) {
                // Try to find by bill number
                bill = await prisma.vendorBill.findFirst({
                    where: { billNumber: vendorBillId },
                })
            }
            if (!bill) {
                return NextResponse.json(
                    { success: false, message: 'Vendor bill not found. Please enter a valid bill ID or bill number.' },
                    { status: 400 }
                )
            }
            validatedBillId = bill.id
        }

        const payment = await prisma.$transaction(async (tx) => {
            const newPayment = await tx.payment.create({
                data: {
                    amount,
                    method,
                    paymentType,
                    partnerType,
                    date: new Date(date),
                    note: note || null,
                    customerInvoiceId: validatedInvoiceId,
                    vendorBillId: validatedBillId,
                },
            })

            // Update invoice/bill status
            if (validatedInvoiceId) {
                const invoice = await tx.customerInvoice.findUnique({
                    where: { id: validatedInvoiceId },
                })

                if (invoice) {
                    const newPaidAmount = invoice.paidAmount + amount
                    const status =
                        newPaidAmount >= invoice.totalAmount ? 'PAID' :
                            newPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'

                    await tx.customerInvoice.update({
                        where: { id: validatedInvoiceId },
                        data: {
                            paidAmount: newPaidAmount,
                            status,
                            paidOn: status === 'PAID' ? new Date() : null,
                        },
                    })

                    if (status === 'PAID') {
                        await tx.saleOrder.update({
                            where: { id: invoice.orderId },
                            data: { status: 'PAID' },
                        })
                    }
                }
            }

            if (validatedBillId) {
                const bill = await tx.vendorBill.findUnique({
                    where: { id: validatedBillId },
                })

                if (bill) {
                    const newPaidAmount = bill.paidAmount + amount
                    const status =
                        newPaidAmount >= bill.totalAmount ? 'PAID' :
                            newPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'

                    await tx.vendorBill.update({
                        where: { id: validatedBillId },
                        data: {
                            paidAmount: newPaidAmount,
                            status,
                            paidOn: status === 'PAID' ? new Date() : null,
                        },
                    })

                    if (status === 'PAID') {
                        await tx.purchaseOrder.update({
                            where: { id: bill.orderId },
                            data: { status: 'PAID' },
                        })
                    }
                }
            }

            return newPayment
        })

        // Trigger webhook
        // Trigger webhook
        if (payment.customerInvoiceId) {
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
                    order_total: payment.amount,
                    year: new Date().getFullYear(),
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Payment registered successfully',
            data: payment,
        }, { status: 201 })
    } catch (error) {
        console.error('Payment registration error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to register payment' },
            { status: 500 }
        )
    }
}

