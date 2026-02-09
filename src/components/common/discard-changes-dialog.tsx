import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface DiscardChangesDialogProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    title?: string
    description?: string
}

export function DiscardChangesDialog({
    open,
    onConfirm,
    onCancel,
    title = 'Discard Changes?',
    description = 'You have unsaved changes. Are you sure you want to discard them and exit?',
}: DiscardChangesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="max-w-[400px] w-[35vw]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <DialogDescription>{description}</DialogDescription>
                </div>
                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button variant="outline" onClick={onCancel} className="flex-1">
                        Keep Editing
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="flex-1">
                        Discard Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
