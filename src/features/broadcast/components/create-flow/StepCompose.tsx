import { BroadcastFormState } from "../../hooks/use-broadcast-form"
import { Button } from "@/components/ui/button"
// import { Switch } from "@/components/ui/switch" // Not available
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Mail, MessageCircle, AlertCircle } from "lucide-react"

interface StepComposeProps {
    formData: BroadcastFormState
    updateField: (field: keyof BroadcastFormState, value: any) => void
    setChannel: (channel: 'email' | 'whatsapp', enabled: boolean) => void
    onNext: () => void
    onBack: () => void
}

export function StepCompose({ formData, updateField, setChannel, onNext, onBack }: StepComposeProps) {
    const isChannelSelected = formData.channels.email || formData.channels.whatsapp

    return (
        <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Settings */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Channels */}
                    <Card className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Channels</h3>
                            {!isChannelSelected && (
                                <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Select at least one
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-xs text-muted-foreground">Via SMTP</p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={formData.channels.email}
                                    onCheckedChange={(checked) => setChannel('email', checked as boolean)}
                                />
                            </div>

                            <div className="h-px bg-zinc-100" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">WhatsApp</p>
                                        <p className="text-xs text-muted-foreground">Business API</p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={formData.channels.whatsapp}
                                    onCheckedChange={(checked) => setChannel('whatsapp', checked as boolean)}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Template Selection */}
                    <Card className="p-5 space-y-3">
                        <Label>Template</Label>
                        <Select
                            value={formData.template}
                            onValueChange={(val) => updateField('template', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cover_request">Cover Availability Request</SelectItem>
                                <SelectItem value="newsletter">Monthly Newsletter</SelectItem>
                                <SelectItem value="urgent">Urgent Announcement</SelectItem>
                                <SelectItem value="custom">Custom Message</SelectItem>
                            </SelectContent>
                        </Select>
                    </Card>

                    {/* Cover Selection (Conditional) */}
                    {formData.template === 'cover_request' && (
                        <Card className="p-5 space-y-3 border-blue-100 bg-blue-50/20">
                            <div className="flex items-center justify-between">
                                <Label className="text-blue-900">Select Covers</Label>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {formData.selectedCovers.length} Selected
                                </span>
                            </div>
                            <p className="text-xs text-blue-600/80 mb-2">
                                Attach unassigned covers to this request.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                    // Placeholder for cover selection logic
                                    const mockCoverId = `cover-${Date.now()}`
                                    updateField('selectedCovers', [...formData.selectedCovers, mockCoverId])
                                }}
                            >
                                Add Unassigned Cover
                            </Button>

                            {/* Short list of selected covers */}
                            {formData.selectedCovers.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {formData.selectedCovers.slice(0, 3).map((cover, i) => (
                                        <div key={i} className="text-xs bg-white border px-2 py-1 rounded text-zinc-600 truncate">
                                            {cover}
                                        </div>
                                    ))}
                                    {formData.selectedCovers.length > 3 && (
                                        <div className="text-xs text-center text-zinc-400">
                                            +{formData.selectedCovers.length - 3} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Variable Helpers */}
                    <Card className="p-5 space-y-3">
                        <Label>Variables</Label>
                        <div className="flex flex-wrap gap-2">
                            {['first_name', 'subject', 'date_today', 'cover_details'].map(v => (
                                <button
                                    key={v}
                                    className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-xs text-zinc-600 font-mono transition-colors"
                                    onClick={() => updateField('message', ((formData.message || '') + ` {{${v}}} `))}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Editor */}
                <div className="lg:col-span-2 h-full">
                    <Card className="h-full flex flex-col p-0 overflow-hidden min-h-[500px]">
                        <div className="border-b bg-zinc-50/50 p-4">
                            <Input
                                placeholder="Subject Line"
                                className="border-none bg-transparent shadow-none text-lg font-medium px-0 focus-visible:ring-0 placeholder:text-zinc-400"
                                value={formData.subject}
                                onChange={(e) => updateField('subject', e.target.value)}
                            />
                        </div>

                        {/* Fake Toolbar */}
                        <div className="border-b px-4 py-2 flex gap-4 text-zinc-400">
                            <span className="font-bold cursor-pointer hover:text-zinc-600">B</span>
                            <span className="italic cursor-pointer hover:text-zinc-600">I</span>
                            <span className="underline cursor-pointer hover:text-zinc-600">U</span>
                        </div>

                        <div className="flex-1 p-4">
                            <Textarea
                                className="w-full h-full min-h-[300px] border-none shadow-none resize-none focus-visible:ring-0 p-0 text-base leading-relaxed"
                                placeholder="Write your message here..."
                                value={formData.message}
                                onChange={(e) => updateField('message', e.target.value)}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} size="lg">
                    Back
                </Button>
                <Button onClick={onNext} disabled={!isChannelSelected} size="lg">
                    Preview & Send
                </Button>
            </div>
        </div>
    )
}
