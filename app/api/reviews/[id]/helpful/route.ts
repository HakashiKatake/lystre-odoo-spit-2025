import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/reviews/[id]/helpful - Increment helpful count
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const review = await prisma.review.findUnique({ where: { id } })

        if (!review) {
            return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 })
        }

        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                helpfulCount: { increment: 1 }
            }
        })

        return NextResponse.json({ success: true, data: updatedReview })
    } catch (error) {
        console.error('Error updating helpful count:', error)
        return NextResponse.json({ success: false, message: 'Failed to update helpful count' }, { status: 500 })
    }
}
