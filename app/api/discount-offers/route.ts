import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/discount-offers
export async function GET() {
    try {
        const offers = await prisma.discountOffer.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { coupons: true },
                },
                coupons: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: offers,
        })
    } catch (error) {
        console.error('Discount offers fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch discount offers' },
            { status: 500 }
        )
    }
}

// POST /api/discount-offers
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, discountPercentage, startDate, endDate, availableOn } = body

        if (!name || !discountPercentage || !startDate || !endDate) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            )
        }

        const offer = await prisma.discountOffer.create({
            data: {
                name,
                discountPercentage: parseFloat(discountPercentage),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                availableOn: availableOn || 'WEBSITE',
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Discount offer created successfully',
            data: offer,
        }, { status: 201 })
    } catch (error) {
        console.error('Discount offer creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create discount offer' },
            { status: 500 }
        )
    }
}
