import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        const tokenRecord = await db.passwordResetToken.findFirst({
            where: {
                email,
                token: otp,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!tokenRecord) {
            return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        // Clean up used token
        await db.passwordResetToken.delete({ where: { id: tokenRecord.id } });

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
