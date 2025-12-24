// Todo: make a component for select> it needs to take a model to fetch its data in infinite scroll mode. and to enable searching in server.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Calendar, DollarSign, FileText, Save, Truck } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useAllResource, useCreateResourceWithChild } from "@/hooks/useResource";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { tc_MasterOrder, tr_MasterOrder } from "@/types/masterOrder";
import { Input } from "@/components/ui/input";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { odooDatetimeFormat } from "@/lib/datetime";
import { Checkbox } from "@/components/ui/checkbox";
import MasterOrderLineTable from "./MasterOrderLineTable";
import { useProducts } from "@/hooks/useOrderLines";
import { assignNestedValue } from "@/lib/formParsing";
import type { tr_MasterOrderLine } from "@/types/masterOrderLine";
import MasterOrderLineTableCustom from "./MasterOrderLineTableCustom";
import ExcelLikeTable from "@/components/ExcelLikeTabel";
import ExcelJspeadsheet from "@/components/ExcelJspeadsheet";
import { data, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import MasterOrderLineTableContr from "./MasterOrderLineTableContr";
class Props {
    "masterOrder"?: tr_MasterOrder;
    "lines"?: tr_MasterOrderLine[];
}

export default function MasterOrderForm({ masterOrder, lines }: Props) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    const { mutateAsync: createMasterOrder } = useCreateResourceWithChild("masterOrder", "line_ids");
    const { data: contacts, isLoading: isContactsLoading } = useAllResource("contact");
    const { data: currencies, isLoading: isCurrencyLoading } = useAllResource("currency");
    // const { data: products, isLoading: isProductsLoading } = useAllResource("product");

    // Computes
    const [clientId, setClientId] = useState(String(masterOrder?.client_id?.[0]));
    const [shippingCost, setShippingCost] = useState(String(masterOrder?.shipping_cost));
    const [shippingCharge, setShippingCharge] = useState(String(masterOrder?.shipping_charge))
    const shippingMargin = Number(shippingCharge) - Number(shippingCost);

    const [purchaseCost, setPurchaseCost] = useState(masterOrder?.amount_cost);
    const [commissionRate, setCommissionRate] = useState(String(masterOrder?.commission_rate));

    const amountCost = Number(purchaseCost) + Number(shippingCost);
    const amountCommission = Number(purchaseCost) + (Number(purchaseCost) * (1 + Number(commissionRate)));

    const totalExpenses = masterOrder?.total_expenses || 0;
    const amountSale = amountCost + amountCommission;

    const { createProducts } = useProducts();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        //* get data of the form
        setIsSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const formEntries: any = {};
        for (const [key, value] of formData.entries()) {
            assignNestedValue(formEntries, key, value);
        }
        console.log("[handleSubmit]formEntries: ", formEntries);

        //* validate
        const validationErrors = [] as any//validateMasterOrder(formEntries); // const validationErrors = validateBill(formEntries);

        setErrors(validationErrors);
        console.log("validationErrors", validationErrors);

        if (!isEmpty(validationErrors)) {
            setIsSubmitting(false);
            return;
        }

        // //* prepare
        const orderLines = await createProducts(formEntries.line_ids);
        console.log("order Lines", orderLines);

        const newMasterOrder: tc_MasterOrder = {
            project_name: formEntries.project_name as string,
            client_id: formEntries.client_id as number,
            date_order: odooDatetimeFormat(formEntries.date_order),
            date_expected: formEntries.date_expected,
            virtual_inventory: formEntries.virtual_inventory, //todo:  make it true and false
            shipping_cost: formEntries.shipping_cost,
            shipping_charge: formEntries.shipping_charge,
            shipper_id: formEntries.shipper_id,
            currency_id: formEntries.currency_id || 1,
            commission_rate: formEntries.commission_rate,
            auto_sync_documents: formEntries.auto_sync_documents,
            line_ids: orderLines.map((line) => ({
                "name": line.name,
                "image_1920": line.image,
                "product_id": line.product_id,
                "price_cost": line.price_cost,
                "price_sale": line.price_sale,
                "quantity": line.quantity,
                "vendor_id": line.vendor_id,
            })),
        }
        console.log("[submitting]: ", newMasterOrder);

        //* send create request
        createMasterOrder(newMasterOrder)
            .then((res) => {
                console.log("[submit success]", res);
                toast.success("Master Order created successfully");
                navigate(`/purchase-orders/${res[0]}`);
            }).catch((err) => {
                console.log("[submit fail]", err);
                toast.error("Failed to create Master Order");
            });

        setIsSubmitting(false);
    }

    return (
        <Card className="bg-neutral-50">
            <CardHeader>
                <CardTitle>
                    {masterOrder ? `${masterOrder.name}` : "New"}
                </CardTitle>
                <CardDescription>
                    Master Order
                </CardDescription>
                <CardAction>
                    <span className="text-gray-400">Statge:</span> <Badge>{masterOrder && (masterOrder?.stage_id as any)?.[1]}</Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <FileText className="inline-block" /> <span>BASIC INFO</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row gap-3 bg-[#fcfcfc]">
                                <Field>
                                    <FieldLabel>Project Name</FieldLabel>
                                    <Input type="text" name="project_name" defaultValue={masterOrder?.project_name} />
                                    <FieldError>{errors?.project_name}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel>Client</FieldLabel>
                                    <Select name="client_id" disabled={isContactsLoading} value={String(clientId)} onValueChange={(value) => setClientId((value))}>
                                        <SelectTrigger className={cn(`w-[180px]`, errors?.client_id && "border-red-500")}>
                                            <SelectValue placeholder="Select a Client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contacts && contacts.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {/* <Input type="number" name="client_id"/> */}
                                    <FieldError>{errors?.client_id}</FieldError>
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Calendar className="inline-block" /> <span>TIMELINE</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row gap-3 bg-[#fcfcfc]">
                                <Field>
                                    <FieldLabel>Order Date</FieldLabel>
                                    <Input type="datetime-local" name="date_order" defaultValue={masterOrder?.date_order} />
                                    <FieldError>{errors?.date_order}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel>Expected Delivery</FieldLabel>
                                    <Input type="date" name="date_expected" defaultValue={masterOrder?.date_expected} />
                                    <FieldError>{errors?.date_expected}</FieldError>
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Truck className="inline-block" /> <span>Shipping</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row gap-3 bg-[#fcfcfc]">
                                <Field orientation="horizontal" className="flex-col">
                                    <FieldLabel>Virtual Inventory (Dropship/D2D)</FieldLabel>
                                    <Checkbox name="virtual_inventory" defaultChecked={masterOrder?.virtual_inventory} />
                                    <FieldError>{errors?.virtual_inventory}</FieldError>
                                </Field>
                                <Field orientation="horizontal" className="flex-col ">
                                    <FieldLabel className="text-left">Shipper</FieldLabel>
                                    <Select name="shipper_id" disabled={isContactsLoading} defaultValue={String(masterOrder?.shipper_id)}>
                                        <SelectTrigger className={cn(`w-[180px]`, errors?.shipper_id && "border-red-500")}>
                                            <SelectValue placeholder="Select a Shipper" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contacts && contacts.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors?.shipper_id}</FieldError>
                                </Field>
                                <Field className="flex-col">
                                    <FieldLabel>Shipping Cost</FieldLabel>
                                    <Input type="number" name="shipping_cost" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
                                    <FieldError>{errors?.shipping_cost}</FieldError>
                                </Field>
                                <Field className="flex-col">
                                    <FieldLabel>Shipping Charge</FieldLabel>
                                    <Input type="number" name="shipping_charge" value={shippingCharge} onChange={(e) => setShippingCharge(e.target.value)} />
                                    <FieldError>{errors?.shipping_charge}</FieldError>
                                </Field>
                                <Field className="flex-col align-top">
                                    <FieldLabel>Shipping Margin</FieldLabel>
                                    <Input type="number" readOnly disabled value={shippingMargin || 0} style={{ color: shippingMargin == 0 ? "black" : shippingMargin > 0 ? "green" : "red" }} />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <DollarSign className="inline-block" /> <span>Finantial</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row gap-3 bg-[#fcfcfc]">
                                <Field>
                                    <FieldLabel>Currency</FieldLabel>
                                    {/* <Input type="number" name="currency_id" defaultValue={masterOrder?.currency_id?.[0]} /> need to make it select */}
                                    <Select name="currency_id" disabled={isCurrencyLoading} defaultValue={String(masterOrder?.currency_id?.[0])}>
                                        <SelectTrigger className={cn(`w-[180px]`, errors?.client_id && "border-red-500")}>
                                            <SelectValue placeholder="Select a Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies && currencies.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors?.currency_id}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel>Commission Rate (%)</FieldLabel>
                                    <Input type="number" min={0} max={100} name="commission_rate" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
                                    <FieldError>{errors?.commission_rate}</FieldError>
                                </Field>
                                <Field>
                                    <FieldLabel>Total Profit</FieldLabel>
                                    <Input type="number" readOnly disabled defaultValue={masterOrder?.amount_profit} />
                                </Field>
                            </CardContent>
                        </Card>
                    </FieldGroup>

                    <FieldGroup className="pt-6">
                        <Field>
                            <FieldLabel>
                                Order Lines
                            </FieldLabel>

                            {/* <MasterOrderLineTableCustom name="line_ids" data={lines} vendors={contacts} products={products} setPurchaseCost={setPurchaseCost}/> */}
                            {/* <MasterOrderLineTable name="line_ids" data={lines} /> */}
                            <MasterOrderLineTableContr
                                isEditMode={!!masterOrder}
                                summaryData={{
                                    shippingCost: Number(shippingCost) || 0,
                                    shippingCharge: Number(shippingCharge) || 0,
                                    commissionRate: Number(commissionRate) || 0,
                                    totalExpenses: totalExpenses || 0
                                }}
                            />

                            {/* <div style={{overflow: "scroll"}}>
                                <ExcelLikeTable />
                            </div>
                            <div>

                                <ExcelJspeadsheet />
                            </div> */}
                        </Field>

                        <div className="flex flex-row-reverse ">
                            <div className="border-1 border-neutral-200 p-5 rounded-lg">

                                <table>
                                    <tbody>
                                        <tr><td className="pr-4"><span className="font-bold">Untaxed Amount: </span></td><td>$ {amountCost || masterOrder?.amount_cost}</td></tr>
                                        <tr><td className="pr-4"><span className="font-bold">Comission: </span></td><td>$ {amountCommission || masterOrder?.amount_commission}</td></tr>
                                        <tr><td className="pr-4"><span className="font-bold">Expenses: </span></td><td>$ {totalExpenses || masterOrder?.total_expenses}</td></tr>
                                        <tr><td className="pr-4"><span className="font-bold">Shipping: </span></td><td>$ {shippingCharge || masterOrder?.shipping_charge}</td></tr>
                                    </tbody>
                                    <tbody>
                                        <tr><td className="pr-4 pt-4"><span className="font-bold">Total: </span></td><td className="text-2xl font-bold">$ {amountSale || 0}</td></tr>
                                    </tbody>

                                </table>


                            </div>
                        </div>

                        <Field orientation="horizontal">
                            <Button
                                type="submit"
                                disabled={isSubmitting /* || isLoading */}
                            >
                                {isSubmitting ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating...</>
                                ) : (
                                    <><Save className="h-4 w-4 mr-2" />Save</>
                                )}
                            </Button>
                        </Field>
                    </FieldGroup>



                </form>
            </CardContent>
        </Card>

    )
}
