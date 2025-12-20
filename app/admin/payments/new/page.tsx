"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_METHODS } from "@/lib/constants";
import { Button } from "@/components/retroui/Button";
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
import { Card } from "@/components/ui/card";

function PaymentFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get("invoiceId");
    const billId = searchParams.get("billId");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: 0,
        method: "upi",
        date: new Date().toISOString().split("T")[0],
        note: "",
        partnerType: invoiceId ? "customer" : "vendor",
        customerInvoiceId: invoiceId || "",
        vendorBillId: billId || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    paymentType: formData.partnerType === "customer" ? "receive" : "send",
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Payment registered successfully!");
                router.push("/admin/payments");
            } else {
                toast.error(data.message || "Failed to register payment");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/payments">
                    <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Register Payment
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Payment Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <Label className="block text-sm font-bold mb-1 text-black">Partner Type *</Label>
                                <Select
                                    value={formData.partnerType}
                                    onValueChange={(val) => setFormData((f) => ({ ...f, partnerType: val }))}
                                >
                                    <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <SelectItem value="customer">Customer (Receive Payment)</SelectItem>
                                        <SelectItem value="vendor">Vendor (Send Payment)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.partnerType === "customer" && (
                                <div>
                                    <Label className="block text-sm font-bold mb-1 text-black">Invoice ID</Label>
                                    <Input
                                        type="text"
                                        value={formData.customerInvoiceId}
                                        onChange={(e) => setFormData((f) => ({ ...f, customerInvoiceId: e.target.value }))}
                                        className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="Enter invoice ID"
                                    />
                                </div>
                            )}

                            {formData.partnerType === "vendor" && (
                                <div>
                                    <Label className="block text-sm font-bold mb-1 text-black">Bill ID</Label>
                                    <Input
                                        type="text"
                                        value={formData.vendorBillId}
                                        onChange={(e) => setFormData((f) => ({ ...f, vendorBillId: e.target.value }))}
                                        className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="Enter bill ID"
                                    />
                                </div>
                            )}

                            <div>
                                <Label className="block text-sm font-bold mb-1 text-black">Amount (₹) *</Label>
                                <Input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-bold mb-1 text-black">Payment Method *</Label>
                                <Select
                                    value={formData.method}
                                    onValueChange={(val) => setFormData((f) => ({ ...f, method: val }))}
                                >
                                    <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        {PAYMENT_METHODS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="block text-sm font-bold mb-1 text-black">Payment Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
                                    required
                                    className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-bold mb-1 text-black">Note</Label>
                                <Textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData((f) => ({ ...f, note: e.target.value }))}
                                    className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    rows={3}
                                    placeholder="Optional payment note..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex-1"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Register Payment
                                </>
                            )}
                        </Button>
                        <Link href="/admin/payments" className="flex-1">
                            <Button type="button" variant="outline" className="w-full bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function NewPaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A1887F]" />
            </div>
        }>
            <PaymentFormContent />
        </Suspense>
    );
}
