'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Home, Minus, Plus, ShoppingCart, Check, Truck, RefreshCcw, Shield, Loader2, Package, Heart, Ruler } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore, useWishlistStore, useRecentlyViewedStore } from '@/lib/store'
import { PRODUCT_COLORS } from '@/lib/constants'
import { toast } from 'sonner'
import { Button } from '@/components/retroui/Button'
import { SizeGuide } from '@/app/components/SizeGuide'
import { ProductReviews } from '@/app/components/ProductReviews'
import { RecentlyViewed } from '@/app/components/RecentlyViewed'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

interface Product {
  id: string
  name: string
  category: string
  type: string
  material?: string
  colors?: string[]
  sizes?: string[]
  stock: number
  salesPrice: number
  salesTax: number
  discountPercentage?: number | null
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
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  
  const addToCart = useCartStore((state) => state.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addItem)

  // Fetch product - BACKEND LOGIC PRESERVED
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
          if (data.data.sizes?.length > 0) {
            setSelectedSize(data.data.sizes[0])
          }
          
          // Add to recently viewed
          addToRecentlyViewed({
            productId: data.data.id,
            name: data.data.name,
            price: data.data.salesPrice,
            image: data.data.images?.[0],
            category: data.data.category,
          })
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
  }, [productId, addToRecentlyViewed])

  const handleAddToCart = () => {
    if (!product) return
    
    if (product.stock <= 0) {
      toast.error('Sorry, this product is currently out of stock.')
      return
    }

    // Check if size is required and selected
    const availableSizes = product.sizes?.length ? product.sizes : SIZES
    if (!selectedSize && availableSizes.length > 0) {
      toast.error('Please select a size to continue.')
      return
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salesPrice,
      quantity,
      color: selectedColor,
      size: selectedSize,
      image: product.images?.[0] || undefined,
      tax: product.salesTax,
    })
    toast.success(`Added ${quantity} ${product.name}(s) to your cart!`)
  }

  const toggleWishlist = () => {
    if (!product) return
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success(`${product.name} removed from wishlist`)
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.salesPrice,
        image: product.images?.[0],
        category: product.category,
        addedAt: new Date(),
      })
      toast.success(`${product.name} added to wishlist!`)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-[#FFFEF9] py-16">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <Package size={64} className="mx-auto text-[#8B7355] mb-4" />
          <h2 className="text-2xl font-serif text-[#2B1810] mb-2">Product Not Found</h2>
          <p className="text-[#8B7355] mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/products">
            <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : []
  const availableSizes = product.sizes?.length ? product.sizes : SIZES
  const inWishlist = isInWishlist(product.id)

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#8B7355] mb-8">
          <Link href="/" className="hover:text-[#2B1810] transition-colors">
            <Home size={16} />
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#2B1810] transition-colors">All Products</Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-[#2B1810] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {images.length > 0 ? images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 border-2 overflow-hidden transition-all ${
                    selectedImage === i 
                      ? 'border-[#8B7355]' 
                      : 'border-[#2B1810] hover:border-[#8B7355]'
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                </button>
              )) : (
                <div className="w-20 h-20 bg-[#F5EBE0] border-2 border-[#2B1810] flex items-center justify-center">
                  <Package className="w-8 h-8 text-[#8B7355]" />
                </div>
              )}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative">
              <div className="aspect-square border-2 border-[#2B1810] overflow-hidden bg-[#F5EBE0]">
                {images[selectedImage] ? (
                  <Image 
                    src={images[selectedImage]} 
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={64} className="text-[#8B7355]" />
                  </div>
                )}
              </div>
              {/* Wishlist Button on Image */}
              <button
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-3 border-2 border-[#2B1810] transition-colors ${
                  inWishlist ? 'bg-red-50' : 'bg-white hover:bg-[#F5EBE0]'
                }`}
              >
                <Heart
                  size={24}
                  className={inWishlist ? 'text-red-500 fill-red-500' : 'text-[#2B1810]'}
                />
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-serif text-[#2B1810]">{product.name}</h1>
                <span className="px-3 py-1 bg-[#F5EBE0] border-2 border-[#2B1810] text-[#8B7355] text-sm capitalize">
                  {product.type}
                </span>
              </div>
              
              {/* Price with Discount */}
              {product.discountPercentage && product.discountPercentage > 0 ? (
                <div className="mt-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#22C55E]">
                      {formatCurrency(product.salesPrice * (1 - product.discountPercentage / 100))}
                    </span>
                    <span className="text-lg text-[#8B7355] line-through">
                      M.R.P: {formatCurrency(product.salesPrice)}
                    </span>
                    <span className="px-2 py-1 bg-[#22C55E] text-white text-sm font-bold border-2 border-[#2B1810]">
                      {product.discountPercentage}% OFF
                    </span>
                  </div>
                  <p className="text-sm text-[#8B7355] mt-1">
                    Inclusive of all taxes
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-[#8B7355] mt-4">
                    {formatCurrency(product.salesPrice)}
                  </p>
                  <p className="text-sm text-[#8B7355] mt-1">
                    Inclusive of all taxes
                  </p>
                </>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="inline-block mt-2 px-3 py-1 bg-[#F59E0B] text-white text-sm border-2 border-[#2B1810]">
                  Only {product.stock} left!
                </span>
              )}
              {product.stock <= 0 && (
                <span className="inline-block mt-2 px-3 py-1 bg-[#EF4444] text-white text-sm border-2 border-[#2B1810]">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[#8B7355] leading-relaxed">{product.description}</p>
            )}

            {/* Material */}
            {product.material && (
              <div>
                <h3 className="font-semibold text-[#2B1810] mb-2">Material</h3>
                <span className="px-3 py-1 bg-[#F5EBE0] border-2 border-[#2B1810] text-[#8B7355] text-sm capitalize">
                  {product.material}
                </span>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#2B1810]">Select Size</h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-[#8B7355] hover:underline flex items-center gap-1"
                >
                  <Ruler size={14} />
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border-2 font-medium transition-all flex items-center justify-center ${
                      selectedSize === size 
                        ? 'border-[#8B7355] bg-[#8B7355] text-white' 
                        : 'border-[#2B1810] bg-white text-[#2B1810] hover:bg-[#F5EBE0]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-sm text-[#8B7355] mt-2">
                  Selected: {selectedSize}
                </p>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#2B1810] mb-3">Select Color</h3>
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
                            ? 'border-[#8B7355] ring-2 ring-[#8B7355]/30 scale-110' 
                            : 'border-[#2B1810] hover:scale-105'
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
                <p className="text-sm text-[#8B7355] mt-2 capitalize">
                  Selected: {selectedColor}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-[#2B1810] mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-[#2B1810]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-[#F5EBE0] transition-colors"
                    disabled={product.stock <= 0}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg text-[#2B1810]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-[#F5EBE0] transition-colors"
                    disabled={product.stock <= 0}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-[#8B7355]">
                  ({product.stock} available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 py-4 text-lg bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={20} className="mr-2" />
                {product.stock <= 0 ? 'Out of Stock' : `Add to Cart - ${formatCurrency(product.salesPrice * quantity)}`}
              </Button>
              <Button
                onClick={toggleWishlist}
                variant="outline"
                className={`py-4 px-4 border-2 border-[#2B1810] ${inWishlist ? 'bg-red-50' : ''}`}
              >
                <Heart
                  size={20}
                  className={inWishlist ? 'text-red-500 fill-red-500' : 'text-[#2B1810]'}
                />
              </Button>
            </div>

            {/* Features */}
            <div className="border-2 border-[#2B1810] p-6 bg-[#F5EBE0]">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2B1810] flex items-center justify-center">
                    <RefreshCcw size={18} className="text-[#8B7355]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#2B1810]">Easy Returns</p>
                    <p className="text-xs text-[#8B7355]">7 days policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2B1810] flex items-center justify-center">
                    <Shield size={18} className="text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#2B1810]">100% Original</p>
                    <p className="text-xs text-[#8B7355]">Guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2B1810] flex items-center justify-center">
                    <Truck size={18} className="text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#2B1810]">Fast Delivery</p>
                    <p className="text-xs text-[#8B7355]">3-5 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2B1810] flex items-center justify-center">
                    <Check size={18} className="text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#2B1810]">COD Available</p>
                    <p className="text-xs text-[#8B7355]">Pay on delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* Recently Viewed Section */}
        <div className="mt-8">
          <RecentlyViewed currentProductId={product.id} maxItems={4} />
        </div>
      </main>

      {/* Size Guide Modal */}
      <SizeGuide isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} productType={product.type} />
    </div>
  )
}
