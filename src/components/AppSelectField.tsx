import {startCase} from "lodash";
import type { UseQueryResult } from "@tanstack/react-query";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { ReactElement } from "react";
import { Field, FieldError, FieldLabel } from "./ui/field";

interface tProps {
    name: string;
    label: string;
    values?: unknown[];
    options?: any[];
    createNew?: ReactElement;
    defaultValue?: any;
    error?: string;
    isLoading?: boolean;
}

export default function AppSelectField({
    name,
    label,
    values,
    options,
    createNew,
    defaultValue,
    error,
    isLoading
}: tProps) {
    return (
        <Field>
            {/* <FieldLabel>{startCase(label)}</FieldLabel> */}
            <div className="flex gap-2">
                <Select
                    name={name}
                    // defaultValue={defaultValue || undefined}
                    // onValueChange={ resourceState? (val) => field.onChange(JSON.parse(val)) : field.onChange}
                    // value={field.value ? (resourceState? JSON.stringify(field.value):field.value) : ""} 
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? `Loading ${startCase(label)}...` : `Select ${startCase(label)}`} />
                    </SelectTrigger>
                    <SelectContent>
                        { <SelectItem value="0">No {startCase(label)}</SelectItem>}
                        { values?.map((v: any) => (
                            <SelectItem key={v.value} value={String(v.value)}>
                                {v.label}
                            </SelectItem>
                        ))}
                        {options?.map((option: any) => (
                            <SelectItem key={option[0]} value={String(option[0])}>
                                {option[1]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {createNew}
            </div>
            <FieldError>{error}</FieldError>
        </Field>

    )
}
