"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Eye, Loader2, CreditCard } from "lucide-react";
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


interface Payment {
    id: string;
    date: string;
    paymentType: string;
    partnerType: string;
    method: string;
    amount: number;
    note?: string;
    customerInvoice?: {
        invoiceNumber: string;
        customer: {
            name: string;
        };
    };
    vendorBill?: {
        billNumber: string;
        vendor: {
            name: string;
        };
    };
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch("/api/payments");
            const data = await res.json();
            if (data.success) {
                setPayments(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch payments:", err);
            toast.error("We encountered an issue loading the payments. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter((p) => {
        const partnerName = p.customerInvoice?.customer?.name || p.vendorBill?.vendor?.name || "";
        const invoiceNumber = p.customerInvoice?.invoiceNumber || p.vendorBill?.billNumber || "";
        const matchesSearch =
            partnerName.toLowerCase().includes(search.toLowerCase()) ||
            invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            p.note?.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" ? true : p.paymentType === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeBadge = (type: string) => {
        return type === "INBOUND" ? (
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-200 font-bold text-xs">
                Inbound
            </span>
        ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 border-2 border-orange-200 font-bold text-xs">
                Outbound
            </span>
        );
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
                    Payments
                </span>
                <Link href="/admin/payments/new">
                    <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Plus size={18} className="mr-2" />
                        Register Payment
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search payments..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg"
                        />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px] bg-white rounded-lg">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="INBOUND">Inbound (Customer)</SelectItem>
                            <SelectItem value="OUTBOUND">Outbound (Vendor)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Payments Table */}
            {filteredPayments.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Date</TableHead>
                                <TableHead className="font-bold text-black">Type</TableHead>
                                <TableHead className="font-bold text-black">Partner</TableHead>
                                <TableHead className="font-bold text-black">Method</TableHead>
                                <TableHead className="font-bold text-black">Reference</TableHead>
                                <TableHead className="font-bold text-black">Amount</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.map((payment) => (
                                <TableRow key={payment.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="text-gray-600">{formatDate(payment.date)}</TableCell>
                                    <TableCell>{getTypeBadge(payment.paymentType)}</TableCell>
                                    <TableCell className="font-medium text-black">
                                        {payment.customerInvoice?.customer?.name || payment.vendorBill?.vendor?.name || "N/A"}
                                    </TableCell>
                                    <TableCell className="capitalize">{payment.method}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {payment.customerInvoice?.invoiceNumber || payment.vendorBill?.billNumber || "-"}
                                    </TableCell>
                                    <TableCell className="font-bold font-mono text-amber-600">{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>
                                        <Link href={`/admin/payments/${payment.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all">
                                                <Eye size={16} />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="bg-white border-2 border-black p-16 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                        <CreditCard size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No payments found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {payments.length === 0
                            ? "Payments will appear here when you register them."
                            : "Try adjusting your search or filter."}
                    </p>
                    <div className="flex justify-center">
                        <Link href="/admin/payments/new">
                            <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                                <Plus size={18} className="mr-2" />
                                Register Payment
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
