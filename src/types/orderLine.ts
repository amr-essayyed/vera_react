export class tfpart_OrderLine {
    "name": string;
    "product_name": string;
    "image"?: File;
    "quantity": number;
    "price_cost": number;
    "price_sale"?: number;
    "vendor_id"?: number;
}

export class tcpart_OrderLine {
    "name": string;
    "product_id": number;
    "image"?: string;
    //File | string;
    "quantity": number;
    "price_cost": number;
    "price_sale"?: number;
    "vendor_id"?: number;
    
    // "quantity_received"?: number; // handled in tu
    // "quantity_pending"?: number; // handled in tu
    // "receipt_progress"?: number; // calc
    // "margin"?: number; // calc
    // "margin_percent"?: number; //  calc
    // "price_subtotal_sale": number; // calc
}