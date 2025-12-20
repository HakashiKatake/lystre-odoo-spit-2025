import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/settings
export async function GET() {
    try {
        // Get settings or create default if not exists
        let settings = await prisma.settings.findUnique({
            where: { id: 'settings' },
        })

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'settings',
                    automaticInvoicing: true,
                },
            })
        }

        return NextResponse.json({
            success: true,
            data: settings,
        })
    } catch (error) {
        console.error('Settings fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()

        const settings = await prisma.settings.upsert({
            where: { id: 'settings' },
            update: {
                automaticInvoicing: body.automaticInvoicing ?? true,
            },
            create: {
                id: 'settings',
                automaticInvoicing: body.automaticInvoicing ?? true,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings,
        })
    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
