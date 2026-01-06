import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

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
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-zinc-50 px-2">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ring-4 ring-zinc-50 transition-colors",
                                    status === "active" && "bg-zinc-900 text-white",
                                    status === "completed" && "bg-zinc-900 text-white",
                                    status === "pending" && "bg-white border border-zinc-200 text-zinc-400"
                                )}
                            >
                                {status === "completed" ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    status === "active" ? "text-zinc-900" : "text-zinc-400"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
