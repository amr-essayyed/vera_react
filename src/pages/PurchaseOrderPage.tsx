import PurchaseOrderRow from "@/components/PurchaseOrderRow";
import ResourceTable from "@/components/ResourceTable";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import IndicatorCard from "@/components/IndicatorCard";
import { FileTextIcon, SendIcon, ClockIcon, CheckCircleIcon } from "@/components/icons/PurchaseOrderIcons";

export default function PurchaseOrderPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <PageHeader
                title="Purchase Orders"
                description="Manage your purchase orders and track their progress"
                actionButton={{
                    label: "+ New Purchase Order",
                    link: <Link to={`create`}>Create Purchase Order</Link>,
                }}
            />

            <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4 ">
                <IndicatorCard
                    icon={FileTextIcon}
                    value={3}
                    description={'Draft RFQs'}
                    color="blue"
                />
                <IndicatorCard
                    icon={SendIcon}
                    value={2}
                    description={'RFQ Sent'}
                    color="orange"
                />
                <IndicatorCard
                    icon={ClockIcon}
                    value={1}
                    description={'To Approve'}
                    color="yellow"
                />
                <IndicatorCard
                    icon={CheckCircleIcon}
                    value={8}
                    description={'Confirmed'}
                    color="green"
                />
            </div>
            

            {/* Main content area */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div>
                    <ResourceTable
                        ResourceRow={PurchaseOrderRow}
                        resourceName="purchaseOrder"
                        columns={['PO Number', 'Vendor', 'Order Date', 'Planned Date', 'Status', 'Total Amount']}
                    />
                </div>
            </div>
        </div>
        );
}
