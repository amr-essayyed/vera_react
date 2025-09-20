import MasterOrderRow from "@/components/MasterOrderRow";
import ResourceTable from "@/components/ResourceTable";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import IndicatorCard from "@/components/IndicatorCard";
import { Clock3, LoaderCircle, Siren, Truck } from "lucide-react";

export default function MasterOrderPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <PageHeader
                title="Master Orders"
                description="Manage your orders and track their progress"
                actionButton={{
                    label: "+ New Master Order",
                    link: <Link to={`create`}>Create Master Order</Link>,
                }}
            />

            <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4 ">
                <IndicatorCard
                    icon={Clock3}
                    value={7}
                    description={'Pending Orders'}
                    color="blue"
                />
                <IndicatorCard
                    icon={LoaderCircle}
                    value={5}
                    description={'In Progress'}
                    color="orange"
                />
                <IndicatorCard
                    icon={Siren}
                    value={2}
                    description={'Delayed'}
                    color="red"
                />
                <IndicatorCard
                    icon={Truck}
                    value={10}
                    description={'Shipped'}
                    color="green"
                />
            </div>
            

            {/* Main content area */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div>
                    <ResourceTable
                        ResourceRow={MasterOrderRow}
                        resourceName="masterOrder"
                        columns={['Name', 'Project Name', 'Client', 'Vendor', 'Expected Date', 'Priority', 'Total Amount']}
                    />
                </div>
            </div>
        </div>
        );
}
