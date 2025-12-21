"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CreditCard, Printer, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";

interface InvoiceItem {
  id: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  totalPrice: number;
  product: {
    name: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  taxAmount: number;
  subtotal: number;
  paidOn?: string;
  customer: {
    name: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  order: {
    orderNumber: string;
  };
  items: InvoiceItem[];
  paymentTerm?: {
    name: string;
  };
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);

  // Fetch invoice - BACKEND LOGIC PRESERVED
  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  // Auto-open payment modal if ?pay=true
  useEffect(() => {
    if (searchParams.get("pay") === "true" && invoice && invoice.amountDue > 0) {
      setShowPaymentModal(true);
    }
  }, [searchParams, invoice]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
        setPaymentAmount(data.data.amountDue.toString());
      } else {
        toast.error("We couldn't find the invoice you're looking for.");
        router.push("/invoices");
      }
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      toast.error("We encountered an issue loading the invoice. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Handle payment - BACKEND LOGIC PRESERVED
  const handlePayment = async () => {
    if (!invoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    if (amount > invoice.amountDue) {
      toast.error("The payment amount cannot exceed the amount due.");
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
          paymentType: "INBOUND",
          partnerType: "CUSTOMER",
          date: new Date().toISOString().split("T")[0],
          customerInvoiceId: invoice.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Payment successful! Thank you for your payment.");
        setShowPaymentModal(false);
        fetchInvoice();
      } else {
        toast.error(data.message || "We couldn't process your payment. Please try again.");
      }
    } catch (err) {
      console.error("Payment failed:", err);
      toast.error("An error occurred while processing your payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatAddress = () => {
    if (!invoice?.customer) return null;
    const parts = [
      invoice.customer.name,
      invoice.customer.address,
      [invoice.customer.city, invoice.customer.state, invoice.customer.pincode].filter(Boolean).join(", "),
      invoice.customer.email,
    ].filter(Boolean);
    return parts;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-[#22C55E] text-white";
      case "PARTIAL":
        return "bg-[#F59E0B] text-white";
      default:
        return "bg-[#EF4444] text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PARTIAL":
        return "Partially Paid";
      default:
        return "Waiting for Payment";
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-[#FFFEF9] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-[#8B7355]">Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <button className="p-2 border-2 border-[#2B1810] hover:bg-[#F5EBE0] transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#2B1810]" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-[#2B1810]">{invoice.invoiceNumber}</h1>
            </div>
            <span className={`px-4 py-2 text-sm border-2 border-[#2B1810] ${getStatusStyle(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {invoice.amountDue > 0 && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()} className="border-2 border-[#2B1810]">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Info */}
            <div className="bg-white border-2 border-[#2B1810] p-6">
              <h2 className="text-xl font-serif text-[#2B1810] mb-4">Invoice Details</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[#8B7355]">Invoice Date</p>
                  <p className="font-medium text-[#2B1810]">{formatDate(invoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-[#8B7355]">Due Date</p>
                  <p className="font-medium text-[#2B1810]">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-[#8B7355]">Source</p>
                  <p className="font-medium text-[#2B1810]">{invoice.order?.orderNumber || "-"}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border-2 border-[#2B1810]">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 p-4 bg-[#F5EBE0] border-b-2 border-[#2B1810] text-sm font-medium text-[#2B1810]">
                <div>Product</div>
                <div className="text-right">Quantity</div>
                <div className="text-right">Unit Price</div>
                <div className="text-right">Tax</div>
                <div className="text-right">Amount</div>
              </div>

              {/* Table Body */}
              {invoice.items?.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-b border-[#E5D4C1]">
                  <div className="font-medium text-[#2B1810]">{item.product.name}</div>
                  <div className="text-right text-[#8B7355]">{item.quantity}</div>
                  <div className="text-right text-[#8B7355]">{formatCurrency(item.unitPrice)}</div>
                  <div className="text-right text-[#8B7355]">{item.taxPercent}%</div>
                  <div className="text-right font-medium text-[#2B1810]">{formatCurrency(item.totalPrice)}</div>
                </div>
              ))}

              {/* Totals */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm text-[#8B7355]">
                  <span>Untaxed Amount</span>
                  <span>{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#8B7355]">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.taxAmount || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-[#2B1810] text-[#2B1810]">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                {invoice.paidOn && (
                  <div className="flex justify-between text-sm text-[#22C55E]">
                    <span>Paid on {formatDate(invoice.paidOn)}</span>
                    <span>-{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#2B1810]">
                  <span>Amount Due</span>
                  <span className={invoice.amountDue > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}>
                    {formatCurrency(invoice.amountDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            {invoice.paymentTerm && (
              <div className="bg-white border-2 border-[#2B1810] p-6">
                <p className="text-sm text-[#8B7355]">Payment Terms</p>
                <p className="font-medium text-[#2B1810]">{invoice.paymentTerm.name}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Address */}
          <div>
            <div className="bg-white border-2 border-[#2B1810] p-6">
              <h2 className="text-xl font-serif text-[#2B1810] mb-4">Billing Address</h2>
              {formatAddress()?.length ? (
                <div className="space-y-1 text-sm">
                  {formatAddress()?.map((line, i) => (
                    <p key={i} className={i === 0 ? "font-medium text-[#2B1810]" : "text-[#8B7355]"}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[#8B7355] text-sm italic">No address set</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-[#2B1810] p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-[#2B1810]">Make Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-[#F5EBE0] transition-colors">
                <X className="w-5 h-5 text-[#2B1810]" />
              </button>
            </div>

            <p className="text-[#8B7355] mb-6">
              Pay for invoice {invoice.invoiceNumber}. Amount due: {formatCurrency(invoice.amountDue)}
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2B1810] mb-2">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={invoice.amountDue}
                  min={1}
                  className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2B1810] mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {["UPI", "Card", "NetBanking"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-4 py-2 border-2 border-[#2B1810] text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? "bg-[#8B7355] text-white"
                          : "bg-white text-[#2B1810] hover:bg-[#F5EBE0]"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border-2 border-[#2B1810]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Pay {formatCurrency(parseFloat(paymentAmount) || 0)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
