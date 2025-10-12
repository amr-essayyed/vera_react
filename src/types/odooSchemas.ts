import { z } from "zod";

/** Many2one fields in Odoo are often represented as a number (id), [id, name] array, or false */
export const many2oneSchema = z.union([
    z.number().int().positive(),
    z.tuple([z.number().int().positive(), z.string()]), // [id, name] format
    z.literal(false), // Odoo returns false for empty many2one fields
]);

/** Many2many / one2many as an array of ids or array of { id, name } */
export const many2manySchema = z.array(many2oneSchema);