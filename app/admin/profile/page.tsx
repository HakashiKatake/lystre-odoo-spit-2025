"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Save, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [contactId, setContactId] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();

            if (data.success && data.data) {
                setContactId(data.data.contactId);
                setFormData({
                    name: data.data.contact?.name || data.data.name || "",
                    email: data.data.contact?.email || data.data.email || "",
                    mobile: data.data.contact?.mobile || "",
                    street: data.data.contact?.street || "",
                    city: data.data.contact?.city || "",
                    state: data.data.contact?.state || "",
                    pincode: data.data.contact?.pincode || "",
                });
            } else {
                toast.error("Please login to continue");
                router.push("/admin/login");
            }
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Please enter your name");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    mobile: formData.mobile,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error("Please fill in all password fields");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setChangingPassword(true);

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Password changed successfully!");
                setShowPasswordDialog(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.message || "Failed to change password");
            }
        } catch {
            toast.error("Failed to change password");
        } finally {
            setChangingPassword(false);
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
        <div className="max-w-4xl mx-auto animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black mb-6">
                My Profile
            </span>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-blue-50">
                            <div className="flex items-center gap-2">
                                <User size={20} className="text-blue-700" />
                                <h3 className="font-bold text-lg font-serif">Personal Information</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name" className="text-black font-bold">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Your name"
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-black font-bold">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="bg-gray-100 border-2 border-black shadow-none mt-1 opacity-70"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="mobile" className="text-black font-bold">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData((f) => ({ ...f, mobile: e.target.value }))}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-green-50">
                            <div className="flex items-center gap-2">
                                <MapPin size={20} className="text-green-700" />
                                <h3 className="font-bold text-lg font-serif">Address</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="street" className="text-black font-bold">Street Address</Label>
                                <Input
                                    id="street"
                                    value={formData.street}
                                    onChange={(e) => setFormData((f) => ({ ...f, street: e.target.value }))}
                                    placeholder="Street address"
                                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city" className="text-black font-bold">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                                        placeholder="City"
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state" className="text-black font-bold">State</Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => setFormData((f) => ({ ...f, state: e.target.value }))}
                                        placeholder="State"
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pincode" className="text-black font-bold">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData((f) => ({ ...f, pincode: e.target.value }))}
                                        placeholder="Pincode"
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-amber-50">
                            <h3 className="font-bold text-lg font-serif">Actions</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Save Changes
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                                onClick={() => setShowPasswordDialog(true)}
                            >
                                <Lock size={16} className="mr-2" />
                                Change Password
                            </Button>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-4 border-b-2 border-black bg-gray-100">
                            <h3 className="font-bold text-lg font-serif">Account</h3>
                        </div>
                        <div className="p-6 space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-lg shadow-sm">
                                <Mail size={16} className="text-gray-500" />
                                <span className="font-bold">{formData.email}</span>
                            </div>
                            {formData.mobile && (
                                <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-lg shadow-sm">
                                    <Phone size={16} className="text-gray-500" />
                                    <span className="font-bold">{formData.mobile}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl font-bold">Change Password</DialogTitle>
                        <DialogDescription className="font-sans text-gray-600">
                            Enter your current password and a new password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="currentPassword" className="text-black font-bold">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="newPassword" className="text-black font-bold">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword" className="text-black font-bold">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="border-2 border-black bg-white hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="bg-lystre-brown text-white hover:bg-[#6D5E52] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Change Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
