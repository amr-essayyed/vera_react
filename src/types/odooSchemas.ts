import { z } from "zod";

/** Many2one fields in Odoo are often represented as a number (id), [id, name] array, or false */
export const many2oneSchema = z.union([
    z.number().int().positive(),
    z.tuple([z.number().int().positive(), z.string()]), // [id, name] format
    z.literal(false), // Odoo returns false for empty many2one fields
]);

/** Many2many / one2many as an array of ids or array of { id, name } */
export const many2manySchema = z.array(many2oneSchema);

export const idRef = z.union([
  z.number().int().positive(),  // valid Odoo ID
  z.null(),                     // no reference
]);

export const idRefList = z.union([
  z.array(z.number().int().positive()),
  z.null(),
]);


export type Many2oneSchema = z.infer<typeof many2oneSchema>;
export type  Many2manySchema = z.infer<typeof many2manySchema>;
export type IdRef = z.infer<typeof idRef>;
export type IdRefList = z.infer<typeof idRefList>;