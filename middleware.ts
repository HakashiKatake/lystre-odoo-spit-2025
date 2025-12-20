import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

interface JWTPayload {
    userId: string
    email: string
    role: 'INTERNAL' | 'PORTAL'
}

// Public routes that don't require authentication
const publicRoutes = [
    '/',
    '/products',
    '/login',
    '/register',
    '/admin/login',
    '/admin/register',
]

async function verifyTokenInMiddleware(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as JWTPayload
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow static files, API routes, and assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Check if route is public
    const isPublic = publicRoutes.some(route => {
        if (route === pathname) return true
        // Products pages are public (including /products/[id])
        if (route === '/products' && pathname.startsWith('/products')) return true
        return false
    })

    if (isPublic) {
        return NextResponse.next()
    }

    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value

    // No token - redirect to login
    if (!token) {
        const isAdminRoute = pathname.startsWith('/admin')
        const loginUrl = isAdminRoute ? '/admin/login' : '/login'
        const url = new URL(loginUrl, request.url)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    // Verify token using jose (Edge-compatible)
    const payload = await verifyTokenInMiddleware(token)

    if (!payload) {
        // Invalid token - clear and redirect
        const isAdminRoute = pathname.startsWith('/admin')
        const loginUrl = isAdminRoute ? '/admin/login' : '/login'
        const response = NextResponse.redirect(new URL(loginUrl, request.url))
        response.cookies.delete('auth-token')
        return response
    }

    // Admin routes require INTERNAL role
    if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/register') {
        if (payload.role !== 'INTERNAL') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Valid token - allow access
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon files
         * - public assets
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)',
    ],
}
