'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Package,
  Receipt,
  Tag,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'

const navItems = [
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Billing & Payments',
    href: '/admin/billing',
    icon: Receipt,
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
    icon: Tag,
    children: [
      { title: 'Payment Terms', href: '/admin/payment-terms' },
      { title: 'Discount Offers', href: '/admin/discount-offers' },
    ],
  },
  {
    title: 'Users & Contacts',
    href: '/admin/users-contacts',
    icon: Users,
    children: [
      { title: 'Users', href: '/admin/users' },
      { title: 'Contacts', href: '/admin/contacts' },
    ],
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
]

interface UserData {
  name: string
  email: string
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [user, setUser] = useState<UserData | null>(null)

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
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    
    if (pathname !== '/admin/login' && pathname !== '/admin/register') {
      fetchUser()
    }
  }, [pathname])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname.startsWith(href)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/admin/login')
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

  // Don't show layout for login/register pages
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--secondary)]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--background)] border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-amber-50 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-semibold text-lg">ApparelDesk</span>
          </Link>
        </div>

        {/* Navigation Modules */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.children ? item.children[0].href : item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-[var(--primary)] text-white'
                  : 'hover:bg-amber-50'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 p-2 hover:bg-amber-50 rounded-lg">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-sm">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {user?.name || 'Loading...'}
              </span>
              <ChevronDown size={16} />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--background)] border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link
                href="/admin/profile"
                className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-sm"
              >
                <User size={16} />
                My Profile
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-sm"
              >
                <Settings size={16} />
                Settings
              </Link>
              <hr className="my-1" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-sm w-full text-left text-red-600"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-[var(--background)] border-r transition-transform z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedItems.includes(item.title)

              return (
                <div key={item.title}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-amber-100 text-amber-900'
                          : 'hover:bg-amber-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} />
                        {item.title}
                      </span>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-amber-100 text-amber-900'
                          : 'hover:bg-amber-50'
                      }`}
                    >
                      <Icon size={18} />
                      {item.title}
                    </Link>
                  )}

                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children!.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === child.href ||
                            pathname.startsWith(child.href.split('?')[0])
                              ? 'bg-amber-100 text-amber-900 font-medium'
                              : 'hover:bg-amber-50 text-gray-600'
                          }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 min-h-[calc(100vh-4rem)] transition-all ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
