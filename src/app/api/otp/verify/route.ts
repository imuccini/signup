import { NextResponse } from "next/server"
import { getOTPProvider } from "@/lib/otp"

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json()

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
        }

        const otpProvider = getOTPProvider()
        const isValid = await otpProvider.verifyOTP(email, code)

        if (isValid) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 })
        }
    } catch (error: any) {
        console.error("Verify OTP API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to verify OTP" },
            { status: 500 }
        )
    }
}
