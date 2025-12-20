"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Package,
    CreditCard,
    Tags,
    Users,
    BarChart3,
    ChevronDown,
    Menu,
    LogOut,
    ChevronRight,
    Circle,
    LayoutDashboard
} from "lucide-react";
import { useState } from "react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    subItems?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    {
        label: "Billing & Payments",
        href: "/admin/billing", // Changed to generic billing since subitems exist
        icon: CreditCard,
        subItems: [
            { label: "Sale Orders", href: "/admin/sale-orders" }, // Updated href to match existing routes
            { label: "Customer Invoices", href: "/admin/invoices" }, // Updated href
            { label: "Customer Payments", href: "/admin/payments?type=customer" }, // Updated href
            { label: "Purchase Orders", href: "/admin/purchase-orders" }, // Updated href
            { label: "Vendor Bills", href: "/admin/vendor-bills" }, // Updated href
            { label: "Vendor Payments", href: "/admin/payments?type=vendor" }, // Updated href
        ]
    },
    {
        label: "Terms & Offers",
        href: "/admin/offers",
        icon: Tags,
        subItems: [
            { label: "Payment Terms", href: "/admin/payment-terms" }, // Updated href
            { label: "Discount Offers", href: "/admin/discount-offers" }, // Updated href
        ]
    },
    {
        label: "Users & Contacts",
        href: "/admin/users",
        icon: Users,
        subItems: [
            { label: "Users", href: "/admin/users" }, // Updated href
            { label: "Contacts", href: "/admin/contacts" }, // Updated href
        ]
    },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>("Billing & Payments"); 

    const toggleExpand = (label: string) => {
        setExpandedItem(expandedItem === label ? null : label);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="md:hidden fixed z-[60] bottom-4 right-4 p-4 bg-lystre-brown text-white rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-black transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="h-20 flex items-center justify-center border-b-2 border-black">
                    <Link href="/admin" className="text-3xl font-serif font-bold text-black tracking-wide">
                        Lystré
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        // Active if path matches, OR if a sub-item matches
                        const isMainActive = pathname === item.href; 
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isExpanded = expandedItem === item.label;

                        // Check if any child is active
                        const isChildActive = item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href));

                        return (
                            <div key={item.label}>
                                <div
                                    onClick={() => hasSubItems ? toggleExpand(item.label) : null}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 text-sm transition-all duration-200 group border-2 cursor-pointer relative",
                                        (isMainActive || (hasSubItems && isExpanded))
                                            ? "bg-transparent border-transparent"
                                            : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    )}
                                >
                                    {!hasSubItems ? (
                                        <Link href={item.href} className="absolute inset-0" />
                                    ) : null}

                                    <Icon
                                        size={20}
                                        strokeWidth={1.5}
                                        className={cn(
                                            "transition-colors",
                                            (isMainActive || isChildActive) ? "text-black" : "text-lystre-brown"
                                        )}
                                    />
                                    <span className={cn("font-sans tracking-wide font-bold", (isMainActive || isChildActive) ? "text-black" : "text-black")}>
                                        {item.label}
                                    </span>

                                    {hasSubItems && (
                                        <ChevronDown
                                            size={16}
                                            className={cn(
                                                "ml-auto transition-transform duration-200",
                                                isExpanded ? "rotate-180" : ""
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Sub Items */}
                                {hasSubItems && isExpanded && (
                                    <div className="mt-1 ml-4 space-y-1 border-l-2 border-black/10 pl-4 py-2">
                                        {item.subItems!.map((sub) => {
                                            const isSubActive = pathname === sub.href;
                                            return (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    className={cn(
                                                        "block px-4 py-2 text-sm rounded-lg transition-colors font-sans",
                                                        isSubActive
                                                            ? "bg-[#FFF9C4] text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                                                            : "text-gray-600 hover:text-black hover:bg-gray-100"
                                                    )}
                                                >
                                                    {sub.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t-2 border-black bg-[#F8F3F0]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-lystre-brown text-white flex items-center justify-center font-serif text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            PA
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-black truncate font-serif">Prince Admin</p>
                            <p className="text-xs text-gray-600 truncate">admin@lystre.com</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
