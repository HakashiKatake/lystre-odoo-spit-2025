"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Search, ShoppingCart, Loader2, Package, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_TYPES, PRODUCT_CATEGORIES, PRODUCT_MATERIALS, PRODUCT_COLORS } from "@/lib/constants";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SIZES = ["S", "M", "L", "XL", "XXL"];

// Product interface matching backend API
interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  material?: string;
  colors?: string[];
  stock: number;
  salesPrice: number;
  salesTax: number;
  published: boolean;
  images?: string[];
}

export default function ProductsPage() {
  // Backend state - API data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Frontend state - filters & UI
  const [selectedType, setSelectedType] = useState("All products");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(50000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Cart store - Backend logic
  const addToCart = useCartStore((state) => state.addItem);

  // Fetch products from API - BACKEND LOGIC PRESERVED
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?published=true");
        const data = await res.json();

        if (data.success) {
          setProducts(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products - BACKEND LOGIC PRESERVED
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Type filter
    if (selectedType !== "All products") {
      const typeMatch = PRODUCT_TYPES.find(t => t.label === selectedType || t.value === selectedType);
      if (typeMatch && product.type.toLowerCase() !== typeMatch.value.toLowerCase()) {
        return false;
      }
    }
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    // Material filter
    if (selectedMaterials.length > 0 && product.material && !selectedMaterials.includes(product.material)) {
      return false;
    }
    // Price filter
    if (product.salesPrice > priceRange) {
      return false;
    }
    return true;
  });

  // Add to cart handler - BACKEND LOGIC PRESERVED
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salesPrice,
      quantity: 1,
      tax: product.salesTax,
    });
    toast.success(`${product.name} added to cart!`);
  };

  // Toggle category selection
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Toggle material selection
  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedType("All products");
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSearchQuery("");
    setPriceRange(50000);
  };

  const hasActiveFilters = selectedType !== "All products" || selectedCategories.length > 0 || selectedMaterials.length > 0 || searchQuery || priceRange < 50000;

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <div className="max-w-[1920px] mx-auto flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-64 bg-white border-r-2 border-[#2B1810] p-6 hidden md:block min-h-screen sticky top-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-[#2B1810]">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#8B7355] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Category */}
            <div className="border-2 border-[#2B1810]">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center justify-between w-full p-3 bg-[#F5EBE0] text-[#2B1810] font-medium"
              >
                Category
                <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </button>
              {categoryOpen && (
                <div className="p-3 space-y-2 bg-white">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <label key={cat.value} className="flex items-center text-sm text-[#2B1810] cursor-pointer hover:text-[#8B7355]">
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4 rounded border-2 border-[#2B1810] accent-[#8B7355]"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Size */}
            <div className="border-2 border-[#2B1810]">
              <button
                onClick={() => setSizeOpen(!sizeOpen)}
                className="flex items-center justify-between w-full p-3 bg-[#F5EBE0] text-[#2B1810] font-medium"
              >
                Size
                <ChevronDown className={`w-4 h-4 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
              </button>
              {sizeOpen && (
                <div className="p-3 space-y-2 bg-white">
                  {SIZES.map((size) => (
                    <label key={size} className="flex items-center text-sm text-[#2B1810] cursor-pointer hover:text-[#8B7355]">
                      <input type="checkbox" className="mr-3 w-4 h-4 rounded border-2 border-[#2B1810] accent-[#8B7355]" />
                      {size}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Material */}
            <div className="border-2 border-[#2B1810]">
              <button
                onClick={() => setMaterialOpen(!materialOpen)}
                className="flex items-center justify-between w-full p-3 bg-[#F5EBE0] text-[#2B1810] font-medium"
              >
                Material
                <ChevronDown className={`w-4 h-4 transition-transform ${materialOpen ? "rotate-180" : ""}`} />
              </button>
              {materialOpen && (
                <div className="p-3 space-y-2 bg-white">
                  {PRODUCT_MATERIALS.map((mat) => (
                    <label key={mat.value} className="flex items-center text-sm text-[#2B1810] cursor-pointer hover:text-[#8B7355]">
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4 rounded border-2 border-[#2B1810] accent-[#8B7355]"
                        checked={selectedMaterials.includes(mat.value)}
                        onChange={() => toggleMaterial(mat.value)}
                      />
                      {mat.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Color */}
            <div className="border-2 border-[#2B1810]">
              <button
                onClick={() => setColorOpen(!colorOpen)}
                className="flex items-center justify-between w-full p-3 bg-[#F5EBE0] text-[#2B1810] font-medium"
              >
                Color
                <ChevronDown className={`w-4 h-4 transition-transform ${colorOpen ? "rotate-180" : ""}`} />
              </button>
              {colorOpen && (
                <div className="p-3 space-y-2 bg-white">
                  {PRODUCT_COLORS.slice(0, 6).map((color) => (
                    <label key={color.value} className="flex items-center text-sm text-[#2B1810] cursor-pointer hover:text-[#8B7355]">
                      <input type="checkbox" className="mr-3 w-4 h-4 rounded border-2 border-[#2B1810] accent-[#8B7355]" />
                      <span
                        className="w-4 h-4 rounded-full border border-[#2B1810] mr-2"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="border-2 border-[#2B1810]">
              <div className="p-3 bg-[#F5EBE0] text-[#2B1810] font-medium">
                Price Range
              </div>
              <div className="p-4 bg-white">
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#8B7355]"
                />
                <div className="mt-3 flex justify-between text-sm text-[#2B1810]">
                  <span>₹0</span>
                  <span className="font-bold">₹{priceRange.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-[#2B1810] placeholder-[#8B7355]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#F5EBE0] rounded"
                  >
                    <X className="w-4 h-4 text-[#8B7355]" />
                  </button>
                )}
              </div>
              <div className="px-4 py-3 bg-[#F5EBE0] border-2 border-[#2B1810] text-[#2B1810]">
                <span className="font-bold">{filteredProducts.length}</span> products
              </div>
            </div>
          </div>

          {/* Product Type Tabs */}
          <div className="flex flex-wrap gap-0 mb-8 border-2 border-[#2B1810] inline-flex">
            <button
              onClick={() => setSelectedType("All products")}
              className={`px-4 py-2 text-sm font-medium border-r-2 border-[#2B1810] transition-colors ${
                selectedType === "All products"
                  ? "bg-[#8B7355] text-white"
                  : "bg-white text-[#2B1810] hover:bg-[#F5EBE0]"
              }`}
            >
              All Products
            </button>
            {PRODUCT_TYPES.map((type, index) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  index < PRODUCT_TYPES.length - 1 ? "border-r-2 border-[#2B1810]" : ""
                } ${
                  selectedType === type.value
                    ? "bg-[#8B7355] text-white"
                    : "bg-white text-[#2B1810] hover:bg-[#F5EBE0]"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-2 border-[#2B1810] group hover:shadow-[4px_4px_0px_#2B1810] transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden border-b-2 border-[#2B1810]">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F5EBE0] flex items-center justify-center">
                        <Package size={48} className="text-[#8B7355]" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-3 right-3 bg-[#EF4444] text-white text-xs px-3 py-1 border-2 border-[#2B1810]">
                        Out of Stock
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-3 right-3 bg-[#F59E0B] text-white text-xs px-3 py-1 border-2 border-[#2B1810]">
                        Only {product.stock} left
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">{product.category}</p>
                    <h3 className="text-lg font-serif text-[#2B1810] mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-xl font-bold text-[#8B7355] mb-4">
                      {formatCurrency(product.salesPrice)}
                    </p>
                    
                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-2 border-[#2B1810]">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className="border-2 border-[#2B1810] px-3 disabled:opacity-50"
                      >
                        <ShoppingCart size={18} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border-2 border-[#2B1810]">
              <Package size={64} className="mx-auto text-[#8B7355] mb-4" />
              <h3 className="text-2xl font-serif text-[#2B1810] mb-2">
                {products.length === 0
                  ? "No products available yet"
                  : "No products found"}
              </h3>
              <p className="text-[#8B7355] mb-6">
                {products.length === 0
                  ? "Check back soon for new arrivals!"
                  : "Try adjusting your filters or search query."}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
