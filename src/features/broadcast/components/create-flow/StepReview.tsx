import { BroadcastFormState } from "../../hooks/use-broadcast-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Send, Users, CreditCard, Clock } from "lucide-react"

interface StepReviewProps {
    formData: BroadcastFormState
    onBack: () => void
    onSubmit: () => void
}

export function StepReview({ formData, onBack, onSubmit }: StepReviewProps) {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                <h2 className="text-xl font-medium tracking-tight mb-6">Review & Ready to Send</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-4 bg-zinc-50 border-zinc-100 shadow-none">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">
                            <Users className="w-3 h-3" /> Recipients
                        </div>
                        <div className="text-2xl text-zinc-900 font-medium tracking-tight">
                            {formData.selectedTeachers.length} <span className="text-sm text-zinc-400 font-normal">Teachers</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-zinc-50 border-zinc-100 shadow-none">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">
                            <CreditCard className="w-3 h-3" /> Est. Cost
                        </div>
                        <div className="text-2xl text-zinc-900 font-medium tracking-tight">
                            £0.00 <span className="text-sm text-zinc-400 font-normal">--</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-zinc-50 border-zinc-100 shadow-none">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">
                            <Clock className="w-3 h-3" /> Scheduled
                        </div>
                        <div className="text-2xl text-zinc-900 font-medium tracking-tight">
                            Immediate
                        </div>
                    </Card>
                </div>

                <Separator className="my-6" />

                {/* Preview */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-900">Message Preview</h3>
                    <div className="border rounded-lg p-6 bg-white space-y-4">
                        <div className="border-b pb-4 space-y-1">
                            <div className="flex gap-2">
                                <span className="text-sm font-medium text-zinc-500 w-16">Subject:</span>
                                <span className="text-sm font-medium">{formData.subject || "(No Subject)"}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-sm font-medium text-zinc-500 w-16">To:</span>
                                <span className="text-sm text-zinc-600">{formData.selectedTeachers.length} recipients</span>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-zinc-700 whitespace-pre-wrap">
                            {formData.message || "(Empty message body)"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} size="lg">
                    Back
                </Button>
                <Button onClick={onSubmit} className="bg-zinc-900 hover:bg-zinc-800" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Send Broadcast
                </Button>
            </div>
        </div>
    )
}
