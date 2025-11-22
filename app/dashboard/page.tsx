import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, ArrowDownLeft, ArrowUpRight, RefreshCw, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { StockMoveType, StockMoveStatus } from "@prisma/client";

export default async function Dashboard() {
  const totalProducts = await db.product.count();

  const products = await db.product.findMany({
    select: { currentStock: true, minStockThreshold: true }
  });
  const lowStockCount = products.filter(p => p.currentStock <= p.minStockThreshold).length;

  const pendingReceipts = await db.stockMove.count({
    where: {
      type: StockMoveType.INCOMING_RECEIPT,
      status: StockMoveStatus.DRAFT
    }
  });

  const pendingDeliveries = await db.stockMove.count({
    where: {
      type: StockMoveType.OUTGOING_DELIVERY,
      status: StockMoveStatus.DRAFT
    }
  });

  const pendingTransfers = await db.stockMove.count({
    where: {
      type: StockMoveType.INTERNAL_TRANSFER,
      status: StockMoveStatus.DRAFT
    }
  });

  const recentMoves = await db.stockMove.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  const kpiData = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      trend: "+12% from last month"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      animate: lowStockCount > 0,
      trend: "Requires attention"
    },
    {
      title: "Pending Receipts",
      value: pendingReceipts.toString(),
      icon: ArrowDownLeft,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      trend: "5 arriving today"
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries.toString(),
      icon: ArrowUpRight,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      trend: "8 to ship"
    },
    {
      title: "Pending Transfers",
      value: pendingTransfers.toString(),
      icon: RefreshCw,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      trend: "Internal logistics"
    },
  ];

  return (
    <div className="space-y-8 p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Real-time overview of your inventory performance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Operational
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiData.map((kpi) => (
          <Card
            key={kpi.title}
            className="light-card border-none hover:shadow-md transition-all duration-300 group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {kpi.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.border} border`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color} ${kpi.animate ? "animate-pulse" : ""}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                {kpi.title === "Low Stock Alerts" ? (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                )}
                <span className={kpi.title === "Low Stock Alerts" ? "text-red-600" : "text-emerald-600"}>
                  {kpi.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 light-card border-none">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMoves.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No recent activity</div>
              ) : (
                recentMoves.map((move) => (
                  <div key={move.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{move.product.name}</span>
                      <span className="text-xs text-slate-500">
                        {move.type.replace(/_/g, " ")} • {new Date(move.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`text-sm font-bold ${move.type === "INCOMING_RECEIPT" ? "text-emerald-600" :
                        move.type === "OUTGOING_DELIVERY" ? "text-red-600" : "text-slate-600"
                      }`}>
                      {move.type === "INCOMING_RECEIPT" ? "+" : move.type === "OUTGOING_DELIVERY" ? "-" : ""}
                      {move.quantity}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 light-card border-none">
          <CardHeader>
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Create Receipt', 'Create Delivery', 'Internal Transfer'].map((action) => (
                <div key={action} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-between group border border-transparent hover:border-gray-200">
                  <span className="text-sm font-medium text-slate-700">{action}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
