import ProductForm from "@/components/ProductForm";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreateProductPage() {
    const categories = await db.category.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="space-y-8 p-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/products"
                    className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        New Product
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Add a new item to your inventory.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <ProductForm categories={categories} />
            </div>
        </div>
    );
}
