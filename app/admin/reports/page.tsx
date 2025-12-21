"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    Loader2,
    DollarSign,
    PieChart,
    Activity,
    Star,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";

interface ProductStats {
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
}

interface CustomerCLV {
    name: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    firstOrder: string;
    lastOrder: string;
}

interface CategoryRevenue {
    category: string;
    revenue: number;
    orders: number;
    percentage: number;
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "clv" | "products" | "margins">("dashboard");
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    // Dashboard stats
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
    const [productStats, setProductStats] = useState<ProductStats[]>([]);
    const [customerCLV, setCustomerCLV] = useState<CustomerCLV[]>([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch sale orders
            const ordersRes = await fetch("/api/sale-orders");
            const ordersData = await ordersRes.json();
            const orders = ordersData.success ? ordersData.data || [] : [];

            // Fetch products
            const productsRes = await fetch("/api/products");
            const productsData = await productsRes.json();
            const products = productsData.success ? productsData.data || [] : [];

            // Fetch contacts
            const contactsRes = await fetch("/api/contacts");
            const contactsData = await contactsRes.json();
            const contacts = contactsData.success ? contactsData.data || [] : [];

            // Calculate totals
            const revenue = orders.reduce((sum: number, o: { totalAmount: number }) => sum + (o.totalAmount || 0), 0);
            setTotalRevenue(revenue);
            setTotalOrders(orders.length);
            setTotalProducts(products.length);
            setTotalCustomers(contacts.filter((c: { type: string }) => c.type === "CUSTOMER").length);

            // Calculate revenue by category
            const categoryMap = new Map<string, { revenue: number; orders: number }>();
            orders.forEach((order: { items?: Array<{ product: { category: string }; totalPrice: number }> }) => {
                order.items?.forEach((item) => {
                    const cat = item.product?.category || "Other";
                    const existing = categoryMap.get(cat) || { revenue: 0, orders: 0 };
                    categoryMap.set(cat, {
                        revenue: existing.revenue + item.totalPrice,
                        orders: existing.orders + 1,
                    });
                });
            });

            const catData: CategoryRevenue[] = Array.from(categoryMap.entries())
                .map(([category, data]) => ({
                    category,
                    revenue: data.revenue,
                    orders: data.orders,
                    percentage: revenue > 0 ? (data.revenue / revenue) * 100 : 0,
                }))
                .sort((a, b) => b.revenue - a.revenue);
            setCategoryRevenue(catData);

            // Calculate product stats with profit margins
            const productMap = new Map<string, { name: string; category: string; quantitySold: number; revenue: number; cost: number }>();
            orders.forEach((order: { items?: Array<{ product: { id: string; name: string; category: string; purchasePrice: number }; quantity: number; totalPrice: number }> }) => {
                order.items?.forEach((item) => {
                    const pid = item.product?.id || "unknown";
                    const existing = productMap.get(pid) || {
                        name: item.product?.name || "Unknown",
                        category: item.product?.category || "Other",
                        quantitySold: 0,
                        revenue: 0,
                        cost: 0,
                    };
                    productMap.set(pid, {
                        ...existing,
                        quantitySold: existing.quantitySold + item.quantity,
                        revenue: existing.revenue + item.totalPrice,
                        cost: existing.cost + (item.product?.purchasePrice || 0) * item.quantity,
                    });
                });
            });

            const prodStats: ProductStats[] = Array.from(productMap.values())
                .map((p) => ({
                    ...p,
                    profit: p.revenue - p.cost,
                    profitMargin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0,
                }))
                .sort((a, b) => b.revenue - a.revenue);
            setProductStats(prodStats);

            // Calculate Customer Lifetime Value
            const customerMap = new Map<string, { name: string; orders: number; totalSpent: number; firstOrder: Date; lastOrder: Date }>();
            orders.forEach((order: { customer: { id: string; name: string }; totalAmount: number; createdAt: string }) => {
                const custId = order.customer?.id || "unknown";
                const custName = order.customer?.name || "Unknown";
                const orderDate = new Date(order.createdAt);
                const existing = customerMap.get(custId);

                if (existing) {
                    customerMap.set(custId, {
                        ...existing,
                        orders: existing.orders + 1,
                        totalSpent: existing.totalSpent + order.totalAmount,
                        firstOrder: orderDate < existing.firstOrder ? orderDate : existing.firstOrder,
                        lastOrder: orderDate > existing.lastOrder ? orderDate : existing.lastOrder,
                    });
                } else {
                    customerMap.set(custId, {
                        name: custName,
                        orders: 1,
                        totalSpent: order.totalAmount,
                        firstOrder: orderDate,
                        lastOrder: orderDate,
                    });
                }
            });

            const clvData: CustomerCLV[] = Array.from(customerMap.values())
                .map((c) => ({
                    name: c.name,
                    totalOrders: c.orders,
                    totalSpent: c.totalSpent,
                    avgOrderValue: c.orders > 0 ? c.totalSpent / c.orders : 0,
                    firstOrder: c.firstOrder.toLocaleDateString(),
                    lastOrder: c.lastOrder.toLocaleDateString(),
                }))
                .sort((a, b) => b.totalSpent - a.totalSpent);
            setCustomerCLV(clvData);
        } catch (err) {
            console.error("Failed to fetch report data:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (index: number) => {
        const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Business Intelligence
                </span>
                <div className="flex items-center gap-3">
                    <Input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg"
                    />
                    <Button
                        onClick={fetchAllData}
                        className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                        <BarChart3 size={16} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: "dashboard", label: "Dashboard", icon: Activity },
                    { id: "clv", label: "Customer Lifetime Value", icon: Users },
                    { id: "products", label: "Product Performance", icon: Package },
                    { id: "margins", label: "Profit Margins", icon: TrendingUp },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-2 rounded-xl transition-all duration-200 ${
                            activeTab === tab.id
                                ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                                : "bg-white text-black border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                    <p className="text-3xl font-bold text-black mt-1">{formatCurrency(totalRevenue)}</p>
                                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-bold">
                                        <ArrowUpRight size={16} />
                                        <span>+12.5% vs last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <DollarSign className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                                    <p className="text-3xl font-bold text-black mt-1">{totalOrders}</p>
                                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-bold">
                                        <ArrowUpRight size={16} />
                                        <span>+8.3% vs last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <BarChart3 className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Products</p>
                                    <p className="text-3xl font-bold text-black mt-1">{totalProducts}</p>
                                    <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm font-bold">
                                        <span>Active in catalog</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Package className="text-purple-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Customers</p>
                                    <p className="text-3xl font-bold text-black mt-1">{totalCustomers}</p>
                                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-bold">
                                        <ArrowUpRight size={16} />
                                        <span>+5 this month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Users className="text-orange-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue by Category Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-2 mb-6">
                                <PieChart size={20} className="text-lystre-brown" />
                                <h3 className="font-serif font-bold text-lg">Revenue by Category</h3>
                            </div>

                            {categoryRevenue.length > 0 ? (
                                <div className="space-y-4">
                                    {categoryRevenue.map((cat, i) => (
                                        <div key={cat.category}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-bold capitalize">{cat.category}</span>
                                                <span className="text-gray-600">
                                                    {formatCurrency(cat.revenue)} ({cat.percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                                                <div
                                                    className={`h-full ${getCategoryColor(i)} transition-all duration-500`}
                                                    style={{ width: `${cat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No sales data available</p>
                            )}
                        </div>

                        {/* Top Products Heatmap */}
                        <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-2 mb-6">
                                <Star size={20} className="text-lystre-brown" />
                                <h3 className="font-serif font-bold text-lg">Best & Worst Products</h3>
                            </div>

                            {productStats.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Best Performers */}
                                    <p className="text-sm font-bold text-green-600 uppercase tracking-wider">Top Performers</p>
                                    {productStats.slice(0, 3).map((prod, i) => (
                                        <div
                                            key={prod.name}
                                            className={`flex justify-between items-center p-3 rounded-lg border-2 border-black ${
                                                i === 0 ? "bg-green-100" : "bg-green-50"
                                            }`}
                                        >
                                            <div>
                                                <p className="font-bold text-black">{prod.name}</p>
                                                <p className="text-xs text-gray-500">{prod.quantitySold} sold</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-700">{formatCurrency(prod.revenue)}</p>
                                                <p className="text-xs text-green-600">+{prod.profitMargin.toFixed(1)}% margin</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Worst Performers */}
                                    {productStats.length > 3 && (
                                        <>
                                            <p className="text-sm font-bold text-red-600 uppercase tracking-wider mt-4">Needs Attention</p>
                                            {productStats.slice(-2).reverse().map((prod) => (
                                                <div
                                                    key={prod.name}
                                                    className="flex justify-between items-center p-3 rounded-lg border-2 border-black bg-red-50"
                                                >
                                                    <div>
                                                        <p className="font-bold text-black">{prod.name}</p>
                                                        <p className="text-xs text-gray-500">{prod.quantitySold} sold</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-red-700">{formatCurrency(prod.revenue)}</p>
                                                        <p className="text-xs text-red-600">{prod.profitMargin.toFixed(1)}% margin</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No product data available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Lifetime Value Tab */}
            {activeTab === "clv" && (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-lystre-brown" />
                            <h3 className="font-bold text-lg font-serif">Customer Lifetime Value Analysis</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Track your most valuable customers and their purchasing behavior</p>
                    </div>

                    {customerCLV.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F3F0] border-b-2 border-black">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-bold text-black">Customer</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Total Orders</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Total Spent (CLV)</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Avg Order Value</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">First Order</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Last Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerCLV.map((customer, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-lystre-brown text-white flex items-center justify-center font-bold border-2 border-black">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-black">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{customer.totalOrders}</td>
                                            <td className="px-6 py-4 font-bold text-green-700 font-mono">{formatCurrency(customer.totalSpent)}</td>
                                            <td className="px-6 py-4 font-mono">{formatCurrency(customer.avgOrderValue)}</td>
                                            <td className="px-6 py-4 text-gray-500">{customer.firstOrder}</td>
                                            <td className="px-6 py-4 text-gray-500">{customer.lastOrder}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-500">No customer data available</div>
                    )}
                </div>
            )}

            {/* Product Performance Tab */}
            {activeTab === "products" && (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-lystre-brown" />
                            <h3 className="font-bold text-lg font-serif">Product Performance Report</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Analyze sales performance across all products</p>
                    </div>

                    {productStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F3F0] border-b-2 border-black">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-bold text-black">Product</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Category</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Qty Sold</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Revenue</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats.map((product, i) => {
                                        const maxRevenue = productStats[0]?.revenue || 1;
                                        const performancePercent = (product.revenue / maxRevenue) * 100;
                                        return (
                                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-bold text-black">{product.name}</td>
                                                <td className="px-6 py-4 capitalize text-gray-600">{product.category}</td>
                                                <td className="px-6 py-4 font-mono">{product.quantitySold}</td>
                                                <td className="px-6 py-4 font-bold text-green-700 font-mono">{formatCurrency(product.revenue)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full max-w-[150px] h-3 bg-gray-200 rounded-full overflow-hidden border border-black">
                                                        <div
                                                            className={`h-full ${performancePercent > 70 ? "bg-green-500" : performancePercent > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                                                            style={{ width: `${performancePercent}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-500">No product data available</div>
                    )}
                </div>
            )}

            {/* Profit Margins Tab */}
            {activeTab === "margins" && (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-gray-50">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-lystre-brown" />
                            <h3 className="font-bold text-lg font-serif">Profit Margin Analysis</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Track profitability across your product catalog</p>
                    </div>

                    {productStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F3F0] border-b-2 border-black">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-bold text-black">Product</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Revenue</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Cost</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Profit</th>
                                        <th className="text-left px-6 py-4 font-bold text-black">Margin %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStats
                                        .sort((a, b) => b.profitMargin - a.profitMargin)
                                        .map((product, i) => (
                                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-bold text-black">{product.name}</td>
                                                <td className="px-6 py-4 font-mono">{formatCurrency(product.revenue)}</td>
                                                <td className="px-6 py-4 font-mono text-red-600">{formatCurrency(product.cost)}</td>
                                                <td className="px-6 py-4 font-bold font-mono text-green-700">{formatCurrency(product.profit)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {product.profitMargin >= 30 ? (
                                                            <TrendingUp size={16} className="text-green-600" />
                                                        ) : (
                                                            <TrendingDown size={16} className="text-red-600" />
                                                        )}
                                                        <span
                                                            className={`font-bold ${
                                                                product.profitMargin >= 30 ? "text-green-700" : product.profitMargin >= 15 ? "text-yellow-700" : "text-red-700"
                                                            }`}
                                                        >
                                                            {product.profitMargin.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-500">No product data available</div>
                    )}

                    {/* Margin Summary */}
                    {productStats.length > 0 && (
                        <div className="p-6 bg-gray-50 border-t-2 border-black">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-black">{formatCurrency(productStats.reduce((s, p) => s + p.revenue, 0))}</p>
                                </div>
                                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Total Profit</p>
                                    <p className="text-2xl font-bold text-green-700">{formatCurrency(productStats.reduce((s, p) => s + p.profit, 0))}</p>
                                </div>
                                <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Avg Margin</p>
                                    <p className="text-2xl font-bold text-lystre-brown">
                                        {(productStats.reduce((s, p) => s + p.profitMargin, 0) / productStats.length).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
