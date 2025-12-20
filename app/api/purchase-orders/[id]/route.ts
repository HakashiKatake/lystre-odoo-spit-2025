import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/purchase-orders/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const order = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                vendor: true,
                lines: { include: { product: true } },
                bill: true,
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
        console.error('Purchase order fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order' },
            { status: 500 }
        )
    }
}

// POST /api/purchase-orders/[id]/confirm
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const order = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { lines: true },
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

        // Confirm order and increase stock
        await prisma.$transaction(async (tx) => {
            await tx.purchaseOrder.update({
                where: { id },
                data: { status: 'CONFIRMED' },
            })

            for (const line of order.lines) {
                await tx.product.update({
                    where: { id: line.productId },
                    data: { stock: { increment: line.quantity } },
                })
            }
        })

        // Trigger webhook for low stock notification check
        await triggerWebhook('purchase.confirmed', { orderId: id })

        return NextResponse.json({
            success: true,
            message: 'Purchase order confirmed and stock updated',
        })
    } catch (error) {
        console.error('Purchase order confirmation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to confirm order' },
            { status: 500 }
        )
    }
}

async function triggerWebhook(event: string, data: Record<string, unknown>) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) return

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
        })
    } catch (error) {
        console.error('Webhook trigger failed:', error)
    }
}
