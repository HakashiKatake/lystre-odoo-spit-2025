import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { purchaseOrderSchema } from '@/lib/validators'
import { getPaginationParams, generateOrderNumber } from '@/lib/utils'

// GET /api/purchase-orders
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        const where: Record<string, unknown> = {}
        const status = searchParams.get('status')
        if (status) where.status = status

        const vendorId = searchParams.get('vendorId')
        if (vendorId) where.vendorId = vendorId

        const [orders, total] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    vendor: true,
                    lines: { include: { product: true } },
                },
            }),
            prisma.purchaseOrder.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Purchase orders fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch purchase orders' },
            { status: 500 }
        )
    }
}

// POST /api/purchase-orders
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = purchaseOrderSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { vendorId, lines } = validation.data

        let subtotal = 0
        let taxAmount = 0
        const orderLines = lines.map((line) => {
            const lineTotal = line.unitPrice * line.quantity
            const lineTax = (lineTotal * line.tax) / 100
            subtotal += lineTotal
            taxAmount += lineTax
            return {
                productId: line.productId,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                tax: line.tax,
                total: lineTotal + lineTax,
            }
        })

        const order = await prisma.purchaseOrder.create({
            data: {
                orderNumber: generateOrderNumber('PO'),
                vendorId,
                subtotal,
                taxAmount,
                totalAmount: subtotal + taxAmount,
                lines: { create: orderLines },
            },
            include: {
                vendor: true,
                lines: { include: { product: true } },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Purchase order created successfully',
            data: order,
        }, { status: 201 })
    } catch (error) {
        console.error('Purchase order creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create purchase order' },
            { status: 500 }
        )
    }
}
