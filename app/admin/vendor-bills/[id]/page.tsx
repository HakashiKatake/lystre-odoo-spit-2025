'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Printer, Loader2, Check } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BillLine {
  id: string
  quantity: number
  unitPrice: number
  tax: number
  total: number
  product: {
    name: string
  }
}

interface VendorBill {
  id: string
  billNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  paidOn?: string
  status: string
  taxAmount: number
  subtotal: number
  vendor: {
    id: string
    name: string
    email?: string
    street?: string
    city?: string
    state?: string
  }
  order?: {
    id: string
    orderNumber: string
    lines: BillLine[]
  }
}

export default function VendorBillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<VendorBill | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [paymentNote, setPaymentNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchBill()
  }, [params.id])

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/vendor-bills/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setBill(data.data)
        const amountDue = data.data.totalAmount - data.data.paidAmount
        setPaymentAmount(amountDue.toString())
      } else {
        toast.error('Vendor bill not found')
        router.push('/admin/vendor-bills')
      }
    } catch (err) {
      console.error('Failed to fetch bill:', err)
      toast.error('Failed to load bill')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterPayment = async () => {
    if (!bill) return
    
    const amount = parseFloat(paymentAmount)
    const amountDue = bill.totalAmount - bill.paidAmount
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    if (amount > amountDue) {
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
          paymentType: 'OUTBOUND',
          partnerType: 'VENDOR',
          date: new Date().toISOString().split('T')[0],
          vendorBillId: bill.id,
          note: paymentNote || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Payment registered successfully!')
        setShowPaymentModal(false)
        setPaymentNote('')
        fetchBill()
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

  if (!bill) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Bill not found</p>
      </div>
    )
  }

  const amountDue = bill.totalAmount - bill.paidAmount

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendor-bills">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{bill.billNumber}</h1>
            <p className="text-muted-foreground">{bill.vendor.name}</p>
          </div>
          <Badge variant={getStatusVariant(bill.status)}>
            {bill.status === 'PAID' ? 'Paid' : bill.status === 'PARTIAL' ? 'Partially Paid' : 'Unpaid'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {amountDue > 0 && (
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
          {/* Bill Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bill Number</p>
                  <p className="font-medium">{bill.billNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bill Date</p>
                  <p className="font-medium">{formatDate(bill.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(bill.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source Order</p>
                  {bill.order ? (
                    <Link href={`/admin/purchase-orders/${bill.order.id}`} className="font-medium text-amber-600 hover:underline">
                      {bill.order.orderNumber}
                    </Link>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Lines</CardTitle>
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
                {bill.order?.lines?.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.product.name}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell className="text-right">{line.tax}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Totals */}
            <div className="border-t p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(bill.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Amount Paid</span>
                <span>{formatCurrency(bill.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Amount Due</span>
                <span className={amountDue > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(amountDue)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{bill.vendor.name}</p>
              {bill.vendor.email && <p>{bill.vendor.email}</p>}
              {(bill.vendor.street || bill.vendor.city) && (
                <p className="text-muted-foreground">
                  {[bill.vendor.street, bill.vendor.city, bill.vendor.state].filter(Boolean).join(', ')}
                </p>
              )}
              <Link href={`/admin/contacts/${bill.vendor.id}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  View Contact
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {bill.paidOn && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Paid On</p>
                <p className="font-medium">{formatDate(bill.paidOn)}</p>
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
              Register payment for bill {bill.billNumber}. Amount due: {formatCurrency(amountDue)}
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
                max={amountDue}
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
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Add a note about this payment..."
                rows={3}
              />
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
