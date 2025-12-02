import { NextResponse } from "next/server"
import { getOTPProvider } from "@/lib/otp"

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const otpProvider = getOTPProvider()
        await otpProvider.sendOTP(email)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Send OTP API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to send OTP" },
            { status: 500 }
        )
    }
}
