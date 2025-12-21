"use client";

import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones, Sparkles } from 'lucide-react'
import { RecentlyViewed } from '@/app/components/RecentlyViewed'
import { Button } from '@/components/retroui/Button'

export default function HomePage() {
  return (
    <div className="bg-[#FFFEF9]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#8B7355] to-[#6B5344] text-white py-20 border-b-2 border-[#2B1810]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Discover Your Perfect Style
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Shop the latest trends in men&apos;s, women&apos;s, and children&apos;s clothing. 
              Quality fabrics, affordable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button className="bg-white text-[#8B7355] border-2 border-[#2B1810] hover:bg-[#F5EBE0] px-6 py-3 flex items-center gap-2">
                  Shop Now
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/find-your-fit">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-6 py-3 flex items-center gap-2">
                  <Sparkles size={18} />
                  Find Your Fit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-[#F5EBE0] border-b-2 border-[#2B1810]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full border-2 border-[#2B1810] flex items-center justify-center">
                <Truck className="text-[#8B7355]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#2B1810]">Free Shipping</h3>
                <p className="text-sm text-[#8B7355]">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full border-2 border-[#2B1810] flex items-center justify-center">
                <Shield className="text-[#22C55E]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#2B1810]">Secure Payment</h3>
                <p className="text-sm text-[#8B7355]">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full border-2 border-[#2B1810] flex items-center justify-center">
                <ShoppingBag className="text-[#8B7355]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#2B1810]">Easy Returns</h3>
                <p className="text-sm text-[#8B7355]">7 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full border-2 border-[#2B1810] flex items-center justify-center">
                <Headphones className="text-[#3B82F6]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#2B1810]">24/7 Support</h3>
                <p className="text-sm text-[#8B7355]">Dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-serif font-bold text-[#2B1810] text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products?category=men" className="group">
              <div className="aspect-[4/5] bg-gradient-to-br from-blue-200 to-blue-300 border-2 border-[#2B1810] overflow-hidden relative hover:shadow-[4px_4px_0px_#2B1810] transition-shadow">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-serif font-bold">Men</h3>
                    <p className="opacity-80">Explore collection →</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/products?category=women" className="group">
              <div className="aspect-[4/5] bg-gradient-to-br from-pink-200 to-pink-300 border-2 border-[#2B1810] overflow-hidden relative hover:shadow-[4px_4px_0px_#2B1810] transition-shadow">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-serif font-bold">Women</h3>
                    <p className="opacity-80">Explore collection →</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/products?category=children" className="group">
              <div className="aspect-[4/5] bg-gradient-to-br from-green-200 to-green-300 border-2 border-[#2B1810] overflow-hidden relative hover:shadow-[4px_4px_0px_#2B1810] transition-shadow">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-serif font-bold">Children</h3>
                    <p className="opacity-80">Explore collection →</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed - Continue Shopping */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <RecentlyViewed maxItems={4} showClearButton={true} />
        </div>
      </section>

      {/* Find Your Fit CTA */}
      <section className="py-16 bg-[#F5EBE0] border-y-2 border-[#2B1810]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border-2 border-[#2B1810] p-8 md:p-12 text-center shadow-[4px_4px_0px_#2B1810]">
            <Sparkles size={48} className="mx-auto text-[#8B7355] mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2B1810] mb-2">
              Not Sure What to Buy?
            </h2>
            <p className="text-[#8B7355] mb-6 max-w-md mx-auto">
              Let our AI-powered style assistant help you find the perfect outfit based on your preferences!
            </p>
            <Link href="/find-your-fit">
              <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8">
                Find Your Perfect Fit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#8B7355] border-2 border-[#2B1810] p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Stay Updated</h2>
            <p className="opacity-80 mb-6">Subscribe to get exclusive offers and new arrival updates!</p>
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border-2 border-[#2B1810] text-[#2B1810] focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-[#8B7355] border-2 border-[#2B1810] hover:bg-[#F5EBE0]">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
