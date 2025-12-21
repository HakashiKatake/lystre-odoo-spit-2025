"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, CreditCard, FileText, Calendar, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Payment {
    id: string;
    date: string;
    paymentType: string;
    partnerType: string;
    method: string;
    amount: number;
    note?: string;
    createdAt: string;
    customerInvoice?: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        paidAmount: number;
        status: string;
        customer: {
            id: string;
            name: string;
            email?: string;
        };
        order?: {
            id: string;
            orderNumber: string;
        };
    };
    vendorBill?: {
        id: string;
        billNumber: string;
        totalAmount: number;
        paidAmount: number;
        status: string;
        vendor: {
            id: string;
            name: string;
            email?: string;
        };
    };
}

export default function PaymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchPayment();
    }, [params.id]);

    const fetchPayment = async () => {
        try {
            const res = await fetch(`/api/payments/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setPayment(data.data);
            } else {
                toast.error("We couldn't find the payment you were looking for.");
                router.push("/admin/payments");
            }
        } catch (err) {
            console.error("Failed to fetch payment:", err);
            toast.error("We encountered an issue loading the payment details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/payments/${params.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Payment has been deleted and the invoice status has been updated.");
                router.push("/admin/payments");
            } else {
                toast.error(data.message || "Failed to delete payment.");
            }
        } catch (err) {
            console.error("Failed to delete payment:", err);
            toast.error("An error occurred while deleting the payment.");
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A1887F]" />
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 font-bold">Payment not found</p>
            </div>
        );
    }

    const partner = payment.customerInvoice?.customer || payment.vendorBill?.vendor;
    const document = payment.customerInvoice || payment.vendorBill;
    const documentType = payment.customerInvoice ? "Invoice" : (payment.vendorBill ? "Bill" : null);
    const documentNumber = payment.customerInvoice?.invoiceNumber || payment.vendorBill?.billNumber;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/payments">
                        <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-serif">Payment Details</h1>
                            <Badge className={`border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-md uppercase tracking-widest ${
                                payment.paymentType === "INBOUND" 
                                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}>
                                {payment.paymentType === "INBOUND" ? "Inbound" : "Outbound"}
                            </Badge>
                        </div>
                        <p className="text-gray-500 font-bold">
                            {formatCurrency(payment.amount)} via {payment.method}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowDeleteDialog(true)}
                    className="bg-red-500 text-white hover:bg-red-600 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <Trash2 size={16} className="mr-2" />
                    Delete Payment
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Payment Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Payment Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg border-2 border-black">
                                        <CreditCard size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Amount</p>
                                        <p className="font-bold text-xl text-green-600">{formatCurrency(payment.amount)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg border-2 border-black">
                                        <Calendar size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Date</p>
                                        <p className="font-bold">{formatDate(payment.date)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Payment Method</p>
                                    <p className="font-bold capitalize">{payment.method}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Type</p>
                                    <p className="font-bold">{payment.paymentType === "INBOUND" ? "Customer Payment" : "Vendor Payment"}</p>
                                </div>
                            </div>

                            {payment.note && (
                                <div className="mt-6 p-4 bg-gray-50 border-2 border-black rounded-lg">
                                    <p className="text-sm text-gray-500 font-bold mb-1">Note</p>
                                    <p className="text-gray-700">{payment.note}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Linked Document */}
                    {document && (
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Linked {documentType}</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg border-2 border-black">
                                            <FileText size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{documentNumber}</p>
                                            <p className="text-sm text-gray-500 font-bold">{partner?.name}</p>
                                        </div>
                                    </div>
                                    <Badge className={`border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                        document.status === "PAID" 
                                            ? "bg-green-100 text-green-700" 
                                            : document.status === "PARTIAL" 
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                    }`}>
                                        {document.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Total Amount</p>
                                        <p className="font-bold text-lg">{formatCurrency(document.totalAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Amount Paid</p>
                                        <p className="font-bold text-lg text-green-600">{formatCurrency(document.paidAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Balance Due</p>
                                        <p className={`font-bold text-lg ${document.totalAmount - document.paidAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                                            {formatCurrency(document.totalAmount - document.paidAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Link href={payment.customerInvoice ? `/admin/invoices/${payment.customerInvoice.id}` : `/admin/vendor-bills/${payment.vendorBill?.id}`}>
                                        <Button variant="outline" className="bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            View {documentType}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Partner Info */}
                    {partner && (
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">
                                    {payment.paymentType === "INBOUND" ? "Customer" : "Vendor"}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-lystre-brown rounded-full flex items-center justify-center border-2 border-black">
                                        <User size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{partner.name}</p>
                                        {partner.email && (
                                            <p className="text-sm text-gray-500 font-medium">{partner.email}</p>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/admin/contacts/${partner.id}`}>
                                    <Button variant="outline" size="sm" className="w-full bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        View Contact
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Record Info</h3>
                        </div>
                        <div className="p-6 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Payment Date</span>
                                <span className="font-medium">{formatDate(payment.date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Created</span>
                                <span className="font-medium">{formatDate(payment.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Payment ID</span>
                                <span className="font-mono text-xs">{payment.id.slice(0, 12)}...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold font-serif">Delete Payment</DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Are you sure you want to delete this payment of {formatCurrency(payment.amount)}? 
                            This will also update the linked invoice/bill status. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white hover:bg-red-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 size={16} className="mr-2" />
                            )}
                            Delete Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
