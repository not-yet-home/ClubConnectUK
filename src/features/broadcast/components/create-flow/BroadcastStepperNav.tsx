import React from 'react'
import {
  Mail01Icon,
  Search01Icon,
  Tick02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

interface BroadcastStepperNavProps {
    currentStep: number
}

export function BroadcastStepperNav({ currentStep }: BroadcastStepperNavProps) {
    const steps = [
        { id: 1, label: "Audience" },
        { id: 2, label: "Compose" },
        { id: 3, label: "Review" },
    ]

    return (
        <div className="w-full mb-10">
            <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-zinc-200 -z-10"></div>

                {steps.map((step) => {
                    const status =
                        currentStep === step.id
                            ? "active"
                            : currentStep > step.id
                                ? "completed"
                                : "pending"

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
