'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Vendor {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  purchasePrice: number
  purchaseTax: number
}

interface OrderLine {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  tax: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [lines, setLines] = useState<OrderLine[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')

  useEffect(() => {
    fetchVendors()
    fetchProducts()
  }, [])

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      if (data.success) {
        setVendors(data.data?.filter((c: { type: string }) => c.type === 'VENDOR' || c.type === 'BOTH') || [])
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const addLine = () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    // Check if product already in lines
    if (lines.some((l) => l.productId === product.id)) {
      toast.error('Product already added')
      return
    }

    setLines([
      ...lines,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.purchasePrice,
        tax: product.purchaseTax,
      },
    ])
    setSelectedProduct('')
  }

  const updateLine = (index: number, field: keyof OrderLine, value: number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    )
  }

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateLineTotal = (line: OrderLine) => {
    const subtotal = line.quantity * line.unitPrice
    const tax = (subtotal * line.tax) / 100
    return subtotal + tax
  }

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const taxAmount = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice * line.tax) / 100, 0)
  const total = subtotal + taxAmount

  const handleSubmit = async () => {
    if (!vendorId) {
      toast.error('Please select a vendor')
      return
    }
    if (lines.length === 0) {
      toast.error('Please add at least one product')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          lines: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            tax: line.tax,
          })),
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Purchase order created successfully!')
        router.push('/admin/purchase-orders')
      } else {
        toast.error(data.message || 'Failed to create purchase order')
      }
    } catch (err) {
      console.error('Failed to create purchase order:', err)
      toast.error('Failed to create purchase order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/purchase-orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Purchase Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="vendor">Select Vendor *</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Order Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Order Lines</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Product */}
              <div className="flex gap-2 mb-4">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.purchasePrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addLine} className="bg-amber-600 hover:bg-amber-700">
                  <Plus size={16} className="mr-1" />
                  Add
                </Button>
              </div>

              {/* Lines Table */}
              {lines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      <TableHead className="w-24">Tax %</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={line.productId}>
                        <TableCell className="font-medium">{line.productName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.quantity}
                            onChange={(e) => updateLine(index, 'quantity', parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.unitPrice}
                            onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min={0}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.tax}
                            onChange={(e) => updateLine(index, 'tax', parseFloat(e.target.value) || 0)}
                            min={0}
                            max={100}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calculateLineTotal(line))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeLine(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No products added yet. Select a product and click Add.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Items</span>
                <span>{lines.length}</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-2">
            <Button 
              onClick={handleSubmit} 
              disabled={saving || lines.length === 0 || !vendorId}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Create Purchase Order
            </Button>
            <Link href="/admin/purchase-orders" className="block">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
