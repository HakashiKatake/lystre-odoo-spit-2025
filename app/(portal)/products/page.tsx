'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, Filter, ShoppingCart, Home, Loader2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PRODUCT_CATEGORIES, PRODUCT_TYPES, PRODUCT_MATERIALS, PRODUCT_COLORS } from '@/lib/constants'
import { useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

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
  published: boolean
  images?: string[]
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [activeType, setActiveType] = useState<string | null>(null)
  const addToCart = useCartStore((state) => state.addItem)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?published=true')
        const data = await res.json()
        
        if (data.success) {
          setProducts(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category)
    const matchesType = (activeType === null && selectedTypes.length === 0) || 
      activeType === p.type || 
      selectedTypes.includes(p.type)
    const matchesMaterial = selectedMaterials.length === 0 || 
      (p.material && selectedMaterials.includes(p.material))
    return matchesSearch && matchesCategory && matchesType && matchesMaterial
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.salesPrice - b.salesPrice
      case 'price_desc':
        return b.salesPrice - a.salesPrice
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock')
      return
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salesPrice,
      quantity: 1,
      tax: product.salesTax,
    })
    toast.success(`${product.name} added to cart!`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="mt-4 text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-amber-600">
          <Home size={16} />
        </Link>
        <span>/</span>
        <span className="text-foreground">All Products</span>
        {activeType && (
          <>
            <span>/</span>
            <span className="capitalize">{activeType}</span>
          </>
        )}
      </nav>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-64 shrink-0 hidden md:block">
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button
                    onClick={() => {
                      setSelectedCategories([])
                      setSelectedTypes([])
                      setSelectedMaterials([])
                      setActiveType(null)
                    }}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm">Category</h4>
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedCategories.includes(cat.value)}
                          onCheckedChange={() => toggleCategory(cat.value)}
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm">Material</h4>
                  <div className="space-y-2">
                    {PRODUCT_MATERIALS.map((mat) => (
                      <label key={mat.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedMaterials.includes(mat.value)}
                          onCheckedChange={() =>
                            setSelectedMaterials((prev) =>
                              prev.includes(mat.value)
                                ? prev.filter((m) => m !== mat.value)
                                : [...prev, mat.value]
                            )
                          }
                        />
                        <span className="text-sm">{mat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_COLORS.slice(0, 8).map((color) => (
                      <button
                        key={color.value}
                        className="w-6 h-6 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              onClick={() => setActiveType(null)}
              variant={activeType === null ? 'default' : 'outline'}
              className={activeType === null ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              All
            </Button>
            {PRODUCT_TYPES.map((type) => (
              <Button
                key={type.value}
                onClick={() => setActiveType(type.value)}
                variant={activeType === type.value ? 'default' : 'outline'}
                className={activeType === type.value ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="md:hidden"
            >
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={48} className="text-gray-300" />
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddToCart(product)
                        }}
                        className="absolute bottom-2 right-2 p-2 bg-amber-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-700"
                      >
                        <ShoppingCart size={16} />
                      </button>
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground capitalize mb-1">{product.category}</p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-medium text-sm group-hover:text-amber-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-bold mt-2 text-amber-600">{formatCurrency(product.salesPrice)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground mb-6">
                  {products.length === 0 
                    ? 'No products have been added yet. Check back later!' 
                    : 'Try adjusting your filters or search terms.'}
                </p>
                {filteredProducts.length === 0 && products.length > 0 && (
                  <Button
                    onClick={() => {
                      setSearch('')
                      setSelectedCategories([])
                      setActiveType(null)
                    }}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
