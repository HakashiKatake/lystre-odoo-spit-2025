'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Home, Minus, Plus, ShoppingCart, Check, Truck, RefreshCcw, Shield, Loader2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { PRODUCT_COLORS } from '@/lib/constants'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  name: string
  category: string
  type: string
  material?: string
  colors?: string[]
  stock: number
  salesPrice: number
  salesTax: number
  description?: string
  published: boolean
  images?: string[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const addToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          setProduct(data.data)
          if (data.data.colors?.length > 0) {
            setSelectedColor(data.data.colors[0])
          }
        } else {
          setError(data.message || 'Product not found')
        }
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    
    if (product.stock <= 0) {
      toast.error('This product is out of stock')
      return
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salesPrice,
      quantity,
      color: selectedColor,
      tax: product.salesTax,
    })
    toast.success(`Added ${quantity} item(s) to cart!`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="mt-4 text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Link href="/products">
          <Button className="bg-amber-600 hover:bg-amber-700">
            Browse Products
          </Button>
        </Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [null, null, null]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-amber-600 transition-colors">
          <Home size={16} />
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-amber-600 transition-colors">All Products</Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === i 
                    ? 'border-amber-500 ring-2 ring-amber-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {img ? (
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">{i + 1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1">
            <Card className="aspect-square overflow-hidden">
              <CardContent className="p-0 h-full">
                {images[selectedImage] ? (
                  <img 
                    src={images[selectedImage]!} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package size={64} className="text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <Badge variant="secondary" className="capitalize">{product.type}</Badge>
            </div>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {formatCurrency(product.salesPrice)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Inclusive of all taxes
            </p>
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="destructive" className="mt-2">Only {product.stock} left!</Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Material */}
          {product.material && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Material</h3>
              <Badge variant="outline" className="capitalize">{product.material}</Badge>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Select Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => {
                  const colorData = PRODUCT_COLORS.find((c) => c.value === color)
                  const isSelected = selectedColor === color
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        isSelected 
                          ? 'border-amber-500 ring-2 ring-amber-200 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: colorData?.hex || '#ccc' }}
                      title={colorData?.label || color}
                    >
                      {isSelected && (
                        <Check 
                          size={16} 
                          className="absolute inset-0 m-auto text-white drop-shadow-md" 
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2 capitalize">
                Selected: {selectedColor}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-none h-10 w-10"
                  disabled={product.stock <= 0}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-14 text-center font-semibold text-lg bg-gray-50">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="rounded-none h-10 w-10"
                  disabled={product.stock <= 0}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.stock} available)
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            size="lg"
            onClick={handleAddToCart}
            className="w-full py-6 text-lg bg-amber-600 hover:bg-amber-700"
            disabled={product.stock <= 0}
          >
            <ShoppingCart size={20} className="mr-2" />
            {product.stock <= 0 ? 'Out of Stock' : `Add to Cart - ${formatCurrency(product.salesPrice * quantity)}`}
          </Button>

          {/* Features */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <RefreshCcw size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">7 days policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">100% Original</p>
                    <p className="text-xs text-muted-foreground">Guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">3-5 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Check size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">COD Available</p>
                    <p className="text-xs text-muted-foreground">Pay on delivery</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
