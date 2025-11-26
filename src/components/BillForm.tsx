import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCreateResourceWithChild } from "@/hooks/useResource";
import { toast } from "sonner";
import { tf_Bill, type tc_Bill } from "@/types/bill";
import { Input } from "./ui/input";
import { validateBill } from "@/validators/validateBill";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
// import qs from "qs";
import BillFormTable from "./BillFormTable";
import { assignNestedValue } from "@/lib/formParsing";

export default function BillForm(): React.ReactElement | null {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    // const {mutateAsync: createBill} = useCreateResource("bill");
    const {mutateAsync: createBill} = useCreateResourceWithChild("bill", "invoice_line_ids");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        //* get data of the form
        setIsSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);
        // const queryString = new URLSearchParams(formData as any).toString();
        // const formEntries = qs.parse(queryString) as unknown as tf_Bill;
         const formEntries: any = {};
        for (const [key, value] of formData.entries()) {
            assignNestedValue(formEntries, key, value);
        }
        console.log("[handleSubmit]formEntries: ", formEntries);
        
        //* validate
        const validationErrors = validateBill(formEntries);
        setErrors(validationErrors);
        console.log("validationErrors", validationErrors);
        
        if (!isEmpty(validationErrors)) {
            setIsSubmitting(false);
            return;
        }

        // //* prepare
        const newBill: tc_Bill = {
            "move_type": "in_invoice",
            "partner_id": parseInt(formEntries.partner_id as string), 
            "ref": formEntries.ref as string || undefined,
            "invoice_date": new Date(formEntries.invoice_date as string) || undefined,
            "invoice_line_ids": formEntries.invoice_line_ids,
        }
        console.log("[submitting]: ", newBill);

        //* send create request
        createBill(newBill)
            .then((res) => {
                console.log("[submit success]", res);
                toast.success("Bill created successfully");
            }).catch((err) => {
                console.log("[submit fail]",err);
                toast.error("Failed to create bill");
            });
        
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field>
                    <FieldLabel>Vendor</FieldLabel>
                    <Select name="partner_id">
                        <SelectTrigger className={cn(`w-[180px]`, errors?.partner_id && "border-red-500")}>
                            <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">Apple</SelectItem>
                            <SelectItem value="11">golde sama</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{errors?.partner_id}</FieldError>
                </Field>

                <Field>
                    <FieldLabel>Bill Reference</FieldLabel>
                    <Input type="text" name="ref" className={cn(errors?.ref && "border-red-500")} />
                    <FieldError>{errors?.ref && errors.ref}</FieldError>
                </Field>
                
                <Field>
                    <FieldLabel>Bill Date</FieldLabel>
                    <Input type="date" name="invoice_date" className={cn(errors?.invoice_date && "border-red-500")} max={new Date().toISOString().split("T")[0]}/>
                    <FieldError>{errors?.invoice_date}</FieldError>
                </Field>
                
                <Field>
                    <FieldLabel>Invoice Lines</FieldLabel>
                    <BillFormTable
                        fields={["product_id", "quantity", "price_unit"]}
                    />
                    
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
    )
}
