import { formatState } from "@/utils/formatter"
import { SalesOrderActionButtons } from "./SalesOrderActionButtons"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"

interface SalesOrderHeaderProps {
    state?: string
    isEditable: boolean
    canEdit: boolean
    onEdit: () => void
    onCancel: () => void
    onButtonClick: (button: any) => void
    isCanceled: boolean
}

export const SalesOrderHeader = ({
    state,
    isEditable,
    canEdit,
    onEdit,
    onCancel,
    onButtonClick,
    isCanceled,

}: SalesOrderHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <Link to="/sales" className="text-blue-600 hover:underline mb-2 inline-block">
                    ← Back to Sales Orders
                </Link>
                <p className="text-gray-600 mt-1">
                    State: <span className="font-semibold">{formatState(state)}</span>
                </p>
            </div>

            <div className="flex gap-2">
                {isEditable ? (
                    <>
                        <Button type="submit" variant="default">Save</Button>
                        <Button variant="outline" type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button variant="outline" disabled={!canEdit} onClick={onEdit}>
                        Edit
                    </Button>
                )}
                <SalesOrderActionButtons
                    isCanceled={isCanceled}
                    onButtonClick={onButtonClick}
                />
            </div>
        </div>
    )
}
