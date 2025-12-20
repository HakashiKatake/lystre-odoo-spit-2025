'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Tag, Loader2, Calendar, Percent } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DiscountOffer {
  id: string
  name: string
  discountPercentage: number
  startDate: string
  endDate: string
  availableOn: string
  _count: {
    coupons: number
  }
  createdAt: string
}

export default function DiscountOffersPage() {
  const [offers, setOffers] = useState<DiscountOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteOffer, setDeleteOffer] = useState<DiscountOffer | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/discount-offers')
      const data = await res.json()
      if (data.success) {
        setOffers(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err)
      toast.error('Failed to load discount offers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteOffer) return
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/discount-offers/${deleteOffer.id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        setOffers((prev) => prev.filter((o) => o.id !== deleteOffer.id))
        toast.success('Offer deleted!')
        setDeleteOffer(null)
      } else {
        toast.error(data.message || 'Failed to delete offer')
      }
    } catch {
      toast.error('Failed to delete offer')
    } finally {
      setDeleting(false)
    }
  }

  const isActive = (offer: DiscountOffer) => {
    const now = new Date()
    return now >= new Date(offer.startDate) && now <= new Date(offer.endDate)
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
        <h1 className="page-title">Discount Offers</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/coupons">
            <Button variant="outline">
              <Tag size={18} className="mr-1" />
              View Coupons
            </Button>
          </Link>
          <Link href="/admin/discount-offers/new">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus size={18} className="mr-1" />
              New Offer
            </Button>
          </Link>
        </div>
      </div>

      {offers.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Available On</TableHead>
                <TableHead>Coupons</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <Percent size={14} />
                      {offer.discountPercentage}% off
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar size={14} className="text-muted-foreground" />
                      {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{offer.availableOn}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/admin/coupons" className="text-amber-600 hover:underline">
                      {offer._count.coupons} coupons
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive(offer) ? 'default' : 'secondary'}>
                      {isActive(offer) ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteOffer(offer)}
                      >
                        <Trash2 size={16} />
                      </Button>
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
            <Tag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No discount offers found</h2>
            <p className="text-muted-foreground mb-6">
              Create your first discount offer to attract customers.
            </p>
            <Link href="/admin/discount-offers/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus size={18} className="mr-1" />
                Create Offer
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOffer} onOpenChange={() => setDeleteOffer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discount Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteOffer?.name}&quot;? 
              This will also delete all {deleteOffer?._count?.coupons || 0} associated coupons.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOffer(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
