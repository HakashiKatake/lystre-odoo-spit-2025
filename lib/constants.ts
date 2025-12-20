// Product Categories
export const PRODUCT_CATEGORIES = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'children', label: 'Children' },
] as const

// Product Types
export const PRODUCT_TYPES = [
    { value: 'tshirt', label: 'T-Shirts' },
    { value: 'shirt', label: 'Shirts' },
    { value: 'kurta', label: 'Kurtas' },
    { value: 'formals', label: 'Formals' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'hoodies', label: 'Hoodies' },
    { value: 'sarees', label: 'Sarees' },
    { value: 'nightwear', label: 'Nightwear' },
    { value: 'pant', label: 'Pants' },
] as const

// Materials
export const PRODUCT_MATERIALS = [
    { value: 'cotton', label: 'Cotton' },
    { value: 'nylon', label: 'Nylon' },
    { value: 'polyester', label: 'Polyester' },
    { value: 'wool', label: 'Wool' },
    { value: 'silk', label: 'Silk' },
    { value: 'linen', label: 'Linen' },
] as const

// Colors
export const PRODUCT_COLORS = [
    { value: 'red', label: 'Red', hex: '#EF4444' },
    { value: 'blue', label: 'Blue', hex: '#3B82F6' },
    { value: 'green', label: 'Green', hex: '#22C55E' },
    { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
    { value: 'orange', label: 'Orange', hex: '#F97316' },
    { value: 'purple', label: 'Purple', hex: '#A855F7' },
    { value: 'pink', label: 'Pink', hex: '#EC4899' },
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'gray', label: 'Gray', hex: '#6B7280' },
    { value: 'brown', label: 'Brown', hex: '#92400E' },
    { value: 'navy', label: 'Navy', hex: '#1E3A5F' },
] as const

// Contact Types
export const CONTACT_TYPES = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'VENDOR', label: 'Vendor' },
    { value: 'BOTH', label: 'Both' },
] as const

// User Roles
export const USER_ROLES = [
    { value: 'INTERNAL', label: 'Internal User' },
    { value: 'PORTAL', label: 'Portal User' },
] as const

// Order Statuses
export const ORDER_STATUSES = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' },
] as const

// Invoice Statuses
export const INVOICE_STATUSES = [
    { value: 'UNPAID', label: 'Unpaid' },
    { value: 'PARTIAL', label: 'Partial' },
    { value: 'PAID', label: 'Paid' },
] as const

// Payment Methods
export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
] as const

// Payment Types
export const PAYMENT_TYPES = [
    { value: 'send', label: 'Send' },
    { value: 'receive', label: 'Receive' },
] as const

// Discount Available On
export const DISCOUNT_AVAILABLE_ON = [
    { value: 'SALES', label: 'Sales' },
    { value: 'WEBSITE', label: 'Website' },
] as const

// Report Types
export const REPORT_TYPES = [
    { value: 'sales', label: 'Sales' },
    { value: 'purchase', label: 'Purchase' },
] as const

// Report Group By
export const REPORT_GROUP_BY = [
    { value: 'product', label: 'Product' },
    { value: 'contact', label: 'Contact' },
] as const

// Discount Computation
export const DISCOUNT_COMPUTATION = [
    { value: 'base_amount', label: 'Base Amount (Product Value)' },
    { value: 'total_amount', label: 'Total Amount (Base + Tax)' },
] as const

// Indian States
export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh',
] as const

// Default Tax Rate
export const DEFAULT_TAX_RATE = 10

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Navigation items for admin sidebar
export const ADMIN_NAV_ITEMS = [
    {
        title: 'Products',
        href: '/admin/products',
        icon: 'Package',
    },
    {
        title: 'Billing & Payments',
        href: '/admin/billing',
        icon: 'Receipt',
        children: [
            { title: 'Sale Orders', href: '/admin/sale-orders' },
            { title: 'Customer Invoices', href: '/admin/invoices' },
            { title: 'Customer Payments', href: '/admin/payments?type=customer' },
            { title: 'Purchase Orders', href: '/admin/purchase-orders' },
            { title: 'Vendor Bills', href: '/admin/vendor-bills' },
            { title: 'Vendor Payments', href: '/admin/payments?type=vendor' },
        ],
    },
    {
        title: 'Terms & Offers',
        href: '/admin/terms-offers',
        icon: 'Tag',
        children: [
            { title: 'Payment Terms', href: '/admin/payment-terms' },
            { title: 'Discount Offers', href: '/admin/discount-offers' },
        ],
    },
    {
        title: 'Users & Contacts',
        href: '/admin/users-contacts',
        icon: 'Users',
        children: [
            { title: 'Users', href: '/admin/users' },
            { title: 'Contacts', href: '/admin/contacts' },
        ],
    },
    {
        title: 'Reports',
        href: '/admin/reports',
        icon: 'BarChart3',
    },
] as const

// Portal navigation items
export const PORTAL_NAV_ITEMS = [
    { title: 'Home', href: '/' },
    { title: 'Shop', href: '/products' },
    { title: 'My Account', href: '/account', requiresAuth: true },
] as const
