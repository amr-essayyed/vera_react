import z from "zod";

export class tf_MasterOrderLine {
    "image"?: File | string;
    "product_name": string;
    "name": string;  // todo: replace "name" with "description" after Odoo model modification.
    "vendor_id"?: number;
    "quantity": number;
    "price_cost": number;
    "price_sale"?: number;  
}
export const MasterOrderLineFormFields = Object.keys(new tf_MasterOrderLine());

export const zf_MasterOrderLine = z.object({
    "image": z.file().or(z.string()).optional(),
    "product_name": z.string().nonempty("Must enter a product name"),
    "name": z.string().nonempty("Must enter a description"),  // todo: replace "name" with "description" after Odoo model modification.
    "vendor_id": z.number().optional(),
    "quantity": z.number(),
    "price_cost": z.number().optional(),
    "price_sale": z.number().optional(),  
})

export const zf_MasterOrderLines = z.array(zf_MasterOrderLine);

export class tc_MasterOrderLine {
    "image_1920"?: string;// File;
    "product_id": number;
    "name": string; // todo: replace "name" with "description" after Odoo model modification.
    "vendor_id"?: number;
    "quantity": number;
    "price_cost": number;
    "price_sale"?: number;  
}


export class tr_MasterOrderLine {
    "id": number;
    "name": string; // todo: replace "name" with "description" after Odoo model modification.
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
    "name": string; // todo: replace "name" with "description" after Odoo model modification.
    "image_1920": File;
    "product_id": number;
    "vendor_id": number;
    "quantity": number;
    "price_cost": number;
    "price_sale": number;  
}