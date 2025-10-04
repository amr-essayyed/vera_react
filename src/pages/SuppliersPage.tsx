import SupplierRow from "@/components/SupplierRow";
import ResourceTable from "@/components/ResourceTable";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import IndicatorCard from "@/components/IndicatorCard";
import { Building2, Users, Globe, CheckCircle } from "lucide-react";

export default function SuppliersPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <PageHeader
                title="Suppliers"
                description="Manage your supplier relationships and vendor information"
                actionButton={{
                    label: "+ New Supplier",
                    link: <Link to={`create`}>Add Supplier</Link>,
                }}
            />

            <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4">
                <IndicatorCard
                    icon={Building2}
                    value={12}
                    description={'Total Suppliers'}
                    color="blue"
                />
                <IndicatorCard
                    icon={CheckCircle}
                    value={10}
                    description={'Active Suppliers'}
                    color="green"
                />
                <IndicatorCard
                    icon={Globe}
                    value={8}
                    description={'International'}
                    color="purple"
                />
                <IndicatorCard
                    icon={Users}
                    value={4}
                    description={'New This Month'}
                    color="orange"
                />
            </div>
            
            {/* Main content area */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div>
                    <ResourceTable
                        ResourceRow={SupplierRow}
                        resourceName="contact"
                        condition={[["supplier_rank", ">", 0]]}
                        columns={['Company', 'Contact Info', 'Address', 'Country', 'Website', 'Status']}
                    />
                </div>
            </div>
        </div>
    );
}