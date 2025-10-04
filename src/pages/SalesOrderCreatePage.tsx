import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAllResource } from "@/hooks/useResource";
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form"
import { SaleOrderLineFormSchema, type SalesOrderLineForm } from "@/types/salesOrder";

const SalesOrderCreatePage = () => {
    // const { data, isLoading, error } = useAllResource("client");
    const { data: salesOrders, isLoading: isSalesOrdersLoading, error: SalesOrderError } = useAllResource("salesOrder");


    console.log(salesOrders);
    








    const form = useForm<SalesOrderLineForm>({
        resolver: zodResolver(SaleOrderLineFormSchema)
    });
    return (
        <div>
            <PageHeader
                title="Sales Orders"
                description="Create your Sales Order here"
            />
            {
                SalesOrderError && (<div className="max-w-6xl mx-auto px-4 py-2">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Error loading products:</strong> {SalesOrderError.message}
                    </div>
                </div>)
            }
            {isSalesOrdersLoading && (
                <div className="max-w-6xl mx-auto px-4 py-2">
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        Loading data...
                        {isSalesOrdersLoading && " Sales Orders "}
                        {" - Please wait before submitting the form."}
                    </div>
                </div>

            )}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <Form {...form}>
                    <FormField
                        name="partner_id"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="w-fit">
                                <FormLabel>Customers</FormLabel>
                                <div className="flex gap-1">
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-[300px]">
                                                <SelectValue placeholder="Select Customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...new Map(
                                                    salesOrders?.map((o: any) => [o.partner_id[0], o.partner_id[1]])
                                                ).entries()].map(([id, name]) => (
                                                    <SelectItem key={id} value={String(id)}>
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <Button type="button" onClick={() => { }}>
                                        +
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="partner_invoice_id"
                        control={form.control}
                        render={({fieled})=>{

                        }}
                    />
                </Form>

            </div>

        </div>
    )

}

export default SalesOrderCreatePage