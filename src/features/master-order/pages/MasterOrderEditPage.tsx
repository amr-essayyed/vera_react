import { useManyResourceByProp, useResourceById } from "@/hooks/useResource";
import MasterOrderForm from "../components/MasterOrderForm";
import { useParams } from "react-router-dom";
import LoadingSubPage from "@/components/LoadingSubPage";
import type { tr_MasterOrder } from "@/types/masterOrder";
// import type { tc_MasterOrderLine } from "@/types/masterOrderLine";
// import type { tr_productProd } from "@/types/product";

export default function MasterOrderEditPage() {
    const {id} = useParams()
    const {data: masterOrder, isLoading} = useResourceById<tr_MasterOrder>("masterOrder", parseInt(id as string));
    const {data: lines, isLoading: isLinesLoading} = useManyResourceByProp("masterOrderLine", "id", masterOrder?.line_ids || [], masterOrder);
    // const {data: products} = useManyResourceByProp("productProd", "id", lines?.map((l:tc_MasterOrderLine)=>l.product_id?.[0]), lines);
    // const fullLines = lines?.map((l: tc_MasterOrderLine)=>l.image_1920 = products?.find((p: tr_productProd)=>p.id == l.product_id)?.image_1920);
    // console.log("full: ", fullLines);
    
    if ( isLoading || isLinesLoading ) return <LoadingSubPage message="Loading Data" />

    return (
        <div className="p-6">
            <MasterOrderForm masterOrder={masterOrder} lines={lines} />
        </div>
    )
}
