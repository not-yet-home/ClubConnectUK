import { useState } from "react"
import { CoverRule } from "@/types/club.types"
import { useUpsertCoverRule, useDeleteCoverRule } from "../api/mutations"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Add01Icon, Calendar03Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { ICON_SIZES } from "@/constants/sizes"
import { Skeleton } from "@/components/ui/skeleton"

interface CoverRulesManagerProps {
    clubId: string
    schoolId: string
    rules: CoverRule[]
    isLoading?: boolean
}

export function CoverRulesManager({ clubId, schoolId, rules, isLoading }: CoverRulesManagerProps) {
    const [editingRule, setEditingRule] = useState<Partial<CoverRule> | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const upsertRule = useUpsertCoverRule()
    const deleteRule = useDeleteCoverRule()

    const [error, setError] = useState<string | null>(null)

    const handleAddRule = () => {
        setError(null)
        setEditingRule({
            club_id: clubId,
            school_id: schoolId,
            frequency: "weekly",
            day_of_week: "monday",
            start_time: "15:00",
            end_time: "16:00",
            status: "active",
        })
        setIsDialogOpen(true)
    }

    const handleEditRule = (rule: CoverRule) => {
        setError(null)
        setEditingRule(rule)
        setIsDialogOpen(true)
    }

    const handleDeleteRule = async (ruleId: string) => {
        if (confirm("Are you sure you want to delete this rule?")) {
            try {
                await deleteRule.mutateAsync({ ruleId, clubId })
            } catch (error) {
                console.error("Failed to delete rule:", error)
                // Since this is inline, maybe just alert for deletion failure or rely on console for now as item stays
                alert("Failed to delete rule. Please try again.")
            }
        }
    }

    const handleSaveRule = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingRule) return
        setError(null)

        try {
            await upsertRule.mutateAsync({
                ...editingRule,
                club_id: clubId,
                school_id: schoolId,
            } as any) // Type assertion needed for upsert params
            setIsDialogOpen(false)
            setEditingRule(null)
        } catch (error) {
            console.error("Failed to save rule:", error)
            setError(error instanceof Error ? error.message : "Failed to save rule")
        }
    }

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours, 10)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        return `${h12}:${minutes} ${ampm}`
    }

    const formatDayTime = (rule: CoverRule) => {
        const day = rule.day_of_week.charAt(0).toUpperCase() + rule.day_of_week.slice(1)
        return `${day}s, ${formatTime(rule.start_time.slice(0, 5))} - ${formatTime(rule.end_time.slice(0, 5))}`
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Weekly Schedule</h3>
                <Button onClick={handleAddRule} size="sm" variant="outline">
                    <HugeiconsIcon icon={Add01Icon} className={ICON_SIZES.md} />
                    Add Rule
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                <div className="flex items-center gap-3 w-full">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 w-full max-w-[200px]">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : rules.length === 0 ? (
                    <div className="text-center py-6 rounded-lg bg-secondary/20">
                        <p className="text-muted-foreground text-sm italic">No cover rules defined.</p>
                        <Button variant="link" size="sm" onClick={handleAddRule} className="mt-1 h-auto p-0 text-primary">
                            Add your first rule
                        </Button>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors gap-4 sm:gap-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-full shrink-0">
                                    <HugeiconsIcon icon={Calendar03Icon} className={ICON_SIZES.md + " text-primary"} />
                                </div>
                                <div>
                                    <p className="font-medium">{formatDayTime(rule)}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs text-muted-foreground capitalize">{rule.frequency}</p>
                                        <span className="hidden sm:inline text-xs text-muted-foreground">•</span>
                                        <Badge variant={rule.status === 'active' ? 'outline' : 'secondary'} className="text-[10px] h-5 px-1.5">
                                            {rule.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 self-end sm:self-auto">
                                <Button variant="ghost" size="icon-sm" onClick={() => handleEditRule(rule)}>
                                    <HugeiconsIcon icon={Edit02Icon} className={ICON_SIZES.sm} />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteRule(rule.id)}>
                                    <HugeiconsIcon icon={Delete02Icon} className={ICON_SIZES.sm} />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] max-w-md sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingRule?.id ? "Edit Cover Rule" : "Add Cover Rule"}</DialogTitle>
                        <DialogDescription>
                            Set the recurring schedule for this club.
                        </DialogDescription>
                    </DialogHeader>
                    {editingRule && (
                        <form onSubmit={handleSaveRule} className="grid gap-4 py-4">
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Day</Label>
                                    <Select
                                        value={editingRule.day_of_week}
                                        onValueChange={(v) => setEditingRule(prev => ({ ...prev, day_of_week: v as any }))}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                                <SelectItem key={day} value={day} className="capitalize">{day}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Frequency</Label>
                                    <Select
                                        value={editingRule.frequency}
                                        onValueChange={(v) => setEditingRule(prev => ({ ...prev, frequency: v as any }))}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={editingRule.start_time}
                                        onChange={(e) => setEditingRule(prev => ({ ...prev, start_time: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={editingRule.end_time}
                                        onChange={(e) => setEditingRule(prev => ({ ...prev, end_time: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Rule</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
