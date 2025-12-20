'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, User, ChevronDown, LogOut, Package, FileText } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { toast } from 'sonner'

interface UserData {
  name: string
  email: string
  role: string
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.data) {
          setUser({
            name: data.data.name || data.data.email.split('@')[0],
            email: data.data.email,
            role: data.data.role,
          })
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      } catch {
        setIsLoggedIn(false)
      }
    }
    
    fetchUser()
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setIsLoggedIn(false)
      toast.success('Logged out successfully')
      router.push('/login')
    } catch {
      toast.error('Failed to logout')
    }
  }

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <span className="font-bold text-xl">ApparelDesk</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-[var(--primary)]' : 'hover:text-[var(--primary)]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/products') ? 'text-[var(--primary)]' : 'hover:text-[var(--primary)]'
              }`}
            >
              Shop
            </Link>
            {isLoggedIn && (
              <Link
                href="/account"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith('/account') ? 'text-[var(--primary)]' : 'hover:text-[var(--primary)]'
                }`}
              >
                My Account
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-[var(--muted)] rounded-lg">
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>

            {/* User Menu */}
            {isLoggedIn && user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded-lg">
                  <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-sm">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  <ChevronDown size={16} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    <User size={16} />
                    My Account
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    <Package size={16} />
                    My Orders
                  </Link>
                  <Link href="/invoices" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    <FileText size={16} />
                    My Invoices
                  </Link>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm w-full text-left text-red-600"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--secondary)] border-t py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-bold">ApparelDesk</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Your one-stop destination for quality clothing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="hover:text-[var(--primary)]">Shop</Link></li>
                <li><Link href="/account" className="hover:text-[var(--primary)]">My Account</Link></li>
                <li><Link href="/orders" className="hover:text-[var(--primary)]">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products?category=men" className="hover:text-[var(--primary)]">Men</Link></li>
                <li><Link href="/products?category=women" className="hover:text-[var(--primary)]">Women</Link></li>
                <li><Link href="/products?category=children" className="hover:text-[var(--primary)]">Children</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li>Email: support@appareldesk.com</li>
                <li>Phone: +91 98765 43210</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>
          <hr className="my-6" />
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            © 2025 ApparelDesk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
