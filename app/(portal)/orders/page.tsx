"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, FileText, UserCircle, Loader2, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";

interface SaleOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer: {
    name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders - BACKEND LOGIC PRESERVED
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (!userData.success) {
          setError("Please login to view your orders");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/sale-orders?customerId=${userData.data.contactId}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Failed to fetch orders");
        }
      } catch (err) {
        setError("Failed to load orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

                {/* Your Orders - Active */}
                <button className="w-full flex items-center gap-4 p-4 bg-[#F5EBE0] border-b-2 border-[#2B1810]">
                  <Package className="w-6 h-6 text-[#2B1810]" />
                  <span className="text-lg font-medium text-[#2B1810]">Your Orders</span>
                </button>

                {/* Your Invoices */}
                <Link href="/invoices">
                  <button className="w-full flex items-center gap-4 p-4 bg-white hover:bg-[#F5EBE0]/50 transition-all">
                    <FileText className="w-6 h-6 text-[#2B1810]" />
                    <span className="text-lg font-medium text-[#2B1810]">Your Invoices</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-[#2B1810] p-8">
              <h2 className="text-2xl font-serif text-[#2B1810] mb-6">Your Orders</h2>

              {error && (
                <div className="bg-[#EF4444]/10 border-2 border-[#EF4444] p-4 mb-6">
                  <p className="text-[#991B1B]">{error}</p>
                </div>
              )}

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border-2 border-[#2B1810] p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-[#2B1810]">Order #{order.orderNumber}</p>
                          <p className="text-sm text-[#8B7355]">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm border-2 border-[#2B1810] ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#2B1810]">
                          Total: <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                        </p>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" className="border-2 border-[#2B1810]">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !error && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-[#8B7355]" />
                    <h3 className="text-xl font-serif text-[#2B1810] mb-2">No orders yet</h3>
                    <p className="text-[#8B7355] mb-6">Start shopping to see your orders here</p>
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
