"use client";

import { useState } from "react";
import { validateMove } from "@/actions/inventory";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ValidateButton({ moveId }: { moveId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleValidate = async () => {
        setIsLoading(true);
        try {
            const result = await validateMove(moveId);
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error("Validation failed", error);
            alert("Failed to validate move");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleValidate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <CheckCircle2 size={12} />
            )}
            Validate
        </button>
    );
}
