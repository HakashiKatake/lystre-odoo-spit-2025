'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Search, Eye, FileText, Loader2, ShoppingBag } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface PurchaseOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  vendor: {
    name: string
  }
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/purchase-orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Purchase Orders</h1>
        <Link href="/admin/purchase-orders/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus size={18} className="mr-1" />
            New Purchase Order
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.vendor?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/purchase-orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      {order.status === 'CONFIRMED' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" title="Create Bill">
                          <FileText size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No purchase orders found</h2>
            <p className="text-muted-foreground mb-6">
              {orders.length === 0 
                ? 'Create your first purchase order.' 
                : 'Try adjusting your search or filter.'}
            </p>
            <Link href="/admin/purchase-orders/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus size={18} className="mr-1" />
                New Purchase Order
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
