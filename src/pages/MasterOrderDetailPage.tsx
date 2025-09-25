import { Link, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useResourceById, useAllResource } from "@/hooks/useResource";
import { useClientName, useVendorName } from "@/hooks/useClientName";
import LoadingSubPage from "@/components/LoadingSubPage";
import type { tMasterOrder } from "@/types/masterOrder";
import { workflowTypeOptions } from "@/types/masterOrder";

export default function MasterOrderDetailPage() {
    const params = useParams();
    const { data, isLoading, error } = useResourceById<tMasterOrder>('masterOrder', String(params.id));
    const { data: masterOrderLines, isLoading: linesLoading } = useAllResource('masterOrderLine');
    
    const masterOrder: tMasterOrder | undefined = Array.isArray(data) ? data[0] : data;
    
    // Get client and vendor names
    const { clientName } = useClientName(masterOrder?.client_id);
    const { vendorName } = useVendorName(masterOrder?.vendor_id);
    
    // Filter lines for this master order
    const orderLines = masterOrderLines?.filter((line: any) => 
        String(line.master_id) === String(params.id) || 
        (Array.isArray(line.master_id) && String(line.master_id[0]) === String(params.id))
    ) || [];

    const formatCurrency = (amount?: number) => {
        return amount ? `$${amount.toFixed(2)}` : "$0.00";
    };

    const formatDate = (date?: string) => {
        return date ? new Date(date).toLocaleDateString() : "Not set";
    };

    const formatPriority = (priority?: string) => {
        const priorityMap = { "1": "Low", "2": "Medium", "3": "High" };
        return priority ? priorityMap[priority as keyof typeof priorityMap] || priority : "Not set";
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "3": return "destructive";
            case "2": return "default";
            case "1": return "secondary";
            default: return "outline";
        }
    };

    const getWorkflowTypeLabel = (type?: string) => {
        const option = workflowTypeOptions.find(opt => opt.value === type);
        return option ? option.label : type || "Not set";
    };

    if (isLoading) return <LoadingSubPage />;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error loading master order:</strong> {error.message}
                </div>
            </div>
        );
    }

    if (!masterOrder) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">Master Order not found</div>
                    <Link to="/master-orders">
                        <Button variant="outline">Back to Master Orders</Button>
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
                    <Link to="/master-orders" className="text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Master Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {masterOrder.name || `Master Order #${params.id}`}
                    </h1>
                    <p className="text-gray-600 mt-1">{masterOrder.project_name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button variant="outline">Print</Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(masterOrder.amount_total)}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={getPriorityColor(masterOrder.priority)}>
                            {formatPriority(masterOrder.priority)}
                        </Badge>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Expected Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">
                            {formatDate(masterOrder.date_expected)}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Commission Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">
                            {masterOrder.commission_rate ? `${masterOrder.commission_rate}%` : "Not set"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="lines">Order Lines ({orderLines.length})</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Order Number</label>
                                    <p className="text-lg">{masterOrder.name || "Auto-generated"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Project Name</label>
                                    <p className="text-lg">{masterOrder.project_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Order Date</label>
                                    <p className="text-lg">{formatDate(masterOrder.date_order)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Expected Date</label>
                                    <p className="text-lg">{formatDate(masterOrder.date_expected)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Partners</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Client</label>
                                    <p className="text-lg">{clientName || "Not assigned"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Vendor</label>
                                    <p className="text-lg">{vendorName || "Not assigned"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Workflow & Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Workflow Type</label>
                                    <p className="text-sm mt-1">{getWorkflowTypeLabel(masterOrder.workflow_type)}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Priority</label>
                                        <div className="mt-1">
                                            <Badge variant={getPriorityColor(masterOrder.priority)}>
                                                {formatPriority(masterOrder.priority)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Commission Rate</label>
                                        <p className="text-lg">{masterOrder.commission_rate ? `${masterOrder.commission_rate}%` : "Not set"}</p>
                                    </div>
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
                            {linesLoading ? (
                                <div className="text-center py-4">Loading order lines...</div>
                            ) : orderLines.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2">Product</th>
                                                <th className="text-right py-2">Quantity</th>
                                                <th className="text-right py-2">Unit Price</th>
                                                <th className="text-right py-2">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderLines.map((line: any, index: number) => (
                                                <tr key={line.id || index} className="border-b">
                                                    <td className="py-3">{line.name || "Unnamed Product"}</td>
                                                    <td className="text-right py-3">{line.quantity || 0}</td>
                                                    <td className="text-right py-3">{formatCurrency(line.price_unit)}</td>
                                                    <td className="text-right py-3 font-semibold">
                                                        {formatCurrency(line.price_subtotal || (line.quantity * line.price_unit))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 font-bold">
                                                <td colSpan={3} className="text-right py-3">Total:</td>
                                                <td className="text-right py-3 text-green-600">
                                                    {formatCurrency(masterOrder.amount_total)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No order lines found
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="workflow" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workflow Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 mb-4">
                                    Current workflow: {getWorkflowTypeLabel(masterOrder.workflow_type)}
                                </div>
                                
                                {/* Workflow steps - this would be dynamic based on workflow_type */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">Order Created</span>
                                        <span className="text-xs text-gray-500">{formatDate(masterOrder.date_order)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm">In Progress</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                                        <span className="text-sm text-gray-500">Pending Completion</span>
                                        <span className="text-xs text-gray-500">Expected: {formatDate(masterOrder.date_expected)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-l-2 border-blue-500 pl-4 py-2">
                                    <div className="font-medium">Order Created</div>
                                    <div className="text-sm text-gray-600">
                                        Master order was created with project: {masterOrder.project_name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(masterOrder.date_order)}
                                    </div>
                                </div>
                                
                                {/* Additional history items would be loaded from a separate API */}
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No additional history available
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
