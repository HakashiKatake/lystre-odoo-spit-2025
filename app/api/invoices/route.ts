import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaginationParams, generateOrderNumber } from '@/lib/utils'

// GET /api/invoices
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        const where: Record<string, unknown> = {}
        const status = searchParams.get('status')
        if (status) where.status = status

        const customerId = searchParams.get('customerId')
        if (customerId) where.customerId = customerId

        const [invoices, total] = await Promise.all([
            prisma.customerInvoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    order: true,
                    payments: true,
                },
            }),
            prisma.customerInvoice.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: invoices,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Invoices fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch invoices' },
            { status: 500 }
        )
    }
}

// POST /api/invoices - Create invoice from sale order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId } = body

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            )
        }

        const order = await prisma.saleOrder.findUnique({
            where: { id: orderId },
            include: { paymentTerm: true, invoice: true },
        })

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            )
        }

        if (order.status === 'DRAFT') {
            return NextResponse.json(
                { success: false, message: 'Order must be confirmed first' },
                { status: 400 }
            )
        }

        if (order.invoice) {
            return NextResponse.json(
                { success: false, message: 'Invoice already exists for this order' },
                { status: 400 }
            )
        }

        // Calculate due date based on payment term
        const dueDate = new Date()
        if (order.paymentTerm?.name) {
            const days = parseInt(order.paymentTerm.name) || 0
            dueDate.setDate(dueDate.getDate() + days)
        }

        const invoice = await prisma.customerInvoice.create({
            data: {
                invoiceNumber: generateOrderNumber('INV'),
                orderId,
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

        // Trigger webhook for invoice creation
        await triggerWebhook('invoice.created', { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber })

        return NextResponse.json({
            success: true,
            message: 'Invoice created successfully',
            data: invoice,
        }, { status: 201 })
    } catch (error) {
        console.error('Invoice creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create invoice' },
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
