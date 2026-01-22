"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Calendar03Icon,
    Call02Icon,
    Clock01Icon,
    Delete02Icon,
    Edit02Icon,
    File02Icon,
    Location01Icon,
    Mail01Icon,
    SentIcon,
    Tag01Icon,
} from "@hugeicons/core-free-icons"
import type { Teacher } from "@/types/teacher.types"
import {
    Sheet,
    SheetContent,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ICON_SIZES } from "@/constants/sizes"

// Type for hugeicons icons
type HugeIcon = typeof Mail01Icon

// Placeholder types for future API integration
interface UpcomingSession {
    id: string
    date: string
    time: string
    clubName: string
    type: "session" | "cover"
}

interface TeacherDocument {
    id: string
    name: string
    type: string
    uploadedAt: string
}

interface TeacherViewSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacher: Teacher | null
    onEdit: (teacher: Teacher) => void
    onDelete: (teacher: Teacher) => void
    // Future props for API data
    upcomingSessions?: Array<UpcomingSession>
    documents?: Array<TeacherDocument>
}

// Empty state component for sections with no data
function EmptyState({ icon, title, description }: {
    icon: HugeIcon
    title: string
    description: string
}) {
    return (
        <div className="text-center py-8 px-4 rounded-xl bg-secondary/10 border border-dashed border-secondary/30 text-muted-foreground">
            <div className="bg-background p-3 rounded-full w-fit mx-auto mb-3 shadow-sm">
                <HugeiconsIcon icon={icon} className="w-6 h-6 opacity-30" />
            </div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
    )
}

// Section header component
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
            {action}
        </div>
    )
}

// Contact item component
function ContactItem({ icon, label, value }: {
    icon: HugeIcon
    label: string
    value?: string | null
}) {
    if (!value) return null

    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-secondary/50 rounded-lg shrink-0">
                <HugeiconsIcon icon={icon} className={ICON_SIZES.md} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-words">{value}</p>
            </div>
        </div>
    )
}

export function TeacherViewSheet({
    open,
    onOpenChange,
    teacher,
    onEdit,
    onDelete,
    upcomingSessions = [],
    documents = [],
}: TeacherViewSheetProps) {
    if (!teacher) return null

    const personDetails = teacher.person_details
    const fullName = `${personDetails.first_name} ${personDetails.last_name}`
    const initials = `${personDetails.first_name[0] || ""}${personDetails.last_name[0] || ""}`.toUpperCase()
    const teacherId = `#T-${teacher.id.slice(0, 4).toUpperCase()}`

    // Parse styles from comma-separated strings
    const primaryStyles = teacher.primary_styles?.split(",").map(s => s.trim()).filter(Boolean) ?? []
    const secondaryStyles = teacher.secondary_styles?.split(",").map(s => s.trim()).filter(Boolean) ?? []

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const handleEdit = () => {
        onEdit(teacher)
        onOpenChange(false)
    }

    const handleDelete = () => {
        onDelete(teacher)
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                <button
                    onClick={handleEdit}
                    className="absolute right-14 top-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary rounded-xs"
                >
                    <HugeiconsIcon icon={Edit02Icon} className="size-5" />
                </button>

                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={personDetails.image ?? undefined} alt={fullName} />
                                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${teacher.is_blocked ? "bg-destructive" : "bg-emerald-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-semibold truncate">{fullName}</h2>
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium border-0 ${teacher.is_blocked
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-emerald-100 text-emerald-700"
                                        }`}
                                >
                                    {teacher.is_blocked ? "Blocked" : "Active"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Teacher ID: {teacherId}</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Contact Details */}
                    <section>
                        <SectionHeader title="Contact Details" />
                        <div className="grid gap-4">
                            <ContactItem
                                icon={Mail01Icon}
                                label="Email Address"
                                value={personDetails.email}
                            />
                            <ContactItem
                                icon={Call02Icon}
                                label="Phone Number"
                                value={personDetails.contact}
                            />
                            <ContactItem
                                icon={Location01Icon}
                                label="Home Address"
                                value={personDetails.address}
                            />
                            <ContactItem
                                icon={Calendar03Icon}
                                label="Joined Date"
                                value={formatDate(personDetails.created_at)}
                            />
                        </div>
                    </section>

                    <Separator />

                    {/* Expertise & Styles */}
                    <section>
                        <SectionHeader
                            title="Expertise & Styles"
                            action={
                                <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                                    Manage Tags
                                </Button>
                            }
                        />
                        {primaryStyles.length > 0 || secondaryStyles.length > 0 ? (
                            <div className="space-y-3">
                                {primaryStyles.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Primary Styles</p>
                                        <div className="flex flex-wrap gap-2">
                                            {primaryStyles.map((style) => (
                                                <Badge key={style} variant="default">{style}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {secondaryStyles.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Secondary Styles</p>
                                        <div className="flex flex-wrap gap-2">
                                            {secondaryStyles.map((style) => (
                                                <Badge key={style} variant="outline">{style}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Tag01Icon}
                                title="No styles assigned"
                                description="Primary and secondary styles will appear here"
                            />
                        )}
                    </section>

                    <Separator />

                    {/* General Notes */}
                    <section>
                        <SectionHeader title="General Notes" />
                        {teacher.general_notes ? (
                            <div className="p-4 bg-secondary/20 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{teacher.general_notes}</p>
                            </div>
                        ) : (
                            <EmptyState
                                icon={File02Icon}
                                title="No notes"
                                description="Add notes about this teacher"
                            />
                        )}
                    </section>

                    <Separator />

                    {/* Upcoming Sessions / Assigned Covers */}
                    <section>
                        <SectionHeader title="Upcoming Sessions" />
                        {upcomingSessions.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingSessions.map((session) => (
                                    <div key={session.id} className="relative pl-4 border-l-2 border-muted pb-3 last:pb-0">
                                        <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">{session.clubName}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <HugeiconsIcon icon={Clock01Icon} className={ICON_SIZES.xs} />
                                                <span>{session.date} • {session.time}</span>
                                                <Badge variant="outline" className="ml-1 text-[10px] py-0">
                                                    {session.type === "cover" ? "Cover" : "Session"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Clock01Icon}
                                title="No upcoming sessions"
                                description="Scheduled sessions and covers will appear here"
                            />
                        )}
                    </section>

                    <Separator />

                    {/* Documents */}
                    <section>
                        <SectionHeader title="Documents" />
                        {documents.length > 0 ? (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                                        <div className="p-2 bg-background rounded-lg shadow-sm">
                                            <HugeiconsIcon icon={File02Icon} className={ICON_SIZES.md} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">{doc.type} • {formatDate(doc.uploadedAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={File02Icon}
                                title="No documents"
                                description="Attached documents will appear here"
                            />
                        )}
                    </section>
                </div>

                {/* Footer Actions */}
                <SheetFooter className="p-6 pt-4 border-t mt-auto">
                    <div className="flex gap-3 w-full">
                        <Button variant="destructive" onClick={handleDelete} className="flex-1">
                            <HugeiconsIcon icon={Delete02Icon} className={ICON_SIZES.md} />
                            Delete Teacher
                        </Button>
                        <Button className="flex-1">
                            <HugeiconsIcon icon={SentIcon} className={ICON_SIZES.md} />
                            Send Message
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
