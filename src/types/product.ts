// Odoo product zod schema and type

import { z } from "zod";
import { many2oneSchema } from "./odooSchemas";

export const productCreateSchema = z.object({
    name: z.string(),
    list_price: z.number().optional(), //sales price
    standard_price: z.number().optional(), // cost
    image_1920: z.string().nullable(),
    // default_code: z.string().nullable(),
});

export const productReadSchema = z.object({
    id: z.number(),
    product_variant_id: z.tuple([z.number().int().positive(), z.string()]),
    name: z.string(),
    default_code: z.string().nullable(),
    list_price: z.number(), //sales price
    standard_price: z.number(), // cost
    image_1920: z.string().nullable(),
});

export type tProductRead = z.infer<typeof productReadSchema>;
export type tProductCreate = z.infer<typeof productCreateSchema>;

export const productKeys = Object.keys(productReadSchema.shape);