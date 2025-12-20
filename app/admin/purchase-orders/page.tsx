"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Eye, FileText, Loader2, ShoppingBag } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface PurchaseOrder {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    vendor: {
        name: string;
    };
}

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/purchase-orders");
            const data = await res.json();
            if (data.success) {
                setOrders(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            toast.error("Failed to load purchase orders");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((o) => {
        const matchesSearch =
            o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            o.vendor?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-200 font-bold text-xs">
                        CONFIRMED
                    </span>
                );
            case "DRAFT":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 border-2 border-gray-200 font-bold text-xs">
                        DRAFT
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 border-2 border-red-200 font-bold text-xs">
                        CANCELLED
                    </span>
                );
            default:
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 border-2 border-gray-200 font-bold text-xs">
                        {status}
                    </span>
                );
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
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Purchase Orders
                </span>
                <Link href="/admin/purchase-orders/new">
                    <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Plus size={18} className="mr-2" />
                        New Purchase Order
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg"
                        />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Order #</TableHead>
                                <TableHead className="font-bold text-black">Vendor</TableHead>
                                <TableHead className="font-bold text-black">Date</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Total</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black font-mono">{order.orderNumber}</TableCell>
                                    <TableCell>{order.vendor?.name || "N/A"}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    <TableCell className="font-bold font-mono text-lg">{formatCurrency(order.totalAmount)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/purchase-orders/${order.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            {order.status === "CONFIRMED" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 border-2 border-transparent hover:border-black transition-all"
                                                    title="Create Bill"
                                                >
                                                    <FileText size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="bg-white border-2 border-black p-16 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                        <ShoppingBag size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No purchase orders found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {orders.length === 0
                            ? "Create your first purchase order."
                            : "Try adjusting your search or filter."}
                    </p>
                    <Link href="/admin/purchase-orders/new">
                        <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Plus size={18} className="mr-2" />
                            New Purchase Order
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
