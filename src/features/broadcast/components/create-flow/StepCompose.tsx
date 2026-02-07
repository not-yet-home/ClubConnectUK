import { AlertCircle, Mail, MessageCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import type { BroadcastFormState } from '../../hooks/use-broadcast-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAvailableCovers } from '@/features/covers/api/queries'

interface StepComposeProps {
  formData: BroadcastFormState
  updateField: (field: keyof BroadcastFormState, value: any) => void
  setChannel: (channel: 'email' | 'whatsapp', enabled: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function StepCompose({
  formData,
  updateField,
  setChannel,
  onNext,
  onBack,
}: StepComposeProps) {
  const isChannelSelected =
    formData.channels.email || formData.channels.whatsapp

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
                  onCheckedChange={(checked) =>
                    setChannel('email', checked as boolean)
                  }
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
                    <p className="text-xs text-muted-foreground">
                      Business API
                    </p>
                  </div>
                </div>
                <Checkbox
                  checked={formData.channels.whatsapp}
                  onCheckedChange={(checked) =>
                    setChannel('whatsapp', checked as boolean)
                  }
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
                <SelectItem value="cover_request">
                  Cover Availability Request
                </SelectItem>
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

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Add Unassigned Cover
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Available Covers</SheetTitle>
                    <SheetDescription>
                      Select upcoming covers to include in this broadcast.
                    </SheetDescription>
                  </SheetHeader>
                  <CoverSelector
                    selectedIds={formData.selectedCovers}
                    onToggle={(id, selected) => {
                      if (selected) {
                        updateField('selectedCovers', [
                          ...formData.selectedCovers,
                          id,
                        ])
                      } else {
                        updateField(
                          'selectedCovers',
                          formData.selectedCovers.filter((c) => c !== id),
                        )
                      }
                    }}
                  />
                </SheetContent>
              </Sheet>

              {/* Short list of selected covers */}
              {formData.selectedCovers.length > 0 && (
                <div className="space-y-1 mt-2">
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                    Selected IDs
                  </p>
                  {formData.selectedCovers.slice(0, 3).map((coverId, i) => (
                    <div
                      key={i}
                      className="text-xs bg-white border px-2 py-1 rounded text-zinc-600 truncate flex justify-between items-center group"
                    >
                      <span className="truncate flex-1">{coverId}</span>
                      <X
                        className="w-3 h-3 opacity-0 group-hover:opacity-100 cursor-pointer text-zinc-400 hover:text-red-500"
                        onClick={() =>
                          updateField(
                            'selectedCovers',
                            formData.selectedCovers.filter(
                              (c) => c !== coverId,
                            ),
                          )
                        }
                      />
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
              {['first_name', 'subject', 'date_today', 'cover_details'].map(
                (v) => (
                  <button
                    key={v}
                    className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-xs text-zinc-600 font-mono transition-colors"
                    onClick={() =>
                      updateField(
                        'message',
                        (formData.message || '') + ` {{${v}}} `,
                      )
                    }
                  >
                    {v}
                  </button>
                ),
              )}
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
              <span className="font-bold cursor-pointer hover:text-zinc-600">
                B
              </span>
              <span className="italic cursor-pointer hover:text-zinc-600">
                I
              </span>
              <span className="underline cursor-pointer hover:text-zinc-600">
                U
              </span>
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

interface CoverSelectorProps {
  selectedIds: Array<string>
  onToggle: (id: string, selected: boolean) => void
}

function CoverSelector({ selectedIds, onToggle }: CoverSelectorProps) {
  const { data: covers, isLoading } = useAvailableCovers()

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading covers...
      </div>
    )
  }

  if (!covers || covers.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No upcoming covers found.
      </div>
    )
  }

  return (
    <div className="max-h-[300px] overflow-y-auto mt-4 space-y-2 pr-2">
      {covers.map((cover: any) => {
        const isSelected = selectedIds.includes(cover.id)
        const date = format(new Date(cover.meeting_date), 'EEE, d MMM yyyy')
        const time = `${cover.cover_rule.start_time.slice(0, 5)} - ${cover.cover_rule.end_time.slice(0, 5)}`
        const location = `${cover.cover_rule.school.school_name} - ${cover.cover_rule.club.club_name}`

        return (
          <div
            key={cover.id}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white hover:bg-zinc-50 border-zinc-200'
            }`}
            onClick={() => onToggle(cover.id, !isSelected)}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(c) => onToggle(cover.id, !!c)}
              id={`cover-${cover.id}`}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <Label
                  htmlFor={`cover-${cover.id}`}
                  className="text-sm font-medium text-zinc-900 cursor-pointer"
                >
                  {date}
                </Label>
                <span className="text-xs text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                  {time}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">{location}</p>
              {cover.notes && (
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1 italic">
                  {cover.notes}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
