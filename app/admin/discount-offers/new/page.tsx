"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Contact {
    id: string;
    name: string;
    type: string;
}

export default function NewDiscountOfferPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState<Contact[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        discountPercentage: 10,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        availableOn: "WEBSITE" as "SALES" | "WEBSITE",
    });

    // Generate coupons options
    const [generateOptions, setGenerateOptions] = useState({
        forType: "anonymous" as "anonymous" | "selected",
        selectedCustomers: [] as string[],
        quantity: 10,
        expirationDate: "",
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/contacts?type=CUSTOMER");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data?.filter((c: Contact) => c.type === "CUSTOMER" || c.type === "BOTH") || []);
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("The offer name is required. Please give it a clear name.");
            return;
        }
        if (!formData.endDate) {
            toast.error("The end date is required. Please set an expiration date for the offer.");
            return;
        }

        setSaving(true);

        try {
            // First create the discount offer
            const res = await fetch("/api/discount-offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    discountPercentage: formData.discountPercentage,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    availableOn: formData.availableOn,
                }),
            });

            const data = await res.json();

            if (data.success) {
                // Optionally generate coupons after creating offer
                const offerId = data.data.id;

                if (generateOptions.forType === "anonymous" && generateOptions.quantity > 0) {
                    await fetch("/api/coupons", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "generateCoupons",
                            discountOfferId: offerId,
                            quantity: generateOptions.quantity,
                            expirationDate: generateOptions.expirationDate || formData.endDate,
                        }),
                    });
                } else if (generateOptions.forType === "selected" && generateOptions.selectedCustomers.length > 0) {
                    await fetch("/api/coupons", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "generateCoupons",
                            discountOfferId: offerId,
                            customerIds: generateOptions.selectedCustomers,
                            expirationDate: generateOptions.expirationDate || formData.endDate,
                        }),
                    });
                }

                toast.success("Discount offer created successfully! You can now view it in the list.");
                router.push("/admin/discount-offers");
            } else {
                toast.error(data.message || "We couldn't create the discount offer. Please try again.");
            }
        } catch (err) {
            console.error("Failed to create discount offer:", err);
            toast.error("An error occurred while creating the discount offer. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/discount-offers">
                    <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    New Discount Offer
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Offer Details */}
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Offer Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-black font-bold">Offer Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g., 10% Discount Coupons"
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="discountPercentage" className="text-black font-bold">Discount Percentage (%)</Label>
                                        <Input
                                            id="discountPercentage"
                                            type="number"
                                            value={formData.discountPercentage}
                                            onChange={(e) => setFormData((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))}
                                            min={0}
                                            max={100}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="availableOn" className="text-black font-bold">Available On</Label>
                                        <Select
                                            value={formData.availableOn}
                                            onValueChange={(value) => setFormData((f) => ({ ...f, availableOn: value as "SALES" | "WEBSITE" }))}
                                        >
                                            <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <SelectItem value="WEBSITE">Website</SelectItem>
                                                <SelectItem value="SALES">Sales</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate" className="text-black font-bold">Start Date *</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate" className="text-black font-bold">End Date *</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Generate Coupons (Optional) */}
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Generate Coupons (Optional)</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label className="text-black font-bold">Generate For</Label>
                                    <Select
                                        value={generateOptions.forType}
                                        onValueChange={(value) => setGenerateOptions((o) => ({ ...o, forType: value as "anonymous" | "selected" }))}
                                    >
                                        <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <SelectItem value="anonymous">Anonymous Customers</SelectItem>
                                            <SelectItem value="selected">Selected Customers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 font-bold mt-1">
                                        {generateOptions.forType === "anonymous"
                                            ? "Generate specified quantity of coupons without customer assignment"
                                            : "Generate one coupon per selected customer"
                                        }
                                    </p>
                                </div>

                                {generateOptions.forType === "anonymous" && (
                                    <div>
                                        <Label htmlFor="quantity" className="text-black font-bold">Quantity to Generate</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            value={generateOptions.quantity}
                                            onChange={(e) => setGenerateOptions((o) => ({ ...o, quantity: parseInt(e.target.value) || 0 }))}
                                            min={1}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                        />
                                    </div>
                                )}

                                {generateOptions.forType === "selected" && (
                                    <div>
                                        <Label className="text-black font-bold">Select Customers</Label>
                                        <div className="border-2 border-black rounded-lg p-3 max-h-40 overflow-auto space-y-2 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {customers.length > 0 ? customers.map((customer) => (
                                                <label key={customer.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                                                    <Checkbox
                                                        checked={generateOptions.selectedCustomers.includes(customer.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setGenerateOptions((o) => ({
                                                                    ...o,
                                                                    selectedCustomers: [...o.selectedCustomers, customer.id],
                                                                }));
                                                            } else {
                                                                setGenerateOptions((o) => ({
                                                                    ...o,
                                                                    selectedCustomers: o.selectedCustomers.filter((id) => id !== customer.id),
                                                                }));
                                                            }
                                                        }}
                                                        className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                                                    />
                                                    <span className="text-sm font-bold">{customer.name}</span>
                                                </label>
                                            )) : (
                                                <p className="text-sm text-gray-500 font-bold">No customers found</p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold mt-1">
                                            {generateOptions.selectedCustomers.length} customers selected
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="expirationDate" className="text-black font-bold">Coupon Expiration Date</Label>
                                    <Input
                                        id="expirationDate"
                                        type="date"
                                        value={generateOptions.expirationDate}
                                        onChange={(e) => setGenerateOptions((o) => ({ ...o, expirationDate: e.target.value }))}
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                    />
                                    <p className="text-xs text-gray-500 font-bold mt-1">
                                        Leave empty to use offer end date
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="p-4 border-b-2 border-black bg-gray-50">
                                <h3 className="font-bold text-lg font-serif">Preview</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Offer Name</p>
                                    <p className="font-medium">{formData.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Discount</p>
                                    <p className="font-medium text-green-600 font-bold">{formData.discountPercentage}% off</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Valid Period</p>
                                    <p className="font-medium">
                                        {formData.startDate} to {formData.endDate || "?"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Available On</p>
                                    <p className="font-medium">{formData.availableOn}</p>
                                </div>
                                <hr className="border-black/20" />
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Coupons to Generate</p>
                                    <p className="font-medium">
                                        {generateOptions.forType === "anonymous"
                                            ? `${generateOptions.quantity} anonymous coupons`
                                            : `${generateOptions.selectedCustomers.length} customer coupons`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#A1887F] text-white hover:bg-[#8D766E] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Create Offer
                            </Button>
                            <Link href="/admin/discount-offers" className="block">
                                <Button type="button" variant="outline" className="w-full bg-white hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
