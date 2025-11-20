// Todo: make a component for select> it needs to take a model to fetch its data in infinite scroll mode. and to enable searching in server.
// todo: make a validation function for master order
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCreateResourceWithChild } from "@/hooks/useResource";
import { toast } from "sonner";
import { validateBill } from "@/validators/validateBill";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import qs from "qs";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { tc_MasterOrder, tf_MasterOrder } from "@/types/masterOrder";

export default function MasterOrderForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    const {mutateAsync: createMasterOrder} = useCreateResourceWithChild("masterOrder", "invoice_line_ids");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        //* get data of the form
        setIsSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const queryString = new URLSearchParams(formData as any).toString();
        const formEntries = qs.parse(queryString) as unknown as tf_MasterOrder;
        console.log("[handleSubmit]formEntries: ", formEntries);
        
        //* validate
        const validationErrors = validateMasterOrder(formEntries); // const validationErrors = validateBill(formEntries);
        
        setErrors(validationErrors);
        console.log("validationErrors", validationErrors);
        
        if (!isEmpty(validationErrors)) {
            setIsSubmitting(false);
            return;
        }

        // //* prepare
        const newMasterOrder: tc_MasterOrder = {
            // "move_type": "in_invoice",
            // "partner_id": parseInt(formEntries.partner_id as string), 
            // "ref": formEntries.ref as string || undefined,
            // "invoice_date": new Date(formEntries.invoice_date as string) || undefined,
            // "invoice_line_ids": formEntries.invoice_line_ids,
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
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field>
                    <FieldLabel>Client</FieldLabel>
                    <Select name="client_id">
                        <SelectTrigger className={cn(`w-[180px]`, errors?.client_id && "border-red-500")}>
                            <SelectValue placeholder="Select a Client" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">Apple</SelectItem>
                            <SelectItem value="11">golde sama</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{errors?.client_id}</FieldError>
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
