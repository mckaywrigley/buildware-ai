import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ThankYouDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ThankYouDialog({ isOpen, onClose }: ThankYouDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thank You!</DialogTitle>
          <DialogDescription>
            We appreciate your feedback. It helps us improve our service.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}