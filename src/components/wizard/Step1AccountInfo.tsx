"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"

interface Step1Props {
    onNext: () => void
}

export function Step1AccountInfo({ onNext }: Step1Props) {
    const { register, formState: { errors }, trigger, watch, setValue } = useFormContext()
    const [isSimulating, setIsSimulating] = useState(false)
    const [duplicateEmailError, setDuplicateEmailError] = useState<string | null>(null)

    const handleNext = async () => {
        const isValid = await trigger(["firstName", "lastName", "workEmail", "acceptTerms"])
        if (isValid) {
            setIsSimulating(true)
            const email = watch("workEmail")

            try {
                // First, check if email already exists
                const checkResponse = await fetch("/api/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                })

                if (!checkResponse.ok) {
                    throw new Error("Failed to verify email")
                }

                const checkData = await checkResponse.json()

                if (checkData.exists) {
                    // Email already exists - show alert below email field
                    setDuplicateEmailError(checkData.message)
                    setIsSimulating(false)
                    return
                }

                // Clear any previous duplicate email error
                setDuplicateEmailError(null)

                // Email is available, proceed to send OTP
                const response = await fetch("/api/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                })

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || "Failed to send code")
                }

                onNext()
            } catch (error) {
                console.error("Error:", error)
                alert("An error occurred. Please try again.")
            } finally {
                setIsSimulating(false)
            }
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Create a free account</h1>
                <p className="text-muted-foreground">Get started in less than 2 minutes.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        placeholder="John"
                        {...register("firstName")}
                        className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                        <p className="text-xs text-red-500">{errors.firstName.message as string}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        placeholder="Doe"
                        {...register("lastName")}
                        className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                        <p className="text-xs text-red-500">{errors.lastName.message as string}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="workEmail">Work Email</Label>
                <Input
                    id="workEmail"
                    type="email"
                    placeholder="john@company.com"
                    {...register("workEmail")}
                    className={errors.workEmail ? "border-red-500" : ""}
                    onChange={() => setDuplicateEmailError(null)}
                />
                {errors.workEmail && (
                    <p className="text-xs text-red-500">{errors.workEmail.message as string}</p>
                )}
                {duplicateEmailError && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {duplicateEmailError}{" "}
                            <a
                                href="https://dashboard.cloud4wi.com"
                                className="font-medium underline underline-offset-4 hover:text-destructive-foreground/80"
                            >
                                Log in here
                            </a>
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="terms"
                    onCheckedChange={(checked) => setValue("acceptTerms", checked)}
                    {...register("acceptTerms")}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept Cloud4Wi&apos;s <a href="https://cloud4wi.ai/cloud4wi-privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms & Conditions</a>
                </Label>
            </div>
            {errors.acceptTerms && (
                <p className="text-xs text-red-500">{errors.acceptTerms.message as string}</p>
            )}

            <Button
                type="button"
                className="w-full"
                onClick={handleNext}
                disabled={isSimulating}
            >
                {isSimulating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                Already have an account? <a href="https://dashboard.cloud4wi.com" className="text-primary hover:underline">Log in</a>
            </p>
        </div>
    )
}
