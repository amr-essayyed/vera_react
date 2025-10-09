import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleOrderLineFormSchema } from "@/types/salesOrder";
import { useAllResource, useCreateMultipleResources } from "@/hooks/useResource";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppSelectFormField from "@/components/AppSelectFormField";
import AppInputFormField from "@/components/AppInputFormField";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const SalesOrderCreatePage = () => {
    const [isloading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(SaleOrderLineFormSchema),
        defaultValues: {
            partner_id: 0,
            partner_invoice_id: 0,
            partner_shipping_id: 0,
            payment_term_id: 0,
            lines: [{ product_id: 0, quantity: 1, price_unit: 0, tax_ids: [] }],
        },
    });
    const navigate = useNavigate();

    const { control, handleSubmit } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });

    const products = useAllResource("product");
    const taxes = useAllResource("accountTax");



    const contactState = useAllResource("contact", [
        ["is_company", "=", true],
        ["customer_rank", ">", 0],
    ]);
    const paymentTerms = useAllResource("accountPaymentTerm");

    const createSalesOrder = useCreateMultipleResources("salesOrder");



    const onSubmit = async (data: any) => {
        console.log(data);

        const payload = {
            partner_id: Number(data.partner_id) || 0,
            partner_invoice_id: Number(data.partner_invoice_id) || 0,
            partner_shipping_id: Number(data.partner_shipping_id) || 0,
            payment_term_id: Number(data.payment_term_id) || 0,
            order_line: data.lines.map((line: any) => [
                0,
                0,
                {
                    product_id: Number(line.product_id),
                    product_uom_qty: Number(line.quantity),
                    price_unit: Number(line.price_unit),
                    tax_id: line.tax_ids
                        ? [[6, 0, [Number(line.tax_ids)]]]
                        : [[6, 0, []]]
                },
            ]),
        };


        try {
            setLoading(true);
            await createSalesOrder.mutateAsync([payload]);
            toast.success("The sales order created successfully");
            setLoading(false);
            form.reset();
            navigate("/sales")
        } catch (err) {
            setLoading(false);
            toast.error(`❌ Error creating sales order: +  ${err}`);
        }
    };

    return (
        <div className="p-2.5">
            <PageHeader
                title="Sales Orders"
                description="Create your Sales Order here"
            />

            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-2.5">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AppSelectFormField
                                    formControl={control}
                                    name="partner_id"
                                    resourceState={contactState}
                                    label="Customer"
                                />
                                <AppSelectFormField
                                    formControl={control}
                                    name="partner_invoice_id"
                                    resourceState={contactState}
                                    label="Invoice Address"
                                />
                                <AppSelectFormField
                                    formControl={control}
                                    name="partner_shipping_id"
                                    resourceState={contactState}
                                    label="Shipping Address"
                                />
                                <AppSelectFormField
                                    formControl={control}
                                    name="payment_term_id"
                                    resourceState={paymentTerms}
                                    label="Payment Term"
                                />
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Order Lines</CardTitle>
                            </CardHeader>
                            <CardContent>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-4 mb-3 items-end">
                                        <AppSelectFormField
                                            formControl={control}
                                            name={`lines.${index}.product_id`}
                                            resourceState={products}
                                            label="Product"

                                        />
                                        <AppInputFormField
                                            formControl={control}
                                            name={`lines.${index}.quantity`}
                                            type="number"
                                            label="Quantity"
                                        />
                                        <AppInputFormField
                                            formControl={control}
                                            name={`lines.${index}.price_unit`}
                                            type="number"
                                            label="Unit Price"
                                        />
                                        <AppSelectFormField
                                            formControl={form.control}
                                            name={`lines.${index}`}
                                            label="taxes"
                                            resourceState={taxes}


                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => remove(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        append({ product_id: 0, quantity: 1, price_unit: 0, tax_ids: [] })
                                    }
                                >
                                    + Add Product
                                </Button>
                            </CardContent>

                        </Card>



                        <div className="flex justify-end mt-4 space-x-4">
                            {<Button type="submit">{isloading ? "Loading..." : "Create Sales Order"}</Button>}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default SalesOrderCreatePage;
