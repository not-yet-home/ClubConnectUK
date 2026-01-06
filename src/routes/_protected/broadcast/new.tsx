import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import { BroadcastStepperNav } from '@/features/broadcast/components/create-flow/BroadcastStepperNav'
import { StepAudience } from '@/features/broadcast/components/create-flow/StepAudience'
import { StepCompose } from '@/features/broadcast/components/create-flow/StepCompose'
import { StepReview } from '@/features/broadcast/components/create-flow/StepReview'
import { useBroadcastForm } from '@/features/broadcast/hooks/use-broadcast-form'
import { toast } from 'sonner'
import useTeachers from '@/hooks/use-teachers'
import { useSendBroadcast } from '@/features/broadcast/hooks/use-broadcasts'

export const Route = createFileRoute('/_protected/broadcast/new')({
  component: BroadcastNewPage,
})

function BroadcastNewPage() {
  const navigate = useNavigate()
  const {
    state,
    setStep,
    updateField,
    setChannel,
  } = useBroadcastForm()

  const handleNext = () => setStep(state.step + 1)
  const handleBack = () => setStep(state.step - 1)

  const handleCancel = () => navigate({ to: '/broadcast' })

  const handleSaveDraft = () => {
    toast.success("Draft saved", { description: "You can resume this broadcast later." })
    // In real app, save to DB
  }

  const { data: teachers } = useTeachers()
  const sendBroadcast = useSendBroadcast()

  const handleSubmit = async () => {
    if (!state.selectedTeachers.length) {
      toast.error("No recipients selected")
      return
    }

    const recipients = teachers
      ?.filter(t => state.selectedTeachers.includes(t.id))
      .map(t => t.person_details?.email)
      .filter((email): email is string => !!email) || []

    if (recipients.length === 0) {
      toast.error("Selected teachers have no valid email addresses")
      return
    }

    const promise = sendBroadcast.mutateAsync({
      subject: state.subject,
      message: state.message,
      recipients: recipients,
    })

    toast.promise(promise, {
      loading: 'Sending broadcast...',
      success: () => {
        navigate({ to: '/broadcast' })
        return `Broadcast sent to ${recipients.length} recipients`
      },
      error: 'Failed to send broadcast'
    })
  }

  return (
    <PageLayout breadcrumbs={[{ label: 'Broadcasts', href: '/broadcast' }, { label: 'New Broadcast' }]}>
      <div className="min-h-screen flex flex-col sm:px-6 lg:px-8 max-w-7xl mr-auto ml-auto pt-8 pr-4 pb-8 pl-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-medium text-xs tracking-tight">
              B
            </div>
            <div>
              <h1 className="text-xl text-zinc-900 font-medium tracking-tight">New Broadcast</h1>
              <p className="text-xs text-zinc-400">Campaign Draft</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Stepper Nav */}
        <BroadcastStepperNav currentStep={state.step} />

        {/* Step Content */}
        <div className="max-w-4xl mx-auto w-full">
          {state.step === 1 && (
            <StepAudience
              formData={state}
              updateField={updateField}
              onNext={handleNext}
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
