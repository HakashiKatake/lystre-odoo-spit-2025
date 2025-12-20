import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validators'
import { getPaginationParams } from '@/lib/utils'

// GET /api/contacts
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        const where: Record<string, unknown> = {}

        const type = searchParams.get('type')
        if (type) where.type = type

        const search = searchParams.get('search')
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.contact.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: contacts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Contacts fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch contacts' },
            { status: 500 }
        )
    }
}

// POST /api/contacts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = contactSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const contact = await prisma.contact.create({
            data: validation.data,
        })

        return NextResponse.json({
            success: true,
            message: 'Contact created successfully',
            data: contact,
        }, { status: 201 })
    } catch (error) {
        console.error('Contact creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create contact' },
            { status: 500 }
        )
    }
}
