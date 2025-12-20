'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Receipt, Tag, Users, BarChart3, ArrowRight, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  salesThisMonth: number
  activeOffers: number
  pendingInvoices: { count: number; amount: number }
  pendingBills: { count: number; amount: number }
  lowStockProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<Array<{text: string; time: string}>>([])

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch products count
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      const totalProducts = productsData.success ? (productsData.data?.length || 0) : 0
      const lowStockProducts = productsData.success 
        ? (productsData.data?.filter((p: { stock: number }) => p.stock < 20)?.length || 0) 
        : 0

      // Fetch contacts count (customers)
      const contactsRes = await fetch('/api/contacts')
      const contactsData = await contactsRes.json()
      const totalCustomers = contactsData.success 
        ? (contactsData.data?.filter((c: { type: string }) => c.type === 'CUSTOMER')?.length || 0)
        : 0

      // Fetch sale orders for sales this month
      const ordersRes = await fetch('/api/sale-orders')
      const ordersData = await ordersRes.json()
      const now = new Date()
      const thisMonth = ordersData.success 
        ? (ordersData.data?.filter((o: { createdAt: string }) => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
          }) || [])
        : []
      const salesThisMonth = thisMonth.reduce((sum: number, o: { totalAmount: number }) => sum + (o.totalAmount || 0), 0)

      // Fetch invoices for pending
      const invoicesRes = await fetch('/api/invoices')
      const invoicesData = await invoicesRes.json()
      const pendingInvoices = invoicesData.success 
        ? (invoicesData.data?.filter((i: { status: string }) => i.status !== 'PAID') || [])
        : []
      const pendingInvoicesAmount = pendingInvoices.reduce((sum: number, i: { amountDue: number }) => sum + (i.amountDue || 0), 0)

      // Fetch vendor bills for pending
      const billsRes = await fetch('/api/vendor-bills')
      const billsData = await billsRes.json()
      const pendingBills = billsData.success 
        ? (billsData.data?.filter((b: { status: string }) => b.status !== 'PAID') || [])
        : []
      const pendingBillsAmount = pendingBills.reduce((sum: number, b: { amountDue: number }) => sum + (b.amountDue || 0), 0)

      // Fetch coupons for active offers
      const couponsRes = await fetch('/api/coupons')
      const couponsData = await couponsRes.json()
      const activeOffers = couponsData.success 
        ? (couponsData.data?.filter((c: { isActive: boolean }) => c.isActive)?.length || 0)
        : 0

      setStats({
        totalProducts,
        totalCustomers,
        salesThisMonth,
        activeOffers,
        pendingInvoices: { count: pendingInvoices.length, amount: pendingInvoicesAmount },
        pendingBills: { count: pendingBills.length, amount: pendingBillsAmount },
        lowStockProducts,
      })

      // Generate recent activity from real data
      const activities: Array<{text: string; time: string}> = []
      if (ordersData.success && ordersData.data?.length > 0) {
        const latestOrder = ordersData.data[0]
        activities.push({ text: `New sale order ${latestOrder.orderNumber} created`, time: 'Recently' })
      }
      if (invoicesData.success && invoicesData.data?.length > 0) {
        const latestInvoice = invoicesData.data[0]
        activities.push({ text: `Invoice ${latestInvoice.invoiceNumber} generated`, time: 'Recently' })
      }
      if (productsData.success && productsData.data?.length > 0) {
        const latestProduct = productsData.data[0]
        activities.push({ text: `Product "${latestProduct.name}" added`, time: 'Recently' })
      }
      if (contactsData.success && contactsData.data?.length > 0) {
        const latestContact = contactsData.data[0]
        activities.push({ text: `Contact "${latestContact.name}" registered`, time: 'Recently' })
      }
      setRecentActivity(activities.slice(0, 4))

    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalProducts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
            <Link href="/admin/products" className="flex items-center gap-1 text-sm text-amber-600 mt-4 hover:underline">
              View all <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalCustomers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
            <Link href="/admin/contacts" className="flex items-center gap-1 text-sm text-amber-600 mt-4 hover:underline">
              View all <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sales This Month</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats?.salesThisMonth || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-purple-600" size={24} />
              </div>
            </div>
            <Link href="/admin/sale-orders" className="flex items-center gap-1 text-sm text-amber-600 mt-4 hover:underline">
              View orders <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Offers</p>
                <p className="text-3xl font-bold mt-1">{stats?.activeOffers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tag className="text-orange-600" size={24} />
              </div>
            </div>
            <Link href="/admin/discount-offers" className="flex items-center gap-1 text-sm text-amber-600 mt-4 hover:underline">
              Manage offers <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/products/new">
                <Button className="w-full justify-start bg-amber-600 hover:bg-amber-700">
                  <Package size={18} className="mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link href="/admin/sale-orders/new">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt size={18} className="mr-2" />
                  Create Sale Order
                </Button>
              </Link>
              <Link href="/admin/purchase-orders/new">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt size={18} className="mr-2" />
                  Create Purchase Order
                </Button>
              </Link>
              <Link href="/admin/contacts/new">
                <Button variant="outline" className="w-full justify-start">
                  <Users size={18} className="mr-2" />
                  Add New Contact
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-amber-600" />
                    <div>
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pending Invoices</h3>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium">
                {stats?.pendingInvoices.count || 0}
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.pendingInvoices.amount || 0)}</p>
            <p className="text-sm text-muted-foreground">To be collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pending Bills</h3>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                {stats?.pendingBills.count || 0}
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.pendingBills.amount || 0)}</p>
            <p className="text-sm text-muted-foreground">To be paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Low Stock Items</h3>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                {stats?.lowStockProducts || 0}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats?.lowStockProducts || 0} Products</p>
            <p className="text-sm text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
