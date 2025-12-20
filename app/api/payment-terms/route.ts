import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentTermSchema } from '@/lib/validators'

// GET /api/payment-terms
export async function GET() {
    try {
        const paymentTerms = await prisma.paymentTerm.findMany({
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            success: true,
            data: paymentTerms,
        })
    } catch (error) {
        console.error('Payment terms fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch payment terms' },
            { status: 500 }
        )
    }
}

// POST /api/payment-terms
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = paymentTermSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { name, earlyPaymentDiscount, discountPercentage, discountDays, discountComputation, active } = validation.data

        const paymentTerm = await prisma.paymentTerm.create({
            data: {
                name,
                earlyPaymentDiscount: earlyPaymentDiscount || false,
                discountPercentage: earlyPaymentDiscount ? discountPercentage : null,
                discountDays: earlyPaymentDiscount ? discountDays : null,
                discountComputation: discountComputation || null,
                active: active ?? true,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Payment term created successfully',
            data: paymentTerm,
        }, { status: 201 })
    } catch (error) {
        console.error('Payment term creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create payment term' },
            { status: 500 }
        )
    }
}
