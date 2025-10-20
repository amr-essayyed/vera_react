export const formatState = (state?: string): string => {
    const stateMap: Record<string, string> = {
        draft: "Quotation",
        sent: "Quotation Sent",
        sale: "Sales Order",
        cancel: "Cancelled",
        done: "Done",
    }
    return state ? stateMap[state] || state : "Quotation"
}


export const formatCurrency = (amount?: number): string => {
    return amount ? `$${amount.toFixed(2)}` : "$0.00"
}