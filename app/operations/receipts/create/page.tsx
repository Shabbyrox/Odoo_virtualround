import StockMoveForm from "@/components/StockMoveForm";
import { db } from "@/lib/db";
import { StockMoveType } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreateReceiptPage() {
    const products = await db.product.findMany({
        select: { id: true, name: true, sku: true, currentStock: true },
        orderBy: { name: "asc" },
    });

    const locations = await db.location.findMany({
        include: { warehouse: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="space-y-8 p-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/operations/receipts"
                    className="p-2 rounded-lg hover:bg-gray-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        New Receipt
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Receive products from vendors.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <StockMoveForm
                    type={StockMoveType.INCOMING_RECEIPT}
                    products={products}
                    locations={locations}
                    redirectPath="/operations/receipts"
                />
            </div>
        </div>
    );
}
