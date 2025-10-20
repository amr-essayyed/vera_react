import { useEffect } from "react"
import { useParams,} from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { ResourceService } from "@/services/resourceService"

export const useSalesOrderDetails = () => {
    const params = useParams()
    const queryClient = useQueryClient()

    const form = useForm({
        defaultValues: {
            partner_id: "",
            partner_invoice_id: "",
            partner_shipping_id: "",
            payment_term_id: "",
            validity_date: "",
            state: ""
        },
    })

    const { data: salesOrderArray = [], isLoading, error } = useQuery({
        queryKey: ["salesOrder", String(params.id)],
        queryFn: async () => await ResourceService.getById("salesOrder", String(params.id)),
        initialData: () => {
            const resourceData = queryClient.getQueryData<[]>(["salesOrder"])
            return resourceData?.find((d: any) => String(d.id) === String(params.id))
                ? [resourceData.find((d: any) => String(d.id) === String(params.id))]
                : undefined
        },
    })

    const salesOrder = salesOrderArray[0]

    useEffect(() => {
        if (salesOrder) {
            form.reset({
                partner_id: salesOrder.partner_id?.[0],
                partner_invoice_id: salesOrder.partner_invoice_id?.[0],
                partner_shipping_id: salesOrder.partner_shipping_id?.[0],
                payment_term_id: salesOrder.payment_term_id?.[0],
                validity_date: salesOrder.validity_date || "",
                state: salesOrder.state
            })
        }
    }, [salesOrder, form])

    return { salesOrder, isLoading, error, form }
}
