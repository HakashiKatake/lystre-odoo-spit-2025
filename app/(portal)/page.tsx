import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--primary)] to-[#9a6b8a] text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Your Perfect Style
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Shop the latest trends in men&apos;s, women&apos;s, and children&apos;s clothing. 
              Quality fabrics, affordable prices.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="btn bg-white text-[var(--primary)] hover:bg-gray-100 px-6 py-3">
                Shop Now
                <ArrowRight size={18} />
              </Link>
              <Link href="/products?category=new" className="btn btn-outline border-white text-white hover:bg-white/10 px-6 py-3">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)] bg-opacity-10 rounded-lg flex items-center justify-center">
                <Truck className="text-[var(--primary)]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-[var(--muted-foreground)]">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)] bg-opacity-10 rounded-lg flex items-center justify-center">
                <Shield className="text-[var(--primary)]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-[var(--muted-foreground)]">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)] bg-opacity-10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-[var(--primary)]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Easy Returns</h3>
                <p className="text-sm text-[var(--muted-foreground)]">7 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)] bg-opacity-10 rounded-lg flex items-center justify-center">
                <Headphones className="text-[var(--primary)]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid-3">
            <Link href="/products?category=men" className="group">
              <div className="aspect-[4/5] bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Men</h3>
                    <p className="opacity-80">Explore collection →</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/products?category=women" className="group">
              <div className="aspect-[4/5] bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Women</h3>
                    <p className="opacity-80">Explore collection →</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/products?category=children" className="group">
              <div className="aspect-[4/5] bg-gradient-to-br from-green-100 to-green-200 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Children</h3>
                    <p className="opacity-80">Explore collection →</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-[var(--primary)] hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid-4">
            {[
              { name: 'Blue Cotton Shirt', price: 1200, category: 'Men' },
              { name: 'Floral Summer Dress', price: 1800, category: 'Women' },
              { name: 'Kids Denim Jacket', price: 999, category: 'Children' },
              { name: 'Classic White Shirt', price: 1499, category: 'Men' },
            ].map((product, i) => (
              <Link key={i} href={`/products/${i + 1}`} className="product-card group">
                <div className="product-card-image">
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]">
                    <ShoppingBag size={48} />
                  </div>
                </div>
                <div className="product-card-body">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">{product.category}</p>
                  <h3 className="font-medium group-hover:text-[var(--primary)] transition-colors">{product.name}</h3>
                  <p className="font-bold mt-2">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[var(--primary)] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Stay Updated</h2>
            <p className="opacity-80 mb-6">Subscribe to get exclusive offers and new arrival updates!</p>
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg text-black"
              />
              <button className="btn bg-white text-[var(--primary)] hover:bg-gray-100">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
