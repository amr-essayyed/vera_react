import {startCase} from "lodash";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface tProps {
    formControl: any;
    name: string;
    label: string;
    type?: string;
}

export default function AppInputFormField({
    formControl,
    name,
    label,
    type='text',
}: tProps) {
    return (
        <FormField
            control={formControl}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <Label>{startCase(label)}</Label>
                        <FormControl>
                            <Input { ...field} type={type} placeholder={`Enter ${startCase(label)}`} />
                        </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
