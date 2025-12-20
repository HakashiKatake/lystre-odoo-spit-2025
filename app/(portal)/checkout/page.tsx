"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, CreditCard, Building, Wallet, Loader2, Check, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { INDIAN_STATES } from "@/lib/constants";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";

interface UserData {
  contactId: string;
  contact?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, discountAmount, getSubtotal, getTaxAmount, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState<"address" | "payment">("address");
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data and pre-fill address - BACKEND LOGIC PRESERVED
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          if (data.data.contact) {
            setAddress({
              street: data.data.contact.address || "",
              city: data.data.contact.city || "",
              state: data.data.contact.state || "",
              pincode: data.data.contact.pincode || "",
            });
          }
        } else {
          toast.error("Please login to continue");
          router.push("/login?redirect=/checkout");
        }
      } catch {
        toast.error("Please login to continue");
        router.push("/login?redirect=/checkout");
      }
    };
    fetchUser();
  }, [router]);

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.city) newErrors.city = "City is required";
    if (!address.state) newErrors.state = "State is required";
    if (!address.pincode) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(address.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateAddress()) {
      setStep("payment");
    } else {
      toast.error("Please fill in all required address fields");
    }
  };

  // Handle place order - BACKEND LOGIC PRESERVED
  const handlePlaceOrder = async () => {
    if (!user?.contactId) {
      toast.error("Please login to place an order");
      return;
    }

    setIsProcessing(true);
    try {
      await fetch(`/api/contacts/${user.contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        }),
      });

      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        tax: 10,
      }));

      const res = await fetch("/api/sale-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.contactId,
          lines: orderItems,
          couponCode: couponCode || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/order-confirmation?order=${data.data.id}`);
      } else {
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FFFEF9] py-16">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#8B7355]" />
          <h2 className="text-2xl font-serif text-[#2B1810] mb-2">Your cart is empty</h2>
          <p className="text-[#8B7355] mb-6">Add some products to checkout.</p>
          <Link href="/products">
            <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Checkout Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            {/* Step 1: Cart */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-[#22C55E] border-2 border-[#2B1810] rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-[#2B1810] mt-2">Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-[#2B1810]" />
            
            {/* Step 2: Address */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 border-2 border-[#2B1810] rounded-full flex items-center justify-center ${
                step === "address" ? "bg-[#8B7355] text-white" : "bg-[#22C55E] text-white"
              }`}>
                {step === "payment" ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <span className="text-sm text-[#2B1810] mt-2 font-medium">Address</span>
            </div>
            <div className="w-16 h-0.5 bg-[#2B1810]" />
            
            {/* Step 3: Payment */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 border-2 border-[#2B1810] rounded-full flex items-center justify-center ${
                step === "payment" ? "bg-[#8B7355] text-white" : "bg-white text-[#2B1810]"
              }`}>
                3
              </div>
              <span className="text-sm text-[#2B1810] mt-2">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "address" ? (
              <div className="bg-white border-2 border-[#2B1810] p-8">
                <h2 className="text-2xl font-serif text-[#2B1810] mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2B1810] mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2B1810] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      required
                      className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810] ${
                        errors.city ? "border-[#EF4444]" : "border-[#2B1810]"
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && <p className="text-[#EF4444] text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2B1810] mb-2">
                      State *
                    </label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                      required
                      className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810] bg-white ${
                        errors.state ? "border-[#EF4444]" : "border-[#2B1810]"
                      }`}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="text-[#EF4444] text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2B1810] mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                      required
                      className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810] ${
                        errors.pincode ? "border-[#EF4444]" : "border-[#2B1810]"
                      }`}
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="text-[#EF4444] text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <Link href="/cart">
                    <Button variant="outline" className="border-2 border-[#2B1810]">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                  <Button
                    onClick={handleContinueToPayment}
                    className="flex-1 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-[#2B1810] p-8">
                <h2 className="text-2xl font-serif text-[#2B1810] mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {/* Card Payment */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-[#8B7355] bg-[#F5EBE0]"
                        : "border-[#2B1810] bg-white hover:bg-[#F5EBE0]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-[#8B7355] w-4 h-4"
                    />
                    <CreditCard className="w-6 h-6 text-[#8B7355]" />
                    <div>
                      <p className="font-medium text-[#2B1810]">Credit/Debit Card</p>
                      <p className="text-sm text-[#8B7355]">Pay securely with your card</p>
                    </div>
                  </label>

                  {/* UPI Payment */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === "upi"
                        ? "border-[#8B7355] bg-[#F5EBE0]"
                        : "border-[#2B1810] bg-white hover:bg-[#F5EBE0]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="accent-[#8B7355] w-4 h-4"
                    />
                    <Wallet className="w-6 h-6 text-[#8B7355]" />
                    <div>
                      <p className="font-medium text-[#2B1810]">UPI</p>
                      <p className="text-sm text-[#8B7355]">Pay using UPI apps</p>
                    </div>
                  </label>

                  {/* Net Banking */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === "netbanking"
                        ? "border-[#8B7355] bg-[#F5EBE0]"
                        : "border-[#2B1810] bg-white hover:bg-[#F5EBE0]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="netbanking"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="accent-[#8B7355] w-4 h-4"
                    />
                    <Building className="w-6 h-6 text-[#8B7355]" />
                    <div>
                      <p className="font-medium text-[#2B1810]">Net Banking</p>
                      <p className="text-sm text-[#8B7355]">Pay through your bank</p>
                    </div>
                  </label>

                  {/* COD */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === "cod"
                        ? "border-[#8B7355] bg-[#F5EBE0]"
                        : "border-[#2B1810] bg-white hover:bg-[#F5EBE0]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-[#8B7355] w-4 h-4"
                    />
                    <ShoppingBag className="w-6 h-6 text-[#8B7355]" />
                    <div>
                      <p className="font-medium text-[#2B1810]">Cash on Delivery</p>
                      <p className="text-sm text-[#8B7355]">Pay when you receive</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => setStep("address")}
                    variant="outline"
                    className="border-2 border-[#2B1810]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Place Order - ${formatCurrency(getTotal())}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white border-2 border-[#2B1810] p-6 sticky top-24">
              <h2 className="text-xl font-serif text-[#2B1810] mb-6">Order Summary</h2>

              {/* Items Preview */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#F5EBE0] border-2 border-[#2B1810] flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-[#8B7355]" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8B7355] text-white text-xs rounded-full flex items-center justify-center border border-[#2B1810]">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2B1810] truncate">{item.name}</p>
                    </div>
                    <p className="text-sm font-bold text-[#2B1810]">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-[#2B1810] my-4" />

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-[#8B7355]">
                  <span>Subtotal</span>
                  <span className="text-[#2B1810]">{formatCurrency(getSubtotal())}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-[#22C55E]">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#8B7355]">
                  <span>Taxes</span>
                  <span className="text-[#2B1810]">{formatCurrency(getTaxAmount())}</span>
                </div>
                <div className="flex justify-between text-sm text-[#8B7355]">
                  <span>Shipping</span>
                  <span className="text-[#22C55E]">Free</span>
                </div>
                <div className="border-t-2 border-[#2B1810] pt-3">
                  <div className="flex justify-between text-[#2B1810]">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
