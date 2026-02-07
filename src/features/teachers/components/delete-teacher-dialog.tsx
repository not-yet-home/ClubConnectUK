'use client'

import type { Teacher } from '@/types/teacher.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteTeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher | null
  onConfirm: (teacher: Teacher) => void
}

export function DeleteTeacherDialog({
  open,
  onOpenChange,
  teacher,
  onConfirm,
}: DeleteTeacherDialogProps) {
  const handleConfirm = () => {
    if (teacher) {
      onConfirm(teacher)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong>
              {teacher?.first_name} {teacher?.last_name}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
