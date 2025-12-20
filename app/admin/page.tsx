"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Package,
    Users,
    DollarSign,
    Tag,
    Plus,
    FileText,
    ShoppingCart,
    UserPlus,
    ArrowRight,
    Circle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/retroui/Button";

// Interfaces
interface DashboardStats {
    totalProducts: number;
    totalCustomers: number;
    salesThisMonth: number;
    activeOffers: number;
    pendingInvoices: { count: number; amount: number };
    pendingBills: { count: number; amount: number };
    lowStockProducts: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<Array<{ text: string; time: string; id?: number }>>([]);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch products count
            const productsRes = await fetch("/api/products");
            const productsData = await productsRes.json();
            const totalProducts = productsData.success ? productsData.data?.length || 0 : 0;
            const lowStockProducts = productsData.success
                ? productsData.data?.filter((p: { stock: number }) => p.stock < 20)?.length || 0
                : 0;

            // Fetch contacts count (customers)
            const contactsRes = await fetch("/api/contacts");
            const contactsData = await contactsRes.json();
            const totalCustomers = contactsData.success
                ? contactsData.data?.filter((c: { type: string }) => c.type === "CUSTOMER")?.length || 0
                : 0;

            // Fetch sale orders for sales this month
            const ordersRes = await fetch("/api/sale-orders");
            const ordersData = await ordersRes.json();
            const now = new Date();
            const thisMonth = ordersData.success
                ? ordersData.data?.filter((o: { createdAt: string }) => {
                      const orderDate = new Date(o.createdAt);
                      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                  }) || []
                : [];
            const salesThisMonth = thisMonth.reduce(
                (sum: number, o: { totalAmount: number }) => sum + (o.totalAmount || 0),
                0
            );

            // Fetch invoices for pending
            const invoicesRes = await fetch("/api/invoices");
            const invoicesData = await invoicesRes.json();
            const pendingInvoices = invoicesData.success
                ? invoicesData.data?.filter((i: { status: string }) => i.status !== "PAID") || []
                : [];
            const pendingInvoicesAmount = pendingInvoices.reduce(
                (sum: number, i: { amountDue: number }) => sum + (i.amountDue || 0),
                0
            );

            // Fetch vendor bills for pending
            const billsRes = await fetch("/api/vendor-bills");
            const billsData = await billsRes.json();
            const pendingBills = billsData.success
                ? billsData.data?.filter((b: { status: string }) => b.status !== "PAID") || []
                : [];
            const pendingBillsAmount = pendingBills.reduce(
                (sum: number, b: { amountDue: number }) => sum + (b.amountDue || 0),
                0
            );

            // Fetch coupons for active offers
            const couponsRes = await fetch("/api/coupons");
            const couponsData = await couponsRes.json();
            const activeOffers = couponsData.success
                ? couponsData.data?.filter((c: { isActive: boolean }) => c.isActive)?.length || 0
                : 0;

            setStats({
                totalProducts,
                totalCustomers,
                salesThisMonth,
                activeOffers,
                pendingInvoices: { count: pendingInvoices.length, amount: pendingInvoicesAmount },
                pendingBills: { count: pendingBills.length, amount: pendingBillsAmount },
                lowStockProducts,
            });

            // Generate recent activity from real data
            const activities: Array<{ text: string; time: string; id?: number }> = [];
            if (ordersData.success && ordersData.data?.length > 0) {
                const latestOrder = ordersData.data[0];
                activities.push({ text: `New sale order ${latestOrder.orderNumber} created`, time: "Recently", id: 1 });
            }
            if (invoicesData.success && invoicesData.data?.length > 0) {
                const latestInvoice = invoicesData.data[0];
                activities.push({
                    text: `Invoice ${latestInvoice.invoiceNumber} generated`,
                    time: "Recently",
                    id: 2
                });
            }
            if (productsData.success && productsData.data?.length > 0) {
                const latestProduct = productsData.data[0];
                activities.push({ text: `Product "${latestProduct.name}" added`, time: "Recently", id: 3 });
            }
            if (contactsData.success && contactsData.data?.length > 0) {
                const latestContact = contactsData.data[0];
                activities.push({ text: `Contact "${latestContact.name}" registered`, time: "Recently", id: 4 });
            }
            setRecentActivity(activities.slice(0, 4));
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div>
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Dashboard
                </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Products */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Total Products</p>
                            <p className="text-4xl font-bold text-black">{stats?.totalProducts || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Package className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-1 text-orange-500 text-sm font-bold hover:text-orange-600"
                    >
                        View all <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Total Customers */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Total Customers</p>
                            <p className="text-4xl font-bold text-black">{stats?.totalCustomers || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <Users className="text-green-500" size={24} />
                        </div>
                    </div>
                    <Link
                        href="/admin/contacts"
                        className="flex items-center gap-1 text-orange-500 text-sm font-bold hover:text-orange-600"
                    >
                        View all <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Sales This Month */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Sales This Month</p>
                            <p className="text-4xl font-bold text-black">
                                ₹{stats?.salesThisMonth.toLocaleString() || "0"}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <DollarSign className="text-purple-500" size={24} />
                        </div>
                    </div>
                    <Link
                        href="/admin/sale-orders"
                        className="flex items-center gap-1 text-orange-500 text-sm font-bold hover:text-orange-600"
                    >
                        View orders <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Active Offers */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Active Offers</p>
                            <p className="text-4xl font-bold text-black">{stats?.activeOffers || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Tag className="text-orange-500" size={24} />
                        </div>
                    </div>
                    <Link
                        href="/admin/discount-offers"
                        className="flex items-center gap-1 text-orange-500 text-sm font-bold hover:text-orange-600"
                    >
                        Manage offers <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-lg font-bold font-serif text-black mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/admin/products/new">
                            <Button className="w-full justify-start gap-3 bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black h-12">
                                <Plus size={18} />
                                Add New Product
                            </Button>
                        </Link>
                        <Link href="/admin/sale-orders/new">
                            <Button className="w-full justify-start gap-3 bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black h-12">
                                <FileText size={18} />
                                Create Sale Order
                            </Button>
                        </Link>
                        <Link href="/admin/purchase-orders/new">
                            <Button className="w-full justify-start gap-3 bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black h-12">
                                <ShoppingCart size={18} />
                                Create Purchase Order
                            </Button>
                        </Link>
                        <Link href="/admin/contacts/new">
                            <Button className="w-full justify-start gap-3 bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black h-12">
                                <UserPlus size={18} />
                                Add New Contact
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-lg font-bold font-serif text-black mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <div key={activity.id || i} className="flex items-start gap-3">
                                    <Circle
                                        className="text-orange-500 fill-orange-500 flex-shrink-0 mt-1"
                                        size={8}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-black font-medium">{activity.text}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pending Items Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Invoices */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold font-serif text-black">Pending Invoices</h3>
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                            {stats?.pendingInvoices.count || 0}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-orange-500 mb-2">
                        ₹{stats?.pendingInvoices.amount.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-400">To be collected</p>
                </div>

                {/* Pending Bills */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold font-serif text-black">Pending Bills</h3>
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                            {stats?.pendingBills.count || 0}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-red-500 mb-2">
                        ₹{stats?.pendingBills.amount.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-400">To be paid</p>
                </div>

                {/* Low Stock Items */}
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold font-serif text-black">Low Stock Items</h3>
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                            {stats?.lowStockProducts || 0}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-black mb-2">{stats?.lowStockProducts || 0} Products</p>
                    <p className="text-xs text-gray-400">Need restocking</p>
                </div>
            </div>
        </div>
    );
}
