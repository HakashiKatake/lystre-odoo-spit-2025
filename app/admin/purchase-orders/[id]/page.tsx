"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, FileText, Printer, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
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

interface OrderLine {
    id: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
    product: {
        name: string;
    };
}

interface PurchaseOrder {
    id: string;
    orderNumber: string;
    orderDate: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    vendor: {
        id: string;
        name: string;
        email?: string;
        street?: string;
        city?: string;
        state?: string;
    };
    lines: OrderLine[];
    bill?: {
        id: string;
        billNumber: string;
        status: string;
    };
}

export default function PurchaseOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/purchase-orders/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setOrder(data.data);
            } else {
                toast.error("We couldn't find the purchase order you were looking for.");
                router.push("/admin/purchase-orders");
            }
        } catch (err) {
            console.error("Failed to fetch order:", err);
            toast.error("We encountered an issue loading the purchase order details. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!order) return;
        setProcessing(true);

        try {
            const res = await fetch(`/api/purchase-orders/${order.id}`, {
                method: "POST",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Purchase order confirmed successfully! The order is now being processed.");
                fetchOrder();
            } else {
                toast.error(data.message || "We couldn't confirm the order. Please try again.");
            }
        } catch (err) {
            console.error("Failed to confirm order:", err);
            toast.error("An error occurred while confirming the order. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;
        setProcessing(true);

        try {
            const res = await fetch(`/api/purchase-orders/${order.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Purchase order cancelled successfully. It has been marked as cancelled.");
                setShowCancelDialog(false);
                fetchOrder();
            } else {
                toast.error(data.message || "We couldn't cancel the order. Please try again.");
            }
        } catch (err) {
            console.error("Failed to cancel order:", err);
            toast.error("An error occurred while cancelling the order. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleCreateBill = async () => {
        if (!order) return;
        setProcessing(true);

        try {
            const res = await fetch("/api/vendor-bills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Vendor bill created successfully! You can now view it.");
                fetchOrder();
            } else {
                toast.error(data.message || "We couldn't create the vendor bill. Please try again.");
            }
        } catch (err) {
            console.error("Failed to create bill:", err);
            toast.error("An error occurred while creating the vendor bill. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "PAID":
                return "default";
            case "CONFIRMED":
                return "secondary";
            case "CANCELLED":
                return "destructive";
            default:
                return "outline";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A1887F]" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">Purchase order not found</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/purchase-orders">
                        <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                                {order.orderNumber}
                            </span>
                            <Badge className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-md bg-white text-black hover:bg-gray-100 uppercase tracking-widest">
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-gray-500 mt-1 font-bold">Vendor: {order.vendor.name}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => window.print()} className="bg-white hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Printer size={16} className="mr-2" />
                    Print
                </Button>
            </div>

            {/* Status Bar */}
            <div className="mb-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex items-center justify-center gap-4">
                    <div className={`flex items-center gap-2 ${order.status !== "DRAFT" && order.status !== "CANCELLED" ? "text-green-600" : order.status === "DRAFT" ? "text-[#A1887F]" : "text-gray-400"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-black shadow-sm ${order.status === "DRAFT" ? "bg-[#A1887F]" : order.status !== "CANCELLED" ? "bg-green-600" : "bg-gray-400"}`}>
                            {order.status !== "DRAFT" && order.status !== "CANCELLED" ? "✓" : "1"}
                        </div>
                        <span className="font-bold">Draft</span>
                    </div>
                    <div className="w-16 h-0.5 bg-black/20" />
                    <div className={`flex items-center gap-2 ${order.status === "CONFIRMED" || order.status === "PAID" ? "text-green-600" : "text-gray-400"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-black shadow-sm ${order.status === "CONFIRMED" ? "bg-[#A1887F]" : order.status === "PAID" ? "bg-green-600" : "bg-gray-300"}`}>
                            {order.status === "PAID" ? "✓" : "2"}
                        </div>
                        <span className="font-bold">Confirmed</span>
                    </div>
                    <div className="w-16 h-0.5 bg-black/20" />
                    <div className={`flex items-center gap-2 ${order.status === "PAID" ? "text-green-600" : "text-gray-400"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-black shadow-sm ${order.status === "PAID" ? "bg-green-600" : "bg-gray-300"}`}>
                            {order.status === "PAID" ? "✓" : "3"}
                        </div>
                        <span className="font-bold">Paid</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-6">
                {order.status === "DRAFT" && (
                    <>
                        <Button
                            onClick={handleConfirmOrder}
                            disabled={processing}
                            className="bg-green-600 text-white hover:bg-green-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                            Confirm
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                            disabled={processing}
                            className="bg-red-600 text-white hover:bg-red-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <X size={16} className="mr-2" />
                            Cancel
                        </Button>
                    </>
                )}
                {order.status === "CONFIRMED" && !order.bill && (
                    <Button
                        onClick={handleCreateBill}
                        disabled={processing}
                        className="bg-[#A1887F] text-white hover:bg-[#8D766E] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText size={16} className="mr-2" />}
                        Create Vendor Bill
                    </Button>
                )}
                {order.bill && (
                    <Link href={`/admin/vendor-bills/${order.bill.id}`}>
                        <Button variant="outline" className="bg-white hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <FileText size={16} className="mr-2" />
                            View Bill ({order.bill.billNumber})
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Order Number</p>
                                    <p className="font-medium">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Order Date</p>
                                    <p className="font-medium">{formatDate(order.orderDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Vendor</p>
                                    <p className="font-medium">{order.vendor.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Status</p>
                                    <Badge className="border border-black bg-gray-100 text-black shadow-sm hover:bg-gray-200">
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Lines */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Lines</h3>
                        </div>
                        <div className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-100 border-b-2 border-black">
                                    <TableRow>
                                        <TableHead className="text-black font-bold">Product</TableHead>
                                        <TableHead className="text-right text-black font-bold">Qty</TableHead>
                                        <TableHead className="text-right text-black font-bold">Unit Price</TableHead>
                                        <TableHead className="text-right text-black font-bold">Tax %</TableHead>
                                        <TableHead className="text-right text-black font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.lines.map((line) => (
                                        <TableRow key={line.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                            <TableCell className="font-bold">{line.product.name}</TableCell>
                                            <TableCell className="text-right">{line.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                                            <TableCell className="text-right">{line.tax}%</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(line.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Summary & Vendor */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Summary</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Subtotal</span>
                                <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Tax</span>
                                <span className="font-bold">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <hr className="border-black" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Vendor</h3>
                        </div>
                        <div className="p-6 space-y-2 text-sm">
                            <p className="font-bold text-lg">{order.vendor.name}</p>
                            {order.vendor.email && <p className="font-medium text-gray-700">{order.vendor.email}</p>}
                            {(order.vendor.street || order.vendor.city) && (
                                <p className="text-gray-500 font-bold">
                                    {[order.vendor.street, order.vendor.city, order.vendor.state].filter(Boolean).join(", ")}
                                </p>
                            )}
                            <Link href={`/admin/contacts/${order.vendor.id}`}>
                                <Button variant="outline" size="sm" className="mt-4 w-full bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    View Contact
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold font-serif">Cancel Purchase Order</DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            No, Keep Order
                        </Button>
                        <Button variant="destructive" onClick={handleCancelOrder} disabled={processing} className="bg-red-600 hover:bg-red-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Yes, Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
