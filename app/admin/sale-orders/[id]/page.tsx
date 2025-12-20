'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, FileText, Printer, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OrderLine {
  id: string
  quantity: number
  unitPrice: number
  tax: number
  total: number
  product: {
    name: string
    images?: string[]
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
  couponCode?: string
  customer: {
    id: string
    name: string
    email?: string
    street?: string
    city?: string
    state?: string
  }
  paymentTerm?: {
    name: string
  }
  lines: OrderLine[]
  invoice?: {
    id: string
    invoiceNumber: string
    status: string
  }
}

export default function SaleOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/sale-orders/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setOrder(data.data)
      } else {
        toast.error('Order not found')
        router.push('/admin/sale-orders')
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!order) return
    setProcessing(true)

    try {
      const res = await fetch(`/api/sale-orders/${order.id}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Order confirmed successfully!')
        fetchOrder()
      } else {
        toast.error(data.message || 'Failed to confirm order')
      }
    } catch (err) {
      console.error('Failed to confirm order:', err)
      toast.error('Failed to confirm order')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    setProcessing(true)

    try {
      const res = await fetch(`/api/sale-orders/${order.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Order cancelled successfully!')
        setShowCancelDialog(false)
        fetchOrder()
      } else {
        toast.error(data.message || 'Failed to cancel order')
      }
    } catch (err) {
      console.error('Failed to cancel order:', err)
      toast.error('Failed to cancel order')
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!order) return
    setProcessing(true)

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Invoice created successfully!')
        fetchOrder()
      } else {
        toast.error(data.message || 'Failed to create invoice')
      }
    } catch (err) {
      console.error('Failed to create invoice:', err)
      toast.error('Failed to create invoice')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'default'
      case 'CONFIRMED': return 'secondary'
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

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/sale-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground">Customer: {order.customer.name}</p>
          </div>
          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${order.status !== 'DRAFT' && order.status !== 'CANCELLED' ? 'text-green-600' : order.status === 'DRAFT' ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${order.status === 'DRAFT' ? 'bg-amber-600' : order.status !== 'CANCELLED' ? 'bg-green-600' : 'bg-gray-400'}`}>
                {order.status !== 'DRAFT' && order.status !== 'CANCELLED' ? '✓' : '1'}
              </div>
              <span className="font-medium">Draft</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className={`flex items-center gap-2 ${order.status === 'CONFIRMED' || order.status === 'PAID' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${order.status === 'CONFIRMED' ? 'bg-amber-600' : order.status === 'PAID' ? 'bg-green-600' : 'bg-gray-300'}`}>
                {order.status === 'PAID' ? '✓' : '2'}
              </div>
              <span className="font-medium">Confirmed</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className={`flex items-center gap-2 ${order.status === 'PAID' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${order.status === 'PAID' ? 'bg-green-600' : 'bg-gray-300'}`}>
                {order.status === 'PAID' ? '✓' : '3'}
              </div>
              <span className="font-medium">Paid</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-6">
        {order.status === 'DRAFT' && (
          <>
            <Button 
              onClick={handleConfirmOrder} 
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
              Confirm
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelDialog(true)}
              disabled={processing}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </>
        )}
        {order.status === 'CONFIRMED' && !order.invoice && (
          <Button 
            onClick={handleCreateInvoice}
            disabled={processing}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText size={16} className="mr-2" />}
            Create Invoice
          </Button>
        )}
        {order.invoice && (
          <Link href={`/admin/invoices/${order.invoice.id}`}>
            <Button variant="outline">
              <FileText size={16} className="mr-2" />
              View Invoice ({order.invoice.invoiceNumber})
            </Button>
          </Link>
        )}
        <Button 
          variant="outline" 
          onClick={() => setShowCouponDialog(true)}
          disabled={order.status !== 'DRAFT'}
        >
          Coupon Code
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Term</p>
                  <p className="font-medium">{order.paymentTerm?.name || 'Immediate'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Order Lines</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.product.name}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell className="text-right">{line.tax}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.total)}</TableCell>
                  </TableRow>
                ))}
                {order.discountAmount > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-green-600">
                      Discount ({order.couponCode})
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      -{formatCurrency(order.discountAmount)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Summary & Customer */}
        <div className="space-y-6">
          {/* Summary */}
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
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              {order.customer.email && <p>{order.customer.email}</p>}
              {(order.customer.street || order.customer.city) && (
                <p className="text-muted-foreground">
                  {[order.customer.street, order.customer.city, order.customer.state].filter(Boolean).join(', ')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              No, Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Coupon Code</DialogTitle>
            <DialogDescription>
              Enter a coupon code to apply a discount to this order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="couponCode">Coupon Code</Label>
            <Input
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
              Discard
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
