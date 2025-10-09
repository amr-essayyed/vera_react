import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useClientName, useVendorName } from "@/hooks/useClientName";
import type { SalesOrder } from "@/types/salesOrder";

export default function SalesOrderRow({salesOrder }: { SalesOrder: SalesOrder }) {
    // Get vendor name from partner_id
    const { user_id, partner_id, name, date_order, state, amount_total, id } = salesOrder;
    const { vendorName } = useVendorName(
        partner_id
    );

    const { clientName } = useClientName(user_id)

    const formatCurrency = (amount?: number) => {
        return amount ? `$${amount.toFixed(2)}` : "-";
    };

    const formatDate = (date?: string) => {
        return date ? new Date(date).toLocaleDateString() : "-";
    };

    const formatState = (state?: string) => {
        const stateMap = {
            "draft": "Quotation",
            "sent": "Quotation Sent",
            "sale": "Sales Order",
            "cancel": "Cancelled"
        };
        return state ? stateMap[state as keyof typeof stateMap] || state : "-";
    };

    const getStateColor = (state?: string) => {
        switch (state) {
            case "draft": return "bg-gray-100 text-gray-800";
            case "sent": return "bg-blue-100 text-blue-800";
            case "sale": return "bg-yellow-100 text-yellow-800";

            case "cancel": return "bg-red-100 text-red-800";
            default: return "bg-blue-100 text-black-800";
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{name || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendorName || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{clientName || "-"}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(date_order)}</td>
            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(date_planned)}</td> */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(state)}`}>
                    {formatState(state)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm  font-semibold text-green-600">{formatCurrency(amount_total)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Button variant="ghost" size="sm">
                    <Link to={`/sales/${id}`}>View</Link>
                </Button>
            </td>
        </tr>
    );
}