import { ButtonService } from "@/services/buttonService";
import { Button } from "./ui/button";
import type { IdRef } from "@/types/odooSchemas";

export default function ButtonPanel({orderId}: {orderId: IdRef}) {
    return (
        <Button onClick={()=>
                    { 
                        console.log("[out]");
                        if (orderId) {
                            console.log("[here]");
                            
                            ButtonService.callConfirm("purchaseOrder", orderId)
                        }
                    } 
                }>Confirm Order</Button>
    )
}
