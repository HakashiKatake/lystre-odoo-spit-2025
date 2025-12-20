import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'
import { registerSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = registerSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { name, email, password, mobile } = validation.data
        const role = (body.role === 'INTERNAL') ? 'INTERNAL' : 'PORTAL'
        const contactType = role === 'INTERNAL' ? 'VENDOR' : 'CUSTOMER'

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create contact first
        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                mobile: mobile || null,
                type: contactType,
            },
        })

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: role,
                contactId: contact.id,
            },
            include: { contact: true },
        })

        // Create session
        await createSession(user.id, user.email, role)

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            data: {
                id: user.id,
                email: user.email,
                name: contact.name,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { success: false, message: 'Registration failed. Please try again.' },
            { status: 500 }
        )
    }
}
