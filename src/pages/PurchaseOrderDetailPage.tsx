import { Link, useParams } from "react-router-dom";

export default function PurchaseOrderDetailPage() {
    const params = useParams();
    console.log(params);
    
    return (
        <>
            <Link to={`/purchase-orders`}><span className="hover:underline">&lt;-- Back to Purchase Orders</span></Link>
            <div>PurchaseOrder {params.id} Detail Page</div>
        </>
    )
}
