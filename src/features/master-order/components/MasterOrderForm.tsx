// Todo: make a component for select> it needs to take a model to fetch its data in infinite scroll mode. and to enable searching in server.
// todo: make a validation function for master order
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAllResource, useCreateResourceWithChild } from "@/hooks/useResource";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { tc_MasterOrder, tr_MasterOrder } from "@/types/masterOrder";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { odooDatetimeFormat } from "@/lib/datetime";
import { Checkbox } from "@/components/ui/checkbox";
import MasterOrderLineTable from "./MasterOrderLineTable";
import { useProducts } from "@/hooks/useOrderLines";
import { assignNestedValue } from "@/lib/formParsing";
import type { tr_MasterOrderLine } from "@/types/masterOrderLine";
import MasterOrderLineTableCustom from "./MasterOrderLineTableCustom";

class Props {
    "masterOrder"?: tr_MasterOrder;
    "lines"?: tr_MasterOrderLine[];
}

export default function MasterOrderForm({ masterOrder, lines}:Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    const {mutateAsync: createMasterOrder} = useCreateResourceWithChild("masterOrder", "line_ids");
    const { data: contacts, isLoading: isContactsLoading } = useAllResource("contact");
    const {data: currencies, isLoading: isCurrencyLoading} = useAllResource("currency");

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
            })) ,
        }
        console.log("[submitting]: ", newMasterOrder);

        //* send create request
        createMasterOrder(newMasterOrder)
            .then((res) => {
                console.log("[submit success]", res);
                toast.success("Master Order created successfully");
            }).catch((err) => {
                console.log("[submit fail]",err);
                toast.error("Failed to create Master Order");
            });
        
        setIsSubmitting(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {masterOrder? `${masterOrder.name}`: "New"}
                </CardTitle>
                <CardDescription>
                    Master Order
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup className="grid grid-cols-2 ">

                        <Field>
                            <FieldLabel>Project Name</FieldLabel>
                            <Input type="text" name="project_name" defaultValue={masterOrder?.project_name}/>
                            <FieldError>{errors?.project_name}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Client</FieldLabel>
                            <Select name="client_id" disabled={isContactsLoading} defaultValue={String(masterOrder?.client_id?.[0])}>
                                <SelectTrigger className={cn(`w-[180px]`, errors?.client_id && "border-red-500")}>
                                    <SelectValue placeholder="Select a Client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts && contacts.map((c:any)=> <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem> )}
                                </SelectContent>
                            </Select>
                            {/* <Input type="number" name="client_id"/> */}
                            <FieldError>{errors?.client_id}</FieldError>
                        </Field>
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
                        <Field orientation="horizontal"> 
                            <FieldLabel>Virtual Inventory (Dropship/D2D)</FieldLabel>
                            <Checkbox name="virtual_inventory" defaultChecked={masterOrder?.virtual_inventory} />
                            <FieldError>{errors?.virtual_inventory}</FieldError>
                        </Field>
                        <Field orientation="horizontal"> 
                            <FieldLabel>Shipper</FieldLabel>
                            <Select name="shipper_id" disabled={isContactsLoading} defaultValue={String(masterOrder?.shipper_id)}>
                                <SelectTrigger className={cn(`w-[180px]`, errors?.shipper_id && "border-red-500")}>
                                    <SelectValue placeholder="Select a Shipper" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts && contacts.map((c:any)=> <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem> )}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors?.shipper_id}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Shipping Cost</FieldLabel>
                            <Input type="number" name="shipping_cost" defaultValue={masterOrder?.shipping_cost} />
                            <FieldError>{errors?.shipping_cost}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Shipping Charge</FieldLabel>
                            <Input type="number" name="shipping_charge" defaultValue={masterOrder?.shipping_charge} />
                            <FieldError>{errors?.shipping_charge}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Shipping Margin</FieldLabel>
                            <Input type="number" readOnly disabled defaultValue={masterOrder?.shipping_margin || 4} /> {/* todo: it calculates*/}
                        </Field>
                        <Field>
                            <FieldLabel>Currency</FieldLabel>
                            {/* <Input type="number" name="currency_id" defaultValue={masterOrder?.currency_id?.[0]} /> need to make it select */}
                            <Select name="currency_id" disabled={isCurrencyLoading} defaultValue={String(masterOrder?.currency_id?.[0])}>
                                <SelectTrigger className={cn(`w-[180px]`, errors?.client_id && "border-red-500")}>
                                    <SelectValue placeholder="Select a Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies && currencies.map((c:any)=> <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem> )}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors?.currency_id}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Commission Rate (%)</FieldLabel>
                            <Input type="number" min={0} max={100} name="commission_rate" defaultValue={masterOrder?.commission_rate} />
                            <FieldError>{errors?.commission_rate}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Total Profit</FieldLabel>
                            <Input type="number" readOnly disabled defaultValue={masterOrder?.amount_profit} />
                        </Field>
                    </FieldGroup>
                    
                    <FieldGroup className="pt-6">
                        <Field>
                            <FieldLabel>
                                Order Lines
                            </FieldLabel>
                            
                            <MasterOrderLineTableCustom name="line_ids" data={lines} />
                        </Field>    
                    
                        
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
