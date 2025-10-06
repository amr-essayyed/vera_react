import z from "zod";

export const many2oneSchema = z.union([
  z.number().int().positive(),
  z.object({
    id: z.number().int().positive(),
    name: z.string().optional(),
  }),
]);

/** Many2many / one2many as an array of ids or array of { id, name } */
export const many2manySchema = z.array(many2oneSchema);


export const salesOrderSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().optional(),
  partner_id: many2oneSchema,                  // Customer
  // partner_invoice_id: many2oneSchema.optional(),
  // partner_shipping_id: many2oneSchema.optional(),
  // sale_order_template_id: many2oneSchema.optional(),
  validity_date: z.string().optional(),    // ISO datetime
  // plan_id: many2oneSchema.optional(),
  company_id: many2oneSchema.optional(),
  create_date: z.string().optional(),   // ISO datetime
  // pricelist_id: many2oneSchema.optional(),
  // payment_term_id: many2oneSchema.optional(),
  state: z.enum(["draft", "sent", "sale", "done", "cancel"]).default("draft"),
  date_order: z.string().optional(),    // ISO datetime
  user_id: many2oneSchema.optional(),
  // order_line: z.array(purchaseOrderLineSchema).default([]),
  amount_total: z.number().optional(),   // computed by Odoo
});

export const SaleOrderLineFormSchema = z.object({
  id: z.number().int().positive().optional(),
  partner_id: many2oneSchema.optional(),
  referrer_id: many2oneSchema.optional(),
  partner_invoice_id: many2oneSchema.optional(),
  partnerShipping_id: many2oneSchema.optional(),
  sales_order_template_id: many2oneSchema.optional(),
  validty_date: z.string().optional(),
  date_order: z.string().optional(),
  plan_id: many2oneSchema.optional(),
  pricelist_id: many2oneSchema.optional(),
  payment_term_id: many2oneSchema.optional(),
  product_template_id: many2oneSchema.optional(),
});


export const salesOrderLineSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1), // description
  product_id: many2oneSchema.optional(),
  product_uom: many2oneSchema.optional(), // unit of measure
  date_planned: z.string().optional(), // ISO datetime string from server
  product_qty: z.number().nonnegative(),
  price_unit: z.number().nonnegative(),
  taxes_id: many2manySchema.optional(), // taxes applied
  price_subtotal: z.number().optional(), // computed by Odoo
  price_total: z.number().optional(), // computed by Odoo
  display_type: z.enum(["line_section", "line_note"]).optional(), // Odoo display-only lines
});

export type SalesOrder = z.infer<typeof salesOrderSchema>
export type SalesOrderLineForm = z.infer<typeof SaleOrderLineFormSchema>
export type tSalesOrderLine = z.infer<typeof salesOrderLineSchema>