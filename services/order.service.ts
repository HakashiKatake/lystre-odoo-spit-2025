import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import type { SaleOrderInput, PurchaseOrderInput } from '@/lib/validators'
import type { Prisma } from '@prisma/client/index.js'

// ============== SALE ORDER SERVICE ==============

export async function createSaleOrder(data: SaleOrderInput) {
    const orderNumber = generateOrderNumber('SO')

    // Calculate totals
    let subtotal = 0
    let taxAmount = 0
    const lines = data.lines.map((line) => {
        const lineTotal = line.unitPrice * line.quantity
        const lineTax = (lineTotal * line.tax) / 100
        subtotal += lineTotal
        taxAmount += lineTax
        return {
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            tax: line.tax,
            total: lineTotal + lineTax,
        }
    })

    // Apply coupon discount if provided
    let discountAmount = 0
    if (data.couponCode) {
        const couponResult = await validateAndApplyCoupon(data.couponCode, data.customerId)
        if (couponResult.valid) {
            discountAmount = (subtotal * couponResult.discountPercentage!) / 100
        }
    }

    const totalAmount = subtotal + taxAmount - discountAmount

    const order = await prisma.saleOrder.create({
        data: {
            orderNumber,
            customerId: data.customerId,
            paymentTermId: data.paymentTermId,
            couponCode: data.couponCode,
            discountAmount,
            subtotal,
            taxAmount,
            totalAmount,
            lines: {
                create: lines,
            },
        },
        include: {
            customer: true,
            lines: { include: { product: true } },
            paymentTerm: true,
        },
    })

    return order
}

export async function confirmSaleOrder(orderId: string) {
    const order = await prisma.saleOrder.findUnique({
        where: { id: orderId },
        include: { lines: true },
    })

    if (!order) throw new Error('Order not found')
    if (order.status !== 'DRAFT') throw new Error('Order is not in draft status')

    // Check stock availability
    for (const line of order.lines) {
        const product = await prisma.product.findUnique({
            where: { id: line.productId },
        })
        if (!product || product.stock < line.quantity) {
            throw new Error(`Insufficient stock for product: ${product?.name}`)
        }
    }

    // Update order status and reduce stock
    await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.saleOrder.update({
            where: { id: orderId },
            data: { status: 'CONFIRMED' },
        })

        // Reduce stock for each product
        for (const line of order.lines) {
            await tx.product.update({
                where: { id: line.productId },
                data: { stock: { decrement: line.quantity } },
            })
        }

        // Mark coupon as used if applicable
        if (order.couponCode) {
            await tx.coupon.updateMany({
                where: { code: order.couponCode },
                data: { status: 'USED' },
            })
        }
    })

    return prisma.saleOrder.findUnique({
        where: { id: orderId },
        include: { customer: true, lines: { include: { product: true } } },
    })
}

export async function cancelSaleOrder(orderId: string) {
    const order = await prisma.saleOrder.findUnique({
        where: { id: orderId },
        include: { lines: true },
    })

    if (!order) throw new Error('Order not found')
    if (order.status === 'PAID') throw new Error('Cannot cancel a paid order')

    await prisma.$transaction(async (tx) => {
        // If order was confirmed, restore stock
        if (order.status === 'CONFIRMED') {
            for (const line of order.lines) {
                await tx.product.update({
                    where: { id: line.productId },
                    data: { stock: { increment: line.quantity } },
                })
            }
        }

        await tx.saleOrder.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        })
    })

    return prisma.saleOrder.findUnique({
        where: { id: orderId },
    })
}

// ============== PURCHASE ORDER SERVICE ==============

export async function createPurchaseOrder(data: PurchaseOrderInput) {
    const orderNumber = generateOrderNumber('PO')

    let subtotal = 0
    let taxAmount = 0
    const lines = data.lines.map((line) => {
        const lineTotal = line.unitPrice * line.quantity
        const lineTax = (lineTotal * line.tax) / 100
        subtotal += lineTotal
        taxAmount += lineTax
        return {
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            tax: line.tax,
            total: lineTotal + lineTax,
        }
    })

    const totalAmount = subtotal + taxAmount

    const order = await prisma.purchaseOrder.create({
        data: {
            orderNumber,
            vendorId: data.vendorId,
            subtotal,
            taxAmount,
            totalAmount,
            lines: {
                create: lines,
            },
        },
        include: {
            vendor: true,
            lines: { include: { product: true } },
        },
    })

    return order
}

export async function confirmPurchaseOrder(orderId: string) {
    const order = await prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { lines: true },
    })

    if (!order) throw new Error('Order not found')
    if (order.status !== 'DRAFT') throw new Error('Order is not in draft status')

    // Update order status and increase stock
    await prisma.$transaction(async (tx) => {
        await tx.purchaseOrder.update({
            where: { id: orderId },
            data: { status: 'CONFIRMED' },
        })

        // Increase stock for each product
        for (const line of order.lines) {
            await tx.product.update({
                where: { id: line.productId },
                data: { stock: { increment: line.quantity } },
            })
        }
    })

    return prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { vendor: true, lines: { include: { product: true } } },
    })
}

// ============== COUPON VALIDATION ==============

export async function validateAndApplyCoupon(code: string, contactId?: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { code },
        include: { discountOffer: true },
    })

    if (!coupon) {
        return { valid: false, message: 'Coupon not found' }
    }

    if (coupon.status === 'USED') {
        return { valid: false, message: 'Coupon has already been used' }
    }

    // Check expiration
    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
        return { valid: false, message: 'Coupon has expired' }
    }

    // Check offer validity period
    const now = new Date()
    if (now < coupon.discountOffer.startDate || now > coupon.discountOffer.endDate) {
        return { valid: false, message: 'Coupon is not valid during this period' }
    }

    // Check contact restriction
    if (coupon.contactId && coupon.contactId !== contactId) {
        return { valid: false, message: 'This coupon is not valid for this customer' }
    }

    return {
        valid: true,
        discountPercentage: coupon.discountOffer.discountPercentage,
        message: `${coupon.discountOffer.discountPercentage}% discount applied!`,
    }
}

// ============== ORDER STATS ==============

export async function getOrderStats(type: 'sale' | 'purchase') {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    if (type === 'sale') {
        const [totalThisMonth, pendingInvoice, overdue] = await Promise.all([
            prisma.saleOrder.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            prisma.saleOrder.count({
                where: { status: 'CONFIRMED', invoice: null },
            }),
            prisma.customerInvoice.aggregate({
                where: { status: 'UNPAID', dueDate: { lt: now } },
                _sum: { totalAmount: true },
            }),
        ])

        return {
            totalThisMonth,
            pendingInvoice,
            overdueAmount: overdue._sum.totalAmount || 0,
        }
    } else {
        const [totalThisMonth, pendingBill, overdue] = await Promise.all([
            prisma.purchaseOrder.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            prisma.purchaseOrder.count({
                where: { status: 'CONFIRMED', bill: null },
            }),
            prisma.vendorBill.aggregate({
                where: { status: 'UNPAID', dueDate: { lt: now } },
                _sum: { totalAmount: true },
            }),
        ])

        return {
            totalThisMonth,
            pendingBill,
            overdueAmount: overdue._sum.totalAmount || 0,
        }
    }
}
