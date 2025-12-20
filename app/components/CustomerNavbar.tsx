"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/retroui/Button";

export function CustomerNavbar() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);

  return (
    <nav className="bg-white border-b border-[#E5D4C1] sticky top-0 z-40">
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
                className={pathname === "/" ? "bg-[#E5D4C1] text-[#8B7355]" : ""}
              >
                Home
              </Button>
            </Link>
            <Link href="/products">
              <Button 
                variant="outline"
                className={pathname.startsWith("/products") ? "bg-[#E5D4C1] text-[#8B7355]" : ""}
              >
                Shop
              </Button>
            </Link>
            <Link href="/orders">
              <Button 
                variant="outline"
                className={pathname.startsWith("/orders") ? "bg-[#E5D4C1] text-[#8B7355]" : ""}
              >
                My Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Cart + User */}
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="p-2 hover:bg-[#F5EBE0] rounded-full transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#8B7355] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {items.length}
              </span>
            )}
          </Link>
          <Link 
            href="/login" 
            className="flex items-center space-x-2 px-3 py-2 bg-[#F5EBE0] rounded-full hover:bg-[#E5D4C1] transition-colors"
          >
            <User className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700 font-medium">Account</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
