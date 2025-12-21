"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Product {
    id: string;
    name: string;
    description?: string;
    category: string;
    type: string;
    stock: number;
    salesPrice: number;
    costPrice: number;
    salesTax: number;
    discountPercentage?: number | null;
    published: boolean;
    status: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                toast.error("We couldn't find the product you were looking for.");
                router.push("/admin/products");
            }
        } catch (err) {
            console.error("Failed to fetch product:", err);
            toast.error("We encountered an issue loading the product details. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async () => {
        if (!product) return;

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: !product.published }),
            });
            const data = await res.json();

            if (data.success) {
                setProduct({ ...product, published: !product.published });
                toast.success(`Product ${!product.published ? "published" : "unpublished"} successfully! Visibility has been updated.`);
            } else {
                toast.error(data.message || "We couldn't update the product visibility. Please try again.");
            }
        } catch {
            toast.error("An error occurred while updating the product. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!product) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Product deleted successfully! It has been removed from the list.");
                router.push("/admin/products");
            } else {
                toast.error(data.message || "We couldn't delete the product. Please try again.");
            }
        } catch {
            toast.error("An error occurred while deleting the product. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "confirmed":
                return "default";
            case "archived":
                return "secondary";
            default:
                return "outline";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-16 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md mx-auto">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold font-serif mb-2">Product Not Found</h2>
                <Link href="/admin/products">
                    <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        Back to Products
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold font-serif">{product.name}</h1>
                        <p className="text-gray-500 font-bold capitalize">
                            {product.category} • {product.type}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" className="bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Edit size={16} className="mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Product Information</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Product Name</p>
                                    <p className="font-bold text-lg">{product.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Category</p>
                                    <p className="font-bold capitalize">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Type</p>
                                    <p className="font-bold capitalize">{product.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Status</p>
                                    <Badge variant={getStatusVariant(product.status || "new") as any} className="capitalize border border-black shadow-sm mt-1">
                                        {product.status || "new"}
                                    </Badge>
                                </div>
                            </div>
                            {product.description && (
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Description</p>
                                    <p className="font-medium p-3 bg-gray-50 border-2 border-black rounded-lg mt-1">{product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Pricing & Inventory</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Sales Price</p>
                                    <p className="text-xl font-bold text-green-700">{formatCurrency(product.salesPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Cost Price</p>
                                    <p className="font-bold">{formatCurrency(product.costPrice || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Sales Tax</p>
                                    <p className="font-bold">{product.salesTax}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Stock</p>
                                    <p className={`font-bold ${product.stock < 20 ? "text-red-600" : "text-black"}`}>
                                        {product.stock} units
                                    </p>
                                </div>
                            </div>
                            {/* Discount Display */}
                            {product.discountPercentage && product.discountPercentage > 0 && (
                                <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-700 font-bold">Discount Applied</p>
                                            <p className="text-2xl font-bold text-green-700">{product.discountPercentage}% OFF</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 font-bold">Final Price</p>
                                            <p className="text-xl font-bold text-green-700">
                                                {formatCurrency(product.salesPrice * (1 - product.discountPercentage / 100))}
                                            </p>
                                            <p className="text-sm text-gray-400 line-through">
                                                {formatCurrency(product.salesPrice)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Images */}
                    {product.images && product.images.length > 0 && (
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Product Images</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    {product.images.map((image, index) => (
                                        <div key={index} className="aspect-square bg-white border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Status */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Visibility</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold">Published</p>
                                    <p className="text-sm text-gray-500 font-bold">
                                        {product.published ? "Visible to customers" : "Hidden from customers"}
                                    </p>
                                </div>
                                <Switch
                                    checked={product.published}
                                    onCheckedChange={togglePublish}
                                    className="data-[state=checked]:bg-lystre-brown border-2 border-black"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Details</h3>
                        </div>
                        <div className="p-6 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-black/10 pb-2">
                                <span className="text-gray-500 font-bold">Created</span>
                                <span className="font-bold">{formatDate(product.createdAt)}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-gray-500 font-bold">Updated</span>
                                <span className="font-bold">{formatDate(product.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Delete Product</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-black">&quot;{product.name}&quot;</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-2 border-black bg-white hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
