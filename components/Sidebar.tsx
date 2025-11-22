"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Box,
    Truck,
    ClipboardList,
    PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Products", icon: Package, href: "/products" },
    {
        name: "Operations",
        icon: ArrowRightLeft,
        href: "/operations",
        subItems: [
            { name: "Receipts", href: "/operations/receipts", icon: Box },
            { name: "Deliveries", href: "/operations/deliveries", icon: Truck },
            { name: "Transfers", href: "/operations/transfers", icon: ArrowRightLeft },
            { name: "Adjustments", href: "/operations/adjustments", icon: ClipboardList },
        ],
    },
    { name: "Reports", icon: PieChart, href: "/reports" },
    { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>("Operations");

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleDropdown = (name: string) => {
        if (isCollapsed) setIsCollapsed(false);
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <motion.div
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-screen bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm"
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-center border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col"
                        >
                            <span className="font-bold text-lg tracking-tight text-slate-900">StockMaster</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Inventory AI</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 bg-white border border-gray-200 text-slate-400 p-1.5 rounded-full shadow-sm hover:text-slate-900 hover:border-slate-300 transition-all z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    const isParentActive = pathname.startsWith(item.href + "/");
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    return (
                        <div key={item.name} className="mb-1">
                            <div
                                onClick={() => hasSubItems ? toggleDropdown(item.name) : null}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                                    isActive || (hasSubItems && isParentActive)
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                        : "text-slate-600 hover:bg-gray-100 hover:text-slate-900"
                                )}
                            >
                                {item.href && !hasSubItems ? (
                                    <Link href={item.href} className="flex items-center gap-3 w-full z-10">
                                        <item.icon size={20} strokeWidth={2} />
                                        {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3 w-full justify-between z-10">
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} strokeWidth={2} />
                                            {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && hasSubItems && (
                                            <ChevronRight
                                                size={16}
                                                className={cn("transition-transform duration-200", openDropdown === item.name ? "rotate-90" : "")}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Submenu */}
                            <AnimatePresence>
                                {!isCollapsed && hasSubItems && openDropdown === item.name && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden ml-4 pl-4 border-l border-gray-200 space-y-1 mt-1"
                                    >
                                        {item.subItems.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                                    pathname === sub.href
                                                        ? "text-slate-900 bg-gray-100 font-medium"
                                                        : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                                                )}
                                            >
                                                <sub.icon size={16} strokeWidth={2} />
                                                <span>{sub.name}</span>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Footer / Profile */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-sm ring-2 ring-white">
                        JD
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 overflow-hidden"
                        >
                            <p className="text-sm font-semibold text-slate-900 truncate">John Doe</p>
                            <p className="text-xs text-slate-500 truncate">Warehouse Manager</p>
                        </motion.div>
                    )}
                    {!isCollapsed && (
                        <button className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
