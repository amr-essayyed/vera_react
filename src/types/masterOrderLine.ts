export class tf_MasterOrderLine {
    "image"?: File;
    "product_name": string;
    "name": string;
    "vendor_id"?: number;
    "quantity": number;
    "price_cost": number;
    "price_sale"?: number;  
}

export class tc_MasterOrderLine {
    "image_1920"?: string;// File;
    "product_id": number;
    "name": string;
    "vendor_id"?: number;
    "quantity": number;
    "price_cost": number;
    "price_sale"?: number;  
}


export class tr_MasterOrderLine {
    "id": number;
    "name": string;
    "image_1920": File;
    "product_id": [number, string];
    "vendor_id": number;
    "quantity": number;
    "quantity_received": number;
    "quantity_pending": number;
    "receipt_progress": number;
    "price_cost": number;
    "price_sale": number;
    "margin": number;
    "margin_percent": number;
    "price_subtotal_sale": number;
}
export const MasterOrderLineFields = Object.keys(new tr_MasterOrderLine());

export class tu_MasterOrderLine {
    "id": number;
    "name": string;
    "image_1920": File;
    "product_id": number;
    "vendor_id": number;
    "quantity": number;
    "price_cost": number;
    "price_sale": number;  
}