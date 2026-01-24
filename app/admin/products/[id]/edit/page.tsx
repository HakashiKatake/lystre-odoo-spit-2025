"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, X, ImagePlus } from "lucide-react";
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

const CATEGORIES = [
  "men",
  "women",
  "kids",
  "accessories",
  "home",
  "electronics",
  "books",
  "other",
  "traditional",
];
const TYPES = [
  "shirt",
  "pants",
  "dress",
  "kurta",
  "saree",
  "shoes",
  "bag",
  "watch",
  "jewelry",
  "other",
  "traditional",
];
const STATUSES = ["new", "confirmed", "archived"];
const PRODUCT_COLORS = [
  { value: "black", label: "Black", hex: "#000000" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "green", label: "Green", hex: "#22C55E" },
  { value: "yellow", label: "Yellow", hex: "#EAB308" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
  { value: "purple", label: "Purple", hex: "#8B5CF6" },
  { value: "orange", label: "Orange", hex: "#F97316" },
  { value: "brown", label: "Brown", hex: "#8B7355" },
  { value: "gray", label: "Gray", hex: "#6B7280" },
  { value: "navy", label: "Navy", hex: "#1E3A5F" },
  { value: "beige", label: "Beige", hex: "#F5F5DC" },
  { value: "maroon", label: "Maroon", hex: "#800000" },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    type: "other",
    stock: 0 as number | string,
    salesPrice: 0 as number | string,
    costPrice: 0 as number | string,
    salesTax: 10 as number | string,
    discountPercentage: 0 as number | string,
    published: false,
    status: "new",
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
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
          discountPercentage: product.discountPercentage || 0,
          published: product.published || false,
          status: product.status || "new",
          sizes: product.sizes || [],
          colors: product.colors || [],
          images: product.images || [],
        });
      } else {
        toast.error("We couldn't find the product you were looking for.");
        router.push("/admin/products");
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      toast.error(
        "We encountered an issue loading the product details. Please refresh the page.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error(
        "The product name is required. Please give your product a name.",
      );
      return;
    }
    if (Number(formData.salesPrice) <= 0) {
      toast.error(
        "The sales price is invalid. Please enter a value greater than zero.",
      );
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
        toast.success(
          "Product updated successfully! Your changes have been saved.",
        );
        router.push(`/admin/products/${params.id}`);
      } else {
        toast.error(
          data.message || "We couldn't update the product. Please try again.",
        );
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error(
        "An error occurred while updating the product. Please try again.",
      );
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

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (formData.images.length >= 4) {
        toast.error("You can only upload up to 4 images per product.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
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
          <Button
            variant="ghost"
            size="icon"
            className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          >
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
                <h3 className="font-bold text-lg font-serif">
                  Basic Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="name" className="text-black font-bold">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Product name"
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-black font-bold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Product description"
                    rows={4}
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-black font-bold">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((f) => ({ ...f, category: value }))
                      }
                    >
                      <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        {CATEGORIES.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="capitalize"
                          >
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-black font-bold">
                      Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((f) => ({ ...f, type: value }))
                      }
                    >
                      <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        {TYPES.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-2">
                  <Label className="text-black font-bold">
                    Available Sizes
                  </Label>
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

                <div className="col-span-2">
                  <Label className="text-black font-bold">
                    Available Colors
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PRODUCT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => toggleColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.colors.includes(color.value)
                            ? "border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-2 ring-lystre-brown scale-110"
                            : "border-black hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  {formData.colors.length > 0 && (
                    <p className="text-sm text-gray-500 font-bold mt-2">
                      Selected: {formData.colors.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50">
                <h3 className="font-bold text-lg font-serif">
                  Pricing & Inventory
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="salesPrice"
                      className="text-black font-bold"
                    >
                      Sales Price (₹) *
                    </Label>
                    <Input
                      id="salesPrice"
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          salesPrice:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min={0}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costPrice" className="text-black font-bold">
                      Cost Price (₹)
                    </Label>
                    <Input
                      id="costPrice"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          costPrice:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min={0}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesTax" className="text-black font-bold">
                      Sales Tax (%)
                    </Label>
                    <Input
                      id="salesTax"
                      type="number"
                      value={formData.salesTax}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          salesTax:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min={0}
                      max={100}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock" className="text-black font-bold">
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          stock:
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value),
                        }))
                      }
                      min={0}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label
                      htmlFor="discountPercentage"
                      className="text-black font-bold flex items-center gap-2"
                    >
                      Discount (%)
                      {Number(formData.discountPercentage) > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                          {formData.discountPercentage}% OFF
                        </span>
                      )}
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          discountPercentage:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min={0}
                      max={100}
                      placeholder="0"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                    {Number(formData.discountPercentage) > 0 &&
                      Number(formData.salesPrice) > 0 && (
                        <p className="text-sm mt-2 text-green-600 font-bold">
                          Final Price: ₹
                          {(
                            Number(formData.salesPrice) *
                            (1 - Number(formData.discountPercentage) / 100)
                          ).toFixed(2)}
                          <span className="text-gray-400 line-through ml-2">
                            ₹{formData.salesPrice}
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50">
                <h3 className="font-bold text-lg font-serif">Images</h3>
              </div>
              <div className="p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      onClick={() =>
                        !formData.images[index] && fileInputRef.current?.click()
                      }
                      className={`aspect-square bg-gray-50 rounded-lg flex items-center justify-center border-2 border-black ${
                        !formData.images[index]
                          ? "cursor-pointer hover:bg-gray-100 border-dashed"
                          : "border-solid"
                      } transition-all`}
                    >
                      {formData.images[index] ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formData.images[index]}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md border-2 border-black hover:bg-red-600 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImagePlus
                            size={24}
                            className="mx-auto mb-1 text-gray-500"
                          />
                          <span className="text-xs font-bold text-gray-500">
                            Add Image
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-bold mt-2">
                  Click to upload. Max 4 images.
                </p>
              </div>
            </div>

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
                    onValueChange={(value) =>
                      setFormData((f) => ({ ...f, status: value }))
                    }
                  >
                    <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                      {STATUSES.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="capitalize"
                        >
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
                    onCheckedChange={(checked) =>
                      setFormData((f) => ({ ...f, published: checked }))
                    }
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
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save Changes
              </Button>
              <Link href={`/admin/products/${params.id}`} className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                >
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
