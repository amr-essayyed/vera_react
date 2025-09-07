import { useAllResource } from "@/hooks/useResource"
import LoadingSubPage from "./LoadingSubPage";

import { type MasterOrder } from "@/types/masterOrder";
import MasterOrderCard from "./MasterOrderCard";

export default function MasterOrderList() {
    const {data, isLoading} = useAllResource('master_orders');
    
    if(isLoading) return <LoadingSubPage />

    return (
        <div className="w-full p-6 mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Orders</h1>
                <p>Manage your orders and track their progress</p>
            </div>
            <div className="flex flex-col gap-4">
                {data.map((order: MasterOrder)=> (<MasterOrderCard key={order.id} order={order} />) )}
            </div>
        </div>
    )
}
