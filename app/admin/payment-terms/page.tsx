"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface PaymentTerm {
    id: string;
    name: string;
    earlyPaymentDiscount: boolean;
    discountPercentage: number | null;
    discountDays: number | null;
    active: boolean;
}

export default function PaymentTermsPage() {
    const [terms, setTerms] = useState<PaymentTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PaymentTerm | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteItem, setDeleteItem] = useState<PaymentTerm | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        earlyPaymentDiscount: false,
        discountPercentage: 0,
        discountDays: 0,
        active: true,
    });

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            const res = await fetch("/api/payment-terms");
            const data = await res.json();
            if (data.success) {
                setTerms(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch payment terms:", err);
            toast.error("Failed to load payment terms");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            earlyPaymentDiscount: false,
            discountPercentage: 0,
            discountDays: 0,
            active: true,
        });
        setEditing(null);
        setShowForm(false);
    };

    const handleEdit = (term: PaymentTerm) => {
        setEditing(term);
        setFormData({
            name: term.name,
            earlyPaymentDiscount: term.earlyPaymentDiscount,
            discountPercentage: term.discountPercentage || 0,
            discountDays: term.discountDays || 0,
            active: term.active,
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Please enter a term name");
            return;
        }

        setSaving(true);

        try {
            const url = editing ? `/api/payment-terms/${editing.id}` : "/api/payment-terms";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    earlyPaymentDiscount: formData.earlyPaymentDiscount,
                    discountPercentage: formData.earlyPaymentDiscount ? formData.discountPercentage : null,
                    discountDays: formData.earlyPaymentDiscount ? formData.discountDays : null,
                    active: formData.active,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(editing ? "Payment term updated!" : "Payment term created!");
                resetForm();
                fetchTerms();
            } else {
                toast.error(data.message || "Failed to save payment term");
            }
        } catch (err) {
            console.error("Failed to save payment term:", err);
            toast.error("Failed to save payment term");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (term: PaymentTerm) => {
        try {
            const res = await fetch(`/api/payment-terms/${term.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...term,
                    active: !term.active,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setTerms((prev) =>
                    prev.map((t) => (t.id === term.id ? { ...t, active: !t.active } : t))
                );
                toast.success("Payment term updated!");
            } else {
                toast.error(data.message || "Failed to update payment term");
            }
        } catch (err) {
            console.error("Failed to toggle active:", err);
            toast.error("Failed to update payment term");
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/payment-terms/${deleteItem.id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (data.success) {
                setTerms((prev) => prev.filter((t) => t.id !== deleteItem.id));
                toast.success("Payment term deleted!");
                setDeleteItem(null);
            } else {
                toast.error(data.message || "Failed to delete payment term");
            }
        } catch (err) {
            console.error("Failed to delete payment term:", err);
            toast.error("Failed to delete payment term");
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
                    Payment Terms
                </span>
                <Button 
                    onClick={() => setShowForm(true)} 
                    className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                >
                    <Plus size={18} className="mr-2" />
                    New Payment Term
                </Button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                    <h3 className="font-serif text-xl font-bold mb-4 border-b-2 border-black pb-2">
                        {editing ? "Edit Payment Term" : "New Payment Term"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Label htmlFor="termName" className="text-black font-bold">Term Name *</Label>
                            <Input
                                id="termName"
                                value={formData.name}
                                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g., 15 Days, 30 Days"
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-center space-x-2 pt-6">
                            <Checkbox
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData((f) => ({ ...f, active: checked as boolean }))}
                                className="border-2 border-black w-5 h-5"
                            />
                            <Label htmlFor="active" className="text-black font-bold cursor-pointer">Active</Label>
                        </div>
                        <div className="col-span-2 flex items-center space-x-2">
                            <Checkbox
                                id="earlyDiscount"
                                checked={formData.earlyPaymentDiscount}
                                onCheckedChange={(checked) => setFormData((f) => ({ ...f, earlyPaymentDiscount: checked as boolean }))}
                                className="border-2 border-black w-5 h-5"
                            />
                            <Label htmlFor="earlyDiscount" className="text-black font-bold cursor-pointer">Enable Early Payment Discount</Label>
                        </div>
                        {formData.earlyPaymentDiscount && (
                            <>
                                <div>
                                    <Label htmlFor="discountPercent" className="text-black font-bold">Discount (%)</Label>
                                    <Input
                                        id="discountPercent"
                                        type="number"
                                        value={formData.discountPercentage}
                                        onChange={(e) => setFormData((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))}
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discountDays" className="text-black font-bold">If paid within (days)</Label>
                                    <Input
                                        id="discountDays"
                                        type="number"
                                        value={formData.discountDays}
                                        onChange={(e) => setFormData((f) => ({ ...f, discountDays: parseInt(e.target.value) || 0 }))}
                                        min={0}
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                            </>
                        )}
                        {formData.earlyPaymentDiscount && formData.discountPercentage > 0 && formData.discountDays > 0 && (
                            <div className="col-span-2">
                                <Label className="text-black font-bold">Example Preview</Label>
                                <div className="p-4 bg-gray-50 rounded-lg border-2 border-black mt-1">
                                    <p className="text-sm text-gray-500">
                                        Payment Terms: <span className="font-bold text-black">{formData.name}</span>
                                    </p>
                                    <p className="text-sm font-medium text-black">
                                        Early payment discount: <span className="text-green-700">{formData.discountPercentage}%</span> if paid within <span className="text-blue-700">{formData.discountDays} days</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-6">
                        <Button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className="bg-green-600 hover:bg-green-700 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin mr-1" /> : <Check size={16} className="mr-1" />}
                            Save
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={resetForm}
                            className="bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            <X size={16} className="mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Terms Table */}
            {terms.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Term Name</TableHead>
                                <TableHead className="font-bold text-black">Early Discount</TableHead>
                                <TableHead className="font-bold text-black">Discount %</TableHead>
                                <TableHead className="font-bold text-black">Within Days</TableHead>
                                <TableHead className="font-bold text-black">Active</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {terms.map((term) => (
                                <TableRow key={term.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black">{term.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={term.earlyPaymentDiscount ? "default" : "secondary"} className="border border-black">
                                            {term.earlyPaymentDiscount ? "Yes" : "No"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono">{term.discountPercentage ? `${term.discountPercentage}%` : "-"}</TableCell>
                                    <TableCell className="font-mono">{term.discountDays || "-"}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={term.active}
                                            onCheckedChange={() => handleToggleActive(term)}
                                            className="data-[state=checked]:bg-lystre-brown"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-amber-50 text-amber-600 border-2 border-transparent hover:border-black transition-all"
                                                onClick={() => handleEdit(term)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all"
                                                onClick={() => setDeleteItem(term)}
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
                        <Plus size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No payment terms</h2>
                    <p className="text-gray-500 mb-6 font-sans">Create your first payment term.</p>
                    <Button 
                        onClick={() => setShowForm(true)} 
                        className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Payment Term
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Delete Payment Term</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-black">&quot;{deleteItem?.name}&quot;</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteItem(null)} className="border-2 border-black bg-white hover:bg-gray-100">
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
