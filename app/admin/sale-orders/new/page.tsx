"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Customer {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    salesPrice: number;
    salesTax: number;
    stock: number;
}

interface OrderLine {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    stock: number;
}

export default function NewSaleOrderPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [saving, setSaving] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [lines, setLines] = useState<OrderLine[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data?.filter((c: { type: string }) => c.type === "CUSTOMER" || c.type === "BOTH") || []);
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.success) {
                setProducts((data.data || []).filter((p: Product) => p.stock > 0));
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    const addLine = () => {
        if (!selectedProduct) {
            toast.error("Please select a product to add to the order.");
            return;
        }

        const product = products.find((p) => p.id === selectedProduct);
        if (!product) return;

        // Check if product already in lines
        if (lines.some((l) => l.productId === product.id)) {
            toast.error("This product is already in the order. You can adjust the quantity instead.");
            return;
        }

        setLines([
            ...lines,
            {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitPrice: product.salesPrice,
                tax: product.salesTax,
                stock: product.stock,
            },
        ]);
        setSelectedProduct("");
    };

    const updateLine = (index: number, field: keyof OrderLine, value: number) => {
        setLines((prev) =>
            prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
        );
    };

    const removeLine = (index: number) => {
        setLines((prev) => prev.filter((_, i) => i !== index));
    };

    const calculateLineTotal = (line: OrderLine) => {
        const subtotal = line.quantity * line.unitPrice;
        const tax = (subtotal * line.tax) / 100;
        return subtotal + tax;
    };

    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const taxAmount = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice * line.tax) / 100, 0);
    const total = subtotal + taxAmount;

    const handleSubmit = async () => {
        if (!customerId) {
            toast.error("Please select a customer for this sale order.");
            return;
        }
        if (lines.length === 0) {
            toast.error("The order is empty. Please add at least one product.");
            return;
        }

        // Check stock availability
        for (const line of lines) {
            if (line.quantity > line.stock) {
                toast.error(`We don't have enough stock for ${line.productName}. Only ${line.stock} available.`);
                return;
            }
        }

        setSaving(true);

        try {
            const res = await fetch("/api/sale-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    lines: lines.map((line) => ({
                        productId: line.productId,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        tax: line.tax,
                    })),
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Sale order created successfully! It is now in draft status.");
                router.push("/admin/sale-orders");
            } else {
                toast.error(data.message || "We couldn't create the sale order. Please try again.");
            }
        } catch (err) {
            console.error("Failed to create sale order:", err);
            toast.error("An error occurred while creating the sale order. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/sale-orders">
                    <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    New Sale Order
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Selection */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Customer</h3>
                        </div>
                        <div className="p-6">
                            <div>
                                <Label htmlFor="customer" className="text-black font-bold">Select Customer *</Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white mt-1">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id} className="cursor-pointer">
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Order Lines */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Lines</h3>
                        </div>
                        <div className="p-6">
                            {/* Add Product */}
                            <div className="flex gap-2 mb-4">
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        <SelectValue placeholder="Select a product to add" />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id} className="cursor-pointer">
                                                {product.name} - {formatCurrency(product.salesPrice)} (Stock: {product.stock})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={addLine} className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                                    <Plus size={16} className="mr-1" />
                                    Add
                                </Button>
                            </div>

                            {/* Lines Table */}
                            {lines.length > 0 ? (
                                <div className="border-2 border-black rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-100 border-b-2 border-black">
                                            <TableRow>
                                                <TableHead className="text-black font-bold">Product</TableHead>
                                                <TableHead className="w-24 text-black font-bold">Qty</TableHead>
                                                <TableHead className="w-32 text-black font-bold">Unit Price</TableHead>
                                                <TableHead className="w-24 text-black font-bold">Tax %</TableHead>
                                                <TableHead className="text-right text-black font-bold">Total</TableHead>
                                                <TableHead className="w-12 text-black font-bold"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lines.map((line, index) => (
                                                <TableRow key={line.productId} className="border-b border-black/10">
                                                    <TableCell>
                                                        <div>
                                                            <span className="font-bold">{line.productName}</span>
                                                            <span className="text-xs text-gray-500 font-bold ml-2">(Stock: {line.stock})</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={line.quantity}
                                                            onChange={(e) => updateLine(index, "quantity", parseInt(e.target.value) || 1)}
                                                            min={1}
                                                            max={line.stock}
                                                            className="w-20 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={line.unitPrice}
                                                            onChange={(e) => updateLine(index, "unitPrice", parseFloat(e.target.value) || 0)}
                                                            min={0}
                                                            className="w-28 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={line.tax}
                                                            onChange={(e) => updateLine(index, "tax", parseFloat(e.target.value) || 0)}
                                                            min={0}
                                                            max={100}
                                                            className="w-20 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        {formatCurrency(calculateLineTotal(line))}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                            onClick={() => removeLine(index)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 font-bold border-2 border-dashed border-black rounded-lg bg-gray-50">
                                    No products added yet. Select a product and click Add.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Order Summary</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Subtotal</span>
                                <span className="font-bold">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Tax</span>
                                <span className="font-bold">{formatCurrency(taxAmount)}</span>
                            </div>
                            <hr className="border-black" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 font-bold">
                                <span>Items</span>
                                <span>{lines.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={saving || lines.length === 0 || !customerId}
                            className="w-full bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                            Create Sale Order
                        </Button>
                        <Link href="/admin/sale-orders" className="block">
                            <Button type="button" variant="outline" className="w-full bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
