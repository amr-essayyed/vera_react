import type { Contact } from "@/types/contact";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Building2, Mail, Phone, Globe } from "lucide-react";

export default function SupplierRow({ supplier }: { supplier: Contact }) {
	const formatAddress = () => {
		const parts = [supplier?.street, supplier?.city, supplier?.zip].filter(Boolean);
		return parts.length > 0 ? parts.join(", ") : "-";
	};

	const getCountryName = () => {
		if (typeof supplier?.country_id === 'object' && supplier.country_id?.name) {
			return supplier?.country_id.name;
		}
		return "-";
	};



	return (
		<tr className="hover:bg-gray-50">
			<td className="px-6 py-4 whitespace-nowrap">
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10">
						{supplier?.avatar_1024 ? (
							<img 
								className="h-10 w-10 rounded-full object-cover" 
								src={`data:image/png;base64,${supplier?.avatar_1024}`} 
								alt={supplier?.name}
							/>
						) : (
							<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
								<Building2 className="h-5 w-5 text-gray-500" />
							</div>
						)}
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900">{supplier?.name}</div>
						{supplier?.vat && (
							<div className="text-sm text-gray-500">VAT: {supplier?.vat}</div>
						)}
					</div>
				</div>
			</td>
			<td className="px-6 py-4 whitespace-nowrap">
				<div className="text-sm text-gray-900">
					{supplier?.email ? (
						<div className="flex items-center">
							<Mail className="h-4 w-4 mr-1 text-gray-400" />
							{supplier?.email}
						</div>
					) : "-"}
				</div>
				{supplier?.phone && (
					<div className="text-sm text-gray-500 flex items-center mt-1">
						<Phone className="h-4 w-4 mr-1 text-gray-400" />
						{supplier?.phone}
					</div>
				)}
			</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				{formatAddress()}
			</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				{getCountryName()}
			</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				{supplier?.website ? (
					<div className="flex items-center">
						<Globe className="h-4 w-4 mr-1 text-gray-400" />
						<a 
							href={supplier?.website} 
							target="_blank" 
							rel="noopener noreferrer"
							className="text-blue-600 hover:text-blue-800"
						>
							Visit
						</a>
					</div>
				) : "-"}
			</td>
			<td className="px-6 py-4 whitespace-nowrap">
				<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
					supplier?.supplier_rank > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
				}`}>
					{supplier?.supplier_rank > 0 ? 'Active' : 'Inactive'}
				</span>
			</td>
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
				<Button variant="ghost" size="sm">
					<Link to={`/suppliers/${supplier?.id}`}>View</Link>
				</Button>
			</td>
		</tr>
	);
}