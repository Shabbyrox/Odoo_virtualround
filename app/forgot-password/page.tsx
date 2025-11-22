"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStep("otp");
                setMessage("OTP sent to your email");
            } else {
                const data = await res.json();
                setError(data.message || "Failed to send OTP");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md light-card p-6">
                <CardHeader className="space-y-1 px-0 pt-0">
                    <CardTitle className="text-2xl font-bold text-center text-slate-900">
                        {step === "email" ? "Forgot Password" : "Reset Password"}
                    </CardTitle>
                    <CardDescription className="text-center text-slate-500">
                        {step === "email"
                            ? "Enter your email to receive a verification code"
                            : "Enter the code sent to your email and your new password"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {step === "email" ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none text-slate-700">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white border-gray-200 focus:border-slate-900 focus:ring-slate-900"
                                />
                            </div>
                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                            <div className="space-y-2">
                                <label htmlFor="otp" className="text-sm font-medium leading-none text-slate-700">OTP Code</label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="bg-white border-gray-200 focus:border-slate-900 focus:ring-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="text-sm font-medium leading-none text-slate-700">New Password</label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="bg-white border-gray-200 focus:border-slate-900 focus:ring-slate-900"
                                />
                            </div>
                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center px-0 pb-0">
                    <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
