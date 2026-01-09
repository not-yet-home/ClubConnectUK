export interface Broadcast {
    id: string
    subject: string
    message?: string
    sent_date: string
    status: 'draft' | 'scheduled' | 'sent' | 'failed'
    recipients_count?: number
    created_at: string
    updated_at: string
}
