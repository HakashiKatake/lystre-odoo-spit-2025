import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validators'

// GET /api/contacts/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const contact = await prisma.contact.findUnique({
            where: { id },
            include: {
                saleOrders: { take: 5, orderBy: { createdAt: 'desc' } },
                purchaseOrders: { take: 5, orderBy: { createdAt: 'desc' } },
            },
        })

        if (!contact) {
            return NextResponse.json(
                { success: false, message: 'Contact not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: contact })
    } catch (error) {
        console.error('Contact fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch contact' },
            { status: 500 }
        )
    }
}

// PUT /api/contacts/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const validation = contactSchema.partial().safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const contact = await prisma.contact.update({
            where: { id },
            data: validation.data,
        })

        return NextResponse.json({
            success: true,
            message: 'Contact updated successfully',
            data: contact,
        })
    } catch (error) {
        console.error('Contact update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update contact' },
            { status: 500 }
        )
    }
}

// DELETE /api/contacts/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.contact.delete({ where: { id } })

        return NextResponse.json({
            success: true,
            message: 'Contact deleted successfully',
        })
    } catch (error) {
        console.error('Contact delete error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to delete contact' },
            { status: 500 }
        )
    }
}
