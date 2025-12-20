import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/webhooks/n8n - Receive events from n8n
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { event, data } = body

        console.log('n8n webhook received:', event, data)

        switch (event) {
            case 'check_low_stock':
                // Check for low stock products and return them
                const lowStockProducts = await prisma.product.findMany({
                    where: { stock: { lt: 20 }, published: true },
                    select: { id: true, name: true, stock: true },
                })
                return NextResponse.json({
                    success: true,
                    data: { lowStockProducts },
                })

            case 'check_overdue_invoices':
                // Check for overdue invoices
                const overdueInvoices = await prisma.customerInvoice.findMany({
                    where: {
                        status: 'UNPAID',
                        dueDate: { lt: new Date() },
                    },
                    include: {
                        customer: { select: { name: true, email: true } },
                    },
                })
                return NextResponse.json({
                    success: true,
                    data: { overdueInvoices },
                })

            case 'send_order_notification':
                // Log that we would send an email notification
                console.log('Would send order notification for:', data)
                return NextResponse.json({
                    success: true,
                    message: 'Notification logged',
                })

            case 'update_payment_status':
                // Update payment status based on n8n trigger
                if (data.invoiceId && data.status) {
                    await prisma.customerInvoice.update({
                        where: { id: data.invoiceId },
                        data: { status: data.status },
                    })
                }
                return NextResponse.json({
                    success: true,
                    message: 'Status updated',
                })

            default:
                return NextResponse.json({
                    success: false,
                    message: `Unknown event: ${event}`,
                }, { status: 400 })
        }
    } catch (error) {
        console.error('n8n webhook error:', error)
        return NextResponse.json(
            { success: false, message: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

// GET /api/webhooks/n8n - Health check
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'n8n webhook endpoint is ready',
        availableEvents: [
            'check_low_stock',
            'check_overdue_invoices',
            'send_order_notification',
            'update_payment_status',
        ],
    })
}
