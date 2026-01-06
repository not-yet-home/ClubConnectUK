import { useState } from 'react'

export interface BroadcastFormState {
    step: number
    selectedTeachers: string[]
    channels: {
        email: boolean
        whatsapp: boolean
    }
    template: string
    subject: string
    message: string
    selectedCovers: string[]
}

export const useBroadcastForm = () => {
    const [state, setState] = useState<BroadcastFormState>({
        step: 1,
        selectedTeachers: [],
        channels: {
            email: true,
            whatsapp: false,
        },
        template: 'cover_request', // Default template
        subject: '',
        message: '',
        selectedCovers: [],
    })

    const setStep = (step: number) => setState(prev => ({ ...prev, step }))

    const toggleTeacher = (teacherId: string) => {
        setState(prev => {
            const isSelected = prev.selectedTeachers.includes(teacherId)
            return {
                ...prev,
                selectedTeachers: isSelected
                    ? prev.selectedTeachers.filter(id => id !== teacherId)
                    : [...prev.selectedTeachers, teacherId]
            }
        })
    }

    const selectAllTeachers = (teacherIds: string[]) => {
        setState(prev => ({ ...prev, selectedTeachers: teacherIds }))
    }

    const deselectAllTeachers = () => {
        setState(prev => ({ ...prev, selectedTeachers: [] }))
    }

    const setChannel = (channel: 'email' | 'whatsapp', enabled: boolean) => {
        setState(prev => ({
            ...prev,
            channels: {
                ...prev.channels,
                [channel]: enabled
            }
        }))
    }

    const updateField = (field: keyof BroadcastFormState, value: any) => {
        setState(prev => ({ ...prev, [field]: value }))
    }

    return {
        state,
        setStep,
        toggleTeacher,
        selectAllTeachers,
        deselectAllTeachers,
        setChannel,
        updateField,
    }
}
