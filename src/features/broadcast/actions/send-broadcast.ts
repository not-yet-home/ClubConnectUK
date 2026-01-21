import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'
import { z } from 'zod'

const BroadcastSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
    teacherIds: z.array(z.string()).min(1, 'At least one recipient is required'),
    coverIds: z.array(z.string()).optional(),
})

export const sendBroadcast = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => BroadcastSchema.parse(data))
    .handler(async ({ data }: { data: z.infer<typeof BroadcastSchema> }) => {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not set')
        }

        // Import Supabase inside handler to avoid SSR issues if any
        const { supabase } = await import('@/services/supabase')

        // 1. Fetch Teachers
        const { data: teachers, error: teacherError } = await supabase
            .from('teachers')
            .select(`
                id,
                person_details:persons_details_id (
                    first_name,
                    last_name,
                    email
                )
            `)
            .in('id', data.teacherIds)

        if (teacherError || !teachers || teachers.length === 0) {
            throw new Error('Failed to fetch selected teachers or no valid teachers found.')
        }

        // 2. Fetch Cover Details (if any)
        let coverDetailsString = ''
        if (data.coverIds && data.coverIds.length > 0) {
            const { data: covers, error: coverError } = await supabase
                .from('cover_occurrences')
                .select(`
                    id,
                    meeting_date,
                    cover_rule:cover_rule_id (
                        start_time,
                        end_time,
                        school:school_id (school_name),
                        club:club_id (club_name)
                    )
                `)
                .in('id', data.coverIds)

            if (!coverError && covers) {
                coverDetailsString = covers.map((c: any) => {
                    const date = new Date(c.meeting_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                    const time = `${c.cover_rule.start_time.slice(0, 5)} - ${c.cover_rule.end_time.slice(0, 5)}`
                    const location = `${c.cover_rule.school.school_name} - ${c.cover_rule.club.club_name}`
                    return `• ${date} | ${time} @ ${location}`
                }).join('<br>')
            }
        }

        // 3. Create Broadcast Record
        const { data: broadcastData, error: broadcastError } = await supabase
            .from('broadcasts')
            .insert({
                subject: data.subject,
                body: data.message,
                channel_used: 'email',
                recipients_count: teachers.length,
                status: 'sending'
            })
            .select()
            .single()

        if (broadcastError) {
            throw new Error(`Failed to create broadcast record: ${broadcastError.message}`)
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@danceandarts.online'
        const resend = new Resend(apiKey)

        // 4. Send Emails & Log Messages
        const results = await Promise.allSettled(
            teachers.map(async (teacher: any) => {
                const person = teacher.person_details
                if (!person?.email) return { error: 'No email found', teacher_id: teacher.id }

                // Variable Substitution
                let personalizedMessage = data.message
                    .replace(/{{first_name}}/g, person.first_name || '')
                    .replace(/{{last_name}}/g, person.last_name || '')
                    .replace(/{{date_today}}/g, new Date().toLocaleDateString('en-GB'))
                    .replace(/{{cover_details}}/g, coverDetailsString || '(No covers attached)')
                    .replace(/\n/g, '<br>')

                let personalizedSubject = data.subject
                    .replace(/{{first_name}}/g, person.first_name || '')

                // Send Email
                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: `Dance and Arts Support <${fromEmail}>`,
                    to: person.email,
                    subject: personalizedSubject,
                    html: personalizedMessage,
                })

                if (emailError) {
                    throw new Error(emailError.message)
                }

                // Log Message to DB
                await supabase.from('messages').insert({
                    teacher_id: teacher.id,
                    broadcast_id: broadcastData.id,
                    channel: 'email',
                    direction: 'outbound',
                    subject: personalizedSubject,
                    body: personalizedMessage,
                    status: 'sent',
                    external_id: emailData?.id
                })

                return { success: true, id: emailData?.id }
            })
        )

        const successCount = results.filter((r) => r.status === 'fulfilled' && !r.value?.error).length
        const failCount = results.length - successCount

        // 5. Update Broadcast Status
        await supabase
            .from('broadcasts')
            .update({
                status: failCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed'), // or 'partial' if we had that status
            })
            .eq('id', broadcastData.id)

        if (successCount === 0 && failCount > 0) {
            throw new Error(`Failed to send to any recipients. Check logs for details.`)
        }

        return {
            success: true,
            total: teachers.length,
            sent: successCount,
            failed: failCount
        }
    })
