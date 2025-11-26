// Odoo product zod schema and type

import { z } from "zod";
import { many2oneSchema } from "./odooSchemas";

export const zc_product = z.object({
    name: z.string(),
    list_price: z.number().optional(), //sales price
    standard_price: z.number().optional(), // cost
    image_1920: z.string().optional(),
    // default_code: z.string().nullable(),
});

export const zr_product = z.object({
    id: z.number(),
    product_variant_id: z.tuple([z.number().int().positive(), z.string()]),
    name: z.string(),
    default_code: z.string().nullable(),
    list_price: z.number(), //sales price
    standard_price: z.number(), // cost
    image_1920: z.string().optional(),
});

export type tr_Product = z.infer<typeof zr_product>;
export type tc_Product = z.infer<typeof zc_product>;

export const productKeys = Object.keys(zr_product.shape);


export class tr_productProd {
    "id": number;
    "name": string;
    "image_1920": File;
}
export const ProductProdFileds = Object.keys(new tr_productProd());
