import type { tMasterOrder } from "@/types/masterOrder";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function MasterOrderCard({ masterOrder }: { masterOrder: tMasterOrder }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{masterOrder.name}</CardTitle>
                <CardDescription>{masterOrder.project_name}</CardDescription>
                <CardAction>
                    <Button variant={"ghost"}>
                        <Link to={`/master-orders/${masterOrder.id}`}>view</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter className="justify-end">
                <span className="text-green-400 text-xl">${masterOrder.amount_total}</span>
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