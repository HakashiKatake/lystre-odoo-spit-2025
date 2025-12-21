"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Sparkles, Package, Heart } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { Button } from "@/components/retroui/Button";

interface UserProfile {
  name: string;
  email: string;
}

export function CustomerNavbar() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.data) {
          setUser({
            name: data.data.name || data.data.email.split("@")[0],
            email: data.data.email,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="bg-white border-b-2 border-[#2B1810] sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-serif font-bold text-[#8B7355] tracking-wider">
            Lystré
          </Link>
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <Link href="/">
              <Button
                variant="outline"
                className={`border-2 border-[#2B1810] ${pathname === "/" ? "bg-[#F5EBE0]" : ""}`}
              >
                Home
              </Button>
            </Link>
            <Link href="/products">
              <Button
                variant="outline"
                className={`border-2 border-[#2B1810] ${pathname.startsWith("/products") ? "bg-[#F5EBE0]" : ""}`}
              >
                Shop
              </Button>
            </Link>
            <Link href="/find-your-fit">
              <Button
                variant="outline"
                className={`border-2 border-[#2B1810] flex items-center gap-1 ${pathname.startsWith("/find-your-fit") ? "bg-[#F5EBE0]" : ""}`}
              >
                <Sparkles size={14} />
                Find Your Fit
              </Button>
            </Link>
            <Link href="/orders">
              <Button
                variant="outline"
                className={`border-2 border-[#2B1810] flex items-center gap-1 ${pathname.startsWith("/orders") ? "bg-[#F5EBE0]" : ""}`}
              >
                <Package size={14} />
                My Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Wishlist + Cart + User */}
        <div className="flex items-center space-x-4">
          {/* Wishlist */}
          <Link href="/wishlist">
            <button className="p-2 hover:bg-[#F5EBE0] transition-colors relative border-2 border-[#2B1810]">
              <Heart className={`w-5 h-5 ${pathname.startsWith("/wishlist") ? "text-red-500 fill-red-500" : "text-[#2B1810]"}`} />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2B1810]">
                  {wishlistItems.length}
                </span>
              )}
            </button>
          </Link>

          {/* Cart */}
          <Link href="/cart">
            <button className="p-2 hover:bg-[#F5EBE0] transition-colors relative border-2 border-[#2B1810]">
              <ShoppingCart className="w-5 h-5 text-[#2B1810]" />
              {mounted && cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B7355] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#2B1810]">
                  {cartItems.length}
                </span>
              )}
            </button>
          </Link>

          {/* User */}
          {user ? (
            <Link href="/account">
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#F5EBE0] border-2 border-[#2B1810] hover:bg-[#E5D4C1] transition-colors cursor-pointer">
                <User className="w-4 h-4 text-[#2B1810]" />
                <span className="text-sm text-[#2B1810] font-medium">{user.name}</span>
              </div>
            </Link>
          ) : (
            <Link href="/login">
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#F5EBE0] border-2 border-[#2B1810] hover:bg-[#E5D4C1] transition-colors cursor-pointer">
                <User className="w-4 h-4 text-[#2B1810]" />
                <span className="text-sm text-[#2B1810] font-medium">Account</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
