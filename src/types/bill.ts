import {z} from "zod";

export class tf_Bill {
    "partner_id": string;
    "ref"?: string;
    "invoice_date"?: string;
    "invoice_line_ids"?: []
}

export class tc_Bill {
    "move_type": string;
    "partner_id": number;
    "ref"?: string | undefined;
    "invoice_date"?: Date | undefined;
    "invoice_line_ids"?: []
}


export const zc_Bill = z.object({
    "move_type": z.string(),
    "partner_id": z.number(),
    "ref": z.string().optional(),
    "invoice_date": z.date().optional(),
});

export const kBill = Object.keys(new tc_Bill());