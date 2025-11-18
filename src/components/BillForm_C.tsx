import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "./ui/field"
import { Button } from "./ui/button"
import { Save } from "lucide-react"
import { useRef, useState } from "react";
import { useCreateResource } from "@/hooks/useResource";
import { toast } from "sonner";
import { zc_Bill, type tc_Bill } from "@/types/bill";
import { Input } from "./ui/input";

export default function BillForm_C() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vendor, setVendor] = useState("")
    const [vendorRef, setVendorRef] = useState("")
    const {mutateAsync: createBill} = useCreateResource("bill");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData: tc_Bill = {
            "partner_id": parseInt(vendor), 
            "move_type": "in_invoice",
            "ref": vendorRef
        }

        const zResult = zc_Bill.safeParse(formData);

        if (!zResult.success) {
            toast.error(`Invalid form data: ${zResult.error}`);
            setIsSubmitting(false);
            return;
        }

        console.log("[submitting]: ", zResult.data);

        // createBill(zResult.data)
        // .then((res) => {
        //     console.log("[submit success]", res);
        //     toast.success("Bill created successfully");
        // }).catch((err) => {
        //     console.log("[submit fail]",err);
        //     toast.error("Failed to create bill");
        // });
        
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <Field>
                <FieldLabel>Vendor</FieldLabel>
                <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="12">Apple</SelectItem>
                        <SelectItem value="11">golde sama</SelectItem>
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <FieldLabel>Ref</FieldLabel>
                <input type="text" value={vendorRef} onChange={(e)=>setVendorRef(e.target.value? e.target.value: "")} 
                    className="border border-gray-300 rounded-md p-2 w-full" 
                />
            </Field>

            <Button
                type="submit" 
                // onClick={handleSaveForms}
                disabled={isSubmitting /* || isLoading */}
            >
                {isSubmitting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating...</>
                ) : (
                    <><Save className="h-4 w-4 mr-2" />Save</>
                )}
            </Button>
        </form>
    )
}
