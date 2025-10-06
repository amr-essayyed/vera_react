import { useState, useCallback, useRef } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useFieldArray, type UseFormReturn } from "react-hook-form";

export default function ItemsTable({ form, isLoading }: { form: UseFormReturn<any>; isLoading?: boolean }) {
	/* 
		PURCHASE ORDER LINE FIELDS:
		
		USER INPUT:
		- name: Product description/name (required)
		- product_qty: Quantity to order (default: 1)
		- price_unit: Unit price (default: 0)
		- image: Product image file (optional)
		
		SYSTEM/AUTO (set by Odoo):
		- id: Line record ID (auto-generated)
		- product_id: Link to product.product (created from name if new)
		- order_id: Link to parent purchase.order
		- product_uom: Unit of measure (default from product)
		- date_planned: Delivery date (inherited from order or product)
		
		COMPUTED (calculated by Odoo):
		- price_subtotal: qty * price_unit (before taxes)
		- price_total: price_subtotal + taxes
		- taxes_id: Applied taxes (from product or supplier)
	*/
	const [selectedCell, setSelectedCell] = useState<{
		row: number;
		col: number;
	} | null>(null);

	const tableRef = useRef<HTMLTableElement>(null);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "order_lines",
	});

	// const { fields: customColumnFields, append: appendCustomColumn, remove: removeCustomColumn } = useFieldArray({
	//     control: form.control,
	//     name: "customColumns",
	// });

	// // Handle custom column management
	// const addCustomColumn = useCallback(() => {
	//     const newColumn = {
	//     id: `custom_${Date.now()}`,
	//     name: `Column ${customColumnFields.length + 1}`,
	//     type: "text" as const,
	//     };
	//     appendCustomColumn(newColumn);
	// }, [customColumnFields.length, appendCustomColumn]);

	// const updateCustomColumnName = useCallback(
	// (columnIndex: number, newName: string) => {
	//     form.setValue(`customColumns.${columnIndex}.name`, newName);
	// },
	// [form]
	// );

	// const updateCustomColumnType = useCallback(
	// (columnIndex: number, newType: "text" | "number" | "date") => {
	//     form.setValue(`customColumns.${columnIndex}.type`, newType);
	// },
	// [form]
	// );

	// const updateCustomCellData = useCallback(
	// (columnId: string, rowIndex: number, value: any) => {
	//     form.setValue(`order_lines.${rowIndex}.${columnId}` as any, value);
	// },
	// [form]
	// );

	// Handle image paste functionality
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
						form.setValue(`order_lines.${rowIndex}.image`, file);
					}
					break;
				}
			}
		},
		[form]
	);

	// Handle paste functionality
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
					append({ name: "", product_qty: 1, price_unit: 0 });
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
							form.setValue(`order_lines.${targetRowIndex}.name`, cellValue || "");
							break;
						case 2: // Quantity column
							const quantity = parseInt(cellValue) || 1;
							form.setValue(`order_lines.${targetRowIndex}.product_qty`, quantity);
							break;
						case 3: // Price column
							const price = parseFloat(cellValue) || 0;
							form.setValue(`order_lines.${targetRowIndex}.price_unit`, price);
							break;
						// default:
						//     // Handle custom columns (starting from index 4)
						//     const customColIndex = targetColIndex - 4;
						//     if (
						//     customColIndex >= 0 &&
						//     customColIndex < customColumnFields.length
						//     ) {
						//     const column = customColumnFields[customColIndex];
						//     const value =
						//         column.type === "number"
						//         ? parseFloat(cellValue) || 0
						//         : cellValue || "";
						//     updateCustomCellData(column.id, targetRowIndex, value);
						//     }
						//     break;
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
			// customColumnFields,
			// updateCustomCellData,
		]
	);

	// Handle cell selection
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
						<TableHead className="w-24">Qty</TableHead>
						<TableHead className="w-32">Unit Price</TableHead>
						<TableHead className="w-32">Subtotal</TableHead>
						<TableHead className="w-20">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{fields.map((field, index) => (
						<TableRow key={field.id}>
							<TableCell onClick={() => handleCellClick(index, 0)} className={`cursor-pointer ${selectedCell?.row === index && selectedCell?.col === 0 ? "bg-blue-100" : ""}`}>
								<FormField
									control={form.control}
									name={`order_lines.${index}.image`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<div className="space-y-2">
													<Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} onBlur={field.onBlur} name={field.name} onFocus={() => handleCellClick(index, 0)} />
													{selectedCell?.row === index && selectedCell?.col === 0 && <div className="text-xs text-gray-500 mt-1">Click to select file or paste image (Ctrl+V)</div>}
													{field.value && (
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
							<TableCell onClick={() => handleCellClick(index, 1)} className={selectedCell?.row === index && selectedCell?.col === 1 ? "bg-blue-100" : ""}>
								<FormField
									control={form.control}
									name={`order_lines.${index}.name`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input {...field} placeholder="Enter product name" onFocus={() => handleCellClick(index, 1)} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TableCell>
							<TableCell onClick={() => handleCellClick(index, 2)} className={selectedCell?.row === index && selectedCell?.col === 2 ? "bg-blue-100" : ""}>
								<FormField
									control={form.control}
									name={`order_lines.${index}.product_qty`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input type="number" min="1" {...field} onFocus={() => handleCellClick(index, 2)} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} placeholder="1" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TableCell>
							<TableCell onClick={() => handleCellClick(index, 3)} className={selectedCell?.row === index && selectedCell?.col === 3 ? "bg-blue-100" : ""}>
								<FormField
									control={form.control}
									name={`order_lines.${index}.price_unit`}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input type="number" step="0.01" min="0" {...field} onFocus={() => handleCellClick(index, 3)} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} placeholder="0.00" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TableCell>
							<TableCell className="text-right font-medium">
								${((form.watch(`order_lines.${index}.product_qty`) || 0) * (form.watch(`order_lines.${index}.price_unit`) || 0)).toFixed(2)}
							</TableCell>
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
				<Button type="button" variant="outline" onClick={() => append({ name: "", product_qty: 1, price_unit: 0 })}>
					Add Item
				</Button>
				{fields.length > 1 && (
					<Button 
						type="button" 
						variant="outline" 
						onClick={() => {
							// Remove all empty rows except the last one
							const emptyIndices = fields
								.map((field, index) => ({ field, index }))
								.filter(({ index }) => {
									const line = form.watch(`order_lines.${index}`);
									return !line?.name && (line?.product_qty || 0) <= 0 && (line?.price_unit || 0) <= 0;
								})
								.map(({ index }) => index)
								.slice(0, -1); // Keep at least one empty row
							
							emptyIndices.reverse().forEach(index => remove(index));
						}}
					>
						Clear Empty Rows
					</Button>
				)}
			</div>

			{/* {customColumnFields.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Form Data (Custom Columns):</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify({
                  customColumns: form.getValues("customColumns"),
                  orderLines: form.getValues("order_lines")
                }, null, 2)}
              </pre>
            </div>
            )} */}
		</>
	);
}

function parseClipboardData(clipboardText: string) {
	return clipboardText
		.trim()
		.split("\n")
		.map((row) => row.split("\t"));
}
