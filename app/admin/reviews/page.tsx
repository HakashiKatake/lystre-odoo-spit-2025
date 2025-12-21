"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Loader2, Package, User, ThumbsUp, Calendar, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Review {
    id: string;
    rating: number;
    title: string;
    comment: string;
    userName: string;
    sizePurchased?: string;
    bodyType?: string;
    images?: string[];
    helpfulCount: number;
    verified: boolean;
    createdAt: string;
    product: {
        id: string;
        name: string;
        images?: string[];
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("newest");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/admin/reviews");
            const data = await res.json();

            if (data.success) {
                setReviews(data.data);
            } else {
                toast.error("Failed to load reviews");
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            toast.error("An error occurred while loading reviews");
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = reviews
        .filter((review) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    review.product.name.toLowerCase().includes(query) ||
                    review.userName.toLowerCase().includes(query) ||
                    review.title.toLowerCase().includes(query) ||
                    review.comment.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .filter((review) => {
            // Rating filter
            if (ratingFilter === "all") return true;
            return review.rating === parseInt(ratingFilter);
        })
        .sort((a, b) => {
            // Sort
            switch (sortBy) {
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "highest":
                    return b.rating - a.rating;
                case "lowest":
                    return a.rating - b.rating;
                case "helpful":
                    return b.helpfulCount - a.helpfulCount;
                default: // newest
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((r) => r.rating === rating).length,
        percentage: reviews.length > 0
            ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
            : 0,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-serif">Product Reviews</h1>
                    <p className="text-gray-500 font-bold">
                        View and manage all customer reviews
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg border-2 border-black">
                            <Star className="w-6 h-6 text-yellow-600 fill-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Average Rating</p>
                            <p className="text-2xl font-bold">{averageRating} / 5</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg border-2 border-black">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Total Reviews</p>
                            <p className="text-2xl font-bold">{reviews.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg border-2 border-black">
                            <ThumbsUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Verified Purchases</p>
                            <p className="text-2xl font-bold">{reviews.filter((r) => r.verified).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg border-2 border-black">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Products with Reviews</p>
                            <p className="text-2xl font-bold">
                                {new Set(reviews.map((r) => r.product.id)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                <h3 className="font-bold text-lg font-serif mb-4">Rating Distribution</h3>
                <div className="space-y-2">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="flex items-center gap-3">
                            <span className="w-12 text-sm font-bold flex items-center gap-1">
                                {rating} <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            </span>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full border border-black overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-16 text-sm text-gray-500 font-bold text-right">
                                {count} ({percentage.toFixed(0)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        
                        <Input
                            placeholder="Search reviews..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                    </div>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-[140px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Filter size={16} className="mr-2" />
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[160px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="highest">Highest Rating</SelectItem>
                            <SelectItem value="lowest">Lowest Rating</SelectItem>
                            <SelectItem value="helpful">Most Helpful</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Star size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold">No reviews found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Product Image */}
                                <Link href={`/admin/products/${review.product.id}`} className="shrink-0">
                                    <div className="w-20 h-20 border-2 border-black rounded-lg overflow-hidden bg-gray-100">
                                        {review.product.images?.[0] ? (
                                            <img
                                                src={review.product.images[0]}
                                                alt={review.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                        <div>
                                            <Link
                                                href={`/admin/products/${review.product.id}`}
                                                className="font-bold text-lg hover:text-lystre-brown transition-colors"
                                            >
                                                {review.product.name}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            className={
                                                                star <= review.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-200"
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                {review.verified && (
                                                    <Badge className="bg-green-100 text-green-700 border border-green-500 text-xs">
                                                        Verified Purchase
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <div className="flex items-center gap-1 font-bold">
                                                <Calendar size={14} />
                                                {formatDate(review.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="font-bold text-md mb-1">{review.title}</p>
                                    <p className="text-gray-600 mb-3">{review.comment}</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="font-bold flex items-center gap-1">
                                            <User size={14} />
                                            {review.userName}
                                        </span>
                                        {review.sizePurchased && (
                                            <span className="font-bold">Size: {review.sizePurchased}</span>
                                        )}
                                        {review.bodyType && (
                                            <span className="font-bold">Body Type: {review.bodyType}</span>
                                        )}
                                        <span className="font-bold flex items-center gap-1">
                                            <ThumbsUp size={14} />
                                            {review.helpfulCount} found helpful
                                        </span>
                                    </div>

                                    {/* Review Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {review.images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-16 h-16 border-2 border-black rounded-lg overflow-hidden"
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Review image ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
