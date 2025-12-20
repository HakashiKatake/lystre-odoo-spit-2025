import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/coupons
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const code = searchParams.get('code')

        const where: Record<string, unknown> = {}
        if (status) where.status = status
        if (code) where.code = code

        const coupons = await prisma.coupon.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                discountOffer: true,
                contact: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: coupons,
        })
    } catch (error) {
        console.error('Coupons fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch coupons' },
            { status: 500 }
        )
    }
}

// POST /api/coupons/validate
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, customerId } = body

        if (!code) {
            return NextResponse.json(
                { success: false, message: 'Coupon code is required' },
                { status: 400 }
            )
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code },
            include: { discountOffer: true },
        })

        if (!coupon) {
            return NextResponse.json({
                success: false,
                valid: false,
                message: 'Coupon not found',
            })
        }

        if (coupon.status === 'USED') {
            return NextResponse.json({
                success: false,
                valid: false,
                message: 'Coupon has already been used',
            })
        }

        // Check expiration
        if (coupon.expirationDate && new Date() > coupon.expirationDate) {
            return NextResponse.json({
                success: false,
                valid: false,
                message: 'Coupon has expired',
            })
        }

        // Check offer validity
        const now = new Date()
        if (now < coupon.discountOffer.startDate || now > coupon.discountOffer.endDate) {
            return NextResponse.json({
                success: false,
                valid: false,
                message: 'Coupon is not valid during this period',
            })
        }

        // Check contact restriction
        if (coupon.contactId && coupon.contactId !== customerId) {
            return NextResponse.json({
                success: false,
                valid: false,
                message: 'This coupon is not valid for this customer',
            })
        }

        return NextResponse.json({
            success: true,
            valid: true,
            discountPercentage: coupon.discountOffer.discountPercentage,
            message: `${coupon.discountOffer.discountPercentage}% discount will be applied!`,
        })
    } catch (error) {
        console.error('Coupon validation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to validate coupon' },
            { status: 500 }
        )
    }
}
