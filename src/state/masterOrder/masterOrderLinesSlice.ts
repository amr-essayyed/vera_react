import { createSlice } from "@reduxjs/toolkit";

const initialState: string[][] = 
    [
        // MasterOrderLineFormFields,
     // ["Image", "Product", "Description", "Qty",    "Unit",   "Sale Price", "Vendor", "Subtotal",],
        ["Image", "text",    "text",        "number", "number", "number",     "text",   "number",],
        ["", "",    "",        "", "", "",     "",   "",],
    ]

const masterOrderLinesSlice = createSlice({
    name: 'masterOrderLines',
    initialState: {value: initialState },
    reducers: {
        setValue: (state, action) => {
            state.value = action.payload;
        },
        setTable: (state, action) => {
            let i = 1;
            for(let line of action.payload){
                if (!state.value[i]) state.value.push([]);
                state.value[i][0]= line.image_1920 && 'data:image/png;base64,' + line.image_1920;
                state.value[i][1]= line.product_id?.[1];
                state.value[i][2]= line.name;
                state.value[i][3]= line.quantity;
                state.value[i][4]= line.price_cost;
                state.value[i][5]= line.price_sale;
                state.value[i][6]= line.vendor_id?.[0];
                state.value[i][7]= line.price_subtotal_sale;
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
            while(state.value.length-1 < action.payload) {
                state.value.push([])
            }
        },
        removeLine: (state, action) => {
            if(state.value.length > 1) {
                state.value.splice(action.payload, 1);
            }
        },
        addColumn: (state, action) => {
            state.value[0].push(action.payload)
        },
        removeColumn: (state, action) => {
            for(let i=0; i<state.value.length; i++){
                state.value[i].splice(action.payload,1);
            }
        },
        clearTable: (state) => {
            state.value = initialState
        }
    }
});

export const { setValue, setTable, setCellValue, addLine, completeTableTobe, removeLine, addColumn, removeColumn, clearTable } = masterOrderLinesSlice.actions;
export default masterOrderLinesSlice.reducer;