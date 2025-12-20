'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, CreditCard, Building, Wallet, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { INDIAN_STATES } from '@/lib/constants'
import { toast } from 'sonner'

interface UserData {
  contactId: string
  contact?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, couponCode, discountAmount, getSubtotal, getTaxAmount, getTotal, clearCart } = useCartStore()
  const [step, setStep] = useState<'address' | 'payment'>('address')
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch user data and pre-fill address
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.data) {
          setUser(data.data)
          // Pre-fill address if available
          if (data.data.contact) {
            setAddress({
              street: data.data.contact.address || '',
              city: data.data.contact.city || '',
              state: data.data.contact.state || '',
              pincode: data.data.contact.pincode || '',
            })
          }
        } else {
          toast.error('Please login to continue')
          router.push('/login?redirect=/checkout')
        }
      } catch {
        toast.error('Please login to continue')
        router.push('/login?redirect=/checkout')
      }
    }
    fetchUser()
  }, [router])

  const validateAddress = () => {
    const newErrors: Record<string, string> = {}
    if (!address.city) newErrors.city = 'City is required'
    if (!address.state) newErrors.state = 'State is required'
    if (!address.pincode) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(address.pincode)) newErrors.pincode = 'Pincode must be 6 digits'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueToPayment = () => {
    if (validateAddress()) {
      setStep('payment')
    } else {
      toast.error('Please fill in all required address fields')
    }
  }

  const handlePlaceOrder = async () => {
    if (!user?.contactId) {
      toast.error('Please login to place an order')
      return
    }

    setIsProcessing(true)
    try {
      // Create the sale order via API
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        tax: 10, // 10% tax
      }))

      const res = await fetch('/api/sale-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.contactId,
          lines: orderItems,
          couponCode: couponCode || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Order placed successfully!')
        clearCart()
        // Redirect to order confirmation with the real order ID
        router.push(`/order-confirmation?order=${data.data.id}`)
      } else {
        toast.error(data.message || 'Failed to place order. Please try again.')
      }
    } catch (err) {
      console.error('Order placement failed:', err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="empty-state">
          <ShoppingBag size={64} className="text-[var(--muted-foreground)] mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Add some products to checkout.</p>
          <Link href="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Checkout Stepper */}
      <div className="checkout-stepper">
        <div className="checkout-step completed">
          <div className="checkout-step-circle">✓</div>
          <span className="text-sm">Order</span>
        </div>
        <div className="w-16 h-px bg-[var(--border)] self-center" />
        <div className={`checkout-step ${step === 'address' ? 'active' : 'completed'}`}>
          <div className="checkout-step-circle">2</div>
          <span className="text-sm font-medium">Address</span>
        </div>
        <div className="w-16 h-px bg-[var(--border)] self-center" />
        <div className={`checkout-step ${step === 'payment' ? 'active' : ''}`}>
          <div className="checkout-step-circle">3</div>
          <span className="text-sm">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'address' ? (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <div className="grid-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                    className="w-full"
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    required
                    className={`w-full ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <select
                    value={address.state}
                    onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                    required
                    className={`w-full ${errors.state ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                    required
                    className={`w-full ${errors.pincode ? 'border-red-500' : ''}`}
                    placeholder="Enter pincode"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Link href="/cart" className="btn btn-secondary">
                  Back to Cart
                </Link>
                <button
                  onClick={handleContinueToPayment}
                  className="btn btn-primary flex-1"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <CreditCard size={24} className="text-[var(--primary)]" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Pay securely with your card</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'upi' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <Wallet size={24} className="text-[var(--primary)]" />
                  <div>
                    <p className="font-medium">UPI</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Pay using UPI apps</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'netbanking' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                  />
                  <Building size={24} className="text-[var(--primary)]" />
                  <div>
                    <p className="font-medium">Net Banking</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Pay through your bank</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <ShoppingBag size={24} className="text-[var(--primary)]" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Pay when you receive</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep('address')} className="btn btn-secondary">
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="btn btn-primary flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${formatCurrency(getTotal())}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-20">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Items Preview */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[var(--muted)] rounded flex items-center justify-center">
                      <ShoppingBag size={16} className="text-[var(--muted-foreground)]" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Subtotal</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Taxes</span>
                <span>{formatCurrency(getTaxAmount())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
