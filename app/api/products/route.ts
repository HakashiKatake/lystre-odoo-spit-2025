import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validators'
import { getPaginationParams } from '@/lib/utils'

// GET /api/products - List products with filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const { page, limit, skip } = getPaginationParams(searchParams)

        // Build filters
        const where: Record<string, unknown> = {}

        const category = searchParams.get('category')
        if (category) where.category = category

        const type = searchParams.get('type')
        if (type) where.type = type

        const material = searchParams.get('material')
        if (material) where.material = material

        const published = searchParams.get('published')
        if (published !== null) where.published = published === 'true'

        const search = searchParams.get('search')
        if (search) {
            where.name = { contains: search, mode: 'insensitive' }
        }

        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        if (minPrice || maxPrice) {
            where.salesPrice = {}
            if (minPrice) (where.salesPrice as Record<string, number>).gte = parseFloat(minPrice)
            if (maxPrice) (where.salesPrice as Record<string, number>).lte = parseFloat(maxPrice)
        }

        // Get products with count
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Products fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

// POST /api/products - Create product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = productSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const product = await prisma.product.create({
            data: validation.data,
        })

        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            data: product,
        }, { status: 201 })
    } catch (error) {
        console.error('Product creation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to create product' },
            { status: 500 }
        )
    }
}
