import type { MasterOrder } from "@/types/masterOrder";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function PurchaseOrderCard({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{purchaseOrder.name}</CardTitle>
                <CardDescription>{purchaseOrder.notes}</CardDescription>
                <CardAction>
                    <Button variant={"ghost"}>
                        <Link to={`/purchase-orders/${purchaseOrder.id}`}>view</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    )
}

    // <div className="card border-2 rounded">
    //     <div>order: {order.name} </div>
    //     <div>Project Name: {order.project_name} </div>
    //     <div>date expected: {order.date_expected} </div>
    //     <div>Vendor: {order.vendor_id} </div>
    //     <div>total amount: {order.amount_total} </div>
    // </div>