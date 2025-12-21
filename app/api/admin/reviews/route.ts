import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/reviews - Get all reviews for admin
export async function GET(request: NextRequest) {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: reviews,
        })
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}
