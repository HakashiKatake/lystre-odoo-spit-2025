"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ImagePlus, X, Loader2 } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  PRODUCT_MATERIALS,
  PRODUCT_COLORS,
} from "@/lib/constants";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const SIZES = ["S", "M", "L", "XL", "XXL"];
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "",
    material: "",
    colors: [] as string[],
    sizes: [] as string[],
    stock: 0 as number | string,
    salesPrice: 0 as number | string,
    salesTax: 10 as number | string,
    discountPercentage: 0 as number | string,
    purchasePrice: 0 as number | string,
    purchaseTax: 10 as number | string,
    published: false,
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim())
      newErrors.name = "Please give your product a clear name.";
    if (!formData.category)
      newErrors.category = "Please select a category for this product.";
    if (!formData.type) newErrors.type = "Please specify the type of product.";
    if (!formData.material)
      newErrors.material = "Please choose the material for this product.";
    if (formData.colors.length === 0)
      newErrors.colors = "Please select at least one available color.";
    if (Number(formData.salesPrice) <= 0)
      newErrors.salesPrice = "The sales price must be greater than zero.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(
        "Please check the form for errors. Some required fields are missing or invalid.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          "Product created successfully! You can now start managing it.",
        );
        router.push("/admin/products");
      } else {
        toast.error(
          data.message || "We couldn't create the product. Please try again.",
        );
      }
    } catch {
      toast.error(
        "An error occurred while creating the product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
    if (errors.colors) setErrors((prev) => ({ ...prev, colors: "" }));
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    /// For now, convert to base64 data URLs (in production, you'd upload to a file server)
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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
          New Product
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50">
                <h3 className="font-bold text-lg font-serif">
                  Product Details
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name" className="text-black font-bold">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, name: e.target.value }));
                        if (errors.name)
                          setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      placeholder="Enter product name"
                      className={`border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 font-bold">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label
                      htmlFor="description"
                      className="text-black font-bold"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Product description..."
                      rows={3}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-black font-bold">Category *</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          category: e.target.value,
                        }));
                        if (errors.category)
                          setErrors((prev) => ({ ...prev, category: "" }));
                      }}
                      className={`w-full border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1 ${errors.category ? "border-red-500" : ""}`}
                    >
                      <option value="">Select category</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 font-bold">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-black font-bold">
                      Product Type *
                    </Label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, type: e.target.value }));
                        if (errors.type)
                          setErrors((prev) => ({ ...prev, type: "" }));
                      }}
                      className={`w-full border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1 ${errors.type ? "border-red-500" : ""}`}
                    >
                      <option value="">Select type</option>
                      {PRODUCT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1 font-bold">
                        {errors.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-black font-bold">Material *</Label>
                    <select
                      value={formData.material}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          material: e.target.value,
                        }));
                        if (errors.material)
                          setErrors((prev) => ({ ...prev, material: "" }));
                      }}
                      className={`w-full border-2 border-black rounded-md px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1 ${errors.material ? "border-red-500" : ""}`}
                    >
                      <option value="">Select material</option>
                      {PRODUCT_MATERIALS.map((mat) => (
                        <option key={mat.value} value={mat.value}>
                          {mat.label}
                        </option>
                      ))}
                    </select>
                    {errors.material && (
                      <p className="text-red-500 text-sm mt-1 font-bold">
                        {errors.material}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-black font-bold">Stock *</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          stock:
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value),
                        }))
                      }
                      min="0"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-black font-bold">Colors *</Label>
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
                    {errors.colors && (
                      <p className="text-red-500 text-sm mt-1 font-bold">
                        {errors.colors}
                      </p>
                    )}
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
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50">
                <h3 className="font-bold text-lg font-serif">Pricing</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black font-bold">
                      Sales Price (₹) *
                    </Label>
                    <Input
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          salesPrice:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }));
                        if (errors.salesPrice)
                          setErrors((prev) => ({ ...prev, salesPrice: "" }));
                      }}
                      min="0"
                      step="0.01"
                      className={`border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1 ${errors.salesPrice ? "border-red-500" : ""}`}
                    />
                    {errors.salesPrice && (
                      <p className="text-red-500 text-sm mt-1 font-bold">
                        {errors.salesPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-black font-bold">
                      Sales Tax (%)
                    </Label>
                    <Input
                      type="number"
                      value={formData.salesTax}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          salesTax:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min="0"
                      max="100"
                      step="0.1"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-black font-bold">
                      Purchase Price (₹)
                    </Label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          purchasePrice:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min="0"
                      step="0.01"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-black font-bold">
                      Purchase Tax (%)
                    </Label>
                    <Input
                      type="number"
                      value={formData.purchaseTax}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          purchaseTax:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min="0"
                      max="100"
                      step="0.1"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-black font-bold flex items-center gap-2">
                      Discount (%)
                      {Number(formData.discountPercentage) > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                          {formData.discountPercentage}% OFF
                        </span>
                      )}
                    </Label>
                    <Input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          discountPercentage:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        }))
                      }
                      min="0"
                      max="100"
                      step="1"
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

          {/* Right Column - Images & Actions */}
          <div className="space-y-6">
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

            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50">
                <h3 className="font-bold text-lg font-serif">Visibility</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-black font-bold">Published</Label>
                    <p className="text-sm text-gray-500 font-bold">
                      Show in customer shop
                    </p>
                  </div>
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, published: checked }))
                    }
                    className="data-[state=checked]:bg-lystre-brown border-2 border-black"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                Save Product
              </Button>
              <Link href="/admin/products" className="flex-1">
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
