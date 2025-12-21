"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Eye, CreditCard, Loader2, FileText } from "lucide-react";
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


interface VendorBill {
    id: string;
    billNumber: string;
    billDate: string;
    dueDate: string;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    status: string;
    vendor: {
        name: string;
    };
}

export default function VendorBillsPage() {
    const [bills, setBills] = useState<VendorBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await fetch("/api/vendor-bills");
            const data = await res.json();
            if (data.success) {
                setBills(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch bills:", err);
            toast.error("We encountered an issue loading the vendor bills. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const filteredBills = bills.filter((b) => {
        const matchesSearch =
            b.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
            b.vendor?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-200 font-bold text-xs">
                        PAID
                    </span>
                );
            case "PARTIAL":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 border-2 border-orange-200 font-bold text-xs">
                        PARTIAL
                    </span>
                );
            case "DRAFT":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 border-2 border-gray-200 font-bold text-xs">
                        DRAFT
                    </span>
                );
            default:
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 border-2 border-red-200 font-bold text-xs">
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
                    Vendor Bills
                </span>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search bills..."
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
                            <SelectItem value="POSTED">Posted</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bills Table */}
            {filteredBills.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Bill #</TableHead>
                                <TableHead className="font-bold text-black">Vendor</TableHead>
                                <TableHead className="font-bold text-black">Date</TableHead>
                                <TableHead className="font-bold text-black">Due Date</TableHead>
                                <TableHead className="font-bold text-black">Total</TableHead>
                                <TableHead className="font-bold text-black">Paid</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.map((bill) => (
                                <TableRow key={bill.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black font-mono">{bill.billNumber}</TableCell>
                                    <TableCell>{bill.vendor?.name || "N/A"}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(bill.billDate)}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(bill.dueDate)}</TableCell>
                                    <TableCell className="font-bold font-mono">{formatCurrency(bill.totalAmount)}</TableCell>
                                    <TableCell className="font-mono text-green-600">{formatCurrency(bill.amountPaid)}</TableCell>
                                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/vendor-bills/${bill.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            {bill.amountDue > 0 && (
                                                <Link href={`/admin/payments/new?billId=${bill.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:bg-green-50 border-2 border-transparent hover:border-black transition-all"
                                                        title="Register Payment"
                                                    >
                                                        <CreditCard size={16} />
                                                    </Button>
                                                </Link>
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
                        <FileText size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No vendor bills found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {bills.length === 0
                            ? "Vendor bills will appear here when created from purchase orders."
                            : "Try adjusting your search or filter."}
                    </p>
                </div>
            )}
        </div>
    );
}
