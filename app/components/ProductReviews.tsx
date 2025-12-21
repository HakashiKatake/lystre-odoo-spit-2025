"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ThumbsUp, Camera, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
    id: string;
    userName: string;
    rating: number;
    createdAt: string;
    title: string;
    comment: string;
    sizePurchased: string | null;
    bodyType: string | null;
    images: string[];
    helpfulCount: number;
    verified: boolean;
}

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

const BODY_TYPES = ["Slim", "Regular", "Athletic", "Plus Size"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [filterSize, setFilterSize] = useState<string | null>(null);
    const [filterBodyType, setFilterBodyType] = useState<string | null>(null);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [helpedReviews, setHelpedReviews] = useState<Set<string>>(new Set());
    const [showAllReviews, setShowAllReviews] = useState(false);
    
    // Form state
    const [newReview, setNewReview] = useState({
        rating: 0,
        title: "",
        comment: "",
        sizePurchased: "",
        bodyType: "",
        userName: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch reviews from API
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?productId=${productId}`);
                const data = await res.json();
                if (data.success) {
                    setReviews(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId]);

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

    const handleHelpful = async (reviewId: string) => {
        if (helpedReviews.has(reviewId)) {
            toast.error("You've already marked this review as helpful");
            return;
        }

        try {
            const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: "POST" });
            const data = await res.json();
            
            if (data.success) {
                setHelpedReviews(new Set([...helpedReviews, reviewId]));
                setReviews(reviews.map(r => 
                    r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
                ));
                toast.success("Thanks for your feedback!");
            }
        } catch (err) {
            console.error("Failed to mark helpful:", err);
            toast.error("Failed to submit feedback");
        }
    };

    const handleSubmitReview = async () => {
        if (newReview.rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        if (!newReview.title.trim()) {
            toast.error("Please add a title");
            return;
        }
        if (!newReview.comment.trim()) {
            toast.error("Please add your review");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    rating: newReview.rating,
                    title: newReview.title,
                    comment: newReview.comment,
                    sizePurchased: newReview.sizePurchased || null,
                    bodyType: newReview.bodyType || null,
                    userName: newReview.userName || "Anonymous",
                }),
            });

            const data = await res.json();

            if (data.success) {
                setReviews([data.data, ...reviews]);
                setShowWriteReview(false);
                setNewReview({ rating: 0, title: "", comment: "", sizePurchased: "", bodyType: "", userName: "" });
                toast.success("Review submitted successfully! Thank you for your feedback.");
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (err) {
            console.error("Failed to submit review:", err);
            toast.error("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, size = 16, interactive = false, onSelect?: (r: number) => void) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onSelect && onSelect(star)}
                        className={interactive ? "hover:scale-110 transition-transform" : ""}
                        disabled={!interactive}
                    >
                        <Star
                            size={size}
                            className={star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const uniqueSizes = [...new Set(reviews.map((r) => r.sizePurchased).filter(Boolean))];
    const uniqueBodyTypes = [...new Set(reviews.map((r) => r.bodyType).filter(Boolean))];

    if (loading) {
        return (
            <div className="bg-white border-2 border-[#2B1810] mt-8 p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#8B7355]" />
            </div>
        );
    }

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
            {reviews.length > 0 && (
                <div className="p-4 border-b-2 border-[#2B1810] bg-[#F5EBE0]">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#2B1810]">Filter by:</span>
                        </div>

                        {/* Size Filter */}
                        {uniqueSizes.length > 0 && (
                            <select
                                value={filterSize || ""}
                                onChange={(e) => setFilterSize(e.target.value || null)}
                                className="px-3 py-2 border-2 border-[#2B1810] bg-white text-sm font-medium"
                            >
                                <option value="">All Sizes</option>
                                {uniqueSizes.map((size) => (
                                    <option key={size} value={size!}>Size {size}</option>
                                ))}
                            </select>
                        )}

                        {/* Body Type Filter */}
                        {uniqueBodyTypes.length > 0 && (
                            <select
                                value={filterBodyType || ""}
                                onChange={(e) => setFilterBodyType(e.target.value || null)}
                                className="px-3 py-2 border-2 border-[#2B1810] bg-white text-sm font-medium"
                            >
                                <option value="">All Body Types</option>
                                {uniqueBodyTypes.map((type) => (
                                    <option key={type} value={type!}>{type}</option>
                                ))}
                            </select>
                        )}

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
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
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
                                        {review.userName.charAt(0).toUpperCase()}
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
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Rating & Title */}
                                        <div className="flex items-center gap-3 mb-2">
                                            {renderStars(review.rating)}
                                            <span className="font-bold text-[#2B1810]">{review.title}</span>
                                        </div>

                                        {/* Size & Body Type */}
                                        {(review.sizePurchased || review.bodyType) && (
                                            <div className="flex gap-4 text-sm text-[#8B7355] mb-3">
                                                {review.sizePurchased && <span>Size: <strong>{review.sizePurchased}</strong></span>}
                                                {review.bodyType && <span>Body Type: <strong>{review.bodyType}</strong></span>}
                                            </div>
                                        )}

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
                                            Helpful ({review.helpfulCount})
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="p-12 text-center">
                    <p className="text-[#8B7355] mb-4">No reviews yet. Be the first to review this product!</p>
                    <Button
                        onClick={() => setShowWriteReview(true)}
                        className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344]"
                    >
                        Write a Review
                    </Button>
                </div>
            )}

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
                            className="bg-white border-2 border-[#2B1810] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-serif text-[#2B1810] mb-4">Write a Review</h3>
                            <p className="text-[#8B7355] mb-4">Share your experience with {productName}</p>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={newReview.userName}
                                        onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    />
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Rating *</label>
                                    {renderStars(newReview.rating, 28, true, (r) => setNewReview({ ...newReview, rating: r }))}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Summarize your experience"
                                        value={newReview.title}
                                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    />
                                </div>

                                {/* Review */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Review *</label>
                                    <textarea
                                        placeholder="Tell us about the product..."
                                        rows={4}
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    />
                                </div>

                                {/* Size Purchased */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Size Purchased</label>
                                    <select
                                        value={newReview.sizePurchased}
                                        onChange={(e) => setNewReview({ ...newReview, sizePurchased: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    >
                                        <option value="">Select size</option>
                                        {SIZES.map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Body Type */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2B1810] mb-2">Body Type</label>
                                    <select
                                        value={newReview.bodyType}
                                        onChange={(e) => setNewReview({ ...newReview, bodyType: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                                    >
                                        <option value="">Select body type</option>
                                        {BODY_TYPES.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={submitting}
                                        className="flex-1 bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin mr-2" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Review"
                                        )}
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
