import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaginationParams, generateOrderNumber } from '@/lib/utils'

// GET /api/vendor-bills
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        const where: Record<string, unknown> = {}
        const status = searchParams.get('status')
        if (status) where.status = status

        const vendorId = searchParams.get('vendorId')
        if (vendorId) where.vendorId = vendorId

        const [bills, total] = await Promise.all([
            prisma.vendorBill.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    vendor: true,
                    order: true,
                    payments: true,
                },
            }),
            prisma.vendorBill.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: bills,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Vendor bills fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch vendor bills' },
            { status: 500 }
        )
    }
}

// POST /api/vendor-bills - Create bill from purchase order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, dueDate } = body

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            )
        }

        const order = await prisma.purchaseOrder.findUnique({
            where: { id: orderId },
            include: { bill: true },
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

        if (order.bill) {
            return NextResponse.json(
                { success: false, message: 'Bill already exists for this order' },
                { status: 400 }
            )
        }

        const bill = await prisma.vendorBill.create({
            data: {
                billNumber: generateOrderNumber('BILL'),
                orderId,
                vendorId: order.vendorId,
                dueDate: new Date(dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
                subtotal: order.subtotal,
                taxAmount: order.taxAmount,
                totalAmount: order.totalAmount,
            },
            include: {
                vendor: true,
                order: { include: { lines: { include: { product: true } } } },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Vendor bill created successfully',
            data: bill,
        }, { status: 201 })
    } catch (error) {
        console.error('Vendor bill creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create vendor bill' },
            { status: 500 }
        )
    }
}
