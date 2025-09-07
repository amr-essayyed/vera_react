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

export default function MasterOrderCard({order}: {order:MasterOrder}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{order.name}</CardTitle>
                <CardDescription>{order.project_name}</CardDescription>
                <CardAction>Card Action</CardAction>
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