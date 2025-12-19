import { useEffect } from "react";
import MasterOrderForm from "../components/MasterOrderForm";
import MasterOrderFormC from "../components/MasterOrderFormContr";
import { ResourceService } from "@/services/resourceService";

export default function MasterOrderCreatePage() {
  return (
    <div className="p-6">
        <MasterOrderFormC />
    </div>
  )
}
