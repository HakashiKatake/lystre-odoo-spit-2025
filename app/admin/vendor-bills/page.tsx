'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, Eye, CreditCard, Loader2, FileText } from 'lucide-react'
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

interface VendorBill {
  id: string
  billNumber: string
  billDate: string
  dueDate: string
  totalAmount: number
  amountPaid: number
  amountDue: number
  status: string
  vendor: {
    name: string
  }
}

export default function VendorBillsPage() {
  const [bills, setBills] = useState<VendorBill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/vendor-bills')
      const data = await res.json()
      if (data.success) {
        setBills(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch bills:', err)
      toast.error('Failed to load vendor bills')
    } finally {
      setLoading(false)
    }
  }

  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.vendor?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'default'
      case 'PARTIAL': return 'secondary'
      case 'DRAFT': return 'outline'
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Vendor Bills</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search bills..."
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
              <option value="POSTED">Posted</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredBills.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.billNumber}</TableCell>
                  <TableCell>{bill.vendor?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(bill.billDate)}</TableCell>
                  <TableCell>{formatDate(bill.dueDate)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(bill.totalAmount)}</TableCell>
                  <TableCell>{formatCurrency(bill.amountPaid)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(bill.status)}>{bill.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/vendor-bills/${bill.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      {bill.amountDue > 0 && (
                        <Link href={`/admin/payments/new?billId=${bill.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                            <CreditCard size={16} />
                          </Button>
                        </Link>
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
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No vendor bills found</h2>
            <p className="text-muted-foreground">
              {bills.length === 0 
                ? 'Vendor bills will appear here when created from purchase orders.' 
                : 'Try adjusting your search or filter.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
