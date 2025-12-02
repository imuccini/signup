"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Step4Props {
    onBack: () => void
}

export function Step4BusinessInfo({ onBack }: Step4Props) {
    const { register, watch, setValue, formState: { errors } } = useFormContext()
    const [isLoading, setIsLoading] = useState(true)
    const workEmail = watch("workEmail")

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!workEmail) return

            // Basic email validation before calling API
            if (!workEmail.includes("@")) return

            try {
                const response = await fetch(`/api/enrich?email=${encodeURIComponent(workEmail)}`)

                if (response.ok) {
                    const data = await response.json()

                    // Map API response to form fields
                    // Note: Adjust these mappings based on the actual API response structure
                    if (data && data.company) {
                        const company = data.company
                        setValue("companyName", company.about?.name || "")
                        setValue("website", company.domain?.domain ? `https://${company.domain.domain}` : "")
                        setValue("industry", company.about?.industry || "")

                        // Try to find country from headquarters
                        const country = company.locations?.headquarters?.country?.name || ""
                        setValue("country", country)
                    }
                } else {
                    // Fallback if API fails (e.g. not found)
                    const domain = workEmail.split("@")[1]
                    if (domain) setValue("website", `https://${domain}`)
                }
            } catch (error) {
                console.error("Failed to fetch business data", error)
                // Fallback on error
                const domain = workEmail.split("@")[1]
                if (domain) setValue("website", `https://${domain}`)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBusinessData()
    }, [workEmail, setValue])

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Your business</h1>
                <p className="text-muted-foreground">Tell us a bit about your company.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <div className="relative">
                        <Input
                            id="companyName"
                            {...register("companyName")}
                            placeholder="Acme Inc."
                        />
                        {isLoading && (
                            <div className="absolute right-3 top-2.5">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                            id="industry"
                            {...register("industry")}
                            placeholder="Technology"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            {...register("country")}
                            placeholder="United States"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        {...register("website")}
                        placeholder="https://acme.com"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full">
                Finalize Account
            </Button>
        </div>
    )
}
