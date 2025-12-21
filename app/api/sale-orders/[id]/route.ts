import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { triggerN8NWebhook } from '@/lib/n8n-webhook'

// GET /api/sale-orders/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const order = await prisma.saleOrder.findUnique({
            where: { id },
            include: {
                customer: true,
                paymentTerm: true,
                lines: { include: { product: true } },
                invoice: true,
            },
        })

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: order })
    } catch (error) {
        console.error('Sale order fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order' },
            { status: 500 }
        )
    }
}

// POST /api/sale-orders/[id]/confirm
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const order = await prisma.saleOrder.findUnique({
            where: { id },
            include: { lines: true, customer: true },
        })

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            )
        }

        if (order.status !== 'DRAFT') {
            return NextResponse.json(
                { success: false, message: 'Order is not in draft status' },
                { status: 400 }
            )
        }

        // Check stock availability
        for (const line of order.lines) {
            const product = await prisma.product.findUnique({
                where: { id: line.productId },
            })
            if (!product || product.stock < line.quantity) {
                return NextResponse.json(
                    { success: false, message: `Insufficient stock for product: ${product?.name}` },
                    { status: 400 }
                )
            }
        }

        // Confirm order and reduce stock
        await prisma.$transaction(async (tx) => {
            await tx.saleOrder.update({
                where: { id },
                data: { status: 'CONFIRMED' },
            })

            for (const line of order.lines) {
                await tx.product.update({
                    where: { id: line.productId },
                    data: { stock: { decrement: line.quantity } },
                })
            }

            if (order.couponCode) {
                await tx.coupon.updateMany({
                    where: { code: order.couponCode },
                    data: { status: 'USED' },
                })
            }
        })

        // Trigger n8n webhook
        await triggerN8NWebhook({
            trigger_type: 'order_confirmation',
            customer_name: order.customer.name,
            customer_email: [order.customer.email],
            order_id: order.orderNumber,
            order_status: 'CONFIRMED',
            order_total: order.totalAmount,
            tracking_link: `https://lystre.com/track/${order.id}`,
            support_email: 'support@lystre.com',
        })

        return NextResponse.json({
            success: true,
            message: 'Order confirmed successfully',
        })
    } catch (error) {
        console.error('Order confirmation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to confirm order' },
            { status: 500 }
        )
    }
}

// DELETE /api/sale-orders/[id] (cancel)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const order = await prisma.saleOrder.findUnique({
            where: { id },
            include: { lines: true },
        })

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            )
        }

        if (order.status === 'PAID') {
            return NextResponse.json(
                { success: false, message: 'Cannot cancel a paid order' },
                { status: 400 }
            )
        }

        await prisma.$transaction(async (tx) => {
            if (order.status === 'CONFIRMED') {
                for (const line of order.lines) {
                    await tx.product.update({
                        where: { id: line.productId },
                        data: { stock: { increment: line.quantity } },
                    })
                }
            }

            await tx.saleOrder.update({
                where: { id },
                data: { status: 'CANCELLED' },
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
        })
    } catch (error) {
        console.error('Order cancellation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to cancel order' },
            { status: 500 }
        )
    }
}

// n8n webhook trigger helper
