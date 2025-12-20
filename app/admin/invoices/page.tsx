"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Eye, CreditCard, Download, Loader2, FileText } from "lucide-react";
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


interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    status: string;
    customer: {
        name: string;
    };
}

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/invoices");
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter((i) => {
        const matchesSearch =
            i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            i.customer?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : i.status === statusFilter;
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
                    Customer Invoices
                </span>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search invoices..."
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

            {/* Invoices Table */}
            {filteredInvoices.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Invoice #</TableHead>
                                <TableHead className="font-bold text-black">Customer</TableHead>
                                <TableHead className="font-bold text-black">Date</TableHead>
                                <TableHead className="font-bold text-black">Due Date</TableHead>
                                <TableHead className="font-bold text-black">Total</TableHead>
                                <TableHead className="font-bold text-black">Paid</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black font-mono">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.customer?.name || "N/A"}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(invoice.invoiceDate)}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(invoice.dueDate)}</TableCell>
                                    <TableCell className="font-bold font-mono">{formatCurrency(invoice.totalAmount)}</TableCell>
                                    <TableCell className="font-mono text-green-600">{formatCurrency(invoice.amountPaid)}</TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/invoices/${invoice.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            {invoice.amountDue > 0 && (
                                                <Link href={`/admin/payments/new?invoiceId=${invoice.id}`}>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </Button>
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
                    <h2 className="text-xl font-bold font-serif mb-2">No invoices found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {invoices.length === 0
                            ? "Invoices will appear here when you create them from sale orders."
                            : "Try adjusting your search or filter."}
                    </p>
                </div>
            )}
        </div>
    );
}
