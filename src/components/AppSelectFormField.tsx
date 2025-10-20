import {startCase} from "lodash";
import type { UseQueryResult } from "@tanstack/react-query";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { ReactElement } from "react";

interface tProps {
    formControl: any;
    name: string;
    label: string;
    resourceState?: UseQueryResult<[]>;
    options?: any[];
    createNew?: ReactElement;
}

export default function AppSelectFormField({
    formControl,
    name,
    label,
    resourceState,
    options,
    createNew,
}: tProps) {
    return (
        <FormField
            control={formControl}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <Label>{startCase(label)}</Label>
                    <div className="flex gap-2">                    
                        <FormControl>
                            <Select onValueChange={ resourceState? (val) => field.onChange(JSON.parse(val)) : field.onChange} value={field.value ? (resourceState? JSON.stringify(field.value):field.value) : ""} disabled={resourceState?.isLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={resourceState?.isLoading ? `Loading ${startCase(label)}...` : `Select ${startCase(label)}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {resourceState && <SelectItem value="0">No {startCase(label)}</SelectItem>}
                                    {resourceState?.data?.map((resource: any) => (
                                        <SelectItem key={resource.id} value={String(resource.id)}>
                                            {resource.name}
                                        </SelectItem>
                                    ))}
                                    {options?.map((option: any) => (
                                        <SelectItem key={option[0]} value={String(option[0])}>
                                            {option[1]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        {createNew}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
