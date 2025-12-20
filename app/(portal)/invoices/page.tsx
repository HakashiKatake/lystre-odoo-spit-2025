"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, FileText, UserCircle, Loader2, Eye, CreditCard, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch invoices - BACKEND LOGIC PRESERVED
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (!userData.success) {
          setError("Please login to view your invoices");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/invoices?customerId=${userData.data.contactId}`);
        const data = await res.json();

        if (data.success) {
          setInvoices(data.data || []);
        } else {
          setError(data.message || "Failed to fetch invoices");
        }
      } catch (err) {
        setError("Failed to load invoices");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-[#22C55E] text-white";
      case "PARTIAL":
        return "bg-[#F59E0B] text-white";
      case "DRAFT":
        return "bg-[#F5EBE0] text-[#8B7355]";
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
      case "DRAFT":
        return "Draft";
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

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Account Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#2B1810] p-6">
              <h1 className="text-3xl font-serif text-[#2B1810] mb-8">My Account</h1>

              {/* Menu Options - Stacked without gaps */}
              <div className="border-2 border-[#2B1810]">
                {/* User Profile */}
                <Link href="/account">
                  <button className="w-full flex items-center gap-4 p-4 bg-white hover:bg-[#F5EBE0]/50 transition-all border-b-2 border-[#2B1810]">
                    <UserCircle className="w-6 h-6 text-[#2B1810]" />
                    <span className="text-lg font-medium text-[#2B1810]">User Profile</span>
                  </button>
                </Link>

                {/* Your Orders */}
                <Link href="/orders">
                  <button className="w-full flex items-center gap-4 p-4 bg-white hover:bg-[#F5EBE0]/50 transition-all border-b-2 border-[#2B1810]">
                    <Package className="w-6 h-6 text-[#2B1810]" />
                    <span className="text-lg font-medium text-[#2B1810]">Your Orders</span>
                  </button>
                </Link>

                {/* Your Invoices - Active */}
                <button className="w-full flex items-center gap-4 p-4 bg-[#F5EBE0]">
                  <FileText className="w-6 h-6 text-[#2B1810]" />
                  <span className="text-lg font-medium text-[#2B1810]">Your Invoices</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-[#2B1810] p-8">
              <h2 className="text-2xl font-serif text-[#2B1810] mb-6">Your Invoices</h2>

              {error && (
                <div className="bg-[#EF4444]/10 border-2 border-[#EF4444] p-4 mb-6">
                  <p className="text-[#991B1B]">{error}</p>
                </div>
              )}

              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border-2 border-[#2B1810] p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-[#2B1810]">Invoice #{invoice.invoiceNumber}</p>
                          <p className="text-sm text-[#8B7355]">
                            Date: {formatDate(invoice.invoiceDate)} • Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm border-2 border-[#2B1810] ${getStatusStyle(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#2B1810]">
                            Total: <span className="font-bold">{formatCurrency(invoice.totalAmount)}</span>
                          </p>
                          {invoice.amountDue > 0 && (
                            <p className="text-[#EF4444] text-sm">
                              Amount Due: {formatCurrency(invoice.amountDue)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="outline" className="border-2 border-[#2B1810]">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          {invoice.amountDue > 0 && (
                            <Link href={`/invoices/${invoice.id}?pay=true`}>
                              <Button className="bg-[#2B1810] text-white border-2 border-[#2B1810] hover:bg-[#1a0f0a]">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !error && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-[#8B7355]" />
                    <h3 className="text-xl font-serif text-[#2B1810] mb-2">No invoices yet</h3>
                    <p className="text-[#8B7355] mb-6">
                      Your invoices will appear here after you place an order
                    </p>
                    <Link href="/products">
                      <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
