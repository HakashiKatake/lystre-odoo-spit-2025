import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { triggerN8NWebhook } from '@/lib/n8n-webhook'

// Generate coupon code
function generateCouponCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// GET /api/coupons
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const code = searchParams.get('code')
        const includeAll = searchParams.get('includeAll')

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
            take: includeAll ? undefined : 100,
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

// POST /api/coupons
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Check if this is for creating a discount offer
        if (body.action === 'createOffer') {
            const { name, discountPercentage, startDate, endDate, availableOn } = body

            if (!name || !discountPercentage || !startDate || !endDate) {
                return NextResponse.json(
                    { success: false, message: 'Missing required fields for discount offer' },
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
        }

        // Check if this is for generating coupons for an offer
        if (body.action === 'generateCoupons') {
            const { discountOfferId, quantity, customerIds, expirationDate } = body

            if (!discountOfferId) {
                return NextResponse.json(
                    { success: false, message: 'Discount offer ID is required' },
                    { status: 400 }
                )
            }

            const couponsToCreate = []
            const numCoupons = customerIds?.length > 0 ? customerIds.length : (quantity || 1)

            for (let i = 0; i < numCoupons; i++) {
                couponsToCreate.push({
                    code: generateCouponCode(),
                    discountOfferId,
                    contactId: customerIds?.[i] || null,
                    expirationDate: expirationDate ? new Date(expirationDate) : null,
                })
            }

            const coupons = await prisma.coupon.createMany({
                data: couponsToCreate,
            })

            // Trigger webhooks for generated coupons
            // Note: This might be heavy if lots of coupons but matches requirement for "each mail"
            // We'll fetch the created coupons (or at least the contacts) to send details
            // Since createMany doesn't return the records, we have to find them or iterate.
            // Optimization: Send one batch or iterate customerIds.

            // For now, simpler approach: Just trigger for each customerId provided (if available) 
            // If bulk quantity with no customerId, we can't send emails.
            if (customerIds && customerIds.length > 0) {
                // Fetch offer details once
                const offer = await prisma.discountOffer.findUnique({ where: { id: discountOfferId } })
                if (offer) {
                    // We need the codes... createMany doesn't give them.
                    // To follow the requirement "send relevant data... discount_code", we strictly need the codes.
                    // This implies we should have created them one by one or fetch them back.
                    // Given the constraint to not alter logic deeply, we will just send a generic "Offer Assigned" 
                    // or if we really need the code, we must fetch.
                    // Let's assume we fetch the latest coupons for these users.
                    const newCoupons = await prisma.coupon.findMany({
                        where: { discountOfferId, contactId: { in: customerIds } },
                        include: { contact: true }
                    })

                    for (const c of newCoupons) {
                        if (c.contact) {
                            await triggerN8NWebhook({
                                trigger_type: 'offer_campaign',
                                customer_name: c.contact.name,
                                customer_email: [c.contact.email],
                                discount_value: `${offer.discountPercentage}%`,
                                discount_code: c.code,
                                expiry_date: c.expirationDate || offer.endDate,
                            })
                        }
                    }
                }
            }

            return NextResponse.json({
                success: true,
                message: `${coupons.count} coupons created successfully`,
                data: { count: coupons.count },
            }, { status: 201 })
        }

        // Default: Validate coupon
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

        // Trigger webhook when offer/coupon is selected
        await triggerN8NWebhook({ data: 'offer' })

        return NextResponse.json({
            success: true,
            valid: true,
            discountPercentage: coupon.discountOffer.discountPercentage,
            message: `${coupon.discountOffer.discountPercentage}% discount will be applied!`,
        })
    } catch (error) {
        console.error('Coupon operation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to process coupon operation' },
            { status: 500 }
        )
    }
}

