import {
  Tick02Icon,
  UserGroupIcon,
  Mail01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import React from 'react'

interface BroadcastStepperNavProps {
  currentStep: number
}

export function BroadcastStepperNav({ currentStep }: BroadcastStepperNavProps) {
  const steps = [
    { id: 1, label: 'Audience', icon: UserGroupIcon },
    { id: 2, label: 'Compose', icon: Mail01Icon },
    { id: 3, label: 'Review', icon: Search01Icon },
  ]

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'active':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="w-full sticky top-0 z-10 bg-background pt-2 pb-6">
      <div className="relative flex items-start justify-between w-full max-w-3xl mx-auto px-4">
        {steps.map((step, index) => {
          const status =
            currentStep === step.id
              ? 'active'
              : currentStep > step.id
                ? 'completed'
                : 'pending'
          const statusText = getStatusText(status)
          const StepIcon = step.icon
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div className="flex flex-col items-center relative z-10">
                {/* Step Circle Indicator with Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    status === 'completed' && 'bg-emerald-300 text-white',
                    status === 'active' &&
                      'bg-primary text-primary-foreground shadow-lg',
                    status === 'pending' &&
                      'bg-muted border-2 border-border text-muted-foreground',
                  )}
                >
                  {status === 'completed' ? (
                    <HugeiconsIcon icon={Tick02Icon} className="w-4 h-4" />
                  ) : (
                    <HugeiconsIcon icon={StepIcon} className="w-4 h-4" />
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={cn(
                    'text-sm font-semibold mt-1 transition-colors duration-300',
                    status === 'pending'
                      ? 'text-muted-foreground'
                      : 'text-foreground',
                  )}
                >
                  {step.label}
                </span>

                {/* Status Badge */}
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-md mt-2 transition-all duration-300',
                    status === 'completed' &&
                      'bg-emerald-500/20 text-emerald-400',
                    status === 'active' && 'bg-primary/20 text-primary',
                    status === 'pending' && 'bg-muted text-muted-foreground',
                  )}
                >
                  {statusText}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 flex items-center pt-6 px-2">
                  <div
                    className={cn(
                      'h-0.5 w-full transition-colors duration-300',
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-border',
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
