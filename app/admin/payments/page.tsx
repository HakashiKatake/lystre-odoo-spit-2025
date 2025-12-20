'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Loader2, CreditCard } from 'lucide-react'
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

interface Payment {
  id: string
  paymentDate: string
  paymentType: string
  paymentMethod: string
  amount: number
  reference?: string
  contact?: {
    name: string
  }
  invoice?: {
    invoiceNumber: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      const data = await res.json()
      if (data.success) {
        setPayments(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice?.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' ? true : p.paymentType === typeFilter
    return matchesSearch && matchesType
  })

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
        <h1 className="page-title">Payments</h1>
        <Link href="/admin/payments/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus size={18} className="mr-1" />
            Register Payment
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
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="INBOUND">Inbound (Customer)</option>
              <option value="OUTBOUND">Outbound (Vendor)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredPayments.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>
                    <Badge variant={payment.paymentType === 'INBOUND' ? 'default' : 'secondary'}>
                      {payment.paymentType === 'INBOUND' ? 'Inbound' : 'Outbound'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{payment.contact?.name || 'N/A'}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.invoice?.invoiceNumber || payment.reference || '-'}</TableCell>
                  <TableCell className="font-medium text-amber-600">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/payments/${payment.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye size={16} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No payments found</h2>
            <p className="text-muted-foreground mb-6">
              {payments.length === 0 
                ? 'Payments will appear here when you register them.' 
                : 'Try adjusting your search or filter.'}
            </p>
            <Link href="/admin/payments/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus size={18} className="mr-1" />
                Register Payment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
