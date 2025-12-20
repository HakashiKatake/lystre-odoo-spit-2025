'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, ImagePlus, X, Loader2 } from 'lucide-react'
import { PRODUCT_CATEGORIES, PRODUCT_TYPES, PRODUCT_MATERIALS, PRODUCT_COLORS } from '@/lib/constants'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    material: '',
    colors: [] as string[],
    stock: 0,
    salesPrice: 0,
    salesTax: 10,
    purchasePrice: 0,
    purchaseTax: 10,
    published: false,
    images: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.type) newErrors.type = 'Product type is required'
    if (!formData.material) newErrors.material = 'Material is required'
    if (formData.colors.length === 0) newErrors.colors = 'Select at least one color'
    if (formData.salesPrice <= 0) newErrors.salesPrice = 'Sales price must be greater than 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error('Please fix the validation errors')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Product created successfully!')
        router.push('/admin/products')
      } else {
        toast.error(data.message || 'Failed to create product')
      }
    } catch {
      toast.error('An error occurred while creating the product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }))
    if (errors.colors) setErrors((prev) => ({ ...prev, colors: '' }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // For now, convert to base64 data URLs (in production, you'd upload to a file server)
    Array.from(files).forEach((file) => {
      if (formData.images.length >= 4) {
        toast.error('Maximum 4 images allowed')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="page-title">New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, name: e.target.value }))
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                      }}
                      placeholder="Enter product name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Category *</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, category: e.target.value }))
                        if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
                      }}
                      className={`w-full border rounded-md px-3 py-2 ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label>Product Type *</Label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, type: e.target.value }))
                        if (errors.type) setErrors((prev) => ({ ...prev, type: '' }))
                      }}
                      className={`w-full border rounded-md px-3 py-2 ${errors.type ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select type</option>
                      {PRODUCT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                  </div>

                  <div>
                    <Label>Material *</Label>
                    <select
                      value={formData.material}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, material: e.target.value }))
                        if (errors.material) setErrors((prev) => ({ ...prev, material: '' }))
                      }}
                      className={`w-full border rounded-md px-3 py-2 ${errors.material ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select material</option>
                      {PRODUCT_MATERIALS.map((mat) => (
                        <option key={mat.value} value={mat.value}>
                          {mat.label}
                        </option>
                      ))}
                    </select>
                    {errors.material && <p className="text-red-500 text-sm mt-1">{errors.material}</p>}
                  </div>

                  <div>
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Colors *</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PRODUCT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => toggleColor(color.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.colors.includes(color.value)
                              ? 'border-amber-500 ring-2 ring-amber-200 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        />
                      ))}
                    </div>
                    {formData.colors.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {formData.colors.join(', ')}
                      </p>
                    )}
                    {errors.colors && <p className="text-red-500 text-sm mt-1">{errors.colors}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sales Price (₹) *</Label>
                    <Input
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, salesPrice: parseFloat(e.target.value) || 0 }))
                        if (errors.salesPrice) setErrors((prev) => ({ ...prev, salesPrice: '' }))
                      }}
                      min="0"
                      step="0.01"
                      className={errors.salesPrice ? 'border-red-500' : ''}
                    />
                    {errors.salesPrice && <p className="text-red-500 text-sm mt-1">{errors.salesPrice}</p>}
                  </div>

                  <div>
                    <Label>Sales Tax (%)</Label>
                    <Input
                      type="number"
                      value={formData.salesTax}
                      onChange={(e) => setFormData((p) => ({ ...p, salesTax: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label>Purchase Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData((p) => ({ ...p, purchasePrice: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label>Purchase Tax (%)</Label>
                    <Input
                      type="number"
                      value={formData.purchaseTax}
                      onChange={(e) => setFormData((p) => ({ ...p, purchaseTax: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Images & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      onClick={() => !formData.images[index] && fileInputRef.current?.click()}
                      className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${
                        !formData.images[index] ? 'cursor-pointer hover:bg-gray-200' : ''
                      } transition-colors`}
                    >
                      {formData.images[index] ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formData.images[index]}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImagePlus size={24} className="mx-auto mb-1" />
                          <span className="text-xs">Add Image</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click to upload. Max 4 images.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Published</Label>
                    <p className="text-sm text-muted-foreground">
                      Show in customer shop
                    </p>
                  </div>
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData((p) => ({ ...p, published: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                Save Product
              </Button>
              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
