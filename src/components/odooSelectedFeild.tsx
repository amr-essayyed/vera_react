import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Option = {
    id: number | string;
    name: string;
};

interface OdooSelectFieldProps {
    name: string;
    label: string;
    control: any;
    options?: Option[];
    placeholder?: string;
    isLoading?: boolean;
    error?: any;
    disabled?: boolean;
}

const OdooSelectField = ({
    name,
    label,
    control,
    options = [],
    placeholder = "Select...",
    isLoading = false,
    error,
    disabled = false,
}: OdooSelectFieldProps) => {
    
    return (
        <FormField
            name={name}
            control={control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>

                    <Select
                        value={String(field.value || "")}
                        onValueChange={field.onChange}
                        disabled={disabled || isLoading}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        isLoading
                                            ? "Loading..."
                                            : error
                                                ? "Failed to load"
                                                : placeholder
                                    }
                                />
                            </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                            {isLoading ? (
                                <div className="p-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            ) : (
                                options.map((opt) => (
                                    <SelectItem key={opt.id} value={String(opt.id)}>
                                        {opt.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default OdooSelectField;
