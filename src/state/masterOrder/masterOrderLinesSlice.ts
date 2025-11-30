import { createSlice } from "@reduxjs/toolkit";

const initialState: string[][] = 
    [
        // MasterOrderLineFormFields,
        ["Image", "Product", "Description", "Qty", "Unit", /*"Sale Price", "Vendor",*/ "Subtotal",],
        [],
    ]

const masterOrderLinesSlice = createSlice({
    name: 'masterOrderLines',
    initialState: {value: initialState },
    reducers: {
        setValue: (state, action) => {
            state.value = action.payload;
        },
        setLines: (state, action) => {
            state.value = action.payload;
        },
        setCellValue: (state, action) => {
            state.value[action.payload.row][action.payload.col] = action.payload.value;
        },
        addLine: (state) => {
            state.value.push([])
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
                state.value[i].splice(i,1);
            }
        }
    }
});

export const { setValue, setCellValue, addLine, completeTableTobe, removeLine, addColumn, removeColumn } = masterOrderLinesSlice.actions;
export default masterOrderLinesSlice.reducer;