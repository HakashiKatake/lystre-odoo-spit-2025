import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { UserRole } from '@prisma/client/index.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const COOKIE_NAME = 'auth-token'

export interface JWTPayload {
    userId: string
    email: string
    role: 'INTERNAL' | 'PORTAL'
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// JWT Token management
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch {
        return null
    }
}

// Session management
export async function createSession(userId: string, email: string, role: 'INTERNAL' | 'PORTAL') {
    const token = generateToken({ userId, email, role })
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
    return token
}

export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

export async function destroySession() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

// Get current user with full details
export async function getCurrentUser() {
    const session = await getSession()
    if (!session) return null

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { contact: true },
    })

    return user
}

// Auth guards
export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

export async function requireInternalUser() {
    const user = await requireAuth()
    if (user.role !== 'INTERNAL') {
        throw new Error('Access denied: Internal users only')
    }
    return user
}

export async function requirePortalUser() {
    const user = await requireAuth()
    if (user.role !== 'PORTAL') {
        throw new Error('Access denied: Portal users only')
    }
    return user
}
