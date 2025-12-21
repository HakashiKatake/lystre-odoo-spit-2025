"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceItem {
    id: string;
    product: {
        name: string;
    };
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    createdAt: string;
    dueDate: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    status: string;
    customer: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    order?: {
        orderNumber: string;
        lines: InvoiceItem[];
    };
}

export default function PrintInvoicePage() {
    const params = useParams();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [params.id]);

    useEffect(() => {
        if (invoice && !loading) {
            // Auto-trigger print dialog after load
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [invoice, loading]);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/invoices/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setInvoice(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch invoice:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading invoice...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Invoice not found</p>
            </div>
        );
    }

    const balanceDue = invoice.totalAmount - invoice.paidAmount;

    return (
        <div className="bg-white min-h-screen p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
                    <p className="text-gray-600 font-mono">{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-[#8B7355]">Lystré</h2>
                    <p className="text-gray-600 text-sm">Premium Fashion Boutique</p>
                    <p className="text-gray-500 text-sm mt-2">Mumbai, India</p>
                </div>
            </div>

            {/* Invoice Info & Customer */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">Bill To</h3>
                    <p className="font-bold text-lg">{invoice.customer?.name}</p>
                    {invoice.customer?.email && <p className="text-gray-600">{invoice.customer.email}</p>}
                    {invoice.customer?.phone && <p className="text-gray-600">{invoice.customer.phone}</p>}
                    {invoice.customer?.address && <p className="text-gray-600">{invoice.customer.address}</p>}
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <h3 className="text-gray-500 font-bold text-sm uppercase">Invoice Date</h3>
                        <p className="font-medium">{formatDate(invoice.createdAt)}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-gray-500 font-bold text-sm uppercase">Due Date</h3>
                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                    </div>
                    {invoice.order && (
                        <div>
                            <h3 className="text-gray-500 font-bold text-sm uppercase">Order #</h3>
                            <p className="font-medium font-mono">{invoice.order.orderNumber}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded font-bold text-sm uppercase ${
                    invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                    invoice.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                }`}>
                    {invoice.status}
                </span>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 font-bold text-gray-700">Item</th>
                        <th className="text-center py-3 font-bold text-gray-700">Qty</th>
                        <th className="text-right py-3 font-bold text-gray-700">Unit Price</th>
                        <th className="text-right py-3 font-bold text-gray-700">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.order?.lines?.map((item, index) => (
                        <tr key={item.id || index} className="border-b border-gray-200">
                            <td className="py-3">{item.product?.name || "Product"}</td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 text-right font-mono">{formatCurrency(item.subtotal)}</td>
                        </tr>
                    )) || (
                        <tr className="border-b border-gray-200">
                            <td className="py-3 text-gray-500" colSpan={4}>No items available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-72">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-mono">{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                        <span>Total</span>
                        <span className="font-mono">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    {invoice.paidAmount > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                            <span>Amount Paid</span>
                            <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
                        </div>
                    )}
                    {balanceDue > 0 && (
                        <div className="flex justify-between py-2 text-red-600 font-bold text-lg">
                            <span>Balance Due</span>
                            <span className="font-mono">{formatCurrency(balanceDue)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-6 text-center text-gray-500 text-sm">
                <p className="mb-2">Thank you for shopping with Lystré!</p>
                <p>For any queries, please contact us at support@lystre.com</p>
            </div>

            {/* Print Button - only visible on screen */}
            <div className="fixed bottom-6 right-6 no-print">
                <button
                    onClick={() => window.print()}
                    className="bg-[#8B7355] text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-[#6D5E52] transition-colors"
                >
                    Save as PDF / Print
                </button>
            </div>
        </div>
    );
}
