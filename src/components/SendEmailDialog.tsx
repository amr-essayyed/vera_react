import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface SendEmailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    emailTo: string
    onEmailToChange: (value: string) => void
    emailSubject: string
    onEmailSubjectChange: (value: string) => void
    emailBody: string
    onEmailBodyChange: (value: string) => void
    onSend: () => void
}

export const SendEmailDialog = ({
    open,
    onOpenChange,
    emailTo,
    onEmailToChange,
    emailSubject,
    onEmailSubjectChange,
    emailBody,
    onEmailBodyChange,
    onSend
}: SendEmailDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Quotation by Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">To</label>
                        <Input
                            value={emailTo}
                            onChange={e => onEmailToChange(e.target.value)}
                            placeholder="customer@example.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Subject</label>
                        <Input
                            value={emailSubject}
                            onChange={e => onEmailSubjectChange(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Message</label>
                        <Textarea
                            rows={6}
                            value={emailBody}
                            onChange={e => onEmailBodyChange(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onSend}>
                        Send Email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

