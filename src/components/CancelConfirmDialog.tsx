import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CancelConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export const CancelConfirmDialog = ({ open, onOpenChange, onConfirm }: CancelConfirmDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmation</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Are you sure you want to cancel this order? This may affect related documents or process.
                </DialogDescription>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm}>
                        Ok
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
