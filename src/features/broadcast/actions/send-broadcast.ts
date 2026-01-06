import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'
import { z } from 'zod'

const BroadcastSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
    recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
})

export const sendBroadcast = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => BroadcastSchema.parse(data))
    .handler(async ({ data }: { data: z.infer<typeof BroadcastSchema> }) => {
        const apiKey = process.env.RESEND_API_KEY

        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not set')
        }

        const resend = new Resend(apiKey)

        try {
            const { recipients, subject, message } = data

            // [DEV ONLY] Resend Sandbox Limitation: Can only send to verified email.
            // We force the recipient to your email and show the actual target list in the body.
            const SAFE_TEST_EMAIL = 'rockbed009@gmail.com'

            // Create a preview header to show who would have received this
            const recipientsListPreview = recipients.join(', ')
            const htmlWithPreview = `
                <div style="background-color: #fffbeb; border: 1px solid #fcd34d; color: #92400e; padding: 12px; margin-bottom: 16px; border-radius: 6px; font-family: sans-serif; font-size: 12px;">
                    <strong>🚧 Resend Sandbox Mode</strong><br/>
                    This email was intended for: <em>${recipientsListPreview}</em><br/>
                    Sent to <strong>${SAFE_TEST_EMAIL}</strong> for testing.
                </div>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
                ${message.replace(/\n/g, '<br>')}
            `

            const response = await resend.emails.send({
                from: 'ClubConnect <onboarding@resend.dev>',
                to: [SAFE_TEST_EMAIL], // Force delivery to verified email
                subject: `[TEST] ${subject}`,
                html: htmlWithPreview,
            })

            if (response.error) {
                console.error('Resend Error:', response.error)
                throw new Error(response.error.message)
            }

            return { success: true, id: response.data?.id }
        } catch (error) {
            console.error('Broadcast Error Full:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw new Error(`Failed to send: ${errorMessage}`)
        }
    })
