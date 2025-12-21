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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderLine {
    id: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
    product: {
        name: string;
        images?: string[];
    };
}

interface Order {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    couponCode?: string;
    customer: {
        id: string;
        name: string;
        email?: string;
        street?: string;
        city?: string;
        state?: string;
    };
    paymentTerm?: {
        name: string;
    };
    lines: OrderLine[];
    invoice?: {
        id: string;
        invoiceNumber: string;
        status: string;
    };
}

export default function SaleOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showCouponDialog, setShowCouponDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [couponCode, setCouponCode] = useState("");

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/sale-orders/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setOrder(data.data);
            } else {
                toast.error("We couldn't find the sale order you were looking for.");
                router.push("/admin/sale-orders");
            }
        } catch (err) {
            console.error("Failed to fetch order:", err);
            toast.error("We encountered an issue loading the sale order details. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!order) return;
        setProcessing(true);

        try {
            const res = await fetch(`/api/sale-orders/${order.id}`, {
                method: "POST",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Order confirmed successfully! It is now ready for invoicing.");
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
            const res = await fetch(`/api/sale-orders/${order.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Order cancelled successfully. It has been marked as cancelled.");
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

    const handleCreateInvoice = async () => {
        if (!order) return;
        setProcessing(true);

        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Invoice created successfully! You can now view it.");
                fetchOrder();
            } else {
                toast.error(data.message || "We couldn't create the invoice. Please try again.");
            }
        } catch (err) {
            console.error("Failed to create invoice:", err);
            toast.error("An error occurred while creating the invoice. Please try again.");
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
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-16 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md mx-auto">
                <p className="text-gray-500 font-bold">Order not found</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/sale-orders">
                        <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold font-serif">{order.orderNumber}</h1>
                        <p className="text-gray-500 font-bold">Customer: {order.customer.name}</p>
                    </div>
                    <Badge variant={getStatusVariant(order.status) as any} className="border border-black shadow-sm">
                        {order.status}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.print()} className="bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Printer size={16} className="mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 p-4">
                <div className="flex items-center justify-center gap-4">
                    <div
                        className={`flex items-center gap-2 ${
                            order.status !== "DRAFT" && order.status !== "CANCELLED"
                                ? "text-green-600"
                                : order.status === "DRAFT"
                                ? "text-amber-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                order.status === "DRAFT"
                                    ? "bg-amber-600"
                                    : order.status !== "CANCELLED"
                                    ? "bg-green-600"
                                    : "bg-gray-400"
                            }`}
                        >
                            {order.status !== "DRAFT" && order.status !== "CANCELLED" ? "✓" : "1"}
                        </div>
                        <span className="font-bold">Draft</span>
                    </div>
                    <div className="w-16 h-0.5 bg-black" />
                    <div
                        className={`flex items-center gap-2 ${
                            order.status === "CONFIRMED" || order.status === "PAID"
                                ? "text-green-600"
                                : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                order.status === "CONFIRMED"
                                    ? "bg-amber-600"
                                    : order.status === "PAID"
                                    ? "bg-green-600"
                                    : "bg-gray-300"
                            }`}
                        >
                            {order.status === "PAID" ? "✓" : "2"}
                        </div>
                        <span className="font-bold">Confirmed</span>
                    </div>
                    <div className="w-16 h-0.5 bg-black" />
                    <div
                        className={`flex items-center gap-2 ${
                            order.status === "PAID" ? "text-green-600" : "text-gray-400"
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                order.status === "PAID" ? "bg-green-600" : "bg-gray-300"
                            }`}
                        >
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
                            className="bg-green-600 hover:bg-green-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                            Confirm
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            <X size={16} className="mr-2" />
                            Cancel
                        </Button>
                    </>
                )}
                {order.status === "CONFIRMED" && !order.invoice && (
                    <Button
                        onClick={handleCreateInvoice}
                        disabled={processing}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText size={16} className="mr-2" />}
                        Create Invoice
                    </Button>
                )}
                {order.invoice && (
                    <Link href={`/admin/invoices/${order.invoice.id}`}>
                        <Button variant="outline" className="bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <FileText size={16} className="mr-2" />
                            View Invoice ({order.invoice.invoiceNumber})
                        </Button>
                    </Link>
                )}
                <Button
                    variant="outline"
                    onClick={() => setShowCouponDialog(true)}
                    disabled={order.status !== "DRAFT"}
                    className="bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                >
                    Coupon Code
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Order Number</p>
                                    <p className="font-bold">{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Order Date</p>
                                    <p className="font-bold">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Customer</p>
                                    <p className="font-bold">{order.customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Payment Term</p>
                                    <p className="font-bold">{order.paymentTerm?.name || "Immediate"}</p>
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
                                <TableHeader className="bg-gray-100">
                                    <TableRow className="border-b-2 border-black">
                                        <TableHead className="text-black font-bold">Product</TableHead>
                                        <TableHead className="text-right text-black font-bold">Qty</TableHead>
                                        <TableHead className="text-right text-black font-bold">Unit Price</TableHead>
                                        <TableHead className="text-right text-black font-bold">Tax %</TableHead>
                                        <TableHead className="text-right text-black font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.lines.map((line) => (
                                        <TableRow key={line.id} className="border-b border-black/10">
                                            <TableCell className="font-bold">{line.product.name}</TableCell>
                                            <TableCell className="text-right">{line.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                                            <TableCell className="text-right">{line.tax}%</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(line.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {order.discountAmount > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-green-600 font-bold">
                                                Discount ({order.couponCode})
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">
                                                -{formatCurrency(order.discountAmount)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Summary & Customer */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Summary</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Subtotal</span>
                                <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-bold">Discount</span>
                                    <span className="font-bold">-{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Tax</span>
                                <span className="font-bold">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <hr className="border-black" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Customer</h3>
                        </div>
                        <div className="p-6 space-y-2 text-sm">
                            <p className="font-bold text-lg">{order.customer.name}</p>
                            {order.customer.email && <p className="text-gray-600 font-medium">{order.customer.email}</p>}
                            {(order.customer.street || order.customer.city) && (
                                <p className="text-gray-500 font-bold">
                                    {[order.customer.street, order.customer.city, order.customer.state].filter(Boolean).join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Cancel Order</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to cancel order <span className="font-bold text-black">{order.orderNumber}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="border-2 border-black bg-white hover:bg-gray-100">
                            No, Keep Order
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelOrder}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Yes, Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Coupon Dialog */}
            <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Apply Coupon Code</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Enter a coupon code to apply a discount to this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="couponCode" className="text-black font-bold">Coupon Code</Label>
                        <Input
                            id="couponCode"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowCouponDialog(false)} className="border-2 border-black bg-white hover:bg-gray-100">
                            Discard
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
