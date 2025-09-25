import type { PurchaseOrder } from "@/types/purchaseOrder";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useVendorName } from "@/hooks/useClientName";

export default function PurchaseOrderRow({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) {
	// Get vendor name from partner_id
	const { vendorName } = useVendorName(purchaseOrder.partner_id);

	const formatCurrency = (amount?: number) => {
		return amount ? `$${amount.toFixed(2)}` : "-";
	};

	const formatDate = (date?: string) => {
		return date ? new Date(date).toLocaleDateString() : "-";
	};

	const formatState = (state?: string) => {
		const stateMap = {
			"draft": "Draft",
			"sent": "RFQ Sent", 
			"to approve": "To Approve",
			"purchase": "Purchase Order",
			"done": "Done",
			"cancel": "Cancelled"
		};
		return state ? stateMap[state as keyof typeof stateMap] || state : "-";
	};

	const getStateColor = (state?: string) => {
		switch (state) {
			case "draft": return "bg-gray-100 text-gray-800";
			case "sent": return "bg-blue-100 text-blue-800";
			case "to approve": return "bg-yellow-100 text-yellow-800";
			case "purchase": return "bg-green-100 text-green-800";
			case "done": return "bg-green-100 text-green-800";
			case "cancel": return "bg-red-100 text-red-800";
			default: return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<tr className="hover:bg-gray-50">
			<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchaseOrder.name || "-"}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendorName || "-"}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(purchaseOrder.date_order)}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(purchaseOrder.date_planned)}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(purchaseOrder.state)}`}>
					{formatState(purchaseOrder.state)}
				</span>
			</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-green-600">{formatCurrency(purchaseOrder.amount_total)}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				<Button variant="ghost" size="sm">
					<Link to={`/purchase-orders/${purchaseOrder.id}`}>View</Link>
				</Button>
			</td>
		</tr>
	);
}