import PageHeader from "@/components/PageHeader";
import { Form } from "@/components/ui/form";
import { useAllResource, useCreateMultipleResources } from "@/hooks/useResource";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { SaleOrderLineFormSchema, type SalesOrderLineForm, type tSalesOrderLine } from "@/types/salesOrder";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppSelectFormField from "@/components/AppSelectFormField";
import AppInputFormField from "@/components/AppInputFormField";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const SalesOrderCreatePage = () => {

    const form = useForm<SalesOrderLineForm>({
        resolver: zodResolver(SaleOrderLineFormSchema),
        defaultValues: {
            partner_id: 0,
            partner_invoice_id: 0,
            partnerShipping_id: 0,
        }
    });


    const accountPaymentTerm = useAllResource("accountPaymentTerm");


    const contactState = useAllResource("contact", [
        ["is_company", "=", true], ["customer_rank", ">", 0]
    ]);


    const products = useAllResource("product");










    const onSubmit: any = async (data: tSalesOrderLine) => {

        try {


        } catch (error) {

        }

    };



    return (
        <div>
            <PageHeader
                title="Sales Orders"
                description="Create your Sales Order here"
            />


            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex-row  max-w-6xl  mx-auto px-4 py-4">
                    <Form  {...form}>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Order information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AppSelectFormField
                                        formControl={form.control}
                                        name="partner_id"
                                        resourceState={contactState}
                                        label="customers"
                                    >
                                    </AppSelectFormField>


                                    <AppSelectFormField
                                        name="partner_id"
                                        formControl={form.control}
                                        resourceState={accountPaymentTerm}
                                        label="Payment Term"
                                    >
                                    </AppSelectFormField>
                                    <AppSelectFormField
                                        formControl={form.control}
                                        label="Invoice Address"
                                        name="partner_invoice_id"
                                        resourceState={contactState}


                                    />


                                    <AppSelectFormField
                                        formControl={form.control}
                                        label="Invoice Address"
                                        name="partnerShipping_id"
                                        resourceState={contactState}


                                    />
                                </div>
                            </CardContent>
                        </Card>


                        <Card className="p-3 mt-2">
                            <CardTitle>Order Line</CardTitle>
                            <CardContent className="gap-10 flex ">
                                <AppSelectFormField
                                    formControl={form.control}
                                    label="Products"
                                    name="product_template_id"
                                    resourceState={products}
                                ></AppSelectFormField>
                                <AppInputFormField
                                    formControl={form.control}
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                ></AppInputFormField>

                                <AppInputFormField
                                    formControl={form.control}
                                    label="price"
                                    name="price"
                                    type="number"

                                ></AppInputFormField>


                            </CardContent>
                        </Card>
                    </Form>
                </div>
                <div className="flex justify-end space-x-4">
                    <Link to="/purchase-orders">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit">

                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Purchase Order
                        </>
                    </Button>
                </div>
            </form>

        </div>
    )

}

export default SalesOrderCreatePage