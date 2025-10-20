import { useState, useCallback, useRef } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { saleOrderFormSchema } from "@/types/salesOrder";
import { ProductCombobox } from "./ProductCompBox";

// Define the assumed structure for a Sale Order Line item for clarity
interface ResourceState<T> {
    data: T[] | undefined;
    isLoading: boolean;
}
interface SaleOrderItemsTableProps {
    form: UseFormReturn<any>;
    isLoading?: boolean;
    // New props:
    productsState: ResourceState<any>;
    taxesState: ResourceState<any>; // Optional, but good practice
}

export default function SaleOrderItemsTable({ form, isLoading, productsState, taxesState }: SaleOrderItemsTableProps) {

    const handleProductLookUp = useCallback((rowIndex: number, productName: string) => {
        const productFound = productsState.data?.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        console.log(productFound);

        if (productFound) {
            form.setValue(`order_line.${rowIndex}.product_id`, productFound.id);
            form.setValue(`order_line.${rowIndex}.price_unit`, productFound.list_price || 0);
        } else {
            console.log("not found");

            form.setValue(`order_line.${rowIndex}.product_id`, false);

        }
    }, [form, productsState.data]);
    const [selectedCell, setSelectedCell] = useState<{
        row: number;
        col: number;
    } | null>(null);

    const tableRef = useRef<HTMLTableElement>(null);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "order_line", // Assuming the array field name is still 'order_line'
    });

    // Helper to parse clipboard data (remains the same)
    const parseClipboardData = useCallback((clipboardText: string) => {
        return clipboardText
            .trim()
            .split("\n")
            .map((row) => row.split("\t"));
    }, []);

    // Handle image paste functionality (only field name changes)
    const handleImagePaste = useCallback(
        async (e: React.ClipboardEvent, rowIndex: number) => {
            const items = e.clipboardData.items;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.type.indexOf("image") !== -1) {
                    e.preventDefault();
                    const blob = item.getAsFile();

                    if (blob) {
                        // Convert blob to File object
                        const file = new File([blob], `pasted-image-${Date.now()}.png`, {
                            type: blob.type,
                        });

                        // Update the form field
                        form.setValue(`order_line.${rowIndex}.image`, file as any); // Type assertion for react-hook-form
                    }
                    break;
                }
            }
        },
        [form]
    );

    // Handle general paste functionality (field names for Qty updated)
    const handlePaste = useCallback(
        async (e: React.ClipboardEvent) => {
            if (!selectedCell) return;

            // Check if we're pasting into an image cell (column 0)
            if (selectedCell.col === 0) {
                await handleImagePaste(e, selectedCell.row);
                return;
            }

            e.preventDefault();
            const clipboardText = e.clipboardData.getData("text");
            const pastedData = parseClipboardData(clipboardText);

            if (pastedData.length === 0) return;

            const startRow = selectedCell.row;
            const startCol = selectedCell.col;

            // Calculate how many new rows we need
            const requiredRows = startRow + pastedData.length;
            const currentRows = fields.length;

            // Add new rows if needed
            if (requiredRows > currentRows) {
                const rowsToAdd = requiredRows - currentRows;
                for (let i = 0; i < rowsToAdd; i++) {
                    // Use Sale Order Line defaults
                    append({ name: "", product_uom_qty: 1, price_unit: 0 });
                }
            }

            // Update form values with pasted data
            pastedData.forEach((row, rowIndex) => {
                const targetRowIndex = startRow + rowIndex;

                row.forEach((cellValue, colIndex) => {
                    const targetColIndex = startCol + colIndex;

                    // Map column indices to field names (skip image column at index 0)
                    switch (targetColIndex) {
                        case 1: // Name column
                            form.setValue(`order_line.${targetRowIndex}.name`, cellValue || "");
                            break;
                        case 2: // Quantity column
                            // Note: field name changed to 'product_uom_qty'
                            const quantity = parseInt(cellValue) || 1;
                            form.setValue(`order_line.${targetRowIndex}.product_uom_qty`, quantity);
                            break;
                        case 3: // Price column
                            const price = parseFloat(cellValue) || 0;
                            form.setValue(`order_line.${targetRowIndex}.price_unit`, price);
                            break;
                        // For any other column, the logic should be here if custom columns were used
                    }
                });
            });
        },
        [
            selectedCell,
            fields.length,
            append,
            form,
            handleImagePaste,
            parseClipboardData,
        ]
    );

    // Handle cell selection (remains the same)
    const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
        setSelectedCell({ row: rowIndex, col: colIndex });
    }, []);

    return (
        <>
            <Table ref={tableRef} onPaste={handlePaste}>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-32">Image</TableHead>
                        <TableHead className="min-w-48">Product Name</TableHead>
                        <TableHead className="w-24">Quantity</TableHead> {/* Label adjusted to 'Quantity' */}
                        <TableHead className="w-32">Unit Price</TableHead>
                        <TableHead className="w-32">Subtotal</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                        <TableRow key={field.id}>
                            {/* Image Field */}
                            <TableCell onClick={() => handleCellClick(index, 0)} className={`cursor-pointer ${selectedCell?.row === index && selectedCell?.col === 0 ? "bg-blue-100" : ""}`}>
                                <FormField
                                    control={form.control}
                                    name={`order_line.${index}.image`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} onBlur={field.onBlur} name={field.name} onFocus={() => handleCellClick(index, 0)} />
                                                    {selectedCell?.row === index && selectedCell?.col === 0 && <div className="text-xs text-gray-500 mt-1">Click to select file or paste image (Ctrl+V)</div>}
                                                    {field.value instanceof File && (
                                                        <div className="mt-2">
                                                            <img src={URL.createObjectURL(field.value)} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            {/* Name Field */}
                            <TableCell  onClick={() => handleCellClick(index, 1)} className={selectedCell?.row === index && selectedCell?.col === 1 ? "bg-blue-100" : ""}>
                                <FormField
                                    control={form.control}
                                    name={`order_line.${index}.name`} // Keep 'name' as the primary field for paste/display
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                           
                                                <ProductCombobox 
                                                    
                                                    products={productsState.data || []}
                                                    value={form.watch(`order_line.${index}.name`) || ""}
                                                    onChange={(value) => {
                                                        form.setValue(`order_line.${index}.name`, value)
                                                    }}
                                                    onSelectProduct={(product) => {
                                                        if (product) {

                                                            form.setValue(`order_line.${index}.product_id`, product.id)
                                                            form.setValue(`order_line.${index}.price_unit`, product.list_price || 0)
                                                        } else {
                                                            form.setValue(`order_line.${index}.product_id`, false)
                                                        }
                                                    }}
                                                />


                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`order_line.${index}.product_id`}
                                    render={() => <Input type="hidden" />}
                                />
                            </TableCell>

                            {/* Quantity Field (product_uom_qty) */}
                            <TableCell onClick={() => handleCellClick(index, 2)} className={selectedCell?.row === index && selectedCell?.col === 2 ? "bg-blue-100" : ""}>
                                <FormField
                                    control={form.control}
                                    name={`order_line.${index}.product_uom_qty`} // <-- CHANGED FIELD NAME
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {/* Ensure value is treated as number for internal state */}
                                                <Input type="number" min="1" {...field} onFocus={() => handleCellClick(index, 2)} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} placeholder="1" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            {/* Unit Price Field (price_unit) */}
                            <TableCell onClick={() => handleCellClick(index, 3)} className={selectedCell?.row === index && selectedCell?.col === 3 ? "bg-blue-100" : ""}>
                                <FormField
                                    control={form.control}
                                    name={`order_line.${index}.price_unit`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {/* Ensure value is treated as number for internal state */}
                                                <Input type="number" step="0.01" min="0" {...field} onFocus={() => handleCellClick(index, 3)} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            {/* Subtotal Calculation */}
                            <TableCell className="text-right font-medium">
                                ${((form.watch(`order_line.${index}.product_uom_qty`) || 0) * (form.watch(`order_line.${index}.price_unit`) || 0)).toFixed(2)}
                            </TableCell>
                            {/* Actions Button */}
                            <TableCell>
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex gap-2 flex-wrap">
                {/* Append Button: Using Sale Order Line defaults */}
                <Button type="button" variant="outline" onClick={() => append({ name: "", product_uom_qty: 1, price_unit: 0 })}>
                    Add Item
                </Button>

                {/* Clear Empty Rows Button (logic updated for product_uom_qty) */}
                {fields.length > 1 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            // Remove all empty rows except the last one
                            const emptyIndices = fields
                                .map((field, index) => ({ field, index }))
                                .filter(({ index }) => {
                                    const line = form.watch(`order_line.${index}`);
                                    // Check for empty name AND (qty <= 0 OR price <= 0) - assuming qty/price must be > 0 if a product is named
                                    return !line?.name && (line?.product_uom_qty || 0) <= 0 && (line?.price_unit || 0) <= 0;
                                })
                                .map(({ index }) => index)
                                .slice(0, -1); // Keep at least one empty row

                            // Remove from high index to low to avoid array shifting issues
                            emptyIndices.reverse().forEach(index => remove(index));
                        }}
                    >
                        Clear Empty Rows
                    </Button>
                )}
            </div>
        </>
    );
}