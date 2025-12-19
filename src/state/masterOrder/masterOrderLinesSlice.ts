import { createSlice } from "@reduxjs/toolkit";

export interface t_Field {
    name: string;
    string: string;
    type: string;
}

const initialState: string[][] =
    [
        // MasterOrderLineFormFields,
        // ["Image", "Product", "Description", "Qty",    "Unit",   "Sale Price", "Vendor", "Subtotal",],
        ["Image", "Product Name", "Description", "Qty", "Unit Price", "Sale Price", "Vendor", "Subtotal",],
        ["", "", "", "", "", "", "", "",],
    ]

const baseColumnNames = ["Image", "Product Name", "Description", "Qty", "Unit Price", "Sale Price", "Vendor", "Subtotal"];

const masterOrderLinesSlice = createSlice({
    name: 'masterOrderLines',
    initialState: {
        value: initialState,
        type: ["binary", "string", "string", "number", "number", "number", "number", "number",],
        name: ["image_1920", "product_name", "name", "quantity", "price_cost", "price_sale", "vendor_id", "price_subtotal"],
        string: ["Image", "Product Name", "Description", "Qty", "Unit Price", "Sale Price", "Vendor", "Subtotal",],
        columnVisibility: baseColumnNames.reduce((acc, _, index) => ({ ...acc, [index]: true }), {} as Record<number, boolean>),
    },
    reducers: {
        setValue: (state, action) => {
            state.value = action.payload;
        },
        setTable: (state, action) => {
            console.log("[masterOrderLinesSlice] setTable: ", action.payload);
            let i = 1;
            const masterOrderLines = action.payload;
            for (let line of masterOrderLines) {
                if (!state.value[i]) state.value.push([]);
                for (let fieldName of Object.keys(line)) {
                    const colIndex = state.name.findIndex((name) => name === fieldName);
                    // Skip fields that don't exist in state.name yet
                    if (colIndex === -1) {
                        console.log(`[setTable] Skipping field "${fieldName}" - not found in columns`);
                        continue;
                    }
                    const fieldType = state.type[colIndex];
                    if (fieldType === 'many2one') state.value[i][colIndex] = line[fieldName]?.[1];
                    else if (fieldType === 'binary') state.value[i][colIndex] = line[fieldName] && 'data:image/png;base64,' + line[fieldName];
                    else state.value[i][colIndex] = line[fieldName];
                }
                // state.value[i][0] = line.image_1920 && 'data:image/png;base64,' + line.image_1920;
                // state.value[i][1] = line.product_id?.[1];
                // state.value[i][2] = line.name;
                // state.value[i][3] = line.quantity;
                // state.value[i][4] = line.price_cost;
                // state.value[i][5] = line.price_sale;
                // state.value[i][6] = line.vendor_id?.[0];
                // state.value[i][7] = line.price_subtotal_sale;

                // 
                // state.value[i][]= line.quantity_received;
                // state.value[i][]= line.quantity_pending;
                // state.value[i][]= line.receipt_progress;
                // state.value[i][]= line.margin;
                // state.value[i][]= line.margin_percent;
                i++;
            }
        },
        setCellValue: (state, action) => {
            state.value[action.payload.row][action.payload.col] = action.payload.value;
        },
        addLine: (state) => {
            const row = [...Array(state.value[0].length)].map(() => '')
            state.value.push(row)
        },
        completeTableTobe: (state, action) => {
            while (state.value.length - 1 < action.payload) {
                state.value.push([])
            }
        },
        removeLine: (state, action) => {
            if (state.value.length > 1) {
                state.value.splice(action.payload, 1);
            }
        },
        addColumn: (state, action) => {
            const newColumnIndex = state.value[0].length;
            state.value[0].push(action.payload);
            // Add empty cells for existing rows
            for (let i = 1; i < state.value.length; i++) {
                state.value[i].push('');
            }
            // Make new columns visible by default (index is already correct, no offset needed)
            state.columnVisibility[newColumnIndex] = true;
        },
        removeColumn: (state, action) => {
            const removeIndex = action.payload;
            // Remove cell data from all rows
            for (let i = 0; i < state.value.length; i++) {
                state.value[i].splice(removeIndex, 1);
            }
            // Also remove from name and string arrays if it's a custom column
            const numberOfBaseColumns = 8;
            if (removeIndex >= numberOfBaseColumns) {
                state.name.splice(removeIndex, 1);
                state.string.splice(removeIndex, 1);
            }
            // Remove column visibility entry and shift remaining entries
            const newVisibility: Record<number, boolean> = {};
            Object.keys(state.columnVisibility).forEach(key => {
                const keyIndex = parseInt(key);
                if (keyIndex < removeIndex) {
                    // Keep entries before the removed column as-is
                    newVisibility[keyIndex] = state.columnVisibility[keyIndex];
                } else if (keyIndex > removeIndex) {
                    // Shift entries after the removed column down by 1
                    newVisibility[keyIndex - 1] = state.columnVisibility[keyIndex];
                }
                // Entry at removeIndex is not copied (effectively deleted)
            });
            state.columnVisibility = newVisibility;
        },
        clearTable: (state) => {
            state.value = initialState
        },
        addColumnsFromFields: (state, action) => {
            const fields: t_Field[] = action.payload;
            // const existingColumns = state.value[0] || [];

            // Get existing column names (case-insensitive for comparison)
            // const existingColumnNames = existingColumns.map(col => col.toLowerCase());
            const existingColumnNames = state.name

            // Process each field and add columns that don't already exist
            Object.values(fields).forEach((field) => {
                // if (field.string && !existingColumnNames.includes(field.string.toLowerCase())) {
                if (field.name && !existingColumnNames.includes(field.name)) {
                    // Add the column header
                    state.value[0].push(field.string);
                    state.name.push(field.name)
                    state.string.push(field.string)
                    state.type.push(field.type) // Store the field type!

                    // Add empty cells for existing rows
                    for (let i = 1; i < state.value.length; i++) {
                        state.value[i].push('');
                    }

                    // Make new columns hidden by default in create mode (index is already correct)
                    const newColumnIndex = state.value[0].length - 1;
                    state.columnVisibility[newColumnIndex] = false;
                }
            });
        },
        toggleColumnVisibility: (state, action) => {
            const columnIndex = action.payload;
            state.columnVisibility[columnIndex] = !state.columnVisibility[columnIndex];
        },
        setColumnVisibility: (state, action) => {
            state.columnVisibility = action.payload;
        },
        // Set visibility for all extra columns (used to show columns with data in edit mode)
        setExtraColumnsVisibility: (state, action) => {
            const { columnIndices, visible } = action.payload;
            columnIndices.forEach((index: number) => {
                state.columnVisibility[index] = visible;
            });
        },
        moveLine: (state, action) => {
            const { fromIndex, toIndex } = action.payload;
            // Adjust indices because state.value[0] is the header row
            // fromIndex/toIndex are 0-based relative to data rows
            const actualFrom = fromIndex + 1;
            const actualTo = toIndex + 1;

            if (
                actualFrom >= 1 && actualFrom < state.value.length &&
                actualTo >= 1 && actualTo < state.value.length
            ) {
                const [movedRow] = state.value.splice(actualFrom, 1);
                state.value.splice(actualTo, 0, movedRow);
            }
        }
    }
});

export const { setValue, setTable, setCellValue, addLine, completeTableTobe, removeLine, addColumn, removeColumn, clearTable, addColumnsFromFields, toggleColumnVisibility, setColumnVisibility, setExtraColumnsVisibility, moveLine } = masterOrderLinesSlice.actions;
export default masterOrderLinesSlice.reducer;