import MasterOrderCard from "@/components/MasterOrderCard";
import MasterOrderList from "@/components/ResourceList";
import PageHeader from "@/components/PageHeader";

export default function MasterOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <PageHeader
        title="Master Orders"
        description="Manage your orders and track their progress"
        // actionButton={{
        //   label: "+ New Order",
        //   dialogContent: <></>,
        // }}
      />

      {/* Main content area */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <MasterOrderList
            ResourceCard={MasterOrderCard}
            resourceName="masterOrder"
          />
        </div>
      </div>
    </div>
  );
}
