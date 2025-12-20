"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Users, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
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

interface Contact {
    id: string;
    name: string;
    type: string;
    email: string;
    mobile?: string;
    city?: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "CUSTOMER" | "VENDOR" | "BOTH">("all");
    const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (data.success) {
                setContacts(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch contacts:", err);
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" ? true : c.type === filter;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = async () => {
        if (!deleteContact) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/contacts/${deleteContact.id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setContacts((prev) => prev.filter((c) => c.id !== deleteContact.id));
                toast.success("Contact deleted!");
                setDeleteContact(null);
            } else {
                toast.error(data.message || "Failed to delete contact");
            }
        } catch {
            toast.error("Failed to delete contact");
        } finally {
            setDeleting(false);
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "CUSTOMER":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 border-2 border-blue-200 font-bold text-xs">
                        CUSTOMER
                    </span>
                );
            case "VENDOR":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 border-2 border-purple-200 font-bold text-xs">
                        VENDOR
                    </span>
                );
            default:
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 border-2 border-gray-200 font-bold text-xs">
                        {type}
                    </span>
                );
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
                    Contacts
                </span>
                <Link href="/admin/contacts/new">
                    <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Plus size={18} className="mr-2" />
                        New Contact
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg"
                        />
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setFilter("all")}
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                            className={filter === "all" ? "bg-black text-white" : "bg-white"}
                        >
                            All ({contacts.length})
                        </Button>
                        <Button
                            onClick={() => setFilter("CUSTOMER")}
                            variant={filter === "CUSTOMER" ? "default" : "outline"}
                            size="sm"
                            className={filter === "CUSTOMER" ? "bg-black text-white" : "bg-white"}
                        >
                            <Users size={16} className="mr-1" />
                            Customers
                        </Button>
                        <Button
                            onClick={() => setFilter("VENDOR")}
                            variant={filter === "VENDOR" ? "default" : "outline"}
                            size="sm"
                            className={filter === "VENDOR" ? "bg-black text-white" : "bg-white"}
                        >
                            <Building size={16} className="mr-1" />
                            Vendors
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contacts Table */}
            {filteredContacts.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Name</TableHead>
                                <TableHead className="font-bold text-black">Type</TableHead>
                                <TableHead className="font-bold text-black">Email</TableHead>
                                <TableHead className="font-bold text-black">Mobile</TableHead>
                                <TableHead className="font-bold text-black">City</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContacts.map((contact) => (
                                <TableRow key={contact.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black">{contact.name}</TableCell>
                                    <TableCell>{getTypeBadge(contact.type)}</TableCell>
                                    <TableCell>{contact.email || "-"}</TableCell>
                                    <TableCell>{contact.mobile || "-"}</TableCell>
                                    <TableCell>{contact.city || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/contacts/${contact.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-blue-600 border-2 border-transparent hover:border-black transition-all">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/contacts/${contact.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 text-amber-600 border-2 border-transparent hover:border-black transition-all">
                                                    <Edit size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all"
                                                onClick={() => setDeleteContact(contact)}
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
                        <Users size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold font-serif mb-2">No contacts found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {contacts.length === 0
                            ? "Add your first contact."
                            : "Try adjusting your search or filter."}
                    </p>
                    <Link href="/admin/contacts/new">
                        <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                            <Plus size={18} className="mr-2" />
                            Add Contact
                        </Button>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteContact} onOpenChange={() => setDeleteContact(null)}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Delete Contact</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-black">&quot;{deleteContact?.name}&quot;</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteContact(null)} className="border-2 border-black bg-white hover:bg-gray-100">
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
