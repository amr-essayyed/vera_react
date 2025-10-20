import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formToOdooCreate, saleOrderFormSchema } from "@/types/salesOrder";
import { useAllResource, useCreateMultipleResources } from "@/hooks/useResource";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppSelectFormField from "@/components/AppSelectFormField";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SaleOrderItemsTable from "@/components/saleOrderLineItemTable";

const SalesOrderCreatePage = () => {
    const [isloading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(saleOrderFormSchema),
        defaultValues: {
            partner_id: undefined,
            partner_invoice_id: undefined,
            partner_shipping_id: undefined,
            payment_term_id: undefined,
            order_line: [{
                product_id: undefined,
                product_uom_qty: 1,
                price_unit: 0,
                tax_id: []
            }],
        },
    });

    const navigate = useNavigate();

    const { control, handleSubmit } = form;

    const productState = useAllResource("product");
    const taxesState = useAllResource("accountTax");

    const contactState = useAllResource("contact", [
        ["is_company", "=", true],
        ["customer_rank", ">", 0],
    ]);
    const paymentTerms = useAllResource("accountPaymentTerm");

    // const salesOrderTemplate = useAllResource("saleOrderTemplate");
    const createSalesOrder = useCreateMultipleResources("salesOrder");

    const watchedLines = form.watch("order_line");

    const calculations = useMemo(() => {
        const unTaxedAmountPrice = watchedLines?.reduce((total: number, line: any) => {
            return total + (Number(line.product_uom_qty) || 0) * (Number(line.price_unit) || 0);
        }, 0);

        const taxedAmount = watchedLines?.reduce((total: number, line: any) => {
            const lineTotal = (Number(line.product_uom_qty) || 0) * (Number(line.price_unit) || 0);

            if (line.tax_ids) {
                const selectedTax = taxesState.data?.find((tax: any) => tax.id === Number(line.tax_ids));

                if (selectedTax && selectedTax.amount) {
                    const taxRate = Number(selectedTax.amount) / 100;
                    return total + (lineTotal * taxRate);
                }
            }

            return total;
        }, 0);

        const totalAmount = (unTaxedAmountPrice ?? 0) + (taxedAmount ?? 0);

        return {
            unTaxedAmountPrice: unTaxedAmountPrice?.toFixed(2),
            taxedAmount: taxedAmount?.toFixed(2),
            totalAmount: totalAmount?.toFixed(2)
        };
    }, [watchedLines, taxesState.data]);



    // console.log(calculations());

    const onSubmit = async (data: any) => {
        console.log("Form submitted with data:", data);
        console.log("Form errors:", form.formState.errors);


        const payload = formToOdooCreate(data);
        console.log(payload);



        try {
            setLoading(true);
            await createSalesOrder.mutateAsync([payload]);
            toast.success("The sales order created successfully");
            setLoading(false);
            form.reset();
            navigate("/sales");
        } catch (err) {
            setLoading(false);
            toast.error(`❌ Error creating sales order: ${err}`);
        }
    };

    const onError = (errors: any) => {
        console.log("Form validation errors:", errors);
        toast.error("Please fix the form errors before submitting");
    };

    return (
        <div className="p-2.5" >
            <PageHeader
                title="Sales Orders"
                description="Create your Sales Order here"
            />

            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
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
                                <SaleOrderItemsTable form={form} isLoading={productState.isLoading}
                                    productsState={productState}
                                    taxesState={taxesState}

                                />                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Total Price</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Here are the details</p>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-1 pt-4 border-t">
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal:</span>
                                                <span className="font-medium">
                                                    ${calculations.unTaxedAmountPrice}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>VAT</span>
                                                <span className="font-medium">
                                                    ${calculations.taxedAmount}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-base font-semibold border-t pt-2">
                                                <span>Total:</span>
                                                <span>
                                                    ${calculations.totalAmount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end mt-4 space-x-4">
                            <Button type="submit" disabled={isloading}>
                                {isloading ? "Loading..." : "Create Sales Order"}
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div >
    );
};

export default SalesOrderCreatePage;