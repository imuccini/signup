import twilio from "twilio"

// Generic interface for OTP providers
export interface OTPProvider {
    sendOTP(email: string): Promise<void>
    verifyOTP(email: string, code: string): Promise<boolean>
}

// Twilio Verify implementation
export class TwilioOTPProvider implements OTPProvider {
    private client: twilio.Twilio
    private serviceSid: string

    constructor(accountSid: string, authToken: string, serviceSid: string) {
        this.client = twilio(accountSid, authToken)
        this.serviceSid = serviceSid
    }

    async sendOTP(email: string): Promise<void> {
        try {
            await this.client.verify.v2.services(this.serviceSid)
                .verifications
                .create({ to: email, channel: "email" })
        } catch (error: any) {
            console.error("Twilio Send OTP Error:", error)
            throw new Error(error.message || "Failed to send OTP")
        }
    }

    async verifyOTP(email: string, code: string): Promise<boolean> {
        try {
            const verification = await this.client.verify.v2.services(this.serviceSid)
                .verificationChecks
                .create({ to: email, code })

            return verification.status === "approved"
        } catch (error) {
            console.error("Twilio Verify OTP Error:", error)
            return false
        }
    }
}

// Factory to get the configured provider
export function getOTPProvider(): OTPProvider {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

    if (accountSid && authToken && serviceSid) {
        return new TwilioOTPProvider(accountSid, authToken, serviceSid)
    }

    // Fallback or Mock provider could go here for dev without creds
    throw new Error("OTP Provider configuration missing")
}
