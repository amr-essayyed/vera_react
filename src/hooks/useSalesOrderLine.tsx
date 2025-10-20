import { useQuery } from "@tanstack/react-query"
import { ResourceService } from "@/services/resourceService"

export const useSalesOrderLines = (orderId?: string | number) => {
    return useQuery({
        queryKey: ["saleOrderLine", String(orderId)],
        queryFn: async () =>
            await ResourceService.getAll("saleOrderLine", [["order_id", "=", orderId]]),
        enabled: !!orderId,
    })
}