import { useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { PageLayout } from '@/components/common/page-layout'
import { BroadcastStepperNav } from '@/features/broadcast/components/create-flow/BroadcastStepperNav'
import { StepAudience } from '@/features/broadcast/components/create-flow/StepAudience'
import { StepCompose } from '@/features/broadcast/components/create-flow/StepCompose'
import { StepReview } from '@/features/broadcast/components/create-flow/StepReview'
import { useBroadcastForm } from '@/features/broadcast/hooks/use-broadcast-form'
import { useSendBroadcast } from '@/features/broadcast/hooks/use-broadcasts'

export const Route = createFileRoute('/_protected/broadcast/new')({
  component: BroadcastNewPage,
})

function BroadcastNewPage() {
  const navigate = useNavigate()
  const { state, setStep, updateField, setChannel } = useBroadcastForm()
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNext = () => {
    setStep(state.step + 1)
    scrollToTop()
  }
  const handleBack = () => {
    setStep(state.step - 1)
    scrollToTop()
  }

  const handleCancel = () => navigate({ to: '/broadcast' })

  const handleSaveDraft = () => {
    toast.success('Draft saved', {
      description: 'You can resume this broadcast later.',
    })
  }

  const sendBroadcast = useSendBroadcast()

  const handleSubmit = () => {
    if (!state.selectedTeachers.length) {
      toast.error('No recipients selected')
      return
    }

    const promise = sendBroadcast.mutateAsync({
      subject: state.subject,
      message: state.message,
      teacherIds: state.selectedTeachers,
      coverIds: state.selectedCovers,
    })

    toast.promise(promise, {
      loading: 'Sending broadcast...',
      success: (data) => {
        navigate({ to: '/broadcast' })
        if (data.failed > 0) {
          return `Sent to ${data.sent} recipients. Failed: ${data.failed}.`
        }
        return `Successfully sent to all ${data.sent} recipients.`
      },
      error: (err) => {
        return err.message || 'Failed to send broadcast'
      },
    })
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: 'Broadcasts', href: '/broadcast' },
        { label: 'New Broadcast' },
      ]}
      className="pt-0"
    >
      <div
        ref={containerRef}
        className="min-h-screen flex flex-col max-w-7xl mr-auto ml-auto"
      >
        <BroadcastStepperNav currentStep={state.step} />

        <div className="max-w-6xl pb-4 mx-2 w-full">
          {state.step === 1 && (
            <StepAudience
              formData={state}
              updateField={updateField}
              onNext={handleNext}
              handleCancel={handleCancel}
              handleSaveDraft={handleSaveDraft}
            />
          )}
          {state.step === 2 && (
            <StepCompose
              formData={state}
              updateField={updateField}
              setChannel={setChannel}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {state.step === 3 && (
            <StepReview
              formData={state}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </PageLayout>
  )
}
