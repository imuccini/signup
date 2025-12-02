import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Mock check: reject duplicate@cloud4wi.com
        if (email.toLowerCase() === "duplicate@cloud4wi.com") {
            return NextResponse.json(
                { exists: true, message: "This email is already associated with an existing account." },
                { status: 200 }
            )
        }

        // For all other emails, return that they don't exist
        return NextResponse.json(
            { exists: false },
            { status: 200 }
        )
    } catch (error) {
        console.error("Check email error:", error)
        return NextResponse.json(
            { error: "Failed to check email" },
            { status: 500 }
        )
    }
}
