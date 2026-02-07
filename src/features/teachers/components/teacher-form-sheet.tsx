'use client'

import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import type { PersonDetails, Teacher } from '@/types/teacher.types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ICON_SIZES } from '@/constants/sizes'

interface TeacherFormData {
  first_name: string
  last_name: string
  email: string
  contact: string
  address: string
  primary_styles: string
  secondary_styles: string
  general_notes: string
}

interface TeacherFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: Teacher | null
  onSave: (teacher: Partial<Teacher>) => void
  onCancel?: () => void // Called when cancel button is clicked
  isEditMode?: boolean // If true, came from view sheet
}

export function TeacherFormSheet({
  open,
  onOpenChange,
  teacher,
  onSave,
  onCancel,
  isEditMode = false,
}: TeacherFormSheetProps) {
  const [formData, setFormData] = React.useState<TeacherFormData>({
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    address: '',
    primary_styles: '',
    secondary_styles: '',
    general_notes: '',
  })

  React.useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.person_details.first_name,
        last_name: teacher.person_details.last_name,
        email: (teacher.person_details.email as string) || '',
        contact: (teacher.person_details.contact as string) || '',
        address: (teacher.person_details.address as string) || '',
        primary_styles: teacher.primary_styles || '',
        secondary_styles: teacher.secondary_styles || '',
        general_notes: teacher.general_notes || '',
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        contact: '',
        address: '',
        primary_styles: '',
        secondary_styles: '',
        general_notes: '',
      })
    }
  }, [teacher, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Transform form data back to Teacher structure
    const teacherData: Partial<Teacher> = {
      ...teacher,
      primary_styles: formData.primary_styles,
      secondary_styles: formData.secondary_styles,
      general_notes: formData.general_notes,
      person_details: {
        ...(teacher?.person_details ?? ({} as PersonDetails)),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        contact: formData.contact,
        address: formData.address,
      } as PersonDetails,
    }
    onSave(teacherData)
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const handleChange =
    (field: keyof TeacherFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-0"
      >
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            {isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="shrink-0 -ml-2"
              >
                <HugeiconsIcon
                  icon={ArrowLeft02Icon}
                  className={ICON_SIZES.md}
                />
              </Button>
            )}
            <div>
              <SheetTitle>
                {teacher ? 'Edit Teacher' : 'Add Teacher'}
              </SheetTitle>
              <SheetDescription>
                {teacher
                  ? 'Update teacher information below.'
                  : 'Fill in the details to add a new teacher.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-[calc(100%-140px)]"
        >
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Personal Information */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange('last_name')}
                    required
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Contact Information */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="teacher@school.co.uk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Phone Number</Label>
                  <Input
                    id="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={handleChange('contact')}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={handleChange('address')}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Expertise & Styles */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Expertise & Styles
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_styles">Primary Styles</Label>
                  <Input
                    id="primary_styles"
                    value={formData.primary_styles}
                    onChange={handleChange('primary_styles')}
                    placeholder="Street Dance, Hip Hop, Commercial"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple styles with commas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_styles">Secondary Styles</Label>
                  <Input
                    id="secondary_styles"
                    value={formData.secondary_styles}
                    onChange={handleChange('secondary_styles')}
                    placeholder="Contemporary Drama, Yoga"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple styles with commas
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* General Notes */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                General Notes
              </h3>
              <Textarea
                id="general_notes"
                value={formData.general_notes}
                onChange={handleChange('general_notes')}
                placeholder="Add any additional notes about this teacher..."
                rows={4}
              />
            </section>
          </div>

          {/* Footer Actions */}
          <SheetFooter className="p-6 pt-4 border-t mt-auto">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {teacher ? 'Save Changes' : 'Create Teacher'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
