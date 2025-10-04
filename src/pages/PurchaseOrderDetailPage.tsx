import { Link, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { useResourceById, useAllResource } from "@/hooks/useResource";
import { useVendorName } from "@/hooks/useClientName";
import LoadingSubPage from "@/components/LoadingSubPage";
import type { tPurchaseOrder, tPurchaseOrderLine } from "@/types/purchaseOrder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResourceService } from "@/services/resourceService";

export default function PurchaseOrderDetailPage() {
	const params = useParams();

	const queryClient = useQueryClient();
	// const { data, isLoading, error } = useResourceById<PurchaseOrder>('purchaseOrder', String(params.id));
	const {
		data: purchaseOrderArray,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["purchaseOrder", String(params.id)],
		queryFn: async () => await ResourceService.getById("purchaseOrder", String(params.id)),
		initialData: () => {
			const resourceData = queryClient.getQueryData<tPurchaseOrder[]>(["purchaseOrder"]);
			const data: tPurchaseOrder | undefined = resourceData?.find((d) => String(d.id) === String(params.id));
			return data;
		},
	});

	const purchaseOrder: tPurchaseOrder = purchaseOrderArray?.[0];
	console.log(purchaseOrder);

	// Fetch purchase order lines based on the IDs from purchaseOrder.order_line
	const { data: purchaseOrderLines = [] } = useQuery({
		queryKey: ["purchaseOrderLine", String(purchaseOrder?.id)],
		queryFn: async () => await ResourceService.getAll("purchaseOrderLine", [["order_id", "=", purchaseOrder?.id]]),
		enabled: !!purchaseOrder?.order_line && purchaseOrder.order_line.length > 0,
	});

	// Get vendor name
	const { vendorName } = useVendorName(purchaseOrder?.partner_id);

	const formatCurrency = (amount?: number) => {
		return amount ? `$${amount.toFixed(2)}` : "$0.00";
	};

	const formatDate = (date?: string | false) => {
		return date && typeof date === "string" ? new Date(date).toLocaleDateString() : "Not set";
	};

	const formatState = (state?: string) => {
		const stateMap = {
			draft: "Draft",
			sent: "RFQ Sent",
			"to approve": "To Approve",
			purchase: "Purchase Order",
			done: "Done",
			cancel: "Cancelled",
		};
		return state ? stateMap[state as keyof typeof stateMap] || state : "Draft";
	};

	const getStateColor = (state?: string) => {
		switch (state) {
			case "draft":
				return "secondary";
			case "sent":
				return "default";
			case "to approve":
				return "default";
			case "purchase":
				return "default";
			case "done":
				return "default";
			case "cancel":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getInvoiceStatusLabel = (status?: string) => {
		const statusMap = {
			no: "Nothing to Invoice",
			"to invoice": "Waiting Bills",
			invoiced: "Fully Billed",
		};
		return status ? statusMap[status as keyof typeof statusMap] || status : "Not set";
	};

	if (isLoading) return <LoadingSubPage />;

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					<strong>Error loading purchase order:</strong> {error.message}
				</div>
			</div>
		);
	}

	if (!purchaseOrder) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<div className="text-gray-500 text-lg mb-2">Purchase Order not found</div>
					<Link to="/purchase-orders">
						<Button variant="outline">Back to Purchase Orders</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<Link to="/purchase-orders" className="text-blue-600 hover:underline mb-2 inline-block">
						← Back to Purchase Orders
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">{purchaseOrder.name || `Purchase Order #${params.id}`}</h1>
					<p className="text-gray-600 mt-1">Vendor: {vendorName}</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">Edit</Button>
					<Button variant="outline">Print</Button>
					<Button variant="outline">Send by Email</Button>
				</div>
			</div>

			{/* Status and Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
					</CardHeader>
					<CardContent>
						<Badge variant={getStateColor(purchaseOrder.state)}>{formatState(purchaseOrder.state)}</Badge>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{formatCurrency(purchaseOrder.amount_total)}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Order Date</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{formatDate(purchaseOrder.date_order)}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Planned Date</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-semibold">{formatDate(purchaseOrder.date_planned)}</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs defaultValue="details" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="lines">Order Lines</TabsTrigger>
					<TabsTrigger value="invoicing">Invoicing</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Purchase Order Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-gray-600">PO Number</label>
									<p className="text-lg">{purchaseOrder.name || "Auto-generated"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Vendor Reference</label>
									<p className="text-lg">{purchaseOrder.partner_ref || "Not provided"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Order Date</label>
									<p className="text-lg">{formatDate(purchaseOrder.date_order)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Planned Date</label>
									<p className="text-lg">{formatDate(purchaseOrder.date_planned)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Approval Date</label>
									<p className="text-lg">{formatDate(purchaseOrder.date_approve)}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Vendor Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-gray-600">Vendor</label>
									<p className="text-lg">{vendorName || "Not assigned"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Vendor Reference</label>
									<p className="text-lg">{purchaseOrder.partner_ref || "Not provided"}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Status & Amounts</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-gray-600">Status</label>
									<div className="mt-1">
										<Badge variant={getStateColor(purchaseOrder.state)}>{formatState(purchaseOrder.state)}</Badge>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Invoice Status</label>
									<p className="text-lg">{getInvoiceStatusLabel(purchaseOrder.invoice_status)}</p>
								</div>
								<div className="grid grid-cols-1 gap-2">
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Untaxed Amount:</span>
										<span>{formatCurrency(purchaseOrder.amount_untaxed)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Tax Amount:</span>
										<span>{formatCurrency(purchaseOrder.amount_tax)}</span>
									</div>
									<div className="flex justify-between font-bold text-lg border-t pt-2">
										<span>Total Amount:</span>
										<span className="text-green-600">{formatCurrency(purchaseOrder.amount_total)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Notes & Terms</CardTitle>
							</CardHeader>
							<CardContent>
								<div>
									<label className="text-sm font-medium text-gray-600">Terms and Conditions</label>
									<p className="text-sm mt-2 whitespace-pre-wrap">{purchaseOrder.notes || "No terms and conditions specified."}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="lines" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Order Lines</CardTitle>
						</CardHeader>
						<CardContent>
							{purchaseOrderLines && purchaseOrderLines.length > 0 ? (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2">Description</th>
												<th className="text-right py-2">Quantity</th>
												<th className="text-right py-2">Unit Price</th>
												<th className="text-right py-2">Subtotal</th>
											</tr>
										</thead>
										<tbody>
											{purchaseOrderLines.map((line: tPurchaseOrderLine, index: number) => (
												<tr key={line.id || index} className="border-b">
													<td className="py-3">{line.name || "Unnamed Product"}</td>
													<td className="text-right py-3">{line.product_qty || 0}</td>
													<td className="text-right py-3">{formatCurrency(line.price_unit)}</td>
													<td className="text-right py-3 font-semibold">{formatCurrency(line.price_subtotal)}</td>
												</tr>
											))}
										</tbody>
										<tfoot>
											<tr className="border-t-2">
												<td colSpan={3} className="text-right py-3">
													Subtotal:
												</td>
												<td className="text-right py-3">{formatCurrency(purchaseOrder.amount_untaxed)}</td>
											</tr>
											<tr>
												<td colSpan={3} className="text-right py-1">
													Tax:
												</td>
												<td className="text-right py-1">{formatCurrency(purchaseOrder.amount_tax)}</td>
											</tr>
											<tr className="font-bold">
												<td colSpan={3} className="text-right py-3">
													Total:
												</td>
												<td className="text-right py-3 text-green-600">{formatCurrency(purchaseOrder.amount_total)}</td>
											</tr>
										</tfoot>
									</table>
								</div>
							) : (
								<div className="text-center py-8 text-gray-500">No order lines found</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="invoicing" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Invoicing Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium text-gray-600">Invoice Status</label>
									<p className="text-lg">{getInvoiceStatusLabel(purchaseOrder.invoice_status)}</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium mb-2">Invoice Summary</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>Untaxed Amount:</span>
											<span>{formatCurrency(purchaseOrder.amount_untaxed)}</span>
										</div>
										<div className="flex justify-between">
											<span>Tax Amount:</span>
											<span>{formatCurrency(purchaseOrder.amount_tax)}</span>
										</div>
										<div className="flex justify-between font-bold border-t pt-2">
											<span>Total Amount:</span>
											<span>{formatCurrency(purchaseOrder.amount_total)}</span>
										</div>
									</div>
								</div>

								<div className="text-center py-4 text-gray-500 text-sm">No vendor bills created yet</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Purchase Order History</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="border-l-2 border-blue-500 pl-4 py-2">
									<div className="font-medium">Purchase Order Created</div>
									<div className="text-sm text-gray-600">Purchase order was created for vendor: {vendorName}</div>
									<div className="text-xs text-gray-500 mt-1">{formatDate(purchaseOrder.date_order)}</div>
								</div>

								{purchaseOrder.date_approve && (
									<div className="border-l-2 border-green-500 pl-4 py-2">
										<div className="font-medium">Purchase Order Approved</div>
										<div className="text-sm text-gray-600">Purchase order was approved and confirmed</div>
										<div className="text-xs text-gray-500 mt-1">{formatDate(purchaseOrder.date_approve)}</div>
									</div>
								)}

								<div className="text-center py-4 text-gray-500 text-sm">No additional history available</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
