"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useState, useEffect } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Step2Props {
    onNext: () => void
    onBack: () => void
}

export function Step2Verification({ onNext, onBack }: Step2Props) {
    const { setValue, trigger, watch, formState: { errors } } = useFormContext()
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState("")
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1)
            }, 1000)
        }
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [cooldown])

    const handleResend = async () => {
        try {
            const email = watch("workEmail")
            const response = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                throw new Error("Failed to resend code")
            }

            toast.success("Code sent", {
                description: "A new verification code has been sent to your email.",
            })
            setCooldown(45)
        } catch (error) {
            toast.error("Error", {
                description: "Failed to resend code. Please try again.",
            })
        }
    }

    const handleVerify = async () => {
        const code = watch("verificationCode")
        if (code?.length !== 6) {
            setError("Please enter the complete 6-digit code")
            return
        }

        setIsVerifying(true)
        setError("")

        try {
            const email = watch("workEmail")
            const response = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            })

            if (response.ok) {
                onNext()
            } else {
                const data = await response.json()
                setError(data.error || "Invalid code. Please try again.")
            }
        } catch (error) {
            console.error("Verify OTP Error:", error)
            setError("An error occurred. Please try again.")
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Enter verification code</h1>
                <p className="text-muted-foreground">
                    We sent a code to <span className="font-medium text-foreground">{watch("workEmail")}</span>
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-center py-4">
                    <InputOTP
                        maxLength={6}
                        value={watch("verificationCode")}
                        onChange={(value) => setValue("verificationCode", value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {error && (
                    <p className="text-sm text-center text-red-500 font-medium">{error}</p>
                )}

                <div className="text-center text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={handleResend}
                        disabled={cooldown > 0} // Disable button during cooldown
                    >
                        {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
                    </button>
                </div>
            </div>

            <Button
                type="button"
                className="w-full"
                onClick={handleVerify}
                disabled={isVerifying}
            >
                {isVerifying ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    "Verify"
                )}
            </Button>
        </div>
    )
}
