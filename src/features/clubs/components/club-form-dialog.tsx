import { useEffect, useState } from 'react'
import { useCreateClub, useUpdateClub } from '../api/mutations'
import type { Club } from '@/types/club.types'
import { useSchools } from '@/hooks/use-schools'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ClubFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  club?: Club | null // If present, we are editing
}

export function ClubFormDialog({
  open,
  onOpenChange,
  club,
}: ClubFormDialogProps) {
  const isEditing = !!club
  const createClub = useCreateClub()
  const updateClub = useUpdateClub()
  const { data: schools } = useSchools()

  const [formData, setFormData] = useState({
    club_name: '',
    club_code: '',
    school_id: '',
    description: '',
    status: 'active' as Club['status'],
  })

  const [error, setError] = useState<string | null>(null)

  // Load club data when editing
  useEffect(() => {
    setError(null)
    if (club) {
      setFormData({
        club_name: club.club_name,
        club_code: club.club_code,
        school_id: club.school_id,
        description: club.description || '',
        status: club.status,
      })
    } else {
      // Reset form when opening in create mode
      setFormData({
        club_name: '',
        club_code: '',
        school_id: '',
        description: '',
        status: 'active',
      })
    }
  }, [club, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (club) {
        await updateClub.mutateAsync({
          id: club.id,
          ...formData,
        })
      } else {
        await createClub.mutateAsync(formData)
      }
      onOpenChange(false)
    } catch (err: any) {
      console.error('Failed to save club:', err)
      const errorMessage =
        err?.message ||
        err?.details ||
        'An error occurred while saving the club.'
      setError(errorMessage)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isLoading = createClub.isPending || updateClub.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Club' : 'Add New Club'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of the club below.'
              : 'Fill in the details to create a new club.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="club_name">Club Name</Label>
            <Input
              id="club_name"
              value={formData.club_name}
              onChange={(e) => handleChange('club_name', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="club_code">Club Code</Label>
            <Input
              id="club_code"
              value={formData.club_code}
              onChange={(e) => handleChange('club_code', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="school">School</Label>
            <Select
              value={formData.school_id}
              onValueChange={(value) => handleChange('school_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.school_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEditing && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('description', e.target.value)
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update Club'
                  : 'Create Club'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
