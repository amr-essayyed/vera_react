import type { tMasterOrder } from "@/types/masterOrder";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useClientName, useVendorName } from "@/hooks/useClientName";

export default function MasterOrderRow({ masterOrder }: { masterOrder: tMasterOrder }) {
	// Get client and vendor names from their respective IDs (no API call needed since names are included in the data)
	const { clientName } = useClientName(masterOrder.client_id);
	const { vendorName } = useVendorName(masterOrder.vendor_id);
	const formatCurrency = (amount?: number) => {
		return amount ? `$${amount.toFixed(2)}` : "-";
	};

	const formatDate = (date?: string) => {
		return date ? new Date(date).toLocaleDateString() : "-";
	};

	const formatPriority = (priority?: string) => {
		const priorityMap = { "1": "Low", "2": "Medium", "3": "High" };
		return priority ? priorityMap[priority as keyof typeof priorityMap] || priority : "-";
	};

	const formatPercentage = (rate?: number) => {
		return rate !== undefined && rate !== null ? `${rate.toFixed(2)}%` : "-";
	};

	return (
		<tr className="hover:bg-gray-50">
			<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{masterOrder.name || "-"}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{masterOrder.project_name || "-"}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{clientName || "-"}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendorName || "-"}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(masterOrder.date_expected)}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${masterOrder.priority === "3" ? "bg-red-100 text-red-800" : masterOrder.priority === "2" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{formatPriority(masterOrder.priority)}</span>
			</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-green-600">{formatCurrency(masterOrder.amount_total)}</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				<Button variant="ghost" size="sm">
					<Link to={`/master-orders/${masterOrder.id}`}>View</Link>
				</Button>
			</td>
		</tr>
	);
}
