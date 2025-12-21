"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Package, Share2, Copy, Check, X } from "lucide-react";
import { useWishlistStore, useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore();
    const addToCart = useCartStore((state) => state.addItem);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleAddToCart = (item: typeof items[0]) => {
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

    const handleRemove = (productId: string, name: string) => {
        removeItem(productId);
        toast.success(`${name} removed from wishlist`);
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const copyToClipboard = () => {
        const wishlistText = items.map(item => `${item.name} - ${formatCurrency(item.price)}`).join('\n');
        const shareText = `Check out my Lystré wishlist:\n\n${wishlistText}\n\nShop at Lystré for the best fashion!`;
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Wishlist copied to clipboard!");
    };

    return (
        <div className="bg-[#FFFEF9] min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif text-[#2B1810] flex items-center gap-3">
                            <Heart className="text-[#8B7355] fill-[#8B7355]" size={32} />
                            My Wishlist
                        </h1>
                        <p className="text-[#8B7355] mt-2">{items.length} items saved</p>
                    </div>
                    {items.length > 0 && (
                        <div className="flex gap-3">
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className="border-2 border-[#2B1810] flex items-center gap-2"
                            >
                                <Share2 size={16} />
                                Share
                            </Button>
                            <Button
                                onClick={() => {
                                    clearWishlist();
                                    toast.success("Wishlist cleared");
                                }}
                                variant="outline"
                                className="border-2 border-[#2B1810] text-red-600 hover:bg-red-50"
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>

                {/* Wishlist Items */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.productId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white border-2 border-[#2B1810] group hover:shadow-[4px_4px_0px_#2B1810] transition-shadow"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-[3/4] overflow-hidden border-b-2 border-[#2B1810]">
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
                                                <Package size={48} className="text-[#8B7355]" />
                                            </div>
                                        )}
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemove(item.productId, item.name)}
                                            className="absolute top-3 right-3 p-2 bg-white border-2 border-[#2B1810] hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={16} className="text-red-600" />
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">{item.category}</p>
                                        <h3 className="text-lg font-serif text-[#2B1810] mb-2 line-clamp-1">{item.name}</h3>
                                        <p className="text-xl font-bold text-[#8B7355] mb-4">
                                            {formatCurrency(item.price)}
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex gap-2">
                                            <Link href={`/products/${item.productId}`} className="flex-1">
                                                <Button variant="outline" className="w-full border-2 border-[#2B1810]">
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                onClick={() => handleAddToCart(item)}
                                                className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-3"
                                            >
                                                <ShoppingCart size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border-2 border-[#2B1810]">
                        <Heart size={64} className="mx-auto text-[#8B7355] mb-4" />
                        <h3 className="text-2xl font-serif text-[#2B1810] mb-2">Your wishlist is empty</h3>
                        <p className="text-[#8B7355] mb-6">
                            Save items you love by clicking the heart icon on products
                        </p>
                        <Link href="/products">
                            <Button className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Share Modal */}
                <AnimatePresence>
                    {showShareModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowShareModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white border-2 border-[#2B1810] p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-serif text-[#2B1810]">Share Wishlist</h3>
                                    <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-[#F5EBE0]">
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-[#8B7355] mb-4">
                                    Share your wishlist with friends and family!
                                </p>
                                <div className="bg-[#F5EBE0] border-2 border-[#2B1810] p-4 mb-4 max-h-40 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.productId} className="flex justify-between text-sm mb-2">
                                            <span className="text-[#2B1810]">{item.name}</span>
                                            <span className="text-[#8B7355] font-bold">{formatCurrency(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={copyToClipboard}
                                    className="w-full bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] flex items-center justify-center gap-2"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? "Copied!" : "Copy to Clipboard"}
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
