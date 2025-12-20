"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Tag, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface Coupon {
    id: string;
    code: string;
    status: "UNUSED" | "USED";
    expirationDate: string | null;
    contact?: {
        id: string;
        name: string;
    };
    discountOffer: {
        id: string;
        name: string;
        discountPercentage: number;
    };
    createdAt: string;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "UNUSED" | "USED">("all");

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/coupons?includeAll=true");
            const data = await res.json();
            if (data.success) {
                setCoupons(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const filteredCoupons = coupons.filter((coupon) => {
        const matchesSearch =
            coupon.code.toLowerCase().includes(search.toLowerCase()) ||
            coupon.contact?.name.toLowerCase().includes(search.toLowerCase()) ||
            coupon.discountOffer.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || coupon.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: coupons.length,
        unused: coupons.filter((c) => c.status === "UNUSED").length,
        used: coupons.filter((c) => c.status === "USED").length,
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
                <div className="flex items-center gap-4">
                    <Link href="/admin/discount-offers">
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                        Coupons
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Tag className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono">{stats.total}</p>
                            <p className="text-sm text-gray-500 font-bold">Total Coupons</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Tag className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono">{stats.unused}</p>
                            <p className="text-sm text-gray-500 font-bold">Unused</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Tag className="text-gray-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono">{stats.used}</p>
                            <p className="text-sm text-gray-500 font-bold">Used</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            type="text"
                            placeholder="Search by code, customer, or program..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as "all" | "UNUSED" | "USED")}
                    >
                        <SelectTrigger className="w-[180px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="UNUSED">Unused</SelectItem>
                            <SelectItem value="USED">Used</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Coupons Table */}
            {filteredCoupons.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Code</TableHead>
                                <TableHead className="font-bold text-black">Valid Until</TableHead>
                                <TableHead className="font-bold text-black">Program</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Customer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCoupons.map((coupon) => (
                                <TableRow key={coupon.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-mono font-bold text-black">{coupon.code}</TableCell>
                                    <TableCell>
                                        {coupon.expirationDate ? (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-500" />
                                                {formatDate(coupon.expirationDate)}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">No expiry</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{coupon.discountOffer.name}</p>
                                            <p className="text-xs text-green-700 font-bold">
                                                {coupon.discountOffer.discountPercentage}% discount
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={coupon.status === "UNUSED" ? "default" : "secondary"}
                                            className="border border-black"
                                        >
                                            {coupon.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {coupon.contact ? (
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-500" />
                                                <Link
                                                    href={`/admin/contacts/${coupon.contact.id}`}
                                                    className="text-amber-600 hover:underline font-medium"
                                                >
                                                    {coupon.contact.name}
                                                </Link>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">Anonymous</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="bg-white border-2 border-black p-16 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                        <Tag size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No coupons found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {coupons.length === 0
                            ? "Create a discount offer to generate coupons."
                            : "Try adjusting your search or filter."}
                    </p>
                    <Link href="/admin/discount-offers/new">
                        <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            Create Discount Offer
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
