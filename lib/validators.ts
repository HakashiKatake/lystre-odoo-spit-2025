import { z } from 'zod'

// ============== AUTH VALIDATORS ==============

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    mobile: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

// ============== USER VALIDATORS ==============

export const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    mobile: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    role: z.enum(['INTERNAL', 'PORTAL']),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

// ============== CONTACT VALIDATORS ==============

export const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.enum(['CUSTOMER', 'VENDOR', 'BOTH']),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    mobile: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
})

// ============== PRODUCT VALIDATORS ==============

export const productSchema = z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    category: z.enum(['men', 'women', 'children']),
    type: z.enum(['tshirt', 'shirt', 'kurta', 'formals', 'jeans', 'hoodies', 'sarees', 'nightwear', 'pant']),
    material: z.enum(['cotton', 'nylon', 'polyester', 'wool', 'silk', 'linen']),
    colors: z.array(z.string()).min(1, 'Select at least one color'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    salesPrice: z.number().positive('Sales price must be positive'),
    salesTax: z.number().min(0).max(100, 'Tax must be between 0 and 100'),
    purchasePrice: z.number().positive('Purchase price must be positive'),
    purchaseTax: z.number().min(0).max(100, 'Tax must be between 0 and 100'),
    published: z.boolean().default(false),
    images: z.array(z.string()).optional(),
})

// ============== PAYMENT TERM VALIDATORS ==============

export const paymentTermSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    earlyPaymentDiscount: z.boolean().default(false),
    discountPercentage: z.number().min(0).max(100).optional().nullable(),
    discountDays: z.number().int().min(0).optional().nullable(),
    discountComputation: z.enum(['base_amount', 'total_amount']).optional(),
    examplePreview: z.string().optional(),
    active: z.boolean().default(true),
})

// ============== DISCOUNT OFFER VALIDATORS ==============

export const discountOfferSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    discountPercentage: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    availableOn: z.enum(['SALES', 'WEBSITE']),
})

export const generateCouponsSchema = z.object({
    discountOfferId: z.string(),
    quantity: z.number().int().positive().optional(),
    contactIds: z.array(z.string()).optional(),
    expirationDate: z.string().or(z.date()).optional(),
})

// ============== ORDER VALIDATORS ==============

export const saleOrderLineSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive('Quantity must be at least 1'),
    unitPrice: z.number().positive(),
    tax: z.number().min(0).max(100),
})

export const saleOrderSchema = z.object({
    customerId: z.string(),
    paymentTermId: z.string().optional(),
    couponCode: z.string().optional(),
    lines: z.array(saleOrderLineSchema).min(1, 'Order must have at least one item'),
})

export const purchaseOrderLineSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive('Quantity must be at least 1'),
    unitPrice: z.number().positive(),
    tax: z.number().min(0).max(100),
})

export const purchaseOrderSchema = z.object({
    vendorId: z.string(),
    lines: z.array(purchaseOrderLineSchema).min(1, 'Order must have at least one item'),
})

// ============== PAYMENT VALIDATORS ==============

export const paymentSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    method: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'Card', 'NetBanking', 'cash', 'bank_transfer', 'upi', 'card']),
    paymentType: z.enum(['INBOUND', 'OUTBOUND', 'send', 'receive']),
    partnerType: z.enum(['CUSTOMER', 'VENDOR', 'customer', 'vendor']),
    date: z.string().or(z.date()),
    note: z.string().optional(),
    customerInvoiceId: z.string().optional(),
    vendorBillId: z.string().optional(),
})

// ============== COUPON VALIDATORS ==============

export const validateCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required'),
    contactId: z.string().optional(),
})

// ============== REPORT VALIDATORS ==============

export const reportSchema = z.object({
    reportType: z.enum(['sales', 'purchase']),
    groupBy: z.enum(['product', 'contact']),
    fromDate: z.string().or(z.date()),
    toDate: z.string().or(z.date()),
})

// ============== CART VALIDATORS ==============

export const cartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    color: z.string().optional(),
})

export const checkoutSchema = z.object({
    items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
    couponCode: z.string().optional(),
    shippingAddress: z.object({
        street: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        pincode: z.string().min(1, 'Pincode is required'),
    }),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UserInput = z.infer<typeof userSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type ProductInput = z.infer<typeof productSchema>
export type PaymentTermInput = z.infer<typeof paymentTermSchema>
export type DiscountOfferInput = z.infer<typeof discountOfferSchema>
export type SaleOrderInput = z.infer<typeof saleOrderSchema>
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type CartItemInput = z.infer<typeof cartItemSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReportInput = z.infer<typeof reportSchema>
