import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { StockMoveType, StockMoveStatus } from "@prisma/client";
import { ClipboardList, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";

export default async function AdjustmentsPage() {
    const adjustments = await db.stockMove.findMany({
        where: {
            type: StockMoveType.ADJUSTMENT,
        },
        include: {
            product: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-8 p-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Inventory Adjustments
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Correct stock levels based on physical counts.
                    </p>
                </div>
                <Link href="/operations/adjustments/create">
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20">
                        Create Adjustment
                    </button>
                </Link>
            </div>

            <div className="grid gap-4">
                {adjustments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">No adjustments found</h3>
                        <p className="mt-1">Create a new adjustment to get started.</p>
                    </div>
                ) : (
                    adjustments.map((adjustment) => (
                        <Card key={adjustment.id} className="light-card border-none hover:shadow-md transition-all duration-200">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${adjustment.status === StockMoveStatus.VALIDATED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <ClipboardList size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{adjustment.product.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {new Date(adjustment.createdAt).toLocaleDateString()} • {adjustment.quantity > 0 ? '+' : ''}{adjustment.quantity} Units
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {adjustment.status === StockMoveStatus.DRAFT && (
                                        <ValidateButton moveId={adjustment.id} />
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${adjustment.status === StockMoveStatus.VALIDATED
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {adjustment.status === StockMoveStatus.VALIDATED ? (
                                            <>
                                                <CheckCircle2 size={12} /> Validated
                                            </>
                                        ) : (
                                            <>
                                                <Clock size={12} /> Draft
                                            </>
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
