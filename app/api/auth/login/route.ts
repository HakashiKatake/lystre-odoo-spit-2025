import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = loginSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { email, password } = validation.data

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { contact: true },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash)

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Create session
        await createSession(user.id, user.email, user.role as 'INTERNAL' | 'PORTAL')

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                email: user.email,
                name: user.contact?.name || email,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { success: false, message: 'Login failed. Please try again.' },
            { status: 500 }
        )
    }
}
