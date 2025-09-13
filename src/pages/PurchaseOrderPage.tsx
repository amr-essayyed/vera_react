import PageHeader from "@/components/PageHeader";
import PurchaseOrderCard from "@/components/PurchaseOrderCard";
import PurchaseOrderList from "@/components/ResourceList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PurchaseOrderPage() {
    return (
        <div className="w-full p-6 mx-auto">
            <PageHeader
                title="Purchase Orders"
                description="Manage your orders and track their progress"
                // actionButton={{
                //     label: "+ New Order",
                //     dialogContent: <></>,
                // }}
            />

            <Button asChild>
                <Link to={`create`}>create a purchase order</Link>
            </Button>

            <PurchaseOrderList 
                ResourceCard={PurchaseOrderCard}
                resourceName="purchaseOrder"
            />
        </div>
    )
}
