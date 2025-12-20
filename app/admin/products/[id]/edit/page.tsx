"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    published: boolean;
    status: string;
    images?: string[];
    sizes?: string[];
}

const SIZES = ["S", "M", "L", "XL", "XXL"];

const CATEGORIES = ["men", "women", "kids", "accessories", "home", "electronics", "books", "other"];
const TYPES = ["shirt", "pants", "dress", "kurta", "saree", "shoes", "bag", "watch", "jewelry", "other"];
const STATUSES = ["new", "confirmed", "archived"];

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "other",
        type: "other",
        stock: 0,
        salesPrice: 0,
        costPrice: 0,
        salesTax: 10,
        published: false,
        status: "new",
        sizes: [] as string[],
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            const data = await res.json();

            if (data.success) {
                const product = data.data;
                setFormData({
                    name: product.name || "",
                    description: product.description || "",
                    category: product.category || "other",
                    type: product.type || "other",
                    stock: product.stock || 0,
                    salesPrice: product.salesPrice || 0,
                    costPrice: product.costPrice || 0,
                    salesTax: product.salesTax || 10,
                    published: product.published || false,
                    status: product.status || "new",
                    sizes: product.sizes || [],
                });
            } else {
                toast.error("Product not found");
                router.push("/admin/products");
            }
        } catch (err) {
            console.error("Failed to fetch product:", err);
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("Please enter a product name");
            return;
        }
        if (formData.salesPrice <= 0) {
            toast.error("Please enter a valid sales price");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/products/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Product updated successfully!");
                router.push(`/admin/products/${params.id}`);
            } else {
                toast.error(data.message || "Failed to update product");
            }
        } catch (err) {
            console.error("Failed to update product:", err);
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    const toggleSize = (size: string) => {
        setFormData((prev) => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter((s) => s !== size)
                : [...prev.sizes, size],
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/admin/products/${params.id}`}>
                    <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Edit Product
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Basic Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-black font-bold">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Product name"
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-black font-bold">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                                        placeholder="Product description"
                                        rows={4}
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category" className="text-black font-bold">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData((f) => ({ ...f, category: value }))}
                                        >
                                            <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                                                {CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat} className="capitalize">
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="type" className="text-black font-bold">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData((f) => ({ ...f, type: value }))}
                                        >
                                            <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                                                {TYPES.map((type) => (
                                                    <SelectItem key={type} value={type} className="capitalize">
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <Label className="text-black font-bold">Available Sizes</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {SIZES.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`w-12 h-10 border-2 font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md ${
                                                    formData.sizes.includes(size)
                                                        ? "border-black bg-lystre-brown text-white"
                                                        : "border-black bg-white hover:bg-gray-100 text-black"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.sizes.length > 0 && (
                                        <p className="text-sm text-gray-500 font-bold mt-2">
                                            Selected: {formData.sizes.join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Pricing & Inventory</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="salesPrice" className="text-black font-bold">Sales Price (₹) *</Label>
                                        <Input
                                            id="salesPrice"
                                            type="number"
                                            value={formData.salesPrice}
                                            onChange={(e) => setFormData((f) => ({ ...f, salesPrice: parseFloat(e.target.value) || 0 }))}
                                            min={0}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="costPrice" className="text-black font-bold">Cost Price (₹)</Label>
                                        <Input
                                            id="costPrice"
                                            type="number"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData((f) => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))}
                                            min={0}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="salesTax" className="text-black font-bold">Sales Tax (%)</Label>
                                        <Input
                                            id="salesTax"
                                            type="number"
                                            value={formData.salesTax}
                                            onChange={(e) => setFormData((f) => ({ ...f, salesTax: parseFloat(e.target.value) || 0 }))}
                                            min={0}
                                            max={100}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="stock" className="text-black font-bold">Stock Quantity</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                                            min={0}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Status</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label className="text-black font-bold">Product Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData((f) => ({ ...f, status: value }))}
                                    >
                                        <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                                            {STATUSES.map((status) => (
                                                <SelectItem key={status} value={status} className="capitalize">
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">Published</p>
                                        <p className="text-sm text-gray-500 font-bold">
                                            Visible to customers
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.published}
                                        onCheckedChange={(checked) => setFormData((f) => ({ ...f, published: checked }))}
                                        className="data-[state=checked]:bg-lystre-brown border-2 border-black"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Save Changes
                            </Button>
                            <Link href={`/admin/products/${params.id}`} className="block">
                                <Button type="button" variant="outline" className="w-full bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
