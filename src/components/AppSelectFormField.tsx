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
    resourceState: UseQueryResult<[]>;
    createNew?: ReactElement;
}

export default function AppSelectFormField({
    formControl,
    name,
    label,
    resourceState,
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
                            <Select onValueChange={(val) => field.onChange(JSON.parse(val))} value={field.value ? JSON.stringify(field.value) : ""} disabled={resourceState.isLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={resourceState.isLoading ? `Loading ${startCase(label)}...` : `Select ${startCase(label)}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">No {startCase(label)}</SelectItem>
                                    {resourceState.data?.map((resource: any) => (
                                        <SelectItem key={resource.id} value={String(resource.id)}>
                                            {resource.name}
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
