"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShoppingCart,
  Loader2,
  Package,
  Check,
  ChevronRight,
  X,
  Wand2,
  // Category Icons
  Shirt,
  User,
  Baby,
  // Occasion Icons
  Sun,
  PartyPopper,
  Heart,
  Briefcase,
  Flame,
  HeartHandshake,
  Mountain,
  Dumbbell,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "men", label: "Men", icon: Shirt },
  { value: "women", label: "Women", icon: User },
  { value: "children", label: "Children", icon: Baby },
  { value: "traditional", label: "Traditional", icon: Sparkles },
];

const OCCASIONS = [
  {
    value: "casual",
    label: "Casual Day",
    icon: Sun,
    description: "Everyday comfort",
  },
  {
    value: "party",
    label: "Party",
    icon: PartyPopper,
    description: "Night out vibes",
  },
  {
    value: "wedding",
    label: "Wedding",
    icon: Heart,
    description: "Celebrate in style",
  },
  {
    value: "formal",
    label: "Formal/Office",
    icon: Briefcase,
    description: "Professional look",
  },
  {
    value: "festive",
    label: "Festive/Diwali",
    icon: Flame,
    description: "Traditional charm",
  },
  {
    value: "date",
    label: "Date Night",
    icon: HeartHandshake,
    description: "Impress someone special",
  },
  {
    value: "outdoor",
    label: "Outdoor/Travel",
    icon: Mountain,
    description: "Adventure ready",
  },
  {
    value: "gym",
    label: "Gym/Sports",
    icon: Dumbbell,
    description: "Active lifestyle",
  },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// Product interface
interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  material?: string;
  colors?: string[];
  sizes?: string[];
  stock: number;
  salesPrice: number;
  salesTax: number;
  published: boolean;
  images?: string[];
}

