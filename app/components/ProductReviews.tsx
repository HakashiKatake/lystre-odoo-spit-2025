"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ThumbsUp, Camera, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
    id: string;
    userName: string;
    rating: number;
    date: string;
    title: string;
    comment: string;
    sizePurchased: string;
    bodyType: string;
    images?: string[];
    helpfulCount: number;
    verified: boolean;
}

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

// Mock reviews data - in production this would come from API
const MOCK_REVIEWS: Review[] = [
    {
        id: "1",
        userName: "Priya S.",
        rating: 5,
        date: "2024-12-15",
        title: "Perfect fit and quality!",
        comment: "Absolutely love this piece! The fabric is so soft and the stitching is impeccable. Wore it to a wedding and received so many compliments.",
        sizePurchased: "M",
        bodyType: "Regular",
        helpfulCount: 24,
        verified: true,
    },
    {
        id: "2",
        userName: "Rahul M.",
        rating: 4,
        date: "2024-12-10",
        title: "Great product, slightly loose",
        comment: "The quality is excellent and color is exactly as shown. However, I'd recommend sizing down as it runs a bit large.",
        sizePurchased: "L",
        bodyType: "Athletic",
        helpfulCount: 18,
        verified: true,
    },
    {
        id: "3",
        userName: "Ananya K.",
        rating: 5,
        date: "2024-12-05",
        title: "Worth every rupee!",
        comment: "This is my third purchase from Lystré and they never disappoint. The design is trendy and the material is breathable.",
        sizePurchased: "S",
        bodyType: "Slim",
        helpfulCount: 12,
        verified: true,
    },
    {
        id: "4",
        userName: "Vikram P.",
        rating: 3,
        date: "2024-11-28",
        title: "Good but could be better",
        comment: "The product is decent. Material quality is good but the color was slightly different from the photos. Still wearable though.",
        sizePurchased: "XL",
        bodyType: "Plus Size",
        helpfulCount: 8,
        verified: false,
    },
];

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const [reviews] = useState<Review[]>(MOCK_REVIEWS);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [filterSize, setFilterSize] = useState<string | null>(null);
    const [filterBodyType, setFilterBodyType] = useState<string | null>(null);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [helpedReviews, setHelpedReviews] = useState<Set<string>>(new Set());
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((r) => r.rating === rating).length,
        percentage: reviews.length > 0
            ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
            : 0,
    }));

    // Filter reviews
    const filteredReviews = reviews.filter((r) => {
        if (filterRating && r.rating !== filterRating) return false;
        if (filterSize && r.sizePurchased !== filterSize) return false;
        if (filterBodyType && r.bodyType !== filterBodyType) return false;
        return true;
    });

    const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

    const handleHelpful = (reviewId: string) => {
        if (helpedReviews.has(reviewId)) {
            toast.error("You've already marked this review as helpful");
            return;
        }
        setHelpedReviews(new Set([...helpedReviews, reviewId]));
        toast.success("Thanks for your feedback!");
    };

    const renderStars = (rating: number, size = 16) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        className={star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                    />
                ))}
            </div>
        );
    };

    const uniqueSizes = [...new Set(reviews.map((r) => r.sizePurchased))];
    const uniqueBodyTypes = [...new Set(reviews.map((r) => r.bodyType))];

    return (
        <div className="bg-white border-2 border-[#2B1810] mt-8">
            {/* Header */}
            <div className="p-6 border-b-2 border-[#2B1810]">
                <h2 className="text-2xl font-serif text-[#2B1810] mb-4">Customer Reviews</h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Rating Summary */}
                    <div className="text-center md:text-left">
                        <div className="text-5xl font-bold text-[#2B1810] mb-2">{averageRating.toFixed(1)}</div>
                        {renderStars(Math.round(averageRating), 20)}
                        <p className="text-[#8B7355] mt-2">{reviews.length} reviews</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 max-w-xs">
                        {ratingDist.map(({ rating, count, percentage }) => (
                            <button
                                key={rating}
                                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                                className={`flex items-center gap-2 w-full mb-2 hover:bg-[#F5EBE0] p-1 rounded ${
                                    filterRating === rating ? "bg-[#F5EBE0]" : ""
                                }`}
                            >
                                <span className="text-sm font-bold w-8">{rating}★</span>
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden border border-[#2B1810]">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-[#8B7355] w-8">{count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Write Review CTA */}
                    <div className="flex flex-col items-center md:items-end justify-center">
                        <Button
                            onClick={() => setShowWriteReview(true)}
                            className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                        >
                            Write a Review
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b-2 border-[#2B1810] bg-[#F5EBE0]">
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2B1810]">Filter by:</span>
                    </div>

                    {/* Size Filter */}
                    <select
                        value={filterSize || ""}
                        onChange={(e) => setFilterSize(e.target.value || null)}
                        className="px-3 py-2 border-2 border-[#2B1810] bg-white text-sm font-medium"
                    >
                        <option value="">All Sizes</option>
                        {uniqueSizes.map((size) => (
                            <option key={size} value={size}>Size {size}</option>
                        ))}
                    </select>

                    {/* Body Type Filter */}
                    <select
                        value={filterBodyType || ""}
                        onChange={(e) => setFilterBodyType(e.target.value || null)}
                        className="px-3 py-2 border-2 border-[#2B1810] bg-white text-sm font-medium"
                    >
                        <option value="">All Body Types</option>
                        {uniqueBodyTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    {(filterRating || filterSize || filterBodyType) && (
                        <button
                            onClick={() => {
                                setFilterRating(null);
                                setFilterSize(null);
                                setFilterBodyType(null);
                            }}
                            className="text-sm text-[#8B7355] hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="divide-y divide-[#2B1810]/20">
                <AnimatePresence>
                    {displayedReviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-[#8B7355] flex items-center justify-center text-white font-bold border-2 border-[#2B1810]">
                                    {review.userName.charAt(0)}
                                </div>

                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="font-bold text-[#2B1810]">{review.userName}</span>
                                        {review.verified && (
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border border-green-300">
                                                ✓ Verified Purchase
                                            </span>
                                        )}
                                        <span className="text-sm text-[#8B7355]">
                                            {new Date(review.date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Rating & Title */}
                                    <div className="flex items-center gap-3 mb-2">
                                        {renderStars(review.rating)}
                                        <span className="font-bold text-[#2B1810]">{review.title}</span>
                                    </div>

                                    {/* Size & Body Type */}
                                    <div className="flex gap-4 text-sm text-[#8B7355] mb-3">
                                        <span>Size: <strong>{review.sizePurchased}</strong></span>
                                        <span>Body Type: <strong>{review.bodyType}</strong></span>
                                    </div>

                                    {/* Comment */}
                                    <p className="text-[#2B1810] mb-4">{review.comment}</p>

                                    {/* Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mb-4">
                                            {review.images.map((img, i) => (
                                                <div key={i} className="w-20 h-20 border-2 border-[#2B1810] overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={`Review image ${i + 1}`}
                                                        width={80}
                                                        height={80}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Helpful */}
                                    <button
                                        onClick={() => handleHelpful(review.id)}
                                        className={`flex items-center gap-2 text-sm px-3 py-1 border-2 border-[#2B1810] hover:bg-[#F5EBE0] ${
                                            helpedReviews.has(review.id) ? "bg-[#F5EBE0]" : ""
                                        }`}
                                    >
                                        <ThumbsUp size={14} />
                                        Helpful ({review.helpfulCount + (helpedReviews.has(review.id) ? 1 : 0)})
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More */}
            {filteredReviews.length > 3 && (
                <div className="p-4 border-t-2 border-[#2B1810] text-center">
                    <Button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        variant="outline"
                        className="border-2 border-[#2B1810]"
                    >
                        {showAllReviews ? "Show Less" : `Show All ${filteredReviews.length} Reviews`}
                        <ChevronDown size={16} className={`ml-2 transition-transform ${showAllReviews ? "rotate-180" : ""}`} />
                    </Button>
                </div>
            )}

            {/* Write Review Modal */}
            <AnimatePresence>
                {showWriteReview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowWriteReview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border-2 border-[#2B1810] max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-serif text-[#2B1810] mb-4">Write a Review</h3>
                            <p className="text-[#8B7355] mb-4">Share your experience with {productName}</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} className="p-1 hover:scale-110 transition-transform">
                                                <Star size={28} className="text-gray-300 hover:text-yellow-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Summarize your experience"
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Review</label>
                                    <textarea
                                        placeholder="Tell us about the product..."
                                        rows={4}
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Add Photos</label>
                                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#2B1810] text-[#8B7355] hover:bg-[#F5EBE0] w-full justify-center">
                                        <Camera size={20} />
                                        Upload Images
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            setShowWriteReview(false);
                                            toast.success("Review submitted! Thank you for your feedback.");
                                        }}
                                        className="flex-1 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                                    >
                                        Submit Review
                                    </Button>
                                    <Button
                                        onClick={() => setShowWriteReview(false)}
                                        variant="outline"
                                        className="border-2 border-[#2B1810]"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
