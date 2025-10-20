import { Button } from "@/components/ui/button"

const ACTION_BUTTONS = [
    { name: "Send", action: "action_quotation_send" },
    { name: "Confirm", action: "action_confirm" },
    { name: "Cancel", action: "action_cancel" },
    { name: "Set To Quotation", action: "action_draft" }
]

interface SalesOrderActionButtonsProps {
    isCanceled: boolean

    onButtonClick: (button: any) => void
}

export const SalesOrderActionButtons = ({ isCanceled, onButtonClick }: SalesOrderActionButtonsProps) => {
    const buttons = isCanceled
        ? ACTION_BUTTONS.filter(b => b.action === "action_draft")
        : ACTION_BUTTONS.filter(b => b.action !== "action_draft")

    return (
        <div className="flex gap-2">
            {buttons.map(button => (
                <Button
                    key={button.action}
                    type="button"
                    variant="default"
                    // disabled={button.action === "action_cancel"}

                    onClick={() => onButtonClick(button)}
                >
                    {button.name}
                </Button>
            ))
            }
        </div >
    )
}