export default function FindYourFitPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const addToCart = useCartStore((state) => state.addItem);

  // Fetch products on mount
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
      }
    };
    fetchProducts();
  }, []);

  // Generate recommendations based on selections
  const generateRecommendations = () => {
    setLoading(true);
    setShowResults(false);

    setTimeout(() => {
      let filtered = [...products];

      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(
          (p) => p.category?.toLowerCase() === selectedCategory,
        );
      }

      // Filter by size if available
      if (selectedSize) {
        filtered = filtered.filter(
          (p) =>
            !p.sizes || p.sizes.length === 0 || p.sizes.includes(selectedSize),
        );
      }

      // Filter by occasion (match product types to occasions)
      if (selectedOccasion) {
        const occasionTypeMap: Record<string, string[]> = {
          casual: ["tshirt", "jeans", "hoodies", "shirt"],
          party: ["shirt", "kurta", "sarees", "formals"],
          wedding: ["kurta", "sarees", "formals", "lehenga", "traditional"],
          formal: ["formals", "shirt", "pant"],
          festive: ["kurta", "sarees", "lehenga", "traditional"],
          date: ["shirt", "kurta", "formals"],
          outdoor: ["tshirt", "jeans", "hoodies"],
          gym: ["tshirt", "shorts", "hoodies"],
        };
        const matchingTypes = occasionTypeMap[selectedOccasion] || [];
        if (matchingTypes.length > 0) {
          filtered = filtered.filter((p) =>
            matchingTypes.some((t) => p.type?.toLowerCase().includes(t)),
          );
        }
      }

      // Only show in-stock items
      filtered = filtered.filter((p) => p.stock > 0);

      // Sort by relevance (random shuffle for variety)
      filtered.sort(() => Math.random() - 0.5);

      setRecommendations(filtered.slice(0, 8));
      setLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Sorry, this product is currently out of stock.");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salesPrice,
      quantity: 1,
      image: product.images?.[0] || undefined,
      tax: product.salesTax,
    });
    toast.success(`Great choice! ${product.name} has been added to your cart.`);
  };

  const resetAll = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedOccasion(null);
    setSelectedSize(null);
    setRecommendations([]);
    setShowResults(false);
  };

  const canProceed = () => {
    if (step === 1) return !!selectedCategory;
    if (step === 2) return !!selectedOccasion;
    if (step === 3) return !!selectedSize;
    return false;
  };

  return (
    <div className="bg-[#FFFEF9] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5EBE0] border-2 border-[#2B1810] mb-4">
            <Wand2 className="text-[#8B7355]" size={20} />
            <span className="text-sm font-bold text-[#2B1810] uppercase tracking-wider">
              AI Style Assistant
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2B1810] mb-4">
            Find Your <span className="text-[#8B7355]">Perfect Fit</span>
          </h1>
          <p className="text-lg text-[#8B7355] max-w-2xl mx-auto">
            Tell us about yourself and the occasion, and we&apos;ll recommend
            the best outfits for you
          </p>
        </div>

        {/* Progress Steps */}
        {!showResults && (
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2B1810] font-bold transition-colors ${
                    step >= s
                      ? "bg-[#8B7355] text-white"
                      : "bg-white text-[#2B1810]"
                  }`}
                >
                  {step > s ? <Check size={18} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${step > s ? "bg-[#8B7355]" : "bg-[#E5D4C1]"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {!showResults && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Category Selection */}
              {step === 1 && (
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-[#2B1810] mb-8">
                    Who are you shopping for?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                    {CATEGORIES.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`p-8 bg-white border-2 border-[#2B1810] transition-all hover:shadow-[4px_4px_0px_#2B1810] ${
                            selectedCategory === cat.value
                              ? "shadow-[4px_4px_0px_#2B1810] bg-[#F5EBE0]"
                              : ""
                          }`}
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B7355] flex items-center justify-center">
                            <IconComponent size={32} className="text-white" />
                          </div>
                          <span className="text-xl font-serif text-[#2B1810]">
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Occasion Selection */}
              {step === 2 && (
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-[#2B1810] mb-8">
                    What&apos;s the occasion?
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
                    {OCCASIONS.map((occ) => {
                      const IconComponent = occ.icon;
                      return (
                        <button
                          key={occ.value}
                          onClick={() => setSelectedOccasion(occ.value)}
                          className={`p-6 bg-white border-2 border-[#2B1810] transition-all hover:shadow-[4px_4px_0px_#2B1810] text-left ${
                            selectedOccasion === occ.value
                              ? "shadow-[4px_4px_0px_#2B1810] bg-[#F5EBE0]"
                              : ""
                          }`}
                        >
                          <div className="w-12 h-12 mb-3 rounded-full bg-[#8B7355] flex items-center justify-center">
                            <IconComponent size={24} className="text-white" />
                          </div>
                          <span className="text-lg font-serif text-[#2B1810] block">
                            {occ.label}
                          </span>
                          <span className="text-sm text-[#8B7355]">
                            {occ.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Size Selection */}
              {step === 3 && (
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-[#2B1810] mb-8">
                    What&apos;s your size?
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mb-12">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-16 h-16 bg-white border-2 border-[#2B1810] transition-all hover:shadow-[4px_4px_0px_#2B1810] font-bold text-lg flex items-center justify-center ${
                          selectedSize === size
                            ? "shadow-[4px_4px_0px_#2B1810] bg-[#8B7355] text-white border-[#2B1810]"
                            : "text-[#2B1810]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4">
                {step > 1 && (
                  <Button
                    onClick={() => setStep(step - 1)}
                    variant="outline"
                    className="border-2 border-[#2B1810] px-8"
                  >
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className={`px-8 border-2 border-[#2B1810] ${
                      canProceed()
                        ? "bg-[#8B7355] text-white hover:bg-[#6B5344]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next <ChevronRight size={18} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={generateRecommendations}
                    disabled={!canProceed() || loading}
                    className="px-8 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Finding your style...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        Find My Perfect Fit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Selection Summary */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="px-4 py-2 bg-white border-2 border-[#2B1810] flex items-center gap-2">
                  {(() => {
                    const cat = CATEGORIES.find(
                      (c) => c.value === selectedCategory,
                    );
                    const IconComponent = cat?.icon;
                    return IconComponent ? (
                      <IconComponent size={20} className="text-[#8B7355]" />
                    ) : null;
                  })()}
                  <span className="font-bold text-[#2B1810] capitalize">
                    {selectedCategory}
                  </span>
                </div>
                <div className="px-4 py-2 bg-white border-2 border-[#2B1810] flex items-center gap-2">
                  {(() => {
                    const occ = OCCASIONS.find(
                      (o) => o.value === selectedOccasion,
                    );
                    const IconComponent = occ?.icon;
                    return IconComponent ? (
                      <IconComponent size={20} className="text-[#8B7355]" />
                    ) : null;
                  })()}
                  <span className="font-bold text-[#2B1810]">
                    {OCCASIONS.find((o) => o.value === selectedOccasion)?.label}
                  </span>
                </div>
                <div className="px-4 py-2 bg-[#8B7355] text-white border-2 border-[#2B1810] font-bold">
                  Size: {selectedSize}
                </div>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 border-2 border-[#2B1810] hover:bg-[#F5EBE0] flex items-center gap-2"
                >
                  <X size={16} />
                  Start Over
                </button>
              </div>

              <h2 className="text-3xl font-serif text-[#2B1810] text-center mb-8">
                Your Perfect{" "}
                <span className="text-[#8B7355]">Recommendations</span>
              </h2>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
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
                        <div className="absolute top-3 right-3 px-2 py-1 bg-[#8B7355] text-white text-xs font-bold border-2 border-[#2B1810]">
                          Recommended
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-lg font-serif text-[#2B1810] mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xl font-bold text-[#8B7355] mb-4">
                          {formatCurrency(product.salesPrice)}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full border-2 border-[#2B1810]"
                            >
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
                <div className="text-center py-16 bg-white border-2 border-[#2B1810]">
                  <Package size={64} className="mx-auto text-[#8B7355] mb-4" />
                  <h3 className="text-2xl font-serif text-[#2B1810] mb-2">
                    No matches found
                  </h3>
                  <p className="text-[#8B7355] mb-6">
                    We couldn&apos;t find products matching your criteria. Try
                    different options!
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={resetAll}
                      className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Browse All CTA */}
              <div className="text-center mt-12">
                <p className="text-[#8B7355] mb-4">
                  Want to explore more options?
                </p>
                <Link href="/products">
                  <Button className="bg-[#2B1810] text-white border-2 border-[#2B1810] hover:bg-[#4A3128] px-8">
                    Browse All Products
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
