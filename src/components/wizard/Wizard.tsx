"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Step1AccountInfo } from "./Step1AccountInfo"
import { Step2Verification } from "./Step2Verification"
import { Step3Password } from "./Step3Password"
import { Step4BusinessInfo } from "./Step4BusinessInfo"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Define the schema for the entire form
const wizardSchema = z.object({
    // Step 1
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    workEmail: z.string().email("Invalid email address").refine((email) => {
        const freeProviders = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"]
        const domain = email.split("@")[1]
        return !freeProviders.includes(domain)
    }, "Please use a work email address"),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the conditions"),

    // Step 2
    verificationCode: z.string().length(6, "Code must be 6 digits"),

    // Step 3
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),

    // Step 4
    companyName: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type WizardFormData = z.infer<typeof wizardSchema>

export function Wizard() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)

    const methods = useForm<WizardFormData>({
        resolver: zodResolver(wizardSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            workEmail: "",
            acceptTerms: false,
            verificationCode: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            industry: "",
            country: "",
            website: "",
        }
    })

    const nextStep = () => setStep((s) => Math.min(s + 1, 4))
    const prevStep = () => setStep((s) => Math.max(s - 1, 1))

    const onSubmit = async (data: WizardFormData) => {
        setIsLoading(true)

        // Format the final output
        const finalOutput = {
            firstName: data.firstName,
            lastName: data.lastName,
            workEmail: data.workEmail,
            password: data.password, // In a real app, this would be hashed or handled securely
            isDomainConditionsAccepted: data.acceptTerms,
            business: {
                companyName: data.companyName || "",
                industry: data.industry || "",
                country: data.country || "",
                website: data.website || "",
            }
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        setIsLoading(false)
        setSuccessData(finalOutput)
    }

    if (successData) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-4 relative overflow-hidden">
                {/* Background SVG Decorations */}
                <div className="fixed top-0 right-0 w-96 h-[800px] pointer-events-none">
                    <svg width="0.57em" height="1em" viewBox="0 0 9 16" className="h-auto w-full" style={{ color: '#F5F8F9' }}>
                        <path fill="currentColor" d="M9 0v14.032l-.515.515a4.961 4.961 0 0 1-7.016-7.016L9 0Z" />
                    </svg>
                </div>
                <div className="fixed bottom-0 left-0 w-96 h-[800px] pointer-events-none">
                    <svg className="h-auto w-full overflow-visible" viewBox="0 0 9 16" aria-hidden="true" style={{ stroke: '#F5F8F9' }}>
                        <path strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" d="M0 16V1.96828l.515254-.51525c1.937376-1.937372 5.078466-1.937372 7.015856 0 1.93739 1.93737 1.93739 5.0785 0 7.01587L0 16Z" />
                    </svg>
                </div>
                <div className="fixed bottom-0 right-0 w-96 h-[800px] pointer-events-none">
                    <svg className="h-auto w-full overflow-visible" viewBox="0 0 9 16" aria-hidden="true" style={{ stroke: '#F5F8F9' }}>
                        <path strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" d="M9-.0000019V14.0317l-.51525.5153c-1.93738 1.9373-5.07847 1.9373-7.01586 0-1.937391-1.9374-1.937391-5.07853 0-7.0159L9-.0000019Z" />
                    </svg>
                </div>

                <div className="w-full max-w-2xl mx-auto relative z-10">
                    {/* Logo with dynamic top padding */}
                    <div className="flex justify-center pt-9 sm:pt-[90px] pb-9">
                        <img
                            src="/cloud4wi_logo.svg"
                            alt="Cloud4Wi Logo"
                            className="h-8 w-auto"
                        />
                    </div>

                    {/* Success Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center space-y-4 mb-8">
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Account Created!</h2>
                            <p className="text-gray-500">Here is the payload that would be sent to the server:</p>
                        </div>

                        <div className="bg-slate-950 rounded-lg p-6 overflow-auto max-h-[500px] border border-slate-800">
                            <pre className="text-sm font-mono text-blue-400">
                                {JSON.stringify(successData, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-gray-500 hover:text-gray-900 underline"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 relative overflow-hidden">
            {/* Background SVG Decorations */}
            <div className="fixed top-0 right-0 w-96 h-[800px] pointer-events-none">
                <svg width="0.57em" height="1em" viewBox="0 0 9 16" className="h-auto w-full" style={{ color: '#F5F8F9' }}>
                    <path fill="currentColor" d="M9 0v14.032l-.515.515a4.961 4.961 0 0 1-7.016-7.016L9 0Z" />
                </svg>
            </div>
            <div className="fixed bottom-0 left-0 w-96 h-[800px] pointer-events-none">
                <svg className="h-auto w-full overflow-visible" viewBox="0 0 9 16" aria-hidden="true" style={{ stroke: '#F5F8F9' }}>
                    <path strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" d="M0 16V1.96828l.515254-.51525c1.937376-1.937372 5.078466-1.937372 7.015856 0 1.93739 1.93737 1.93739 5.0785 0 7.01587L0 16Z" />
                </svg>
            </div>
            <div className="fixed bottom-0 right-0 w-96 h-[800px] pointer-events-none">
                <svg className="h-auto w-full overflow-visible" viewBox="0 0 9 16" aria-hidden="true" style={{ stroke: '#F5F8F9' }}>
                    <path strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" d="M9-.0000019V14.0317l-.51525.5153c-1.93738 1.9373-5.07847 1.9373-7.01586 0-1.937391-1.9374-1.937391-5.07853 0-7.0159L9-.0000019Z" />
                </svg>
            </div>

            <div className="w-full max-w-4xl mx-auto relative z-10">
                {/* Logo with dynamic top padding: 90px on large screens, 36px on mobile */}
                <div className="flex justify-center pt-9 sm:pt-[90px] pb-9">
                    <img
                        src="/cloud4wi_logo.svg"
                        alt="Cloud4Wi Logo"
                        className="h-8 w-auto"
                    />
                </div>

                {/* Wizard Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
                    {/* Left Side - Form */}
                    <div className="p-8 flex flex-col justify-between relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-lg font-medium text-gray-600">Finalizing your account...</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground mb-2">
                                    <span>Step {step} of 4</span>
                                </div>
                                <Progress value={(step / 4) * 100} className="h-2" />
                            </div>

                            <FormProvider {...methods}>
                                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                                    {step === 1 && <Step1AccountInfo onNext={nextStep} />}
                                    {step === 2 && <Step2Verification onNext={nextStep} onBack={prevStep} />}
                                    {step === 3 && <Step3Password onNext={nextStep} onBack={prevStep} />}
                                    {step === 4 && <Step4BusinessInfo onBack={prevStep} />}
                                </form>
                            </FormProvider>
                        </div>
                    </div>

                    {/* Right Side - Visual/Context */}
                    <div className="hidden md:block bg-slate-900 relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
                        <div className="relative h-full flex flex-col justify-end p-12 text-white">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold">Let's get started with Guest WiFi.</h2>
                                <p className="text-gray-300 text-lg">
                                    Elevate your guest WiFi experience for free in a few minutes!.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
