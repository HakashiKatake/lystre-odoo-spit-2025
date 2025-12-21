"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, User, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Contact {
    id: string;
    name: string;
    email: string | null;
    mobile: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    type: "CUSTOMER" | "VENDOR" | "BOTH";
    createdAt: string;
}

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Contact>>({});

    useEffect(() => {
        fetchContact();
    }, [params.id]);

    const fetchContact = async () => {
        try {
            const res = await fetch(`/api/contacts/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setContact(data.data);
                setFormData(data.data);
            } else {
                toast.error("We couldn't find the contact you were looking for.");
                router.push("/admin/contacts");
            }
        } catch (err) {
            console.error("Failed to fetch contact:", err);
            toast.error("We encountered an issue loading the contact details. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const res = await fetch(`/api/contacts/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    type: formData.type,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Contact updated successfully! Your changes have been saved.");
                setContact(data.data);
                setIsEditing(false);
            } else {
                toast.error(data.message || "We couldn't update the contact information. Please try again.");
            }
        } catch (err) {
            console.error("Failed to save contact:", err);
            toast.error("An error occurred while saving the contact. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const getTypeVariant = (type: string) => {
        switch (type) {
            case "CUSTOMER":
                return "default";
            case "VENDOR":
                return "secondary";
            case "BOTH":
                return "outline";
            default:
                return "outline";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A1887F]" />
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 font-bold">Contact not found</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/contacts">
                        <Button variant="ghost" size="icon" className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-serif">{contact.name}</h1>
                            <Badge className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-md bg-white text-black hover:bg-gray-100 uppercase tracking-widest">
                                {contact.type}
                            </Badge>
                        </div>
                        <p className="text-gray-500 font-bold">{contact.email || "No email"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => {
                                setIsEditing(false);
                                setFormData(contact);
                            }} className="bg-white hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#A1887F] text-white hover:bg-[#8D766E] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="bg-[#A1887F] text-white hover:bg-[#8D766E] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            Edit Contact
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                                <User size={20} />
                                Contact Information
                            </h3>
                        </div>
                        <div className="p-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name" className="text-black font-bold">Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name || ""}
                                                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                                                placeholder="Contact name"
                                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="type" className="text-black font-bold">Type *</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value) => setFormData((f) => ({ ...f, type: value as "CUSTOMER" | "VENDOR" | "BOTH" }))}
                                            >
                                                <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                    <SelectItem value="VENDOR">Vendor</SelectItem>
                                                    <SelectItem value="BOTH">Both</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-black font-bold">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                                                placeholder="email@example.com"
                                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="mobile" className="text-black font-bold">Mobile</Label>
                                            <Input
                                                id="mobile"
                                                value={formData.mobile || ""}
                                                onChange={(e) => setFormData((f) => ({ ...f, mobile: e.target.value }))}
                                                placeholder="+91 98765 43210"
                                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Name</p>
                                        <p className="font-medium">{contact.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Type</p>
                                        <Badge className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100 text-black hover:bg-gray-200 mt-1">
                                            {contact.type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Email</p>
                                        <p className="font-medium">{contact.email || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Mobile</p>
                                        <p className="font-medium">{contact.mobile || "-"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                                <MapPin size={20} />
                                Address
                            </h3>
                        </div>
                        <div className="p-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="street" className="text-black font-bold">Street Address</Label>
                                        <Input
                                            id="street"
                                            value={formData.street || ""}
                                            onChange={(e) => setFormData((f) => ({ ...f, street: e.target.value }))}
                                            placeholder="123 Main Street"
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="city" className="text-black font-bold">City</Label>
                                            <Input
                                                id="city"
                                                value={formData.city || ""}
                                                onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                                                placeholder="Mumbai"
                                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state" className="text-black font-bold">State</Label>
                                            <Input
                                                id="state"
                                                value={formData.state || ""}
                                                onChange={(e) => setFormData((f) => ({ ...f, state: e.target.value }))}
                                                placeholder="Maharashtra"
                                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="pincode" className="text-black font-bold">Pincode</Label>
                                            <Input
                                                id="pincode"
                                                value={formData.pincode || ""}
                                                onChange={(e) => setFormData((f) => ({ ...f, pincode: e.target.value }))}
                                                placeholder="400001"
                                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {contact.street || contact.city || contact.state ? (
                                        <p className="font-medium">
                                            {[contact.street, contact.city, contact.state, contact.pincode].filter(Boolean).join(", ")}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 italic font-bold">No address set</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <h3 className="font-bold text-lg font-serif">Quick Info</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#A1887F] rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <User className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-bold">Type</p>
                                    <p className="font-medium">{contact.type}</p>
                                </div>
                            </div>
                            {contact.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Mail className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Email</p>
                                        <p className="font-medium">{contact.email}</p>
                                    </div>
                                </div>
                            )}
                            {contact.mobile && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Phone className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold">Mobile</p>
                                        <p className="font-medium">{contact.mobile}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
