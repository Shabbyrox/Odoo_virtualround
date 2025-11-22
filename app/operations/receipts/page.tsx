import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { StockMoveType, StockMoveStatus } from "@prisma/client";
import { ArrowDownLeft, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import ValidateButton from "@/components/ValidateButton";

export default async function ReceiptsPage() {
    const receipts = await db.stockMove.findMany({
        where: {
            type: StockMoveType.INCOMING_RECEIPT,
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
                        Receipts
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage incoming inventory from vendors.
                    </p>
                </div>
                <Link href="/operations/receipts/create">
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20">
                        Create Receipt
                    </button>
                </Link>
            </div>

            <div className="grid gap-4">
                {receipts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <ArrowDownLeft className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">No receipts found</h3>
                        <p className="mt-1">Create a new receipt to get started.</p>
                    </div>
                ) : (
                    receipts.map((receipt) => (
                        <Card key={receipt.id} className="light-card border-none hover:shadow-md transition-all duration-200">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${receipt.status === StockMoveStatus.VALIDATED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <ArrowDownLeft size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{receipt.product.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {new Date(receipt.createdAt).toLocaleDateString()} • {receipt.quantity} Units
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {receipt.status === StockMoveStatus.DRAFT && (
                                        <ValidateButton moveId={receipt.id} />
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${receipt.status === StockMoveStatus.VALIDATED
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {receipt.status === StockMoveStatus.VALIDATED ? (
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
