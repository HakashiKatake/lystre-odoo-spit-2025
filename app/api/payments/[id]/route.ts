import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payments/[id] - Get payment details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                customerInvoice: {
                    include: {
                        customer: true,
                        order: true,
                    },
                },
                vendorBill: {
                    include: {
                        vendor: true,
                    },
                },
            },
        })

        if (!payment) {
            return NextResponse.json(
                { success: false, message: 'Payment not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: payment,
        })
    } catch (error) {
        console.error('Payment fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch payment' },
            { status: 500 }
        )
    }
}

// DELETE /api/payments/[id] - Delete payment (and revert invoice/bill status)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                customerInvoice: true,
                vendorBill: true,
            },
        })

        if (!payment) {
            return NextResponse.json(
                { success: false, message: 'Payment not found' },
                { status: 404 }
            )
        }

        await prisma.$transaction(async (tx) => {
            // Revert invoice status if linked
            if (payment.customerInvoiceId && payment.customerInvoice) {
                const newPaidAmount = Math.max(0, payment.customerInvoice.paidAmount - payment.amount)
                const status =
                    newPaidAmount >= payment.customerInvoice.totalAmount ? 'PAID' :
                        newPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'

                await tx.customerInvoice.update({
                    where: { id: payment.customerInvoiceId },
                    data: {
                        paidAmount: newPaidAmount,
                        status,
                        paidOn: status === 'PAID' ? payment.customerInvoice.paidOn : null,
                    },
                })
            }

            // Revert bill status if linked
            if (payment.vendorBillId && payment.vendorBill) {
                const newPaidAmount = Math.max(0, payment.vendorBill.paidAmount - payment.amount)
                const status =
                    newPaidAmount >= payment.vendorBill.totalAmount ? 'PAID' :
                        newPaidAmount > 0 ? 'PARTIAL' : 'UNPAID'

                await tx.vendorBill.update({
                    where: { id: payment.vendorBillId },
                    data: {
                        paidAmount: newPaidAmount,
                        status,
                    },
                })
            }

            // Delete the payment
            await tx.payment.delete({
                where: { id },
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Payment deleted successfully',
        })
    } catch (error) {
        console.error('Payment delete error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to delete payment' },
            { status: 500 }
        )
    }
}
