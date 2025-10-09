import PageHeader from "@/components/PageHeader"
import ResourceTable from "@/components/ResourceTable"
import SalesOrderRow from "@/components/SalesOrderRow"
import { Link } from "react-router-dom"

export const SalesOrderLinePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <PageHeader
                title="Sales"
                description="Manage your sales order and track thier progress "
                actionButton={{
                    label: "+ New Purchase Order",
                    link: <Link to={`create`}>Create Sales Order</Link>,
                }}
            />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div>
                    <ResourceTable
                        ResourceRow={SalesOrderRow}
                        resourceName="salesOrder"
                        columns={['SO Number', 'Customer Name', "Salesman Name", 'Creation Date', 'Status', 'Total Amount']}
                    />
                </div>
            </div>
        </div>
    )
}

export default SalesOrderLinePage