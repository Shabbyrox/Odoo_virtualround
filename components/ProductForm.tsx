"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProduct } from "@/actions/inventory";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    categoryId: z.string().min(1, "Category is required"),
    unitOfMeasure: z.string().min(1, "Unit of Measure is required"),
    initialStock: z.coerce.number().int().nonnegative().default(0),
    minStockThreshold: z.coerce.number().int().nonnegative().default(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm({ categories }: { categories: { id: string; name: string }[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            initialStock: 0,
            minStockThreshold: 0,
        },
    });

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });

        const result = await createProduct(formData);

        if (result.error) {
            setError(typeof result.error === "string" ? result.error : "Failed to create product");
            setIsSubmitting(false);
        } else {
            router.push("/products");
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Product Name</label>
                    <input
                        {...register("name")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        placeholder="e.g. Wireless Mouse"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">SKU</label>
                    <input
                        {...register("sku")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        placeholder="e.g. WM-001"
                    />
                    {errors.sku && <p className="text-red-500 text-xs">{errors.sku.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <select
                        {...register("categoryId")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white"
                    >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Unit of Measure</label>
                    <input
                        {...register("unitOfMeasure")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        placeholder="e.g. Units, kg, m"
                    />
                    {errors.unitOfMeasure && <p className="text-red-500 text-xs">{errors.unitOfMeasure.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Initial Stock</label>
                    <input
                        type="number"
                        {...register("initialStock")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    {errors.initialStock && <p className="text-red-500 text-xs">{errors.initialStock.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Min Stock Threshold</label>
                    <input
                        type="number"
                        {...register("minStockThreshold")}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    {errors.minStockThreshold && <p className="text-red-500 text-xs">{errors.minStockThreshold.message}</p>}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Product
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
