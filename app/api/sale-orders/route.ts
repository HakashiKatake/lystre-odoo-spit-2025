import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saleOrderSchema } from '@/lib/validators'
import { getPaginationParams, generateOrderNumber } from '@/lib/utils'

// GET /api/sale-orders
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        const where: Record<string, unknown> = {}

        const status = searchParams.get('status')
        if (status) where.status = status

        const customerId = searchParams.get('customerId')
        if (customerId) where.customerId = customerId

        const search = searchParams.get('search')
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
            ]
        }

        const [orders, total] = await Promise.all([
            prisma.saleOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    paymentTerm: true,
                    lines: { include: { product: true } },
                },
            }),
            prisma.saleOrder.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Sale orders fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch sale orders' },
            { status: 500 }
        )
    }
}

// POST /api/sale-orders
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = saleOrderSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { customerId, paymentTermId, lines, couponCode } = validation.data

        // Calculate totals
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

        // Apply coupon if provided
        let discountAmount = 0
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode },
                include: { discountOffer: true },
            })
            if (coupon && coupon.status === 'UNUSED') {
                discountAmount = (subtotal * coupon.discountOffer.discountPercentage) / 100
            }
        }

        const totalAmount = subtotal + taxAmount - discountAmount

        const order = await prisma.saleOrder.create({
            data: {
                orderNumber: generateOrderNumber('SO'),
                customerId,
                paymentTermId,
                couponCode,
                discountAmount,
                subtotal,
                taxAmount,
                totalAmount,
                lines: { create: orderLines },
            },
            include: {
                customer: true,
                lines: { include: { product: true } },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Sale order created successfully',
            data: order,
        }, { status: 201 })
    } catch (error) {
        console.error('Sale order creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create sale order' },
            { status: 500 }
        )
    }
}
