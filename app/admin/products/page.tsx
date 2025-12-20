'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Loader2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Product {
  id: string
  name: string
  category: string
  type: string
  stock: number
  salesPrice: number
  published: boolean
  status: string // new/confirmed/archived
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'confirmed' | 'archived'>('all')
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesPublish =
      publishFilter === 'all'
        ? true
        : publishFilter === 'published'
        ? p.published
        : !p.published
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter
    return matchesSearch && matchesPublish && matchesStatus
  })

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      })
      const data = await res.json()
      
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, published: !currentStatus } : p))
        )
        toast.success(`Product ${!currentStatus ? 'published' : 'unpublished'}!`)
      } else {
        toast.error(data.message || 'Failed to update product')
      }
    } catch {
      toast.error('Failed to update product')
    }
  }

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        )
        toast.success(`Product status changed to ${newStatus}!`)
      } else {
        toast.error(data.message || 'Failed to update product')
      }
    } catch {
      toast.error('Failed to update product status')
    }
  }

  const handleDelete = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
        toast.success('Product deleted!')
        setDeleteProduct(null)
      } else {
        toast.error(data.message || 'Failed to delete product')
      }
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'archived': return 'secondary'
      default: return 'outline'
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
        <h1 className="page-title">Products</h1>
        <Link href="/admin/products/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus size={18} className="mr-1" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'new' | 'confirmed' | 'archived')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={() => setPublishFilter('all')}
                variant={publishFilter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All ({products.length})
              </Button>
              <Button
                onClick={() => setPublishFilter('published')}
                variant={publishFilter === 'published' ? 'default' : 'outline'}
                size="sm"
              >
                Published ({products.filter(p => p.published).length})
              </Button>
              <Button
                onClick={() => setPublishFilter('unpublished')}
                variant={publishFilter === 'unpublished' ? 'default' : 'outline'}
                size="sm"
              >
                Unpublished ({products.filter(p => !p.published).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sales Price</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="capitalize">{product.type}</TableCell>
                  <TableCell>
                    <Select 
                      value={product.status || 'new'} 
                      onValueChange={(v) => changeStatus(product.id, v)}
                    >
                      <SelectTrigger className="w-[110px] h-8">
                        <Badge variant={getStatusVariant(product.status)} className="capitalize">
                          {product.status || 'new'}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {product.stock < 20 ? (
                      <Badge variant="destructive">{product.stock}</Badge>
                    ) : (
                      <span>{product.stock}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(product.salesPrice)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.published}
                      onCheckedChange={() => togglePublish(product.id, product.published)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteProduct(product)}
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
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6">
              {products.length === 0 
                ? 'Create your first product to get started.' 
                : 'Try adjusting your search or filter.'}
            </p>
            <Link href="/admin/products/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus size={18} className="mr-1" />
                Add Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteProduct?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>
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
