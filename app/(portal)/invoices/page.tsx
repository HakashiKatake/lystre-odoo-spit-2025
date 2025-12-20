'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Eye, CreditCard, FileText, Loader2 } from 'lucide-react'
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

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  amountPaid: number
  amountDue: number
  status: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // Get current user
        const userRes = await fetch('/api/auth/me')
        const userData = await userRes.json()
        
        if (!userData.success) {
          setError('Please login to view your invoices')
          setLoading(false)
          return
        }

        // Fetch invoices for this customer
        const res = await fetch(`/api/invoices?customerId=${userData.data.contactId}`)
        const data = await res.json()
        
        if (data.success) {
          setInvoices(data.data || [])
        } else {
          setError(data.message || 'Failed to fetch invoices')
        }
      } catch (err) {
        setError('Failed to load invoices')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'default'
      case 'PARTIAL': return 'secondary'
      case 'DRAFT': return 'outline'
      default: return 'destructive'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Paid'
      case 'PARTIAL': return 'Partially Paid'
      case 'DRAFT': return 'Draft'
      default: return 'Waiting for Payment'
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="mt-4 text-muted-foreground">Loading invoices...</p>
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
        <Link href="/account" className="hover:text-amber-600">My Account</Link>
        <span>/</span>
        <span className="text-foreground">Invoices</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">My Invoices</h1>

      {error && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {invoices.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell className={invoice.amountDue > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {formatCurrency(invoice.amountDue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </Link>
                      {invoice.amountDue > 0 && (
                        <Link href={`/invoices/${invoice.id}?pay=true`}>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                            <CreditCard size={14} className="mr-1" />
                            Pay
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
      ) : !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No invoices yet</h2>
            <p className="text-muted-foreground mb-6">Your invoices will appear here after you place an order</p>
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
