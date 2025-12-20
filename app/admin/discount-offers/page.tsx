'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Tag, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Coupon {
  id: string
  code: string
  name: string
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxUses: number
  currentUses: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

export default function DiscountOffersPage() {
  const [offers, setOffers] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/coupons')
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        setOffers((prev) => prev.filter((o) => o.id !== id))
        toast.success('Offer deleted!')
      } else {
        toast.error(data.message || 'Failed to delete offer')
      }
    } catch {
      toast.error('Failed to delete offer')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      const data = await res.json()
      
      if (data.success) {
        setOffers((prev) => prev.map((o) => 
          o.id === id ? { ...o, isActive: !currentStatus } : o
        ))
        toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}!`)
      }
    } catch {
      toast.error('Failed to update offer')
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
        <h1 className="page-title">Discount Offers</h1>
        <Link href="/admin/discount-offers/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus size={18} className="mr-1" />
            New Offer
          </Button>
        </Link>
      </div>

      {offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={!offer.isActive ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Tag size={24} />
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => toggleActive(offer.id, offer.isActive)}
                    >
                      {offer.isActive ? '🟢' : '🔴'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(offer.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{offer.name || offer.code}</h3>
                <p className="text-3xl font-bold text-amber-600 mb-4">
                  {offer.discountType === 'PERCENTAGE' 
                    ? `${offer.discountValue}% OFF` 
                    : `₹${offer.discountValue} OFF`}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code</span>
                    <span className="font-mono font-bold">{offer.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid From</span>
                    <span>{formatDate(offer.validFrom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span>{formatDate(offer.validUntil)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uses</span>
                    <span>{offer.currentUses} / {offer.maxUses}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link href={`/admin/discount-offers/${offer.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye size={16} className="mr-1" /> View
                    </Button>
                  </Link>
                  <Button 
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={() => {
                      navigator.clipboard.writeText(offer.code)
                      toast.success(`Copied: ${offer.code}`)
                    }}
                  >
                    <Tag size={16} className="mr-1" /> Copy Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No discount offers found</h2>
            <p className="text-muted-foreground mb-6">Create your first discount offer to attract customers.</p>
            <Link href="/admin/discount-offers/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus size={18} className="mr-1" />
                Create Offer
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
