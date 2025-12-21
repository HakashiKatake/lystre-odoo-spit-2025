"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Package, ShoppingCart, Heart, X } from "lucide-react";
import { useRecentlyViewedStore, useCartStore, useWishlistStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface RecentlyViewedProps {
    currentProductId?: string; // Exclude current product from display
    maxItems?: number;
    showClearButton?: boolean;
}

export function RecentlyViewed({ currentProductId, maxItems = 4, showClearButton = true }: RecentlyViewedProps) {
    const { items, clearHistory } = useRecentlyViewedStore();
    const addToCart = useCartStore((state) => state.addItem);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Filter out current product and limit items
    const displayItems = items
        .filter((item) => item.productId !== currentProductId)
        .slice(0, maxItems);

    if (displayItems.length === 0) return null;

    const handleAddToCart = (item: typeof displayItems[0]) => {
        addToCart({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
            tax: 0,
        });
        toast.success(`${item.name} added to your cart!`);
    };

    const toggleWishlist = (item: typeof displayItems[0]) => {
        if (isInWishlist(item.productId)) {
            removeFromWishlist(item.productId);
            toast.success(`${item.name} removed from wishlist`);
        } else {
            addToWishlist({
                productId: item.productId,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
                addedAt: new Date(),
            });
            toast.success(`${item.name} added to wishlist!`);
        }
    };

    return (
        <div className="bg-white border-2 border-[#2B1810] p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-[#2B1810] flex items-center gap-2">
                    <Clock size={20} className="text-[#8B7355]" />
                    Recently Viewed
                </h2>
                {showClearButton && (
                    <button
                        onClick={() => {
                            clearHistory();
                            toast.success("Browsing history cleared");
                        }}
                        className="text-sm text-[#8B7355] hover:underline flex items-center gap-1"
                    >
                        <X size={14} />
                        Clear History
                    </button>
                )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayItems.map((item, index) => (
                    <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border-2 border-[#2B1810] group hover:shadow-[4px_4px_0px_#2B1810] transition-shadow"
                    >
                        {/* Product Image */}
                        <Link href={`/products/${item.productId}`}>
                            <div className="relative aspect-square overflow-hidden border-b-2 border-[#2B1810]">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#F5EBE0] flex items-center justify-center">
                                        <Package size={32} className="text-[#8B7355]" />
                                    </div>
                                )}
                            </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-3">
                            <Link href={`/products/${item.productId}`}>
                                <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">{item.category}</p>
                                <h3 className="text-sm font-serif text-[#2B1810] mb-1 line-clamp-1 hover:underline">{item.name}</h3>
                            </Link>
                            <p className="text-base font-bold text-[#8B7355] mb-3">
                                {formatCurrency(item.price)}
                            </p>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] text-xs font-bold"
                                >
                                    <ShoppingCart size={14} />
                                    Add
                                </button>
                                <button
                                    onClick={() => toggleWishlist(item)}
                                    className={`p-1.5 border-2 border-[#2B1810] hover:bg-[#F5EBE0] ${
                                        isInWishlist(item.productId) ? "bg-red-50" : ""
                                    }`}
                                >
                                    <Heart
                                        size={14}
                                        className={isInWishlist(item.productId) ? "text-red-500 fill-red-500" : "text-[#2B1810]"}
                                    />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* View All Link */}
            {items.length > maxItems && (
                <div className="text-center mt-6">
                    <Link href="/products" className="text-[#8B7355] hover:underline text-sm font-medium">
                        Continue Shopping →
                    </Link>
                </div>
            )}
        </div>
    );
}
