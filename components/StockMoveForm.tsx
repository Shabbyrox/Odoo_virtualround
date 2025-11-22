"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStockMove } from "@/actions/inventory";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { StockMoveType } from "@prisma/client";

const moveSchema = z.object({
    type: z.nativeEnum(StockMoveType),
    productId: z.string().min(1, "Product is required"),
    sourceLocationId: z.string().optional(),
    destinationLocationId: z.string().optional(),
    quantity: z.coerce.number().int(),
});

type MoveFormValues = z.infer<typeof moveSchema>;

interface StockMoveFormProps {
    type: StockMoveType;
    products: { id: string; name: string; sku: string; currentStock: number }[];
    locations: { id: string; name: string; warehouse: { name: string } }[];
    redirectPath: string;
}

export default function StockMoveForm({ type, products, locations, redirectPath }: StockMoveFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string>("");

    // For Adjustment mode
    const [physicalCount, setPhysicalCount] = useState<number | "">("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<MoveFormValues>({
        resolver: zodResolver(moveSchema),
        defaultValues: {
            type,
            quantity: 0,
        },
    });

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handlePhysicalCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPhysicalCount(val === "" ? "" : Number(val));

        if (type === StockMoveType.ADJUSTMENT && selectedProduct && val !== "") {
            const diff = Number(val) - selectedProduct.currentStock;
            setValue("quantity", diff);
        }
    };

    const onSubmit = async (data: MoveFormValues) => {
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) formData.append(key, value.toString());
        });

        const result = await createStockMove(formData);

        if (result.error) {
            setError(typeof result.error === "string" ? result.error : "Failed to create move");
            setIsSubmitting(false);
        } else {
            router.push(redirectPath);
            router.refresh();
        }
    };

    const showSource = type === StockMoveType.OUTGOING_DELIVERY || type === StockMoveType.INTERNAL_TRANSFER;
    const showDest = type === StockMoveType.INCOMING_RECEIPT || type === StockMoveType.INTERNAL_TRANSFER;
    const isAdjustment = type === StockMoveType.ADJUSTMENT;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <input type="hidden" {...register("type")} value={type} />
            {isAdjustment && <input type="hidden" {...register("quantity")} />}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-slate-700">Product</label>
                    <select
                        {...register("productId")}
                        onChange={(e) => {
                            register("productId").onChange(e);
                            setSelectedProductId(e.target.value);
                            setPhysicalCount("");
                            if (isAdjustment) setValue("quantity", 0);
                        }}
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white"
                    >
                        <option value="">Select a product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                [{p.sku}] {p.name} {isAdjustment ? `(Current: ${p.currentStock})` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
                </div>

                {isAdjustment ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Current Stock</label>
                            <div className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-slate-500">
                                {selectedProduct ? selectedProduct.currentStock : '-'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Physical Count</label>
                            <input
                                type="number"
                                value={physicalCount}
                                onChange={handlePhysicalCountChange}
                                disabled={!selectedProduct}
                                className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                placeholder="Enter actual quantity"
                            />
                            <p className="text-xs text-slate-500">
                                Adjustment: {selectedProduct && physicalCount !== "" ? (Number(physicalCount) - selectedProduct.currentStock) : 0} units
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Quantity</label>
                        <input
                            type="number"
                            {...register("quantity")}
                            className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        />
                        {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
                    </div>
                )}

                {showSource && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Source Location</label>
                        <select
                            {...register("sourceLocationId")}
                            className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white"
                        >
                            <option value="">Select source</option>
                            {locations.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.warehouse.name} / {l.name}
                                </option>
                            ))}
                        </select>
                        {errors.sourceLocationId && <p className="text-red-500 text-xs">{errors.sourceLocationId.message}</p>}
                    </div>
                )}

                {showDest && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Destination Location</label>
                        <select
                            {...register("destinationLocationId")}
                            className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white"
                        >
                            <option value="">Select destination</option>
                            {locations.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.warehouse.name} / {l.name}
                                </option>
                            ))}
                        </select>
                        {errors.destinationLocationId && <p className="text-red-500 text-xs">{errors.destinationLocationId.message}</p>}
                    </div>
                )}
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
                            <Save className="w-4 h-4" /> Create Draft
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
