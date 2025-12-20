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

        return NextResponse.json({ success: true, data: invoice })
    } catch (error) {
        console.error('Invoice fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch invoice' },
            { status: 500 }
        )
    }
}
