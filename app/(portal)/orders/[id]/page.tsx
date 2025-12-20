"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
  };
}

interface SaleOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    mobile?: string;
  };
  lines: OrderItem[];
  shippingAddress?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<SaleOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch order - BACKEND LOGIC PRESERVED
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/sale-orders/${orderId}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || "Order not found");
        }
      } catch (err) {
        setError("Failed to load order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "PAID":
      case "DELIVERED":
        return "bg-[#22C55E] text-white";
      case "DRAFT":
      case "PENDING":
        return "bg-[#F5EBE0] text-[#8B7355]";
      case "CANCELLED":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-[#8B7355] text-white";
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#FFFEF9] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-[#8B7355]" />
          <h2 className="text-2xl font-serif text-[#2B1810] mb-2">Order Not Found</h2>
          <p className="text-[#8B7355] mb-6">{error || "The order you are looking for does not exist."}</p>
          <Link href="/orders">
            <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/orders">
            <button className="p-2 border-2 border-[#2B1810] hover:bg-[#F5EBE0] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#2B1810]" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-serif text-[#2B1810]">Order {order.orderNumber}</h1>
            <p className="text-[#8B7355]">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`px-4 py-2 text-sm border-2 border-[#2B1810] ${getStatusStyle(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-[#2B1810]">
              <div className="p-6 border-b-2 border-[#2B1810]">
                <h2 className="text-xl font-serif text-[#2B1810]">Order Items</h2>
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-[#F5EBE0] border-b-2 border-[#2B1810] text-sm font-medium text-[#2B1810]">
                <div>Product</div>
                <div className="text-center">Qty</div>
                <div className="text-right">Price</div>
                <div className="text-right">Total</div>
              </div>

              {/* Table Body */}
              {(order.lines || []).map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4 p-4 border-b border-[#E5D4C1]">
                  <div>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium text-[#2B1810] hover:text-[#8B7355]"
                    >
                      {item.product.name}
                    </Link>
                  </div>
                  <div className="text-center text-[#8B7355]">{item.quantity}</div>
                  <div className="text-right text-[#8B7355]">{formatCurrency(item.unitPrice)}</div>
                  <div className="text-right font-medium text-[#2B1810]">
                    {formatCurrency(item.totalPrice || item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-[#2B1810] p-6">
              <h2 className="text-xl font-serif text-[#2B1810] mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-[#8B7355]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8B7355]">
                  <span>Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="border-t-2 border-[#2B1810] pt-4">
                  <div className="flex justify-between text-[#2B1810]">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#2B1810] p-6">
              <h2 className="text-xl font-serif text-[#2B1810] mb-4">Shipping Address</h2>
              <p className="text-[#8B7355]">
                {order.shippingAddress || "No shipping address provided"}
              </p>
            </div>

            <Link href="/orders">
              <Button variant="outline" className="w-full border-2 border-[#2B1810]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
