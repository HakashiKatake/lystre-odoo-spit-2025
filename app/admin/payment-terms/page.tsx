'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

interface PaymentTerm {
  id: string
  name: string
  earlyPaymentDiscount: boolean
  discountPercentage: number | null
  discountDays: number | null
  active: boolean
}

export default function PaymentTermsPage() {
  const [terms, setTerms] = useState<PaymentTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PaymentTerm | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteItem, setDeleteItem] = useState<PaymentTerm | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    earlyPaymentDiscount: false,
    discountPercentage: 0,
    discountDays: 0,
    active: true,
  })

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const res = await fetch('/api/payment-terms')
      const data = await res.json()
      if (data.success) {
        setTerms(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch payment terms:', err)
      toast.error('Failed to load payment terms')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      earlyPaymentDiscount: false,
      discountPercentage: 0,
      discountDays: 0,
      active: true,
    })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (term: PaymentTerm) => {
    setEditing(term)
    setFormData({
      name: term.name,
      earlyPaymentDiscount: term.earlyPaymentDiscount,
      discountPercentage: term.discountPercentage || 0,
      discountDays: term.discountDays || 0,
      active: term.active,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a term name')
      return
    }

    setSaving(true)

    try {
      const url = editing ? `/api/payment-terms/${editing.id}` : '/api/payment-terms'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          earlyPaymentDiscount: formData.earlyPaymentDiscount,
          discountPercentage: formData.earlyPaymentDiscount ? formData.discountPercentage : null,
          discountDays: formData.earlyPaymentDiscount ? formData.discountDays : null,
          active: formData.active,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(editing ? 'Payment term updated!' : 'Payment term created!')
        resetForm()
        fetchTerms()
      } else {
        toast.error(data.message || 'Failed to save payment term')
      }
    } catch (err) {
      console.error('Failed to save payment term:', err)
      toast.error('Failed to save payment term')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (term: PaymentTerm) => {
    try {
      const res = await fetch(`/api/payment-terms/${term.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...term,
          active: !term.active,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setTerms((prev) =>
          prev.map((t) => (t.id === term.id ? { ...t, active: !t.active } : t))
        )
        toast.success('Payment term updated!')
      } else {
        toast.error(data.message || 'Failed to update payment term')
      }
    } catch (err) {
      console.error('Failed to toggle active:', err)
      toast.error('Failed to update payment term')
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/payment-terms/${deleteItem.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        setTerms((prev) => prev.filter((t) => t.id !== deleteItem.id))
        toast.success('Payment term deleted!')
        setDeleteItem(null)
      } else {
        toast.error(data.message || 'Failed to delete payment term')
      }
    } catch (err) {
      console.error('Failed to delete payment term:', err)
      toast.error('Failed to delete payment term')
    } finally {
      setDeleting(false)
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
        <h1 className="page-title">Payment Terms</h1>
        <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus size={18} className="mr-1" />
          New Payment Term
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">{editing ? 'Edit Payment Term' : 'New Payment Term'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="termName">Term Name *</Label>
                <Input
                  id="termName"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., 15 Days, 30 Days"
                />
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center space-x-2 pt-6">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, active: checked as boolean }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <Checkbox
                  id="earlyDiscount"
                  checked={formData.earlyPaymentDiscount}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, earlyPaymentDiscount: checked as boolean }))}
                />
                <Label htmlFor="earlyDiscount">Enable Early Payment Discount</Label>
              </div>
              {formData.earlyPaymentDiscount && (
                <>
                  <div>
                    <Label htmlFor="discountPercent">Discount (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountDays">If paid within (days)</Label>
                    <Input
                      id="discountDays"
                      type="number"
                      value={formData.discountDays}
                      onChange={(e) => setFormData((f) => ({ ...f, discountDays: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </div>
                </>
              )}
              {formData.earlyPaymentDiscount && formData.discountPercentage > 0 && formData.discountDays > 0 && (
                <div className="col-span-2">
                  <Label>Example Preview</Label>
                  <div className="p-4 bg-gray-50 rounded-lg border mt-1">
                    <p className="text-sm text-muted-foreground">
                      Payment Terms: {formData.name}
                    </p>
                    <p className="text-sm font-medium">
                      Early payment discount: {formData.discountPercentage}% if paid within {formData.discountDays} days
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                {saving ? <Loader2 size={16} className="animate-spin mr-1" /> : <Check size={16} className="mr-1" />}
                Save
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms Table */}
      {terms.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term Name</TableHead>
                <TableHead>Early Discount</TableHead>
                <TableHead>Discount %</TableHead>
                <TableHead>Within Days</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">{term.name}</TableCell>
                  <TableCell>
                    <Badge variant={term.earlyPaymentDiscount ? 'default' : 'secondary'}>
                      {term.earlyPaymentDiscount ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>{term.discountPercentage ? `${term.discountPercentage}%` : '-'}</TableCell>
                  <TableCell>{term.discountDays || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={term.active}
                      onCheckedChange={() => handleToggleActive(term)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(term)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteItem(term)}
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
            <Plus size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No payment terms</h2>
            <p className="text-muted-foreground mb-6">Create your first payment term.</p>
            <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
              <Plus size={18} className="mr-1" />
              Add Payment Term
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Term</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
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
