'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Printer, Loader2, FileText, Check } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    id: string
    name: string
    email?: string
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
  order?: {
    id: string
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
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setInvoice(data.data)
        setPaymentAmount(data.data.amountDue.toString())
      } else {
        toast.error('Invoice not found')
        router.push('/admin/invoices')
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err)
      toast.error('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterPayment = async () => {
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
        toast.success('Payment registered successfully!')
        setShowPaymentModal(false)
        fetchInvoice()
      } else {
        toast.error(data.message || 'Failed to register payment')
      }
    } catch (err) {
      console.error('Payment registration failed:', err)
      toast.error('Failed to register payment')
    } finally {
      setProcessing(false)
    }
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">{invoice.customer.name}</p>
          </div>
          <Badge variant={getStatusVariant(invoice.status)}>
            {invoice.status === 'PAID' ? 'Paid' : invoice.status === 'PARTIAL' ? 'Partially Paid' : 'Open'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {invoice.amountDue > 0 && (
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard size={16} className="mr-2" />
              Register Payment
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
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source Order</p>
                  {invoice.order ? (
                    <Link href={`/admin/sale-orders/${invoice.order.id}`} className="font-medium text-amber-600 hover:underline">
                      {invoice.order.orderNumber}
                    </Link>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Lines</CardTitle>
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
                <span className="text-muted-foreground">Subtotal</span>
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
              <div className="flex justify-between text-sm text-green-600">
                <span>Amount Paid</span>
                <span>{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Amount Due</span>
                <span className={invoice.amountDue > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(invoice.amountDue)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{invoice.customer.name}</p>
              {invoice.customer.email && <p>{invoice.customer.email}</p>}
              {(invoice.customer.street || invoice.customer.city) && (
                <p className="text-muted-foreground">
                  {[invoice.customer.street, invoice.customer.city, invoice.customer.state, invoice.customer.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              <Link href={`/admin/contacts/${invoice.customer.id}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  View Contact
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Term */}
          {invoice.paymentTerm && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Term</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{invoice.paymentTerm.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Payment</DialogTitle>
            <DialogDescription>
              Register payment for invoice {invoice.invoiceNumber}. Amount due: {formatCurrency(invoice.amountDue)}
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
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRegisterPayment} 
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check size={16} className="mr-2" />
              )}
              Register Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
