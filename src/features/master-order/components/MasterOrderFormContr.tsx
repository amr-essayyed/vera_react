// Todo: make a component for select> it needs to take a model to fetch its data in infinite scroll mode. and to enable searching in server.

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Calendar, DollarSign, FileSpreadsheet, FileText, Plus, Save, Truck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAllResource, useCreateResourceWithChild } from "@/hooks/useResource";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { zf_MasterOrder, type tc_MasterOrder, type tr_MasterOrder } from "@/types/masterOrder";
import { Input } from "@/components/ui/input";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { odooDatetimeFormat } from "@/lib/datetime";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts } from "@/hooks/useOrderLines";
import { tf_MasterOrderLine, zf_MasterOrderLines, type tr_MasterOrderLine } from "@/types/masterOrderLine";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import MasterOrderLineTableContr from "./MasterOrderLineTableContr";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/state/store";
class Props {
    "masterOrder"?: tr_MasterOrder;
    "lines"?: tr_MasterOrderLine[];
}
import { clearForm, setFieldValue, setForm } from "@/state/masterOrder/masterOrderSlice";
import { addColumnsFromFields, clearTable, setTable, type t_Field } from "@/state/masterOrder/masterOrderLinesSlice";
import SearchableSelect from "@/components/SearchableSelect";
import { ResourceService } from "@/services/resourceService";

