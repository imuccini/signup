"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

interface Step3Props {
    onNext: () => void
    onBack: () => void
}

export function Step3Password({ onNext, onBack }: Step3Props) {
    const { register, formState: { errors }, trigger } = useFormContext()

    const handleNext = async () => {
        const isValid = await trigger(["password", "confirmPassword"])
        if (isValid) {
            onNext()
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Get Started</h1>
                <p className="text-muted-foreground">Create a secure password for your account.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Create Password</Label>
                    <Input
                        id="password"
                        type="password"
                        {...register("password")}
                        className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message as string}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters, include an uppercase letter and a number.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message as string}</p>
                    )}
                </div>
            </div>

            <Button
                type="button"
                className="w-full"
                onClick={handleNext}
            >
                Set Password
            </Button>
        </div>
    )
}
