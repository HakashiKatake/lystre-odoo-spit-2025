'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Check, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CartPage() {
  const { items, updateQuantity, removeItem, couponCode, discountAmount, setCoupon, removeCoupon, getSubtotal, getTaxAmount, getTotal } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponError('')
    setValidatingCoupon(true)

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.toUpperCase() }),
      })
      
      const data = await res.json()
      
      if (data.success && data.valid) {
        const discount = getSubtotal() * (data.discountPercentage / 100)
        setCoupon(couponInput.toUpperCase(), discount)
        toast.success(data.message || `${data.discountPercentage}% discount applied!`)
      } else {
        setCouponError(data.message || 'Invalid coupon code')
        toast.error(data.message || 'Invalid coupon code')
      }
    } catch (err) {
      console.error('Coupon validation error:', err)
      setCouponError('Failed to validate coupon')
      toast.error('Failed to validate coupon')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveItem = (productId: string) => {
    removeItem(productId)
    toast.success('Item removed from cart')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products">
            <Button className="bg-amber-600 hover:bg-amber-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Checkout Stepper */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-semibold">
            1
          </div>
          <span className="font-medium">Cart</span>
        </div>
        <div className="w-16 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
            2
          </div>
          <span className="text-gray-500">Address</span>
        </div>
        <div className="w-16 h-px bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
            3
          </div>
          <span className="text-gray-500">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold mb-4">Shopping Cart ({items.length} items)</h1>
          
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ShoppingBag className="text-gray-400" size={24} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.color && (
                          <p className="text-sm text-muted-foreground capitalize">Color: {item.color}</p>
                        )}
                      </div>
                      <p className="font-bold text-amber-600">{formatCurrency(item.price * item.quantity)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="h-8 w-8 rounded-none"
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-8 w-8 rounded-none"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Discount Line */}
          {couponCode && discountAmount > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <Tag size={18} />
                  <span>Coupon: {couponCode}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-green-700">-{formatCurrency(discountAmount)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (10%)</span>
                  <span>{formatCurrency(getTaxAmount())}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">{formatCurrency(getTotal())}</span>
                </div>
              </div>

              {/* Coupon Input */}
              {!couponCode && (
                <div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Discount Code..."
                      className="flex-1"
                    />
                    <Button onClick={handleApplyCoupon} variant="outline" disabled={validatingCoupon}>
                      {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-sm mt-2">{couponError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter your coupon code from discount offers
                  </p>
                </div>
              )}

              <Link href="/checkout" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
                  Checkout
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>

              <Link href="/products" className="block text-center text-sm text-amber-600 hover:underline">
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
