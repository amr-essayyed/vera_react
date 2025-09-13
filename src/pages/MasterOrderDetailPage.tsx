import { Link, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResourceById } from "@/hooks/useResource";
import LoadingSubPage from "@/components/LoadingSubPage";
import type { MasterOrder } from "@/types/masterOrder";

export default function MasterOrderDetailPage() {
    const params = useParams();
    const {data, isLoading} = useResourceById<MasterOrder>('masterOrder', String(params.id));
    const masterOrder: MasterOrder | undefined = data[0];
    
    if(isLoading) return <LoadingSubPage />;

    return (
        <div className="p-6">
            <Link to={`/master-orders`}><span className="hover:underline">&lt;-- Back to Master Orders</span></Link>
            <h1 className="text-3xl font-bold">MasterOrder {params.id} Detail Page</h1>

            <div className="card">
                <div>Project Name: {masterOrder?.project_name}</div>
                <div>Expected Date: {masterOrder?.date_expected}</div>
                <div>Total Amount: {masterOrder?.amount_total}</div>

            </div>

            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
        </div>
    )
}
