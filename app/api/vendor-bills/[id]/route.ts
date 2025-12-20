import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vendor-bills/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const bill = await prisma.vendorBill.findUnique({
            where: { id },
            include: {
                vendor: true,
                order: {
                    include: {
                        lines: {
                            include: { product: true },
                        },
                    },
                },
                payments: true,
            },
        })

        if (!bill) {
            return NextResponse.json(
                { success: false, message: 'Vendor bill not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: bill })
    } catch (error) {
        console.error('Vendor bill fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch vendor bill' },
            { status: 500 }
        )
    }
}

// PUT /api/vendor-bills/[id] - Update bill (e.g., mark as paid)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const bill = await prisma.vendorBill.update({
            where: { id },
            data: {
                status: body.status,
                paidAmount: body.paidAmount,
                paidOn: body.paidOn ? new Date(body.paidOn) : undefined,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Vendor bill updated successfully',
            data: bill,
        })
    } catch (error) {
        console.error('Vendor bill update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update vendor bill' },
            { status: 500 }
        )
    }
}

// DELETE /api/vendor-bills/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if there are payments
        const payments = await prisma.payment.count({
            where: { vendorBillId: id },
        })

        if (payments > 0) {
            return NextResponse.json(
                { success: false, message: 'Cannot delete bill with payments' },
                { status: 400 }
            )
        }

        await prisma.vendorBill.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: 'Vendor bill deleted successfully',
        })
    } catch (error) {
        console.error('Vendor bill deletion error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to delete vendor bill' },
            { status: 500 }
        )
    }
}
