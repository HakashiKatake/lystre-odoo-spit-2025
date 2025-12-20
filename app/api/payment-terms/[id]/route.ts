import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentTermSchema } from '@/lib/validators'

// GET /api/payment-terms/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const paymentTerm = await prisma.paymentTerm.findUnique({
            where: { id },
        })

        if (!paymentTerm) {
            return NextResponse.json(
                { success: false, message: 'Payment term not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: paymentTerm })
    } catch (error) {
        console.error('Payment term fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch payment term' },
            { status: 500 }
        )
    }
}

// PUT /api/payment-terms/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const paymentTerm = await prisma.paymentTerm.update({
            where: { id },
            data: {
                name: body.name,
                earlyPaymentDiscount: body.earlyPaymentDiscount || false,
                discountPercentage: body.earlyPaymentDiscount ? body.discountPercentage : null,
                discountDays: body.earlyPaymentDiscount ? body.discountDays : null,
                discountComputation: body.discountComputation || null,
                active: body.active,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Payment term updated successfully',
            data: paymentTerm,
        })
    } catch (error) {
        console.error('Payment term update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update payment term' },
            { status: 500 }
        )
    }
}

// DELETE /api/payment-terms/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if used in any orders
        const usedInOrders = await prisma.saleOrder.count({
            where: { paymentTermId: id },
        })

        if (usedInOrders > 0) {
            return NextResponse.json(
                { success: false, message: 'Cannot delete payment term that is used in orders' },
                { status: 400 }
            )
        }

        await prisma.paymentTerm.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: 'Payment term deleted successfully',
        })
    } catch (error) {
        console.error('Payment term deletion error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to delete payment term' },
            { status: 500 }
        )
    }
}
