"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, X, Loader2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  
  // Backend cart store logic - PRESERVED
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    couponCode, 
    discountAmount, 
    setCoupon, 
    removeCoupon, 
    getSubtotal, 
    getTaxAmount, 
    getTotal 
  } = useCartStore();
  
  // Frontend state
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Apply coupon - BACKEND LOGIC PRESERVED
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      setCouponSuccess("");
      return;
    }

    setCouponError("");
    setValidatingCoupon(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.toUpperCase() }),
      });

      const data = await res.json();

      if (data.success && data.valid) {
        const discount = getSubtotal() * (data.discountPercentage / 100);
        setCoupon(couponInput.toUpperCase(), discount);
        setCouponSuccess(`You have successfully applied the following code: ${couponInput.toUpperCase()}`);
        setCouponError("");
        toast.success(data.message || `${data.discountPercentage}% discount applied!`);
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setCouponSuccess("");
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      setCouponError("Failed to validate coupon");
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Remove item - BACKEND LOGIC PRESERVED
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    toast.success("Item removed from cart");
  };

  // Handle checkout
  const handleCheckout = () => {
    if (items.length > 0) {
      router.push("/checkout");
    }
  };

  // Calculate values
  const subtotal = getSubtotal();
  const taxes = getTaxAmount();
  const total = getTotal();

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="bg-[#FFFEF9] min-h-[60vh]">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-[#2B1810] p-12 text-center"
          >
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-[#8B7355]" />
            <h2 className="text-2xl font-serif text-[#2B1810] mb-2">Your cart is empty</h2>
            <p className="text-[#8B7355] mb-6">Add some items to get started!</p>
            <Link href="/products">
              <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-center space-x-2 text-sm text-[#8B7355]">
          <Link href="/cart" className="hover:underline font-medium text-[#2B1810]">
            Order
          </Link>
          <span>&gt;</span>
          <Link href="/checkout" className="hover:underline font-medium">
            Address
          </Link>
          <span>&gt;</span>
          <span className="font-medium">Payment</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl font-serif text-[#2B1810] mb-4">
              Shopping Cart ({items.length} items)
            </h1>

            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-[#2B1810] p-6"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-[#F5EBE0] border-2 border-[#2B1810] flex-shrink-0 relative overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-[#8B7355]" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif text-lg text-[#2B1810] mb-1">
                          {item.name}
                        </h3>
                        {item.color && (
                          <p className="text-sm text-[#8B7355] capitalize">
                            Color: {item.color}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-sm text-[#8B7355]">
                            Size: {item.size}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-1 hover:bg-[#F5EBE0] rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-[#8B7355]" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3 border-2 border-[#2B1810]">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 hover:bg-[#F5EBE0] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-[#2B1810] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-[#F5EBE0]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#2B1810]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Discount Applied Message */}
            {couponCode && discountAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-[#2B1810] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#22C55E] border-2 border-[#2B1810] flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#2B1810] font-medium leading-relaxed">
                      Coupon {couponCode} applied successfully!
                    </p>
                    <p className="text-sm text-[#8B7355] mt-1">
                      Discount: -{formatCurrency(discountAmount)}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#2B1810] p-6 sticky top-24">
              {/* Order Summary */}
              <h2 className="font-serif text-2xl text-[#2B1810] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[#8B7355]">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span>Discount</span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8B7355]">
                  <span>Taxes</span>
                  <span className="font-medium">{formatCurrency(taxes)}</span>
                </div>
                <div className="border-t-2 border-[#2B1810] pt-4">
                  <div className="flex justify-between text-[#2B1810]">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              {!couponCode && (
                <div className="mb-6">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Discount Code..."
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="flex-1 px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon}
                      className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-6"
                    >
                      {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>

                  {/* Success Message */}
                  {couponSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#22C55E]/10 border-2 border-[#22C55E] p-3"
                    >
                      <p className="text-sm text-[#166534] leading-relaxed">
                        {couponSuccess}
                      </p>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {couponError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#EF4444]/10 border-2 border-[#EF4444] p-3"
                    >
                      <p className="text-sm text-[#991B1B]">{couponError}</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full bg-[#2B1810] text-white border-2 border-[#2B1810] hover:bg-[#1a0f0a] py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </Button>

              {/* Continue Shopping */}
              <Link href="/products" className="block text-center mt-4">
                <span className="text-sm text-[#8B7355] hover:underline">
                  Continue Shopping
                </span>
              </Link>

              {/* Additional Info Box */}
              <div className="mt-6 p-4 bg-[#F5EBE0] border-2 border-[#2B1810]">
                <p className="text-xs text-[#8B7355] leading-relaxed">
                  <span className="font-bold text-[#2B1810]">Note:</span> In address and payment
                  section box will look like this with item details and totals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
