import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invoices/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const invoice = await prisma.customerInvoice.findUnique({
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

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: 'Invoice not found' },
                { status: 404 }
            )
        }

        // Calculate amount paid from payments
        const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)

        // Get values from order since invoice might not have them directly
        const subtotal = invoice.order?.subtotal || invoice.totalAmount || 0
        const taxAmount = invoice.order?.taxAmount || 0
        const totalAmount = invoice.order?.totalAmount || invoice.totalAmount || subtotal + taxAmount
        const amountDue = totalAmount - amountPaid

        // Get items from order lines
        const items = invoice.order?.lines?.map(line => ({
            id: line.id,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxPercent: line.tax || 10,
            totalPrice: line.total || (line.quantity * line.unitPrice),
            product: line.product
        })) || []

        // Transform to expected format
        const formattedInvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            totalAmount,
            amountPaid,
            amountDue,
            status: amountPaid >= totalAmount ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'OPEN',
            taxAmount,
            subtotal,
            paidOn: invoice.paidOn,
            customer: {
                name: invoice.customer.name,
                email: invoice.customer.email,
                address: invoice.customer.street,
                city: invoice.customer.city,
                state: invoice.customer.state,
                pincode: invoice.customer.pincode,
            },
            order: invoice.order ? {
                id: invoice.order.id,
                orderNumber: invoice.order.orderNumber,
            } : null,
            items,
            paymentTerm: invoice.order?.paymentTerm,
        }

        return NextResponse.json({ success: true, data: formattedInvoice })
    } catch (error) {
        console.error('Invoice fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch invoice' },
            { status: 500 }
        )
    }
}
