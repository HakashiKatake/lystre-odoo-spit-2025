'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Tag, User, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Coupon {
  id: string
  code: string
  status: 'UNUSED' | 'USED'
  expirationDate: string | null
  contact?: {
    id: string
    name: string
  }
  discountOffer: {
    id: string
    name: string
    discountPercentage: number
  }
  createdAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'UNUSED' | 'USED'>('all')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons?includeAll=true')
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      coupon.contact?.name.toLowerCase().includes(search.toLowerCase()) ||
      coupon.discountOffer.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: coupons.length,
    unused: coupons.filter((c) => c.status === 'UNUSED').length,
    used: coupons.filter((c) => c.status === 'USED').length,
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
        <div className="flex items-center gap-4">
          <Link href="/admin/discount-offers">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="page-title">Coupons</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unused}</p>
                <p className="text-sm text-muted-foreground">Unused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Tag className="text-gray-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.used}</p>
                <p className="text-sm text-muted-foreground">Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Search by code, customer, or program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as 'all' | 'UNUSED' | 'USED')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UNUSED">Unused</SelectItem>
                <SelectItem value="USED">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      {filteredCoupons.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.expirationDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        {formatDate(coupon.expirationDate)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{coupon.discountOffer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {coupon.discountOffer.discountPercentage}% discount
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.status === 'UNUSED' ? 'default' : 'secondary'}>
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.contact ? (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <Link 
                          href={`/admin/contacts/${coupon.contact.id}`}
                          className="text-amber-600 hover:underline"
                        >
                          {coupon.contact.name}
                        </Link>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Anonymous</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No coupons found</h2>
            <p className="text-muted-foreground mb-6">
              {coupons.length === 0 
                ? 'Create a discount offer to generate coupons.' 
                : 'Try adjusting your search or filter.'}
            </p>
            <Link href="/admin/discount-offers/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Create Discount Offer
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
