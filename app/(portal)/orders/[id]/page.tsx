'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Home, ArrowLeft, Package, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: string
    name: string
  }
}

interface SaleOrder {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  createdAt: string
  customer: {
    name: string
    email: string
    mobile?: string
  }
  items: OrderItem[]
  shippingAddress?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<SaleOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/sale-orders/${orderId}`)
        const data = await res.json()
        
        if (data.success) {
          setOrder(data.data)
        } else {
          setError(data.message || 'Order not found')
        }
      } catch (err) {
        setError('Failed to load order details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

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
        <p className="mt-4 text-muted-foreground">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'The order you are looking for does not exist.'}</p>
        <Link href="/orders">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </Button>
        </Link>
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
        <Link href="/orders" className="hover:text-amber-600">Orders</Link>
        <span>/</span>
        <span className="text-foreground">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={getStatusVariant(order.status)} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link 
                          href={`/products/${item.product.id}`}
                          className="font-medium hover:text-amber-600"
                        >
                          {item.product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {order.shippingAddress || 'No shipping address provided'}
              </p>
            </CardContent>
          </Card>

          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
