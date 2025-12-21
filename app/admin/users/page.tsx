"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Loader2, Users, UserCheck, UserX } from "lucide-react";
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

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    contact?: {
        name: string;
        mobile?: string;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/contacts");
            const data = await res.json();

            if (data.success) {
                const transformedUsers: User[] = (data.data || []).map(
                    (contact: {
                        id: string;
                        name: string;
                        email: string;
                        type: string;
                        mobile?: string;
                        createdAt: string;
                    }) => ({
                        id: contact.id,
                        name: contact.name,
                        email: contact.email,
                        role: contact.type === "VENDOR" ? "INTERNAL" : "PORTAL",
                        active: true,
                        createdAt: contact.createdAt,
                        contact: {
                            name: contact.name,
                            mobile: contact.mobile,
                        },
                    })
                );
                setUsers(transformedUsers);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
            toast.error("We encountered an issue loading the user list. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "INTERNAL":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-200 font-bold text-xs">
                        Admin
                    </span>
                );
            case "PORTAL":
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 border-2 border-purple-200 font-bold text-xs">
                        Customer
                    </span>
                );
            default:
                return (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 border-2 border-gray-200 font-bold text-xs">
                        {role}
                    </span>
                );
        }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/contacts/${deleteUser.id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
                toast.success("User deleted successfully!");
                setDeleteUser(null);
            } else {
                toast.error(data.message || "We couldn't delete the user. Please try again.");
            }
        } catch {
            toast.error("An error occurred while deleting. Please try again.");
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
                    Users
                </span>
                <Link href="/admin/register">
                    <Button className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                        <Plus size={18} className="mr-2" />
                        New Admin User
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono">{users.length}</p>
                            <p className="text-sm text-gray-500 font-bold">Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <UserCheck className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono">{users.filter((u) => u.role === "INTERNAL").length}</p>
                            <p className="text-sm text-gray-500 font-bold">Admin Users</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <UserX className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-mono">{users.filter((u) => u.role === "PORTAL").length}</p>
                            <p className="text-sm text-gray-500 font-bold">Portal Users</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-wrap items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg"
                        />
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setRoleFilter("all")}
                            variant={roleFilter === "all" ? "default" : "outline"}
                            size="sm"
                            className={roleFilter === "all" ? "bg-black text-white" : "bg-white"}
                        >
                            All
                        </Button>
                        <Button
                            onClick={() => setRoleFilter("INTERNAL")}
                            variant={roleFilter === "INTERNAL" ? "default" : "outline"}
                            size="sm"
                            className={roleFilter === "INTERNAL" ? "bg-black text-white" : "bg-white"}
                        >
                            Admins
                        </Button>
                        <Button
                            onClick={() => setRoleFilter("PORTAL")}
                            variant={roleFilter === "PORTAL" ? "default" : "outline"}
                            size="sm"
                            className={roleFilter === "PORTAL" ? "bg-black text-white" : "bg-white"}
                        >
                            Customers
                        </Button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length > 0 ? (
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black hover:bg-transparent">
                                <TableHead className="font-bold text-black">Name</TableHead>
                                <TableHead className="font-bold text-black">Email</TableHead>
                                <TableHead className="font-bold text-black">Role</TableHead>
                                <TableHead className="font-bold text-black">Mobile</TableHead>
                                <TableHead className="font-bold text-black">Status</TableHead>
                                <TableHead className="font-bold text-black">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-b border-black/10 hover:bg-gray-50/50">
                                    <TableCell className="font-bold text-black">{user.name}</TableCell>
                                    <TableCell>{user.email || "-"}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{user.contact?.mobile || "-"}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full border-2 font-bold text-xs ${
                                                user.active
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : "bg-red-100 text-red-700 border-red-200"
                                            }`}
                                        >
                                            {user.active ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/contacts/${user.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-blue-600 border-2 border-transparent hover:border-black transition-all">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/contacts/${user.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 text-amber-600 border-2 border-transparent hover:border-black transition-all">
                                                    <Edit size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black transition-all"
                                                onClick={() => setDeleteUser(user)}
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
                    <h2 className="text-xl font-bold font-serif mb-2">No users found</h2>
                    <p className="text-gray-500 mb-6 font-sans">
                        {users.length === 0
                            ? "Users will appear here as they register."
                            : "Try adjusting your search or filter."}
                    </p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Delete User</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-black">&quot;{deleteUser?.name}&quot;</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteUser(null)} className="border-2 border-black bg-white hover:bg-gray-100">
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
