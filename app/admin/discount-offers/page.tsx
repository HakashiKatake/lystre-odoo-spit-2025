"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2, Calendar, Percent } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DiscountOffer {
    id: string;
    name: string;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    availableOn: string;
    _count: {
        coupons: number;
    };
    createdAt: string;
}

export default function DiscountOffersPage() {
    const [offers, setOffers] = useState<DiscountOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteOffer, setDeleteOffer] = useState<DiscountOffer | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch("/api/discount-offers");
            const data = await res.json();
            if (data.success) {
                setOffers(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch offers:", err);
            toast.error("We encountered an issue loading the discount offers. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteOffer) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/discount-offers/${deleteOffer.id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setOffers((prev) => prev.filter((o) => o.id !== deleteOffer.id));
                toast.success("Discount offer deleted successfully!");
                setDeleteOffer(null);
            } else {
                toast.error(data.message || "We couldn't delete the discount offer. Please try again.");
            }
        } catch {
            toast.error("An error occurred while deleting the offer. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const isActive = (offer: DiscountOffer) => {
        const now = new Date();
        return now >= new Date(offer.startDate) && now <= new Date(offer.endDate);
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
                    Discount Offers
                </span>
                <div className="flex items-center gap-2">
                    <Link href="/admin/coupons">
                        <Button variant="outline" className="bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Tag size={18} className="mr-2" />
                            View Coupons
                        </Button>
                    </Link>
                    <Link href="/admin/discount-offers/new">
                        <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Plus size={18} className="mr-2" />
                            New Offer
                        </Button>
                    </Link>
                </div>
            </div>

            {offers.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Offer Name</TableHead>
                                <TableHead className="font-bold text-black">Discount</TableHead>
                                <TableHead className="font-bold text-black">Valid Period</TableHead>
                                <TableHead className="font-bold text-black">Available On</TableHead>
                                <TableHead className="font-bold text-black">Coupons</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offers.map((offer) => (
                                <TableRow key={offer.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black">{offer.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-green-700 font-bold border-2 border-green-200 bg-green-50 px-2 py-1 rounded-md inline-flex">
                                            <Percent size={14} />
                                            {offer.discountPercentage}% off
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="border-black border shadow-sm">
                                            {offer.availableOn}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href="/admin/coupons" className="text-lystre-brown font-bold hover:underline">
                                            {offer._count.coupons} coupons
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full border-2 font-bold text-xs ${
                                                isActive(offer)
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                            }`}
                                        >
                                            {isActive(offer) ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all"
                                                onClick={() => setDeleteOffer(offer)}
                                            >
                                                <Trash2 size={16} />
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
                        <Tag size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No discount offers found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        Create your first discount offer to attract customers.
                    </p>
                    <Link href="/admin/discount-offers/new">
                        <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Plus size={18} className="mr-2" />
                            Create Offer
                        </Button>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteOffer} onOpenChange={() => setDeleteOffer(null)}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Delete Discount Offer</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-black">&quot;{deleteOffer?.name}&quot;</span>?
                            This will also delete all {deleteOffer?._count?.coupons || 0} associated coupons.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteOffer(null)} className="border-2 border-black bg-white hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
