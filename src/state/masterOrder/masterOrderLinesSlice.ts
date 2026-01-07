import { createSlice } from "@reduxjs/toolkit";

interface MasterOrderLine {
    image_1920: string;
    product_id: string;
    name: string;
    quantity: string;
    price_cost: string;
    price_sale: string;
    vendor_id: string;
    price_subtotal_sale: string;
    [key: string]: any;
}

const initialStateValue: MasterOrderLine[] =
    [
        { image_1920: "", product_id: "", name: "", quantity: "", price_cost: "", price_sale: "", vendor_id: "", price_subtotal_sale: "", },
    ]

const masterOrderLinesSlice = createSlice({
    name: 'masterOrderLines',
    initialState: {
        value: initialStateValue,
        type: { image_1920: "binary", product_id: "string", name: "string", quantity: "number", price_cost: "number", price_sale: "number", vendor_id: "string", price_subtotal_sale: "number", } as Record<string, string>,
        string: { image_1920: "Image", product_id: "Product", name: "Description", vendor_id: "Vendor", quantity: "Quantity", price_cost: "Cost", price_sale: "Sale", price_subtotal_sale: "Subtotal", } as Record<string, string>,
        columnVisibility: { image_1920: true, product_id: true, name: true, vendor_id: true, quantity: true, price_cost: true, price_sale: true, price_subtotal_sale: true, } as Record<string, boolean>,
        colNameByIndex: ["image_1920", "product_id", "name", "vendor_id", "quantity", "price_cost", "price_sale", "price_subtotal_sale"],
    },
    reducers: {
        setValue: (state, action) => {
            state.value = action.payload;
        },
        initializeTable: (state, action) => {
            const masterOrderLines = action.payload.lines;
            const fields = action.payload.fields;
            console.log("[masterOrderLines slice reducer initializeTable]", fields);

            for (let field of Object.keys(fields)) {
                state.type[field] = fields[field].type;
                state.string[field] = fields[field].string;
            }

            let i = 0;
            for (let line of masterOrderLines) {
                if (!state.value[i]) state.value.push({ ...initialStateValue[0] });
                const lineFields = Object.keys(line);
                for (let field of lineFields) {
                    if (state.type[field] === 'binary') {
                        state.value[i][field] = line[field] && 'data:image/png;base64,' + line[field];
                    } else {
                        state.value[i][field] = line[field];
                    }
                }
                i++;
            }
        },
        setTable: (state, action) => {
            const masterOrderLines = action.payload.lines;
            const fields = action.payload.fields;
            console.log("[masterOrderLines slice reducer setTable]", fields);

            for (let field of Object.keys(fields)) {
                state.type[field] = fields[field].type;
                state.string[field] = fields[field].string;
            }

            let i = 0;
            for (let line of masterOrderLines) {
                if (!state.value[i]) state.value.push({ ...initialStateValue[0] });
                const lineFields = Object.keys(line);
                for (let field of lineFields) {
                    if (state.type[field] === 'binary') {
                        state.value[i][field] = line[field] && 'data:image/png;base64,' + line[field];
                    } else {
                        state.value[i][field] = line[field];
                    }
                }
                i++;
            }
        },
        setCellValue: (state, action) => {
            const row = action.payload.row;
            const col = action.payload.col;
            const value = action.payload.value;
            state.value[row][state.colNameByIndex[col]] = value;
        },
        addLine: (state) => {
            const row = { ...initialStateValue[0] };
            state.value.push(row)
        },
        completeTableTobe: (state, action) => {
            while (state.value.length - 1 < action.payload) {
                state.value.push({ ...initialStateValue[0] })
            }
        },
        removeLine: (state, action) => {
            if (state.value.length > 1) {
                state.value.splice(action.payload, 1);
            }
        },
        addColumn: (state, action) => {
            // state.value[0].push(action.payload)
            const colName: string = action.payload.colName;
            const colType: string = action.payload.colType;
            state.type[colName] = colType;
            state.value.forEach((row) => {
                row[colName] = "";
            })
        },
        removeColumn: (state, action) => {
            const colName: string = action.payload.colName;
            state.value.forEach((row) => {
                delete row[colName];
            })
            delete state.type[colName];
        },
        clearTable: (state) => {
            state.value = initialStateValue;
        }
    }
});

export const { setValue, initializeTable, setTable, setCellValue, addLine, completeTableTobe, removeLine, addColumn, removeColumn, clearTable } = masterOrderLinesSlice.actions;
export default masterOrderLinesSlice.reducer;