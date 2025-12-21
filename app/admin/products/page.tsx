"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Loader2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    category: string;
    type: string;
    stock: number;
    salesPrice: number;
    published: boolean;
    status: string; // new/confirmed/archived
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [publishFilter, setPublishFilter] = useState<"all" | "published" | "unpublished">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "new" | "confirmed" | "archived">("all");
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch products from API
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.success) {
                setProducts(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
            toast.error("We encountered an issue loading your products. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesPublish =
            publishFilter === "all"
                ? true
                : publishFilter === "published"
                ? p.published
                : !p.published;
        const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
        return matchesSearch && matchesPublish && matchesStatus;
    });

    const togglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: !currentStatus }),
            });
            const data = await res.json();

            if (data.success) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, published: !currentStatus } : p))
                );
                toast.success(`Product ${!currentStatus ? "published" : "unpublished"} successfully!`);
            } else {
                toast.error(data.message || "We couldn't update the product. Please try again.");
            }
        } catch {
            toast.error("An error occurred while updating the product. Please try again.");
        }
    };

    const changeStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
                );
                toast.success(`Product status changed to ${newStatus} successfully!`);
            } else {
                toast.error(data.message || "We couldn't update the product. Please try again.");
            }
        } catch {
            toast.error("An error occurred while updating the product status. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!deleteProduct) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/products/${deleteProduct.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
                toast.success("Product deleted successfully!");
                setDeleteProduct(null);
            } else {
                toast.error(data.message || "We couldn't delete the product. Please try again.");
            }
        } catch {
            toast.error("An error occurred while deleting the product. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-lystre-brown" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Products
                </span>
                <Link href="/admin/products/new">
                    <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Plus size={18} className="mr-2" />
                        New Product
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) =>
                            setStatusFilter(v as "all" | "new" | "confirmed" | "archived")
                        }
                    >
                        <SelectTrigger className="w-[150px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white rounded-lg">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setPublishFilter("all")}
                            variant={publishFilter === "all" ? "default" : "outline"}
                            size="sm"
                            className={publishFilter === "all" ? "bg-black text-white" : "bg-white"}
                        >
                            All ({products.length})
                        </Button>
                        <Button
                            onClick={() => setPublishFilter("published")}
                            variant={publishFilter === "published" ? "default" : "outline"}
                            size="sm"
                            className={publishFilter === "published" ? "bg-black text-white" : "bg-white"}
                        >
                            Published ({products.filter((p) => p.published).length})
                        </Button>
                        <Button
                            onClick={() => setPublishFilter("unpublished")}
                            variant={publishFilter === "unpublished" ? "default" : "outline"}
                            size="sm"
                            className={publishFilter === "unpublished" ? "bg-black text-white" : "bg-white"}
                        >
                            Unpublished ({products.filter((p) => !p.published).length})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Product Name</TableHead>
                                <TableHead className="font-bold text-black">Category</TableHead>
                                <TableHead className="font-bold text-black">Type</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Stock</TableHead>
                                <TableHead className="font-bold text-black">Sales Price</TableHead>
                                <TableHead className="font-bold text-black">Published</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black">{product.name}</TableCell>
                                    <TableCell className="capitalize">{product.category}</TableCell>
                                    <TableCell className="capitalize">{product.type}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={product.status || "new"}
                                            onValueChange={(v) => changeStatus(product.id, v)}
                                        >
                                            <SelectTrigger className="w-[120px] h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] bg-white rounded-md">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {product.stock < 20 ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-bold border-2 border-red-200">
                                                {product.stock}
                                            </span>
                                        ) : (
                                            <span className="font-bold text-black">{product.stock}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono">{formatCurrency(product.salesPrice)}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={product.published}
                                            onCheckedChange={() => togglePublish(product.id, product.published)}
                                            className="data-[state=checked]:bg-lystre-brown"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-blue-600">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 text-amber-600">
                                                    <Edit size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-50 text-red-600"
                                                onClick={() => setDeleteProduct(product)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="bg-white border-2 border-black p-16 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                        <Package size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No products found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {products.length === 0
                            ? "Create your first product to get started."
                            : "Try adjusting your search or filter."}
                    </p>
                    <Link href="/admin/products/new">
                        <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Plus size={18} className="mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Delete Product</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-black">&quot;{deleteProduct?.name}&quot;</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteProduct(null)} className="border-2 border-black bg-white hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button
                            variant="default"
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
