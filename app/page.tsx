import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            S
                        </div>
                        StockMaster
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="linear-button-primary">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="py-24 md:py-32 container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary">
                            Inventory Management, <br />
                            <span className="text-muted-foreground">Reimagined.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Track stock, manage warehouses, and automate receipts in one place.
                            Simple, powerful, and designed for modern teams.
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Link href="/dashboard">
                                <Button size="lg" className="linear-button-primary h-12 px-8 text-base">
                                    Login to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border hover:bg-secondary">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 bg-secondary/30 border-t border-border">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="linear-card p-8 rounded-2xl space-y-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Real-time Tracking</h3>
                                <p className="text-muted-foreground">
                                    Monitor stock levels across multiple warehouses instantly. Never run out of inventory again.
                                </p>
                            </div>
                            <div className="linear-card p-8 rounded-2xl space-y-4">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Smart Alerts</h3>
                                <p className="text-muted-foreground">
                                    Get notified automatically when stock is low. Set custom thresholds for every product.
                                </p>
                            </div>
                            <div className="linear-card p-8 rounded-2xl space-y-4">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Secure Ledger</h3>
                                <p className="text-muted-foreground">
                                    Every move is recorded in an immutable ledger. Audit trails for complete transparency.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-12 bg-background">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; 2024 StockMaster Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
