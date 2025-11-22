import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
    const products = await db.product.findMany({
        orderBy: {
            name: 'asc',
        },
        include: {
            category: true
        }
    });

    return (
        <div className="space-y-8 p-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Products
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage your product catalog and stock levels.
                    </p>
                </div>
                <Link href="/products/create">
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20">
                        Create Product
                    </button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900">No products found</h3>
                        <p className="mt-1">Create a new product to get started.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <Card key={product.id} className="light-card border-none hover:shadow-md transition-all duration-200 group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <Package size={24} />
                                    </div>
                                    {product.currentStock <= product.minStockThreshold && (
                                        <div className="text-red-500" title="Low Stock">
                                            <AlertTriangle size={20} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{product.name}</h3>
                                <p className="text-sm text-slate-500 mb-4">{product.sku}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Stock</p>
                                        <p className={`font-bold text-lg ${product.currentStock <= product.minStockThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                                            {product.currentStock} <span className="text-xs font-normal text-slate-500">{product.unitOfMeasure}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Category</p>
                                        <p className="text-sm font-medium text-slate-700">{product.category.name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
