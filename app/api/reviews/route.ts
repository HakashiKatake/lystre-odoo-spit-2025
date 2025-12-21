import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 })
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true }
                }
            }
        })

        return NextResponse.json({ success: true, data: reviews })
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch reviews' }, { status: 500 })
    }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
    try {
        // Get current user
        const token = request.cookies.get('token')?.value
        let userId: string | null = null
        let userName = 'Anonymous'

        if (token) {
            const payload = verifyToken(token)
            if (payload) {
                userId = payload.userId
                const user = await prisma.user.findUnique({ where: { id: userId } })
                if (user) {
                    userName = user.name
                }
            }
        }

        const body = await request.json()
        const { productId, rating, title, comment, sizePurchased, bodyType, images } = body

        // Validation
        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 })
        }
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5' }, { status: 400 })
        }
        if (!title || title.trim().length === 0) {
            return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 })
        }
        if (!comment || comment.trim().length === 0) {
            return NextResponse.json({ success: false, message: 'Comment is required' }, { status: 400 })
        }

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
        }

        // Check if user has purchased this product (verified review)
        let verified = false
        if (userId) {
            // Get user's contact
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { contact: true }
            })

            if (user?.contact) {
                const hasPurchased = await prisma.saleOrder.findFirst({
                    where: {
                        customerId: user.contact.id,
                        status: 'PAID',
                        lines: {
                            some: { productId }
                        }
                    }
                })
                verified = !!hasPurchased
            }
        }

        // Use provided userName or fallback
        const reviewUserName = body.userName || userName

        const review = await prisma.review.create({
            data: {
                productId,
                userId,
                userName: reviewUserName,
                rating,
                title: title.trim(),
                comment: comment.trim(),
                sizePurchased: sizePurchased || null,
                bodyType: bodyType || null,
                images: images || [],
                verified,
                helpfulCount: 0,
            }
        })

        return NextResponse.json({ success: true, data: review }, { status: 201 })
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ success: false, message: 'Failed to create review' }, { status: 500 })
    }
}
