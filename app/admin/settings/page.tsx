"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, FileText, Bell, Shield, Database } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Switch } from "@/components/ui/switch";

interface SettingsData {
    id?: string;
    automaticInvoicing: boolean;
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        automaticInvoicing: false,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();

            if (data.success && data.data) {
                setSettings({
                    id: data.data.id,
                    automaticInvoicing: data.data.automaticInvoicing || false,
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    automaticInvoicing: settings.automaticInvoicing,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Settings saved successfully!");
            } else {
                toast.error(data.message || "Failed to save settings");
            }
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleAutomaticInvoicing = async (checked: boolean) => {
        setSettings((s) => ({ ...s, automaticInvoicing: checked }));

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    automaticInvoicing: checked,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(checked ? "Automatic invoicing enabled" : "Automatic invoicing disabled");
            } else {
                // Revert on failure
                setSettings((s) => ({ ...s, automaticInvoicing: !checked }));
                toast.error(data.message || "Failed to update setting");
            }
        } catch {
            setSettings((s) => ({ ...s, automaticInvoicing: !checked }));
            toast.error("Failed to update setting");
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
            <div className="flex items-center gap-3 mb-6">
                <span className="inline-block px-4 py-2 rounded-lg bg-[#A1887F] text-white text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans border-2 border-black">
                    Settings
                </span>
            </div>

            <div className="space-y-6">
                {/* Invoicing Settings */}
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-blue-50">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText size={20} className="text-blue-700" />
                            <h3 className="font-bold text-lg font-serif">Invoicing</h3>
                        </div>
                        <p className="text-sm text-gray-600 font-sans">
                            Configure automatic invoice generation and billing settings
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                                <p className="font-bold text-black">Automatic Invoice Generation</p>
                                <p className="text-sm text-gray-500 font-bold">
                                    Automatically create invoices when sale orders are confirmed
                                </p>
                            </div>
                            <Switch
                                checked={settings.automaticInvoicing}
                                onCheckedChange={toggleAutomaticInvoicing}
                                className="data-[state=checked]:bg-lystre-brown border-2 border-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications (Placeholder) */}
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-amber-50">
                        <div className="flex items-center gap-2 mb-1">
                            <Bell size={20} className="text-amber-700" />
                            <h3 className="font-bold text-lg font-serif">Notifications</h3>
                        </div>
                        <p className="text-sm text-gray-600 font-sans">
                            Configure email and system notifications
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                                <p className="font-bold text-black">Order Notifications</p>
                                <p className="text-sm text-gray-500 font-bold">
                                    Receive email when new orders are placed
                                </p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-lystre-brown border-2 border-black" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                                <p className="font-bold text-black">Low Stock Alerts</p>
                                <p className="text-sm text-gray-500 font-bold">
                                    Get notified when product stock falls below threshold
                                </p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-lystre-brown border-2 border-black" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                                <p className="font-bold text-black">Payment Reminders</p>
                                <p className="text-sm text-gray-500 font-bold">
                                    Send automatic payment reminders for overdue invoices
                                </p>
                            </div>
                            <Switch className="data-[state=checked]:bg-lystre-brown border-2 border-black" />
                        </div>
                    </div>
                </div>

                {/* Security (Placeholder) */}
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-red-50">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={20} className="text-red-700" />
                            <h3 className="font-bold text-lg font-serif">Security</h3>
                        </div>
                        <p className="text-sm text-gray-600 font-sans">
                            Security and access control settings
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                                <p className="font-bold text-black">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500 font-bold">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                            <Button variant="outline" size="sm" disabled className="opacity-50 border-2 border-black font-bold">
                                Coming Soon
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div>
                                <p className="font-bold text-black">Session Timeout</p>
                                <p className="text-sm text-gray-500 font-bold">
                                    Automatically log out after period of inactivity
                                </p>
                            </div>
                            <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full border-2 border-black">30 minutes</span>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-4 border-b-2 border-black bg-gray-100">
                        <div className="flex items-center gap-2">
                            <Database size={20} className="text-gray-700" />
                            <h3 className="font-bold text-lg font-serif">System Information</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <p className="text-gray-500 font-bold mb-1">Application</p>
                                <p className="font-bold text-lg">ApparelDesk ERP</p>
                            </div>
                            <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <p className="text-gray-500 font-bold mb-1">Version</p>
                                <p className="font-bold text-lg">1.0.0</p>
                            </div>
                            <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <p className="text-gray-500 font-bold mb-1">Environment</p>
                                <p className="font-bold text-lg">Development</p>
                            </div>
                            <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <p className="text-gray-500 font-bold mb-1">Database</p>
                                <p className="font-bold text-lg">PostgreSQL</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
