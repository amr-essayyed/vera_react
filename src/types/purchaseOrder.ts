import { z } from "zod";

/** Many2one fields in Odoo are often represented as a number (id) or { id, name } */
export const many2oneSchema = z.union([
  z.number().int().positive(),
  z.object({
    id: z.number().int().positive(),
    name: z.string().optional(),
  }),
]);

/** Many2many / one2many as an array of ids or array of { id, name } */
export const many2manySchema = z.array(many2oneSchema);

/** Common enums from purchase.order */
export const purchaseStateEnum = z.enum([
  "draft",        // RFQ
  "sent",         // RFQ Sent
  "to approve",   // Waiting approval
  "purchase",     // Purchase Order
  "done",         // Locked/Done
  "cancel",       // Cancelled
]);

export const invoiceStatusEnum = z.enum([
  "no",           // nothing to invoice
  "to invoice",   // waiting bills
  "invoiced",     // fully billed
]);

/** Order line schema (purchase.order.line) */
export const purchaseOrderLineSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1),                // description
  product_id: many2oneSchema.optional(),
  product_uom: many2oneSchema.optional(), // unit of measure
  date_planned: z.string().optional(),    // ISO datetime string from server
  product_qty: z.number().nonnegative(),
  price_unit: z.number().nonnegative(),
  taxes_id: many2manySchema.optional(),   // taxes applied
  price_subtotal: z.number().optional(),  // computed by Odoo
  price_total: z.number().optional(),     // computed by Odoo
  display_type: z
    .enum(["line_section", "line_note"])
    .optional(), // Odoo display-only lines
  analytic_account_id: many2oneSchema.optional(),
}).catchall(z.any()); // Allow additional custom fields

/** Top-level purchase.order schema */
export const purchaseOrderSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().optional(),                 // PO number
  partner_id: many2oneSchema,                  // Vendor
  partner_ref: z.string().optional(),          // Vendor reference
  company_id: many2oneSchema.optional(),
  user_id: many2oneSchema.optional(),          // Buyer
  currency_id: many2oneSchema.optional(),
  picking_type_id: many2oneSchema.optional(),  // incoming picking type
  payment_term_id: many2oneSchema.optional(),
  fiscal_position_id: many2oneSchema.optional(),
  incoterm_id: many2oneSchema.optional(),
  dest_address_id: many2oneSchema.optional(),

  state: purchaseStateEnum.default("draft"),
  invoice_status: invoiceStatusEnum.optional(),

  date_order: z.string().optional(),    // ISO datetime
  date_approve: z.string().optional(),  // ISO datetime

  order_line: z.array(purchaseOrderLineSchema).default([]),

  amount_untaxed: z.number().optional(), // computed by Odoo
  amount_tax: z.number().optional(),     // computed by Odoo
  amount_total: z.number().optional(),   // computed by Odoo

  notes: z.string().optional(),          // terms/notes
});

/** Custom column definition for form UI */
// export const customColumnSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   type: z.enum(["text", "number", "date"]),
// });

/** Extended purchase order line for form with image support */
export const purchaseOrderLineFormSchema = purchaseOrderLineSchema.extend({
  image: z.instanceof(File).optional(), // For form file upload
}); // .catchall(z.any()); // Allow custom fields as direct properties

/** Form schema for purchase order creation */
export const purchaseOrderFormSchema = z.object({
  order_line: z.array(purchaseOrderLineFormSchema).min(1, "At least one line is required"),
  // customColumns: z.array(customColumnSchema).default([]),
});

/** Handy TS types */
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderLine = z.infer<typeof purchaseOrderLineSchema>;
// export type CustomColumn = z.infer<typeof customColumnSchema>;
export type PurchaseOrderLineForm = z.infer<typeof purchaseOrderLineFormSchema>;
export type PurchaseOrderForm = z.infer<typeof purchaseOrderFormSchema>;
