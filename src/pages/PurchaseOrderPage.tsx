import PageHeader from "@/components/PageHeader";
import PurchaseOrderCard from "@/components/PurchaseOrderCard";
import PurchaseOrderList from "@/components/ResourceList";
import { Link } from "react-router-dom";

export default function PurchaseOrderPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <PageHeader
                title="Purchase Orders"
                description="Manage your orders and track their progress"
                actionButton={{
                    label: "+ New Order",
                    link: <Link to={`create`}>Create Purchase Order</Link>,
                }}
            />

            
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div>
                    <PurchaseOrderList 
                        ResourceCard={PurchaseOrderCard}
                        resourceName="purchaseOrder"
                    />
                </div>
            </div>
        </div>
    )
}
