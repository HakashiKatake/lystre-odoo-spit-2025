'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle, Printer, ShoppingBag, Loader2, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OrderLine {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: {
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  lines: OrderLine[]
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/sale-orders/${orderId}`)
      const data = await res.json()
      
      if (data.success) {
        setOrder(data.data)
      } else {
        setError('Order not found')
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <XCircle size={64} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'We could not find your order.'}</p>
        <div className="flex justify-center gap-4">
          <Link href="/orders">
            <Button variant="outline">View My Orders</Button>
          </Link>
          <Link href="/products">
            <Button className="bg-amber-600 hover:bg-amber-700">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
        <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg">
          Your payment has been processed successfully
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Order {order.orderNumber}</h2>
              <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order.lines?.map((line: OrderLine) => (
              <div key={line.id} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {line.product.images?.[0] ? (
                      <img 
                        src={line.product.images[0]} 
                        alt={line.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="text-muted-foreground" size={24} />
                    )}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
                    {line.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{line.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {line.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(line.total)}</p>
              </div>
            ))}
          </div>

          <hr className="my-6" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <hr className="my-6" />

          {/* Next Steps */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              A confirmation email has been sent to your registered email address.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/orders">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  View My Orders
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-4" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
