'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, CreditCard, Printer, ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react'
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

interface InvoiceItem {
  id: string
  quantity: number
  unitPrice: number
  taxPercent: number
  totalPrice: number
  product: {
    name: string
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  amountPaid: number
  amountDue: number
  status: string
  taxAmount: number
  subtotal: number
  paidOn?: string
  customer: {
    name: string
    email?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
  order: {
    orderNumber: string
  }
  items: InvoiceItem[]
  paymentTerm?: {
    name: string
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  // Auto-open payment modal if ?pay=true
  useEffect(() => {
    if (searchParams.get('pay') === 'true' && invoice && invoice.amountDue > 0) {
      setShowPaymentModal(true)
    }
  }, [searchParams, invoice])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setInvoice(data.data)
        setPaymentAmount(data.data.amountDue.toString())
      } else {
        toast.error('Invoice not found')
        router.push('/invoices')
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err)
      toast.error('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!invoice) return
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    if (amount > invoice.amountDue) {
      toast.error('Amount cannot exceed amount due')
      return
    }

    setProcessing(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: paymentMethod,
          paymentType: 'INBOUND',
          partnerType: 'CUSTOMER',
          date: new Date().toISOString().split('T')[0],
          customerInvoiceId: invoice.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Payment successful!')
        setShowPaymentModal(false)
        fetchInvoice() // Refresh invoice data
      } else {
        toast.error(data.message || 'Payment failed')
      }
    } catch (err) {
      console.error('Payment failed:', err)
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatAddress = () => {
    if (!invoice?.customer) return null
    const parts = [
      invoice.customer.name,
      invoice.customer.address,
      [invoice.customer.city, invoice.customer.state, invoice.customer.pincode].filter(Boolean).join(', '),
      invoice.customer.email,
    ].filter(Boolean)
    return parts
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'default'
      case 'PARTIAL': return 'secondary'
      default: return 'destructive'
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="mt-4 text-muted-foreground">Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-amber-600">
          <Home size={16} />
        </Link>
        <span>/</span>
        <Link href="/invoices" className="hover:text-amber-600">Invoices</Link>
        <span>/</span>
        <span className="text-foreground">{invoice.invoiceNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <Badge variant={getStatusVariant(invoice.status)}>
            {invoice.status === 'PAID' ? 'Paid' : invoice.status === 'PARTIAL' ? 'Partially Paid' : 'Waiting for Payment'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {invoice.amountDue > 0 && (
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <CreditCard size={16} className="mr-2" />
              Pay Now
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice {invoice.invoiceNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium">{invoice.order?.orderNumber || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.taxPercent}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Totals */}
            <div className="border-t p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Untaxed Amount</span>
                <span>{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {invoice.paidOn && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Paid on {formatDate(invoice.paidOn)}</span>
                  <span>-{formatCurrency(invoice.amountPaid)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Amount Due</span>
                <span className={invoice.amountDue > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(invoice.amountDue)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Terms */}
          {invoice.paymentTerm && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Payment Terms</p>
                <p className="font-medium">{invoice.paymentTerm.name}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Address */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              {formatAddress()?.length ? (
                <div className="space-y-1 text-sm">
                  {formatAddress()?.map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-medium' : ''}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">No address set</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Pay for invoice {invoice.invoiceNumber}. Amount due: {formatCurrency(invoice.amountDue)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Payment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={invoice.amountDue}
                min={1}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['UPI', 'Card', 'NetBanking'].map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={paymentMethod === method ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod(method)}
                    className={paymentMethod === method ? 'bg-amber-600 hover:bg-amber-700' : ''}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check size={16} className="mr-2" />
              )}
              Pay {formatCurrency(parseFloat(paymentAmount) || 0)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
