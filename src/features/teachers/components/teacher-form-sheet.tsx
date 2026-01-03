"use client"

import * as React from "react"
import { Teacher } from "@/types/teacher.types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TeacherFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: Teacher | null
  onSave: (teacher: Partial<Teacher>) => void
}

export function TeacherFormSheet({
  open,
  onOpenChange,
  teacher,
  onSave,
}: TeacherFormSheetProps) {
  const [formData, setFormData] = React.useState<Partial<Teacher>>({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    phone: "",
    school_id: "",
  })

  React.useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email,
        department: teacher.department,
        phone: teacher.phone,
        school_id: teacher.school_id,
      })
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        phone: "",
        school_id: "",
      })
    }
  }, [teacher, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const handleChange = (field: keyof Teacher) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{teacher ? "Edit Teacher" : "Add Teacher"}</SheetTitle>
          <SheetDescription>
            {teacher
              ? "Update teacher information below."
              : "Fill in the details to add a new teacher."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={handleChange("first_name")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={handleChange("last_name")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={handleChange("department")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange("phone")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school_id">School ID (Optional)</Label>
            <Input
              id="school_id"
              value={formData.school_id}
              onChange={handleChange("school_id")}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {teacher ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
