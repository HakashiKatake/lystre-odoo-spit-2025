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
    id: string;
    name: string;
    email?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  order?: {
    id: string;
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
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
        setPaymentAmount(data.data.amountDue.toString());
      } else {
        toast.error("We couldn't find the invoice you were looking for.");
        router.push("/admin/invoices");
      }
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      toast.error(
        "We encountered an issue loading the invoice details. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async () => {
    if (!invoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount greater than zero.");
      return;
    }

    if (amount > invoice.amountDue) {
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
          paymentType: "INBOUND",
          partnerType: "CUSTOMER",
          date: new Date().toISOString().split("T")[0],
          customerInvoiceId: invoice.id,
          note: paymentNote || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          "Payment registered successfully! The invoice status has been updated."
        );
        setShowPaymentModal(false);
        setPaymentNote("");
        fetchInvoice();
      } else {
        toast.error(
          data.message || "We couldn't register the payment. Please try again."
        );
      }
    } catch (err) {
      console.error("Payment registration failed:", err);
      toast.error(
        "An error occurred while registering the payment. Please try again."
      );
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

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 font-bold">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-serif">
                {invoice.invoiceNumber}
              </h1>
              <Badge className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-md bg-white text-black hover:bg-gray-100 uppercase tracking-widest">
                {invoice.status === "PAID"
                  ? "Paid"
                  : invoice.status === "PARTIAL"
                  ? "Partially Paid"
                  : "Open"}
              </Badge>
            </div>
            <p className="text-gray-500 font-bold">{invoice.customer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.amountDue > 0 && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 text-white hover:bg-green-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <CreditCard size={16} className="mr-2" />
              Register Payment
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="bg-white hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Printer size={16} className="mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Info */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-4 border-b-2 border-black bg-gray-50">
              <h3 className="font-bold text-lg font-serif">Invoice Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-bold">
                    Invoice Number
                  </p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">
                    Invoice Date
                  </p>
                  <p className="font-medium">
                    {formatDate(invoice.invoiceDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">Due Date</p>
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">
                    Source Order
                  </p>
                  {invoice.order ? (
                    <Link
                      href={`/admin/sale-orders/${invoice.order.id}`}
                      className="font-medium text-[#A1887F] hover:underline"
                    >
                      {invoice.order.orderNumber}
                    </Link>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-4 border-b-2 border-black bg-gray-50">
              <h3 className="font-bold text-lg font-serif">Invoice Lines</h3>
            </div>
            <div className="p-0">
              <Table>
                <TableHeader className="bg-gray-100 border-b-2 border-black">
                  <TableRow>
                    <TableHead className="text-black font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-right text-black font-bold">
                      Qty
                    </TableHead>
                    <TableHead className="text-right text-black font-bold">
                      Unit Price
                    </TableHead>
                    <TableHead className="text-right text-black font-bold">
                      Tax %
                    </TableHead>
                    <TableHead className="text-right text-black font-bold">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-black/10 hover:bg-gray-50/50"
                    >
                      <TableCell className="font-bold">
                        {item.product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.taxPercent}%
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="border-t-2 border-black p-6 space-y-2 bg-gray-50/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.taxAmount || 0)}
                  </span>
                </div>
                <hr className="border-black/20 my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Amount Paid</span>
                  <span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Amount Due</span>
                  <span
                    className={
                      invoice.amountDue > 0 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {formatCurrency(invoice.amountDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-4 border-b-2 border-black bg-gray-50">
              <h3 className="font-bold text-lg font-serif">Customer</h3>
            </div>
            <div className="p-6 space-y-2 text-sm">
              <p className="font-bold text-lg">{invoice.customer.name}</p>
              {invoice.customer.email && (
                <p className="font-medium text-gray-700">
                  {invoice.customer.email}
                </p>
              )}
              {(invoice.customer.street || invoice.customer.city) && (
                <p className="text-gray-500 font-bold">
                  {[
                    invoice.customer.street,
                    invoice.customer.city,
                    invoice.customer.state,
                    invoice.customer.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              <Link href={`/admin/contacts/${invoice.customer.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  View Contact
                </Button>
              </Link>
            </div>
          </div>

          {/* Payment Term */}
          {invoice.paymentTerm && (
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50">
                <h3 className="font-bold text-lg font-serif">Payment Term</h3>
              </div>
              <div className="p-6">
                <p className="font-bold text-lg">{invoice.paymentTerm.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif">
              Register Payment
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-500">
              Register payment for invoice {invoice.invoiceNumber}. Amount due:{" "}
              {formatCurrency(invoice.amountDue)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount" className="text-black font-bold">
                Payment Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={invoice.amountDue}
                min={1}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
              />
            </div>
            <div>
              <Label htmlFor="method" className="text-black font-bold">
                Payment Method
              </Label>
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
              <Label htmlFor="note" className="text-black font-bold">
                Note (Optional)
              </Label>
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
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="bg-white hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
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