export default function MasterOrderFormC({ masterOrder, lines }: Props) {
    // States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    const [MOLerrors, setMOLErrors] = useState<any>(null);
    const { mutateAsync: createMasterOrder } = useCreateResourceWithChild("masterOrder", "line_ids");
    const { data: contacts, isLoading: isContactsLoading } = useAllResource("contact");
    const { data: currencies, isLoading: isCurrencyLoading } = useAllResource("currency");
    // const {data: products, isLoading: isProductsLoading} = useAllResource("product");
    const masterOrderForm = useSelector((state: RootState) => state.masterOrder.value)
    const masterOrderLines = useSelector((state: RootState) => state.masterOrderLines.value);

    // Computes
    const shippingMargin = Number(masterOrderForm.shipping_charge) - Number(masterOrderForm.shipping_cost);
    const purchaseCost = masterOrderLines.slice(1).reduce((sum, row) => Number(sum) + ((Number(row[3]) || 0) * (Number(row[5]) || 0)), 0);
    const amountCost = Number(purchaseCost) + Number(masterOrderForm.shipping_cost);
    // const amountCommission = Number(purchaseCost) + (Number(purchaseCost) * (1+(Number(masterOrderForm.commission_rate)/100)));
    const amountCommission = Number(purchaseCost) * ((Number(masterOrderForm.commission_rate) / 100));
    const totalExpenses = masterOrder?.total_expenses || 0;
    const amountSale = amountCost + amountCommission;

    // Hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { createProducts } = useProducts();

    // lifeCycle Hooks
    useEffect(() => {
        // First load fields to ensure columns exist, then set table data
        (async () => {
            const allfields = await ResourceService.getFields("masterOrderLine");
            console.log("allfields", allfields);

            // const fields = allfields.filter((field: t_Field) => !["id", "master_id", "create_date", "create_uid", "write_date", "write_uid"].includes(field.name));
            dispatch(addColumnsFromFields(allfields));

            if (masterOrder) {
                console.log("[MasterOrderFormContr] masterOrder: ", masterOrder);
                console.log("[MasterOrderFormContr] lines: ", lines);
                dispatch(setForm(masterOrder));
                dispatch(setTable(lines));
            } else {
                dispatch(clearTable());
                dispatch(clearForm());
            }
        })();
    }, [masterOrder, lines, dispatch]);

    // Handlers
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // //* prepare
        const masterOrderLineForm: tf_MasterOrderLine[] = masterOrderLines.slice(1).map((mol) => ({
            image: mol[0],
            product_name: mol[1],
            name: mol[2],
            quantity: Number(mol[3]),
            price_cost: Number(mol[4]),
            price_sale: Number(mol[5]),
            vendor_id: Number(mol[6]),
        }))

        console.log("masterOrder form", masterOrderForm);
        console.log("masterOrderLine form", masterOrderLineForm);

        // Validation
        const MOValidation = zf_MasterOrder.safeParse(masterOrderForm);
        const MOLValidation = zf_MasterOrderLines.safeParse(masterOrderLineForm);
        if (MOValidation.success && MOLValidation.success) {
            console.log("MO Validated data:", MOValidation.data);
            console.log("MOL Validated data:", MOLValidation.data);
        } else {
            if (MOValidation.error) {
                console.error("MO Validation errors:", MOValidation?.error.flatten().fieldErrors);
                toast.error("Failed to create Master Order");
                const errors = MOValidation?.error.flatten().fieldErrors;
                setErrors(errors);
                // for (const key of Object.keys(errors)){
                //     toast.error(`for field '${key}': ${(errors as any)[key][0]}`);

                // }
                // toast.error("Validation errors:", result.error);

            }

            if (MOLValidation.error) {
                console.error("MOL Validation errors:", MOLValidation?.error.format());
                toast.error("Failed to create Master Order");
                const errors = MOLValidation?.error.format();
                setMOLErrors(errors);
                // for (const key of Object.keys(errors)){
                //     toast.error(`for field '${key}': ${(errors as any)[key][0]}`);

                // }
                // toast.error("Validation errors:", result.error);
            }

            setIsSubmitting(false);
            return
        }

        const orderLines = await createProducts(masterOrderLineForm);
        console.log("order Lines", orderLines);



        // create
        const newMasterOrder: tc_MasterOrder = {
            project_name: masterOrderForm.project_name as string,
            client_id: Number(masterOrderForm.client_id),
            date_order: odooDatetimeFormat(masterOrderForm.date_order),
            date_expected: masterOrderForm.date_expected || undefined,
            virtual_inventory: masterOrderForm.virtual_inventory, //todo:  make it true and false
            shipping_cost: Number(masterOrderForm.shipping_cost),
            shipping_charge: Number(masterOrderForm.shipping_charge),
            shipper_id: Number(masterOrderForm.shipper_id),
            currency_id: Number(masterOrderForm.currency_id) || 1,
            commission_rate: Number(masterOrderForm.commission_rate),
            auto_sync_documents: masterOrderForm.auto_sync_documents,
            line_ids: orderLines.map((line) => ({
                "name": line.name,
                "image_1920": line.image,
                "product_id": line.product_id,
                "price_cost": line.price_cost,
                "price_sale": line.price_sale || line.price_cost,
                "quantity": line.quantity,
                "vendor_id": line.vendor_id,
                "currency_id": Number(masterOrderForm.currency_id) || 1
            })),
        }
        console.log("[submitting]: ", newMasterOrder);

        //* send create request
        createMasterOrder(newMasterOrder)
            .then((res) => {
                console.log("[submit success]", res);
                toast.success("Master Order created successfully");
                navigate(`/master-orders/${res}`);
                dispatch(clearTable());
                dispatch(clearForm());
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
                    <div>
                        {masterOrder ? `${masterOrder.name}` : "New"}

                    </div>
                </CardTitle>
                <CardDescription>
                    Master Order
                </CardDescription>
                <CardAction>
                    <div className="flex flex-row-reverse gap-2">
                        {masterOrder && <><span className="text-gray-400">Statge:</span> <Badge>{masterOrder && (masterOrder?.stage_id as any)?.[1]}</Badge></>}
                        <Button><Plus />Create Sales Order</Button>
                        <Button><Plus />Create purchase Order</Button>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
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
                                        <Input type="text" name="project_name" value={masterOrderForm.project_name} onChange={(e) => dispatch(setFieldValue({ field: e.target.name, value: e.target.value }))} className={cn(`w-[180px]`, errors?.project_name && "border-red-500")} />
                                        <FieldError>{errors?.project_name}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel>Client</FieldLabel>
                                        {/* <Select name="client_id" disabled={isContactsLoading} value={masterOrderForm.client_id ||""} onValueChange={(v)=>dispatch(setFieldValue({field: "client_id", value: v}))}>
                                            <SelectTrigger className={cn(`w-[180px]`, errors?.client_id && "border-red-500")}>
                                                <SelectValue placeholder="Select a Client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contacts && contacts.map((c:any)=> <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem> )}
                                            </SelectContent>
                                        </Select> */}
                                        <SearchableSelect
                                            value={masterOrderForm.client_id || ""}
                                            setValue={(v: string) => dispatch(setFieldValue({ field: "client_id", value: v }))}
                                        />
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
                                        <Input type="datetime-local" name="date_order" value={masterOrderForm.date_order} onChange={(e) => dispatch(setFieldValue({ field: e.target.name, value: e.target.value }))} className={cn(`w-[180px]`, errors?.date_order && "border-red-500")} />
                                        <FieldError>{errors?.date_order}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Expected Delivery</FieldLabel>
                                        <Input type="date" name="date_expected" value={masterOrderForm.date_expected} onChange={(e) => dispatch(setFieldValue({ field: e.target.name, value: e.target.value }))} className={cn(`w-[180px]`, errors?.date_expected && "border-red-500")} />
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
                                <CardContent className="bg-[#fcfcfc]">
                                    <Field orientation="horizontal" className="flex flex-col items-start mb-4">
                                        <FieldLabel>Virtual Inventory (Dropship/D2D)</FieldLabel>
                                        <Checkbox name="virtual_inventory" checked={masterOrderForm.virtual_inventory} onCheckedChange={(value) => dispatch(setFieldValue({ field: 'virtual_inventory', value }))} />
                                        <FieldError>{errors?.virtual_inventory}</FieldError>
                                    </Field>
                                    <Field orientation="horizontal" className="flex flex-col">
                                        <FieldLabel className="w-full">Shipper</FieldLabel>
                                        <Select name="shipper_id" disabled={isContactsLoading} value={masterOrderForm.shipper_id || ""} onValueChange={(v) => dispatch(setFieldValue({ field: 'shipper_id', value: v }))}>
                                            <SelectTrigger className={cn(`w-[180px]`, errors?.shipper_id && "border-red-500", "w-full")}>
                                                <SelectValue placeholder="Select a Shipper" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contacts && contacts.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{errors?.shipper_id}</FieldError>
                                    </Field>
                                    <div className="flex flex-row gap-2 mt-4">
                                        <Field className="flex-col">
                                            <FieldLabel>Shipping Cost</FieldLabel>
                                            <Input type="number" name="shipping_cost" value={masterOrderForm.shipping_cost} onChange={(e) => dispatch(setFieldValue({ field: e.target.name, value: e.target.value }))} />
                                            <FieldError>{errors?.shipping_cost}</FieldError>
                                        </Field>
                                        <Field className="flex-col">
                                            <FieldLabel>Shipping Charge</FieldLabel>
                                            <Input type="number" name="shipping_charge" value={masterOrderForm.shipping_charge} onChange={(e) => dispatch(setFieldValue({ field: e.target.name, value: e.target.value }))} />
                                            <FieldError>{errors?.shipping_charge}</FieldError>
                                        </Field>
                                        <Field className="flex-col align-top">
                                            <FieldLabel>Shipping Margin</FieldLabel>
                                            <Input type="number" readOnly disabled value={shippingMargin || 0} style={{ color: shippingMargin == 0 ? "black" : shippingMargin > 0 ? "green" : "red" }} />
                                        </Field>
                                    </div>
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
                                        <Select name="currency_id" disabled={isCurrencyLoading} value={String(masterOrderForm.currency_id)} onValueChange={(value) => dispatch(setFieldValue({ field: 'currency_id', value }))}>
                                            <SelectTrigger className={cn(`w-[180px]`, errors?.currency_id && "border-red-500")}>
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
                                        <Input type="number" min={0} max={100} name="commission_rate" value={masterOrderForm.commission_rate} onChange={(e) => dispatch(setFieldValue({ field: e.target.name, value: e.target.value }))} />
                                        <FieldError>{errors?.commission_rate}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Total Profit</FieldLabel>
                                        <Input type="number" readOnly disabled value={masterOrder?.amount_profit} />
                                    </Field>
                                </CardContent>
                            </Card>
                        </FieldGroup>

                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>
                                    Related Orders
                                </CardTitle>
                                <CardContent className="p-0">
                                    <div className="flex flex-col gap-2">
                                        <Button variant={"outline"} className="justify-start bg-gray-100 hover:bg-blue-400">Sales Order</Button>
                                        <Button variant={"outline"} className="justify-start bg-gray-100 hover:bg-blue-400">Purchase Orders</Button>
                                        <Button variant={"outline"} className="justify-start bg-gray-100 hover:bg-blue-400">Shipping</Button>
                                        <Button variant={"outline"} className="justify-start bg-gray-100 hover:bg-blue-400">Payment</Button>
                                    </div>
                                </CardContent>
                            </CardHeader>
                        </Card>
                    </div>

                    <FieldGroup className="pt-6">
                        <Field>
                            <FieldLabel>Order Lines</FieldLabel>
                            {/* <MasterOrderLineTableCustom name="line_ids" data={lines} vendors={contacts} products={products} setPurchaseCost={setPurchaseCost}/> */}
                            {/* <MasterOrderLineTable name="line_ids" data={lines} /> */}
                            {/* <div style={{overflow: "scroll"}}><ExcelLikeTable /></div><div><ExcelJspeadsheet /></div> */}
                            <MasterOrderLineTableContr errors={MOLerrors} isEditMode={!!masterOrder} />
                        </Field>

                        <div className="flex flex-row-reverse ">
                            <div className="border-1 border-neutral-200 p-5 rounded-lg">

                                <table>
                                    <tbody>
                                        <tr><td className="pr-4"><span className="font-bold">Untaxed Amount: </span></td><td>$ {amountCost || masterOrder?.amount_cost || 0}</td></tr>
                                        <tr><td className="pr-4"><span className="font-bold">Comission: </span></td><td>$ {amountCommission || masterOrder?.amount_commission || 0}</td></tr>
                                        <tr><td className="pr-4"><span className="font-bold">Expenses: </span></td><td>$ {totalExpenses || masterOrder?.total_expenses || 0}</td></tr>
                                        <tr><td className="pr-4"><span className="font-bold">Shipping: </span></td><td>$ {masterOrderForm.shipping_charge || masterOrder?.shipping_charge || 0}</td></tr>
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
