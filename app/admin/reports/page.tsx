'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Package, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SalesByProduct {
  name: string
  quantity: number
  revenue: number
}

interface SalesByCustomer {
  name: string
  orders: number
  total: number
}

interface PurchaseByVendor {
  name: string
  orders: number
  total: number
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'sales_product' | 'sales_customer' | 'purchase_vendor'>('sales_product')
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  
  const [salesByProduct, setSalesByProduct] = useState<SalesByProduct[]>([])
  const [salesByCustomer, setSalesByCustomer] = useState<SalesByCustomer[]>([])
  const [purchaseByVendor, setPurchaseByVendor] = useState<PurchaseByVendor[]>([])

  useEffect(() => {
    generateReport()
  }, [reportType])

  const generateReport = async () => {
    setLoading(true)
    
    try {
      if (reportType === 'sales_product') {
        // Fetch sale orders and aggregate by product
        const res = await fetch('/api/sale-orders')
        const data = await res.json()
        
        if (data.success && data.data) {
          const productMap = new Map<string, { quantity: number; revenue: number }>()
          
          data.data.forEach((order: { items?: Array<{ product: { name: string }; quantity: number; totalPrice: number }> }) => {
            order.items?.forEach((item) => {
              const existing = productMap.get(item.product.name) || { quantity: 0, revenue: 0 }
              productMap.set(item.product.name, {
                quantity: existing.quantity + item.quantity,
                revenue: existing.revenue + item.totalPrice,
              })
            })
          })
          
          const report: SalesByProduct[] = Array.from(productMap.entries()).map(([name, data]) => ({
            name,
            quantity: data.quantity,
            revenue: data.revenue,
          })).sort((a, b) => b.revenue - a.revenue)
          
          setSalesByProduct(report)
        }
      } else if (reportType === 'sales_customer') {
        // Fetch sale orders and aggregate by customer
        const res = await fetch('/api/sale-orders')
        const data = await res.json()
        
        if (data.success && data.data) {
          const customerMap = new Map<string, { orders: number; total: number }>()
          
          data.data.forEach((order: { customer: { name: string }; totalAmount: number }) => {
            const customerName = order.customer?.name || 'Unknown'
            const existing = customerMap.get(customerName) || { orders: 0, total: 0 }
            customerMap.set(customerName, {
              orders: existing.orders + 1,
              total: existing.total + order.totalAmount,
            })
          })
          
          const report: SalesByCustomer[] = Array.from(customerMap.entries()).map(([name, data]) => ({
            name,
            orders: data.orders,
            total: data.total,
          })).sort((a, b) => b.total - a.total)
          
          setSalesByCustomer(report)
        }
      } else if (reportType === 'purchase_vendor') {
        // Fetch purchase orders and aggregate by vendor
        const res = await fetch('/api/purchase-orders')
        const data = await res.json()
        
        if (data.success && data.data) {
          const vendorMap = new Map<string, { orders: number; total: number }>()
          
          data.data.forEach((order: { vendor: { name: string }; totalAmount: number }) => {
            const vendorName = order.vendor?.name || 'Unknown'
            const existing = vendorMap.get(vendorName) || { orders: 0, total: 0 }
            vendorMap.set(vendorName, {
              orders: existing.orders + 1,
              total: existing.total + order.totalAmount,
            })
          })
          
          const report: PurchaseByVendor[] = Array.from(vendorMap.entries()).map(([name, data]) => ({
            name,
            orders: data.orders,
            total: data.total,
          })).sort((a, b) => b.total - a.total)
          
          setPurchaseByVendor(report)
        }
      }
    } catch (err) {
      console.error('Failed to generate report:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title mb-6">Reports</h1>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setReportType('sales_product')}
          className={`transition-all ${
            reportType === 'sales_product' ? 'ring-2 ring-amber-500' : ''
          }`}
        >
          <Card className="h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Sales by Product</h3>
                <p className="text-sm text-muted-foreground">Revenue per product</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => setReportType('sales_customer')}
          className={`transition-all ${
            reportType === 'sales_customer' ? 'ring-2 ring-amber-500' : ''
          }`}
        >
          <Card className="h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Sales by Customer</h3>
                <p className="text-sm text-muted-foreground">Top customers</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => setReportType('purchase_vendor')}
          className={`transition-all ${
            reportType === 'purchase_vendor' ? 'ring-2 ring-amber-500' : ''
          }`}
        >
          <Card className="h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Purchase by Vendor</h3>
                <p className="text-sm text-muted-foreground">Vendor analysis</p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Date Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
              />
            </div>
            <Button onClick={generateReport} className="bg-amber-600 hover:bg-amber-700">
              <BarChart3 size={16} className="mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          {reportType === 'sales_product' && (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">Sales by Product</h3>
              </div>
              {salesByProduct.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByProduct.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="font-medium text-amber-600">{formatCurrency(item.revenue)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">{salesByProduct.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                      <TableCell className="font-bold text-amber-600">{formatCurrency(salesByProduct.reduce((s, i) => s + i.revenue, 0))}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No data available</div>
              )}
            </>
          )}

          {reportType === 'sales_customer' && (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">Sales by Customer</h3>
              </div>
              {salesByCustomer.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByCustomer.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell className="font-medium text-amber-600">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No data available</div>
              )}
            </>
          )}

          {reportType === 'purchase_vendor' && (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">Purchase by Vendor</h3>
              </div>
              {purchaseByVendor.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseByVendor.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell className="font-medium text-amber-600">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No data available</div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}
