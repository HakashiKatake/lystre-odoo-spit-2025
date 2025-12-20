"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Printer, ShoppingBag, Loader2, Package, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";
import { motion } from "framer-motion";

interface OrderLine {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: {
    name: string;
    images: string[];
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
  lines: OrderLine[];
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch order - BACKEND LOGIC PRESERVED
  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/sale-orders/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B7355] mb-4" />
          <p className="text-[#8B7355]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#FFFEF9] py-16">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="w-24 h-24 bg-[#EF4444] border-4 border-[#2B1810] rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-[#2B1810] mb-4">Order Not Found</h1>
          <p className="text-[#8B7355] mb-8">{error || "We could not find your order."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button variant="outline" className="border-2 border-[#2B1810] px-8">
                View My Orders
              </Button>
            </Link>
            <Link href="/products">
              <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Message */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 bg-[#22C55E] border-4 border-[#2B1810] rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_#2B1810]">
                <Check className="w-14 h-14 text-white" strokeWidth={4} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-serif text-[#2B1810] mb-4"
            >
              Thank you for your order.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xl text-[#2B1810] font-medium mb-2">
                Order {order.orderNumber}
              </p>
              <div className="inline-block bg-[#22C55E]/10 border-2 border-[#22C55E] px-6 py-3 mb-6">
                <p className="text-[#166534] font-medium">
                  Your payment has been processed.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="print:hidden"
            >
              <Button
                onClick={handlePrint}
                className="bg-[#2B1810] text-white border-2 border-[#2B1810] hover:bg-[#1a0f0a] px-8 inline-flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print
              </Button>
            </motion.div>
          </div>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="max-w-[500px] mx-auto"
          >
            <div className="bg-white border-2 border-[#2B1810] p-8">
              {/* Items List */}
              <div className="space-y-4 mb-6">
                {order.lines?.map((line: OrderLine) => (
                  <div key={line.id} className="flex items-start gap-3">
                    {/* Quantity Circle */}
                    <div className="w-8 h-8 rounded-full bg-[#87CEEB] border-2 border-[#2B1810] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#2B1810] font-bold text-sm">{line.quantity}</span>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#2B1810] text-sm leading-tight">
                            {line.product.name}
                          </p>
                        </div>
                        <p className="font-bold text-[#2B1810] text-sm ml-4">
                          {formatCurrency(line.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Discount Item */}
                {order.discountAmount > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#87CEEB] border-2 border-[#2B1810] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#2B1810] font-bold text-sm">%</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#2B1810] text-sm leading-tight">
                            Discount Applied
                          </p>
                        </div>
                        <p className="font-bold text-[#22C55E] text-sm ml-4">
                          -{formatCurrency(order.discountAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-[#2B1810] my-6"></div>

              {/* Summary Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#2B1810]">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#2B1810]">
                  <span className="font-medium">Taxes</span>
                  <span className="font-bold">{formatCurrency(order.taxAmount)}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-[#2B1810] my-6"></div>

              {/* Total */}
              <div className="flex justify-between text-[#2B1810] mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center mt-12 print:hidden"
          >
            <p className="text-[#8B7355] mb-6">
              A confirmation email has been sent to your email address.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" className="border-2 border-[#2B1810] px-8">
                  View All Orders
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B7355] mb-4" />
            <p className="text-[#8B7355]">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
