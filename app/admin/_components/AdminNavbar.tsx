"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    ChevronDown,
    LogOut,
    User,
    Settings,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
    name: string;
    email: string;
    role: string;
}

export function AdminNavbar() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.success && data.data) {
                    setUser({
                        name: data.data.name || data.data.email.split("@")[0],
                        email: data.data.email,
                        role: data.data.role,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            toast.success("Logged out successfully");
            router.push("/admin/login");
        } catch {
            toast.error("Failed to logout");
        }
    };

    // Get user initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="h-20 bg-white border-b-2 border-black flex items-center justify-between px-6 md:px-10 z-40 sticky top-0">
             {/* Left side - Breadcrumb or Title (Optional, leaving empty for now based on design) */}
            <div className="flex items-center gap-4">
                 <h1 className="text-xl font-bold font-serif text-black hidden md:block">
                    Dashboard
                 </h1>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-10 h-10 bg-lystre-brown text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-black">
                            {user ? getInitials(user.name) : "U"}
                        </div>
                        <div className="hidden md:block text-left">
                             <p className="text-sm font-bold text-black leading-none">{user?.name || "Loading..."}</p>
                             <p className="text-xs text-gray-500 mt-1">{user?.role || "Admin"}</p>
                        </div>
                        <ChevronDown size={16} className="text-black" />
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                        <div className="p-4 border-b-2 border-black bg-gray-50">
                            <p className="text-sm font-bold text-black">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                             <Link
                                href="/admin/profile"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#FFF9C4] hover:text-black hover:border-2 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md transition-all"
                            >
                                <User size={16} />
                                My Profile
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#FFF9C4] hover:text-black hover:border-2 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md transition-all"
                            >
                                <Settings size={16} />
                                Settings
                            </Link>
                            <hr className="my-2 border-black/10" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-2 hover:border-red-600 hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] rounded-md w-full text-left transition-all"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
