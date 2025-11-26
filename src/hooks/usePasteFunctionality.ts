export function usePaste () {
    const [selectedCell, setSelectedCell] = useState<{
            row: number;
            col: number;
        } | null>(null);
    
        const tableRef = useRef<HTMLTableElement>(null);
    
        const { fields, append, remove } = useFieldArray({
            control: form.control,
            name: "order_line",
        });
    
    
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
                            form.setValue(`order_line.${rowIndex}.image`, file);
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
                                form.setValue(`order_line.${targetRowIndex}.product_name`, cellValue || "");
                                break;
                            case 2: // Quantity column
                                const quantity = parseInt(cellValue) || 1;
                                form.setValue(`order_line.${targetRowIndex}.product_qty`, quantity);
                                break;
                            case 3: // Price column
                                const price = parseFloat(cellValue) || 0;
                                form.setValue(`order_line.${targetRowIndex}.price_unit`, price);
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
}