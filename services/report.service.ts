import { prisma } from '@/lib/prisma'
import type { ReportInput } from '@/lib/validators'

// ============== SALES REPORTS ==============

export async function getSalesReportByProduct(fromDate: Date, toDate: Date) {
    const result = await prisma.saleOrderLine.groupBy({
        by: ['productId'],
        where: {
            order: {
                status: { in: ['CONFIRMED', 'PAID'] },
                orderDate: { gte: fromDate, lte: toDate },
            },
        },
        _sum: {
            quantity: true,
            total: true,
        },
    })

    // Fetch product names
    const productIds = result.map((r) => r.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p.name]))

    return result.map((r) => ({
        productId: r.productId,
        productName: productMap.get(r.productId) || 'Unknown',
        soldQuantity: r._sum.quantity || 0,
        totalReceivedAmount: r._sum.total || 0,
    }))
}

export async function getSalesReportByCustomer(fromDate: Date, toDate: Date) {
    const result = await prisma.saleOrder.groupBy({
        by: ['customerId'],
        where: {
            status: { in: ['CONFIRMED', 'PAID'] },
            orderDate: { gte: fromDate, lte: toDate },
        },
        _count: { id: true },
        _sum: { totalAmount: true },
    })

    // Fetch customer names and paid amounts
    const customerIds = result.map((r) => r.customerId)
    const customers = await prisma.contact.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, name: true },
    })

    // Get paid amounts per customer
    const paidAmounts = await prisma.customerInvoice.groupBy({
        by: ['customerId'],
        where: {
            customerId: { in: customerIds },
            createdAt: { gte: fromDate, lte: toDate },
        },
        _sum: { paidAmount: true, totalAmount: true },
    })

    const customerMap = new Map(customers.map((c) => [c.id, c.name]))
    const paidMap = new Map(
        paidAmounts.map((p) => [
            p.customerId,
            { paid: p._sum.paidAmount || 0, total: p._sum.totalAmount || 0 },
        ])
    )

    return result.map((r) => {
        const amounts = paidMap.get(r.customerId) || { paid: 0, total: 0 }
        return {
            customerId: r.customerId,
            customerName: customerMap.get(r.customerId) || 'Unknown',
            totalOrders: r._count.id,
            paidAmount: amounts.paid,
            unpaidAmount: amounts.total - amounts.paid,
        }
    })
}

// ============== PURCHASE REPORTS ==============

export async function getPurchaseReportByProduct(fromDate: Date, toDate: Date) {
    const result = await prisma.purchaseOrderLine.groupBy({
        by: ['productId'],
        where: {
            order: {
                status: { in: ['CONFIRMED', 'PAID'] },
                orderDate: { gte: fromDate, lte: toDate },
            },
        },
        _sum: {
            quantity: true,
            total: true,
        },
    })

    const productIds = result.map((r) => r.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p.name]))

    return result.map((r) => ({
        productId: r.productId,
        productName: productMap.get(r.productId) || 'Unknown',
        purchasedQuantity: r._sum.quantity || 0,
        totalPaidAmount: r._sum.total || 0,
    }))
}

export async function getPurchaseReportByVendor(fromDate: Date, toDate: Date) {
    const result = await prisma.purchaseOrder.groupBy({
        by: ['vendorId'],
        where: {
            status: { in: ['CONFIRMED', 'PAID'] },
            orderDate: { gte: fromDate, lte: toDate },
        },
        _count: { id: true },
        _sum: { totalAmount: true },
    })

    const vendorIds = result.map((r) => r.vendorId)
    const vendors = await prisma.contact.findMany({
        where: { id: { in: vendorIds } },
        select: { id: true, name: true },
    })

    // Get paid amounts per vendor
    const paidAmounts = await prisma.vendorBill.groupBy({
        by: ['vendorId'],
        where: {
            vendorId: { in: vendorIds },
            createdAt: { gte: fromDate, lte: toDate },
        },
        _sum: { paidAmount: true, totalAmount: true },
    })

    const vendorMap = new Map(vendors.map((v) => [v.id, v.name]))
    const paidMap = new Map(
        paidAmounts.map((p) => [
            p.vendorId,
            { paid: p._sum.paidAmount || 0, total: p._sum.totalAmount || 0 },
        ])
    )

    return result.map((r) => {
        const amounts = paidMap.get(r.vendorId) || { paid: 0, total: 0 }
        return {
            vendorId: r.vendorId,
            vendorName: vendorMap.get(r.vendorId) || 'Unknown',
            totalOrders: r._count.id,
            paidAmount: amounts.paid,
            unpaidAmount: amounts.total - amounts.paid,
        }
    })
}

// ============== GENERATE REPORT ==============

export async function generateReport(input: ReportInput) {
    const fromDate = new Date(input.fromDate)
    const toDate = new Date(input.toDate)

    if (input.reportType === 'sales') {
        if (input.groupBy === 'product') {
            return {
                type: 'Sales by Product',
                data: await getSalesReportByProduct(fromDate, toDate),
            }
        } else {
            return {
                type: 'Sales by Customer',
                data: await getSalesReportByCustomer(fromDate, toDate),
            }
        }
    } else {
        if (input.groupBy === 'product') {
            return {
                type: 'Purchase by Product',
                data: await getPurchaseReportByProduct(fromDate, toDate),
            }
        } else {
            return {
                type: 'Purchase by Vendor',
                data: await getPurchaseReportByVendor(fromDate, toDate),
            }
        }
    }
}

// ============== DASHBOARD STATS ==============

export async function getDashboardStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
        totalProducts,
        totalCustomers,
        totalVendors,
        salesThisMonth,
        purchasesThisMonth,
        revenueThisMonth,
    ] = await Promise.all([
        prisma.product.count(),
        prisma.contact.count({ where: { type: { in: ['CUSTOMER', 'BOTH'] } } }),
        prisma.contact.count({ where: { type: { in: ['VENDOR', 'BOTH'] } } }),
        prisma.saleOrder.count({
            where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
        }),
        prisma.purchaseOrder.count({
            where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
        }),
        prisma.payment.aggregate({
            where: {
                partnerType: 'customer',
                createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
        }),
    ])

    return {
        totalProducts,
        totalCustomers,
        totalVendors,
        salesThisMonth,
        purchasesThisMonth,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
    }
}
