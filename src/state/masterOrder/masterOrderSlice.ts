import type { tf_MasterOrder } from "@/types/masterOrder";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: Omit<tf_MasterOrder, 'line_ids'> = {
    "project_name": '',
    "client_id": 0,
    "date_order": '',
    "date_expected": '',
    "virtual_inventory": false,
    "shipper_id": 0,
    "shipping_cost": 0,
    "shipping_charge": 0,
    "currency_id": 0,
    "commission_rate": 0,
    "auto_sync_documents": 0,
}

const masterOrderSlice = createSlice({
    name: 'masterOrder',
    initialState: {
        value: initialState
    },
    reducers: {
        setValue: (state, action) => {
            state.value = action.payload;
        },
        setFieldValue: (state, action: PayloadAction<{ field: string; value: any }>) => {
            const { field, value } = action.payload;
            (state.value as any)[field] = value;
        }
    }

});

export default masterOrderSlice.reducer;
export const {setValue, setFieldValue} = masterOrderSlice.actions;