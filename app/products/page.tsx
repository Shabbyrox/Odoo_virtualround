import { db } from "@/lib/db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";

    const products = await db.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { sku: { contains: query, mode: "insensitive" } },
            ],
        },
        include: {
            category: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    async function searchProducts(formData: FormData) {
        "use server";
        const query = formData.get("q")?.toString();
        redirect(`/products?q=${query || ""}`);
    }

    return (
        <div className="space-y-8 p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
                    <p className="text-slate-500 mt-1">
                        Manage your product inventory and stock levels.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white border-gray-200 text-slate-700 hover:bg-gray-50">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="light-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
                    <form action={searchProducts} className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            name="q"
                            type="search"
                            placeholder="Search by name or SKU..."
                            className="pl-10 bg-white border-gray-200 focus:border-slate-900 focus:ring-slate-900"
                            defaultValue={query}
                        />
                    </form>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-gray-100">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>

                <div className="relative w-full overflow-auto bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-[300px] text-slate-500 font-medium">Name</TableHead>
                                <TableHead className="text-slate-500 font-medium">SKU</TableHead>
                                <TableHead className="text-slate-500 font-medium">Category</TableHead>
                                <TableHead className="text-slate-500 font-medium">Stock</TableHead>
                                <TableHead className="text-right text-slate-500 font-medium">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableCell colSpan={5} className="text-center h-32 text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 opacity-20" />
                                            <p>No products found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => {
                                    const isLowStock = product.currentStock <= product.minStockThreshold;
                                    return (
                                        <TableRow key={product.id} className="hover:bg-gray-50 border-gray-100 transition-colors group">
                                            <TableCell className="font-medium text-slate-900">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-slate-600 font-normal">
                                                    {product.category.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-slate-900">{product.currentStock}</span>
                                                <span className="text-slate-500 text-xs ml-1">{product.unitOfMeasure}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isLowStock ? (
                                                    <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100">
                                                        Low Stock
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100">
                                                        In Stock
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
