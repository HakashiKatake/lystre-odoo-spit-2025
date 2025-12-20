'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Suspense } from 'react'
import { toast } from 'sonner'
import { PAYMENT_METHODS } from '@/lib/constants'

function PaymentFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get('invoiceId')
  const billId = searchParams.get('billId')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: 0,
    method: 'upi',
    date: new Date().toISOString().split('T')[0],
    note: '',
    partnerType: invoiceId ? 'customer' : 'vendor',
    customerInvoiceId: invoiceId || '',
    vendorBillId: billId || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentType: formData.partnerType === 'customer' ? 'receive' : 'send',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Payment registered successfully!')
        router.push('/admin/payments')
      } else {
        toast.error(data.message || 'Failed to register payment')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/payments" className="p-2 hover:bg-[var(--muted)] rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">Register Payment</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Partner Type *</label>
              <select
                value={formData.partnerType}
                onChange={(e) => setFormData((f) => ({ ...f, partnerType: e.target.value }))}
                className="w-full"
              >
                <option value="customer">Customer (Receive Payment)</option>
                <option value="vendor">Vendor (Send Payment)</option>
              </select>
            </div>

            {formData.partnerType === 'customer' && (
              <div>
                <label className="block text-sm font-medium mb-1">Invoice ID</label>
                <input
                  type="text"
                  value={formData.customerInvoiceId}
                  onChange={(e) => setFormData((f) => ({ ...f, customerInvoiceId: e.target.value }))}
                  className="w-full"
                  placeholder="Enter invoice ID"
                />
              </div>
            )}

            {formData.partnerType === 'vendor' && (
              <div>
                <label className="block text-sm font-medium mb-1">Bill ID</label>
                <input
                  type="text"
                  value={formData.vendorBillId}
                  onChange={(e) => setFormData((f) => ({ ...f, vendorBillId: e.target.value }))}
                  className="w-full"
                  placeholder="Enter bill ID"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                step="0.01"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method *</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData((f) => ({ ...f, method: e.target.value }))}
                className="w-full"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData((f) => ({ ...f, note: e.target.value }))}
                className="w-full"
                rows={3}
                placeholder="Optional payment note..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <span className="spinner" />
              ) : (
                <>
                  <Save size={18} />
                  Register Payment
                </>
              )}
            </button>
            <Link href="/admin/payments" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8"><span className="spinner" /> Loading...</div>}>
      <PaymentFormContent />
    </Suspense>
  )
}
