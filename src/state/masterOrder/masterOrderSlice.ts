import type { tf_MasterOrder } from "@/types/masterOrder";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: Omit<tf_MasterOrder, 'line_ids'> = {
    "project_name": '',
    "client_id": "",
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
        },
        setForm: (state, action) => {
            state.value.project_name = action.payload.project_name;
            state.value.client_id = String(action.payload.client_id?.[0] || '');
            state.value.date_order = action.payload.date_order;
            state.value.date_expected = action.payload.date_expected;
            state.value.virtual_inventory = action.payload.virtual_inventory;
            state.value.shipper_id = action.payload.shipper_id?.[0];
            state.value.shipping_cost = action.payload.shipping_cost;
            state.value.shipping_charge = action.payload.shipping_charge;
            state.value.currency_id = action.payload.currency_id?.[0];
            state.value.commission_rate = action.payload.commission_rate;
            state.value.auto_sync_documents = action.payload.auto_sync_documents;
        },
        clearForm: (state) => {
            state.value = initialState;
        }
    }

});

export default masterOrderSlice.reducer;
export const {setValue, setFieldValue, setForm, clearForm } = masterOrderSlice.actions;