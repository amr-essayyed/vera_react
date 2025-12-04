import { z } from "zod";

/** Many2one fields in Odoo are often represented as a number (id) or { id, name } */
export const many2oneSchema = z.union([
  z.number().int().positive(),
  z.object({
    id: z.number().int().positive(),
    name: z.string().optional(),
  }),
]);

/** Many2many as an array of ids or array of { id, name } */
export const many2manySchema = z.array(many2oneSchema);

/** Supplier schema based on res.partner model */
export const contactSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  street: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state_id: many2oneSchema.optional(),
  zip: z.string().optional(),
  country_id: many2oneSchema.optional(),
  vat: z.string().optional(),
  is_company: z.boolean().default(true),
  supplier_rank: z.number().default(1),
  customer_rank: z.number().default(0),
  category_id: many2manySchema.optional(),
  comment: z.string().optional(),
  avatar_1024: z.string().optional(),
}).catchall(z.any());

/** Form schema for supplier creation/editing */
export const contactFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  street: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state_id: z.number().optional(),
  zip: z.string().optional(),
  country_id: z.number().optional(),
  vat: z.string().optional(),
  comment: z.string().optional(),
});

/** Handy TS types */
export type Contact = z.infer<typeof contactSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;