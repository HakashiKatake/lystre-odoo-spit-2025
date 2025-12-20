import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.contact?.name || user.email,
                role: user.role,
                contactId: user.contactId,
                contact: user.contact ? {
                    id: user.contact.id,
                    name: user.contact.name,
                    email: user.contact.email,
                    mobile: user.contact.mobile,
                    address: user.contact.street,
                    city: user.contact.city,
                    state: user.contact.state,
                    pincode: user.contact.pincode,
                } : null,
            },
        })
    } catch (error) {
        console.error('Session check error:', error)
        return NextResponse.json(
            { success: false, message: 'Session check failed' },
            { status: 500 }
        )
    }
}
