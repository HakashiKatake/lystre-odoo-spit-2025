import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const type = searchParams.get('type') || 'sales_by_product'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const dateFilter: Record<string, unknown> = {}
        if (startDate) dateFilter.gte = new Date(startDate)
        if (endDate) dateFilter.lte = new Date(endDate)

        let data: unknown[] = []

        switch (type) {
            case 'sales_by_product':
                data = await getSalesByProduct(dateFilter)
                break
            case 'sales_by_customer':
                data = await getSalesByCustomer(dateFilter)
                break
            case 'purchase_by_vendor':
                data = await getPurchaseByVendor(dateFilter)
                break
            case 'dashboard':
                return NextResponse.json({
                    success: true,
                    data: await getDashboardStats(),
                })
            default:
                return NextResponse.json(
                    { success: false, message: 'Invalid report type' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            data,
        })
    } catch (error) {
        console.error('Report generation error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to generate report' },
            { status: 500 }
        )
    }
}

async function getSalesByProduct(dateFilter: Record<string, unknown>) {
    const orders = await prisma.saleOrder.findMany({
        where: {
            status: { in: ['CONFIRMED', 'PAID'] },
            orderDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        include: {
            lines: { include: { product: true } },
        },
    })

    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {}

    for (const order of orders) {
        for (const line of order.lines) {
            if (!productStats[line.productId]) {
                productStats[line.productId] = {
                    name: line.product.name,
                    quantity: 0,
                    revenue: 0,
                }
            }
            productStats[line.productId].quantity += line.quantity
            productStats[line.productId].revenue += line.total
        }
    }

    return Object.entries(productStats)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
}

async function getSalesByCustomer(dateFilter: Record<string, unknown>) {
    const customers = await prisma.contact.findMany({
        where: { type: { in: ['CUSTOMER', 'BOTH'] } },
        include: {
            saleOrders: {
                where: {
                    status: { in: ['CONFIRMED', 'PAID'] },
                    orderDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
                },
            },
        },
    })

    return customers
        .map((c) => ({
            id: c.id,
            name: c.name,
            orderCount: c.saleOrders.length,
            totalAmount: c.saleOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        }))
        .filter((c) => c.orderCount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount)
}

async function getPurchaseByVendor(dateFilter: Record<string, unknown>) {
    const vendors = await prisma.contact.findMany({
        where: { type: { in: ['VENDOR', 'BOTH'] } },
        include: {
            purchaseOrders: {
                where: {
                    status: { in: ['CONFIRMED', 'PAID'] },
                    orderDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
                },
            },
        },
    })

    return vendors
        .map((v) => ({
            id: v.id,
            name: v.name,
            orderCount: v.purchaseOrders.length,
            totalAmount: v.purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        }))
        .filter((v) => v.orderCount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount)
}

async function getDashboardStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
        totalProducts,
        totalCustomers,
        totalVendors,
        salesThisMonth,
        salesLastMonth,
        purchasesThisMonth,
        overdueInvoices,
        lowStockProducts,
    ] = await Promise.all([
        prisma.product.count({ where: { published: true } }),
        prisma.contact.count({ where: { type: { in: ['CUSTOMER', 'BOTH'] } } }),
        prisma.contact.count({ where: { type: { in: ['VENDOR', 'BOTH'] } } }),
        prisma.saleOrder.aggregate({
            where: { createdAt: { gte: startOfMonth } },
            _sum: { totalAmount: true },
            _count: true,
        }),
        prisma.saleOrder.aggregate({
            where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
            _sum: { totalAmount: true },
        }),
        prisma.purchaseOrder.aggregate({
            where: { createdAt: { gte: startOfMonth } },
            _sum: { totalAmount: true },
            _count: true,
        }),
        prisma.customerInvoice.count({
            where: { status: 'UNPAID', dueDate: { lt: now } },
        }),
        prisma.product.count({
            where: { stock: { lt: 20 } },
        }),
    ])

    return {
        totalProducts,
        totalCustomers,
        totalVendors,
        salesThisMonth: {
            amount: salesThisMonth._sum.totalAmount || 0,
            count: salesThisMonth._count,
        },
        salesLastMonth: salesLastMonth._sum.totalAmount || 0,
        purchasesThisMonth: {
            amount: purchasesThisMonth._sum.totalAmount || 0,
            count: purchasesThisMonth._count,
        },
        overdueInvoices,
        lowStockProducts,
    }
}
