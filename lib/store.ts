import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============== CART STORE ==============

export interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
    color?: string
    size?: string
    image?: string
    tax: number
}

interface CartState {
    items: CartItem[]
    couponCode: string | null
    discountAmount: number
    addItem: (item: CartItem) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    setCoupon: (code: string | null, discountAmount: number) => void
    removeCoupon: () => void
    getSubtotal: () => number
    getTaxAmount: () => number
    getTotal: () => number
    getItemCount: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            couponCode: null,
            discountAmount: 0,

            addItem: (item) =>
                set((state) => {
                    const existingItem = state.items.find(
                        (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
                    )
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.productId === item.productId && i.color === item.color && i.size === item.size
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                        }
                    }
                    return { items: [...state.items, item] }
                }),

            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                })),

            updateQuantity: (productId, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                })),

            clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),

            setCoupon: (code, discountAmount) =>
                set({ couponCode: code, discountAmount }),

            removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

            getSubtotal: () => {
                const { items } = get()
                return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
            },

            getTaxAmount: () => {
                const { items } = get()
                return items.reduce(
                    (sum, item) => sum + (item.price * item.quantity * item.tax) / 100,
                    0
                )
            },

            getTotal: () => {
                const state = get()
                return state.getSubtotal() + state.getTaxAmount() - state.discountAmount
            },

            getItemCount: () => {
                const { items } = get()
                return items.reduce((sum, item) => sum + item.quantity, 0)
            },
        }),
        {
            name: 'appareldesk-cart',
        }
    )
)

// ============== USER STORE ==============

interface UserState {
    user: {
        id: string
        name: string
        email: string
        role: 'INTERNAL' | 'PORTAL'
    } | null
    isLoading: boolean
    setUser: (user: UserState['user']) => void
    clearUser: () => void
    setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    clearUser: () => set({ user: null, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
}))

// ============== UI STORE ==============

interface UIState {
    sidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))

// ============== FILTER STORE ==============

interface FilterState {
    category: string[]
    type: string[]
    material: string[]
    color: string[]
    priceRange: [number, number]
    search: string
    sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'
    setCategory: (category: string[]) => void
    setType: (type: string[]) => void
    setMaterial: (material: string[]) => void
    setColor: (color: string[]) => void
    setPriceRange: (range: [number, number]) => void
    setSearch: (search: string) => void
    setSortBy: (sortBy: FilterState['sortBy']) => void
    clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
    category: [],
    type: [],
    material: [],
    color: [],
    priceRange: [0, 100000],
    search: '',
    sortBy: 'newest',
    setCategory: (category) => set({ category }),
    setType: (type) => set({ type }),
    setMaterial: (material) => set({ material }),
    setColor: (color) => set({ color }),
    setPriceRange: (priceRange) => set({ priceRange }),
    setSearch: (search) => set({ search }),
    setSortBy: (sortBy) => set({ sortBy }),
    clearFilters: () =>
        set({
            category: [],
            type: [],
            material: [],
            color: [],
            priceRange: [0, 100000],
            search: '',
            sortBy: 'newest',
        }),
}))
