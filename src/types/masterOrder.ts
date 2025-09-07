interface MasterOrder {
    "id": number,
    "name":string,
    "project_name":string,
    "workflow_type":string, //! enum
    "client_id":[
        number,
        string
    ],
    "vendor_id": boolean,
    "date_order": string,
    "date_expected": string,
    "priority": string, //!enum
    "amount_total": number,
    "line_ids": string[],
}

export type {MasterOrder}