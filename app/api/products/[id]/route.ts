import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validators'

// GET /api/products/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const product = await prisma.product.findUnique({
            where: { id },
        })

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: product,
        })
    } catch (error) {
        console.error('Product fetch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

// PUT /api/products/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const validation = productSchema.partial().safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const product = await prisma.product.update({
            where: { id },
            data: validation.data,
        })

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        })
    } catch (error) {
        console.error('Product update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update product' },
            { status: 500 }
        )
    }
}

// DELETE /api/products/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.product.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
        })
    } catch (error) {
        console.error('Product delete error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to delete product' },
            { status: 500 }
        )
    }
}

// PATCH /api/products/[id] - For toggling publish status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const product = await prisma.product.update({
            where: { id },
            data: body,
        })

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        })
    } catch (error) {
        console.error('Product patch error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update product' },
            { status: 500 }
        )
    }
}
