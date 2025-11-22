import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const otp = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.passwordResetToken.create({
            data: {
                email,
                token: otp,
                expiresAt,
            },
        });

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // Send Email
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "StockMaster Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">Password Reset Request</h2>
          <p>You requested a password reset for your StockMaster account.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #0f172a; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
        });

        return NextResponse.json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("OTP Error:", error);
        return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
    }
}
