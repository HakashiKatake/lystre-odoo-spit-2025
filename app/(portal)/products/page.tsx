"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Search, ShoppingCart, Loader2, Package } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_TYPES, PRODUCT_CATEGORIES, PRODUCT_MATERIALS, PRODUCT_COLORS } from "@/lib/constants";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { toast } from "sonner";

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
  const [categoryOpen, setCategoryOpen] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <div className="max-w-[1920px] mx-auto flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-48 bg-white border-r border-[#E5D4C1] p-6 space-y-6 hidden md:block min-h-screen sticky top-16">
          {/* Category */}
          <div>
            <Button
              onClick={() => setCategoryOpen(!categoryOpen)}
              variant="outline"
              className="flex items-center justify-between w-full text-[#8B7355] font-medium mb-2"
            >
              Category
              <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </Button>
            {categoryOpen && (
              <div className="space-y-2 pl-2">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-[#E5D4C1] accent-[#8B7355]"
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
          <div>
            <Button
              onClick={() => setSizeOpen(!sizeOpen)}
              variant="outline"
              className="flex items-center justify-between w-full text-[#8B7355] font-medium mb-2"
            >
              Size
              <ChevronDown className={`w-4 h-4 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
            </Button>
            {sizeOpen && (
              <div className="space-y-2 pl-2">
                {SIZES.map((size) => (
                  <label key={size} className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="mr-2 rounded border-[#E5D4C1] accent-[#8B7355]" />
                    {size}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Material */}
          <div>
            <Button
              onClick={() => setMaterialOpen(!materialOpen)}
              variant="outline"
              className="flex items-center justify-between w-full text-[#8B7355] font-medium mb-2"
            >
              Material
              <ChevronDown className={`w-4 h-4 transition-transform ${materialOpen ? "rotate-180" : ""}`} />
            </Button>
            {materialOpen && (
              <div className="space-y-2 pl-2">
                {PRODUCT_MATERIALS.map((mat) => (
                  <label key={mat.value} className="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-[#E5D4C1] accent-[#8B7355]"
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
          <div>
            <Button
              onClick={() => setColorOpen(!colorOpen)}
              variant="outline"
              className="flex items-center justify-between w-full text-[#8B7355] font-medium mb-2"
            >
              Color
              <ChevronDown className={`w-4 h-4 transition-transform ${colorOpen ? "rotate-180" : ""}`} />
            </Button>
            {colorOpen && (
              <div className="space-y-2 pl-2">
                {PRODUCT_COLORS.slice(0, 5).map((color) => (
                  <label key={color.value} className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="mr-2 rounded border-[#E5D4C1] accent-[#8B7355]" />
                    {color.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-[#8B7355] font-medium mb-2">Price Range</h3>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#8B7355]"
            />
            <div className="mt-2 text-sm text-gray-600 font-medium">
              ₹0 - ₹{priceRange.toLocaleString("en-IN")}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Product Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#E5D4C1]">
            <Button
              onClick={() => setSelectedType("All products")}
              variant="outline"
              className={`text-sm font-medium ${selectedType === "All products" ? "bg-[#E5D4C1] text-[#8B7355]" : ""}`}
            >
              All products
            </Button>
            {PRODUCT_TYPES.map((type) => (
              <Button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                variant="outline"
                className={`text-sm font-medium ${selectedType === type.value ? "bg-[#E5D4C1] text-[#8B7355]" : ""}`}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Search Bar + Sort */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5D4C1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
              />
            </div>
            <div className="ml-4 text-sm text-gray-600">
              <span className="font-medium">{filteredProducts.length}</span> products found
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="w-full shadow-none hover:shadow-none group">
                  <Card.Content className="pb-0 relative aspect-[3/4] overflow-hidden">
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
                        <Package size={48} className="text-[#E5D4C1]" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                  </Card.Content>
                  <Card.Header className="pb-0 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
                    <Card.Title className="text-lg font-serif">{product.name}</Card.Title>
                  </Card.Header>
                  <Card.Content className="flex justify-between items-center pt-2">
                    <p className="text-lg font-semibold text-[#8B7355]">
                      {formatCurrency(product.salesPrice)}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <ShoppingCart size={16} />
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package size={64} className="mx-auto text-[#E5D4C1] mb-4" />
              <p className="text-xl font-serif text-gray-500">
                {products.length === 0
                  ? "No products available yet. Check back soon!"
                  : "No products found matching your filters."}
              </p>
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedType("All products");
                    setSelectedCategories([]);
                    setSelectedMaterials([]);
                    setSearchQuery("");
                    setPriceRange(50000);
                  }}
                  className="mt-4 text-[#8B7355] underline hover:opacity-70"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
