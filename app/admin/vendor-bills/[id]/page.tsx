"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Printer, Loader2, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BillLine {
    id: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
    product: {
        name: string;
    };
}

interface VendorBill {
    id: string;
    billNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    paidOn?: string;
    status: string;
    taxAmount: number;
    subtotal: number;
    vendor: {
        id: string;
        name: string;
        email?: string;
        street?: string;
        city?: string;
        state?: string;
    };
    order?: {
        id: string;
        orderNumber: string;
        lines: BillLine[];
    };
}

export default function VendorBillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [bill, setBill] = useState<VendorBill | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [paymentNote, setPaymentNote] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBill();
    }, [params.id]);

    const fetchBill = async () => {
        try {
            const res = await fetch(`/api/vendor-bills/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setBill(data.data);
                const amountDue = data.data.totalAmount - data.data.paidAmount;
                setPaymentAmount(amountDue.toString());
            } else {
                toast.error("We couldn't find the vendor bill you were looking for.");
                router.push("/admin/vendor-bills");
            }
        } catch (err) {
            console.error("Failed to fetch bill:", err);
            toast.error("We encountered an issue loading the bill details. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPayment = async () => {
        if (!bill) return;

        const amount = parseFloat(paymentAmount);
        const amountDue = bill.totalAmount - bill.paidAmount;

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount greater than zero.");
            return;
        }

        if (amount > amountDue) {
            toast.error("The payment amount cannot exceed the total amount due.");
            return;
        }

        setProcessing(true);

        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    method: paymentMethod,
                    paymentType: "OUTBOUND",
                    partnerType: "VENDOR",
                    date: new Date().toISOString().split("T")[0],
                    vendorBillId: bill.id,
                    note: paymentNote || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Payment registered successfully! The bill status has been updated.");
                setShowPaymentModal(false);
                setPaymentNote("");
                fetchBill();
            } else {
                toast.error(data.message || "We couldn't register the payment. Please try again.");
            }
        } catch (err) {
            console.error("Payment registration failed:", err);
            toast.error("An error occurred while registering the payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "PAID":
                return "default";
            case "PARTIAL":
                return "secondary";
            default:
                return "destructive";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A1887F]" />
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 font-bold">Bill not found</p>
            </div>
        );
    }

    const amountDue = bill.totalAmount - bill.paidAmount;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/vendor-bills">
                        <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-serif">{bill.billNumber}</h1>
                            <Badge className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-md bg-white text-black hover:bg-gray-100 uppercase tracking-widest">
                                {bill.status === "PAID" ? "Paid" : bill.status === "PARTIAL" ? "Partially Paid" : "Unpaid"}
                            </Badge>
                        </div>
                        <p className="text-gray-500 font-bold">{bill.vendor.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {amountDue > 0 && (
                        <Button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-green-600 text-white hover:bg-green-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <CreditCard size={16} className="mr-2" />
                            Register Payment
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => window.print()} className="bg-white hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Printer size={16} className="mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bill Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Bill Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Bill Number</p>
                                    <p className="font-medium">{bill.billNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Bill Date</p>
                                    <p className="font-medium">{formatDate(bill.invoiceDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Due Date</p>
                                    <p className="font-medium">{formatDate(bill.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Source Order</p>
                                    {bill.order ? (
                                        <Link href={`/admin/purchase-orders/${bill.order.id}`} className="font-medium text-[#A1887F] hover:underline">
                                            {bill.order.orderNumber}
                                        </Link>
                                    ) : (
                                        <p className="font-medium">-</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill Lines */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Bill Lines</h3>
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
                                    {bill.order?.lines?.map((line) => (
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

                            {/* Totals */}
                            <div className="border-t-2 border-black p-6 space-y-2 bg-gray-50/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-bold">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-bold">Tax</span>
                                    <span className="font-medium">{formatCurrency(bill.taxAmount)}</span>
                                </div>
                                <hr className="border-black/20 my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatCurrency(bill.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600 font-bold">
                                    <span>Amount Paid</span>
                                    <span>{formatCurrency(bill.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Amount Due</span>
                                    <span className={amountDue > 0 ? "text-red-600" : "text-green-600"}>
                                        {formatCurrency(amountDue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Vendor Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Vendor</h3>
                        </div>
                        <div className="p-6 space-y-2 text-sm">
                            <p className="font-bold text-lg">{bill.vendor.name}</p>
                            {bill.vendor.email && <p className="font-medium text-gray-700">{bill.vendor.email}</p>}
                            {(bill.vendor.street || bill.vendor.city) && (
                                <p className="text-gray-500 font-bold">
                                    {[bill.vendor.street, bill.vendor.city, bill.vendor.state].filter(Boolean).join(", ")}
                                </p>
                            )}
                            <Link href={`/admin/contacts/${bill.vendor.id}`}>
                                <Button variant="outline" size="sm" className="mt-4 w-full bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    View Contact
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Payment Status */}
                    {bill.paidOn && (
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Payment Info</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-500 font-bold">Paid On</p>
                                <p className="font-medium">{formatDate(bill.paidOn)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold font-serif">Register Payment</DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Register payment for bill {bill.billNumber}. Amount due: {formatCurrency(amountDue)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="amount" className="text-black font-bold">Payment Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                max={amountDue}
                                min={1}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="method" className="text-black font-bold">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="note" className="text-black font-bold">Note (Optional)</Label>
                            <Textarea
                                id="note"
                                value={paymentNote}
                                onChange={(e) => setPaymentNote(e.target.value)}
                                placeholder="Add a note about this payment..."
                                rows={3}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegisterPayment}
                            disabled={processing}
                            className="bg-green-600 text-white hover:bg-green-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Check size={16} className="mr-2" />
                            )}
                            Register Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
