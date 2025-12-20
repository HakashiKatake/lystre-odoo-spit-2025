'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Eye, ShoppingBag, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SaleOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  customer: {
    name: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<SaleOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch current user to get their customer ID
        const userRes = await fetch('/api/auth/me')
        const userData = await userRes.json()
        
        if (!userData.success) {
          setError('Please login to view your orders')
          setLoading(false)
          return
        }

        // Fetch orders for this customer
        const res = await fetch(`/api/sale-orders?customerId=${userData.data.contactId}`)
        const data = await res.json()
        
        if (data.success) {
          setOrders(data.data || [])
        } else {
          setError(data.message || 'Failed to fetch orders')
        }
      } catch (err) {
        setError('Failed to load orders')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default'
      case 'DRAFT': return 'secondary'
      case 'CANCELLED': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="mt-4 text-muted-foreground">Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-amber-600">
          <Home size={16} />
        </Link>
        <span>/</span>
        <Link href="/account" className="hover:text-amber-600">My Account</Link>
        <span>/</span>
        <span className="text-foreground">Orders</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {error && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {orders.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-amber-600">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Link href="/products">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
