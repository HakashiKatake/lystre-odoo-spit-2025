"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Package, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SalesByProduct {
    name: string;
    quantity: number;
    revenue: number;
}

interface SalesByCustomer {
    name: string;
    orders: number;
    total: number;
}

interface PurchaseByVendor {
    name: string;
    orders: number;
    total: number;
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState<"sales_product" | "sales_customer" | "purchase_vendor">("sales_product");
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });

    const [salesByProduct, setSalesByProduct] = useState<SalesByProduct[]>([]);
    const [salesByCustomer, setSalesByCustomer] = useState<SalesByCustomer[]>([]);
    const [purchaseByVendor, setPurchaseByVendor] = useState<PurchaseByVendor[]>([]);

    useEffect(() => {
        generateReport();
    }, [reportType]);

    const generateReport = async () => {
        setLoading(true);

        try {
            if (reportType === "sales_product") {
                // Fetch sale orders and aggregate by product
                const res = await fetch("/api/sale-orders");
                const data = await res.json();

                if (data.success && data.data) {
                    const productMap = new Map<string, { quantity: number; revenue: number }>();

                    data.data.forEach((order: { items?: Array<{ product: { name: string }; quantity: number; totalPrice: number }> }) => {
                        order.items?.forEach((item) => {
                            const existing = productMap.get(item.product.name) || { quantity: 0, revenue: 0 };
                            productMap.set(item.product.name, {
                                quantity: existing.quantity + item.quantity,
                                revenue: existing.revenue + item.totalPrice,
                            });
                        });
                    });

                    const report: SalesByProduct[] = Array.from(productMap.entries())
                        .map(([name, data]) => ({
                            name,
                            quantity: data.quantity,
                            revenue: data.revenue,
                        }))
                        .sort((a, b) => b.revenue - a.revenue);

                    setSalesByProduct(report);
                }
            } else if (reportType === "sales_customer") {
                // Fetch sale orders and aggregate by customer
                const res = await fetch("/api/sale-orders");
                const data = await res.json();

                if (data.success && data.data) {
                    const customerMap = new Map<string, { orders: number; total: number }>();

                    data.data.forEach((order: { customer: { name: string }; totalAmount: number }) => {
                        const customerName = order.customer?.name || "Unknown";
                        const existing = customerMap.get(customerName) || { orders: 0, total: 0 };
                        customerMap.set(customerName, {
                            orders: existing.orders + 1,
                            total: existing.total + order.totalAmount,
                        });
                    });

                    const report: SalesByCustomer[] = Array.from(customerMap.entries())
                        .map(([name, data]) => ({
                            name,
                            orders: data.orders,
                            total: data.total,
                        }))
                        .sort((a, b) => b.total - a.total);

                    setSalesByCustomer(report);
                }
            } else if (reportType === "purchase_vendor") {
                // Fetch purchase orders and aggregate by vendor
                const res = await fetch("/api/purchase-orders");
                const data = await res.json();

                if (data.success && data.data) {
                    const vendorMap = new Map<string, { orders: number; total: number }>();

                    data.data.forEach((order: { vendor: { name: string }; totalAmount: number }) => {
                        const vendorName = order.vendor?.name || "Unknown";
                        const existing = vendorMap.get(vendorName) || { orders: 0, total: 0 };
                        vendorMap.set(vendorName, {
                            orders: existing.orders + 1,
                            total: existing.total + order.totalAmount,
                        });
                    });

                    const report: PurchaseByVendor[] = Array.from(vendorMap.entries())
                        .map(([name, data]) => ({
                            name,
                            orders: data.orders,
                            total: data.total,
                        }))
                        .sort((a, b) => b.total - a.total);

                    setPurchaseByVendor(report);
                }
            }
        } catch (err) {
            console.error("Failed to generate report:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black mb-6">
                Reports
            </span>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                    onClick={() => setReportType("sales_product")}
                    className={`transition-all duration-200 outline-none ${
                        reportType === "sales_product" ? "scale-105" : "hover:scale-102"
                    }`}
                >
                    <div
                        className={`h-full bg-white border-2 text-left p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                            reportType === "sales_product" ? "border-black bg-blue-50" : "border-black"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Package className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg font-serif">Sales by Product</h3>
                                <p className="text-sm text-gray-500 font-sans font-bold">Revenue per product</p>
                            </div>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setReportType("sales_customer")}
                    className={`transition-all duration-200 outline-none ${
                        reportType === "sales_customer" ? "scale-105" : "hover:scale-102"
                    }`}
                >
                    <div
                        className={`h-full bg-white border-2 text-left p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                            reportType === "sales_customer" ? "border-black bg-green-50" : "border-black"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Users className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg font-serif">Sales by Customer</h3>
                                <p className="text-sm text-gray-500 font-sans font-bold">Top customers</p>
                            </div>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setReportType("purchase_vendor")}
                    className={`transition-all duration-200 outline-none ${
                        reportType === "purchase_vendor" ? "scale-105" : "hover:scale-102"
                    }`}
                >
                    <div
                        className={`h-full bg-white border-2 text-left p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                            reportType === "purchase_vendor" ? "border-black bg-purple-50" : "border-black"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg font-serif">Purchase by Vendor</h3>
                                <p className="text-sm text-gray-500 font-sans font-bold">Vendor analysis</p>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Date Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 ml-1">Start Date</label>
                        <Input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 ml-1">End Date</label>
                        <Input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg"
                        />
                    </div>
                    <Button 
                        onClick={generateReport} 
                        className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black mb-[2px]"
                    >
                        <BarChart3 size={16} className="mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Report Data */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
                </div>
            ) : (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {reportType === "sales_product" && (
                        <>
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Sales by Product</h3>
                            </div>
                            {salesByProduct.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b-2 border-black hover:bg-transparent">
                                            <TableHead className="font-bold text-black">Product</TableHead>
                                            <TableHead className="font-bold text-black">Quantity Sold</TableHead>
                                            <TableHead className="font-bold text-black">Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesByProduct.map((item, i) => (
                                            <TableRow key={i} className="border-b border-black/10 hover:bg-gray-50/50">
                                                <TableCell className="font-bold text-black">{item.name}</TableCell>
                                                <TableCell className="font-mono">{item.quantity}</TableCell>
                                                <TableCell className="font-bold font-mono text-green-700">{formatCurrency(item.revenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-t-2 border-black">
                                            <TableCell className="font-black text-lg">Total</TableCell>
                                            <TableCell className="font-black text-lg font-mono">{salesByProduct.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                                            <TableCell className="font-black text-lg font-mono text-green-700">{formatCurrency(salesByProduct.reduce((s, i) => s + i.revenue, 0))}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-16 text-center text-gray-500 font-sans">No data available</div>
                            )}
                        </>
                    )}

                    {reportType === "sales_customer" && (
                        <>
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Sales by Customer</h3>
                            </div>
                            {salesByCustomer.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b-2 border-black hover:bg-transparent">
                                            <TableHead className="font-bold text-black">Customer</TableHead>
                                            <TableHead className="font-bold text-black">Orders</TableHead>
                                            <TableHead className="font-bold text-black">Total Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesByCustomer.map((item, i) => (
                                            <TableRow key={i} className="border-b border-black/10 hover:bg-gray-50/50">
                                                <TableCell className="font-bold text-black">{item.name}</TableCell>
                                                <TableCell className="font-mono">{item.orders}</TableCell>
                                                <TableCell className="font-bold font-mono text-green-700">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-16 text-center text-gray-500 font-sans">No data available</div>
                            )}
                        </>
                    )}

                    {reportType === "purchase_vendor" && (
                        <>
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Purchase by Vendor</h3>
                            </div>
                            {purchaseByVendor.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b-2 border-black hover:bg-transparent">
                                            <TableHead className="font-bold text-black">Vendor</TableHead>
                                            <TableHead className="font-bold text-black">Orders</TableHead>
                                            <TableHead className="font-bold text-black">Total Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseByVendor.map((item, i) => (
                                            <TableRow key={i} className="border-b border-black/10 hover:bg-gray-50/50">
                                                <TableCell className="font-bold text-black">{item.name}</TableCell>
                                                <TableCell className="font-mono">{item.orders}</TableCell>
                                                <TableCell className="font-bold font-mono text-red-700">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-16 text-center text-gray-500 font-sans">No data available</div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
