import z from "zod"

// ============================================================================
// BASE SCHEMAS
// ============================================================================
export const many2oneSchema = z.union([
  z.number().int().positive(),
  z.object({ id: z.number().int().positive(), name: z.string().optional() }),
])

export const many2manySchema = z.array(many2oneSchema)

// ============================================================================
// SALE ORDER FORM SCHEMA (UI)
// ============================================================================
export const saleOrderFormSchema = z.object({
  // Customer Info
  partner_id: many2oneSchema.optional(),
  partner_invoice_id: many2oneSchema.optional(),
  partner_shipping_id: many2oneSchema.optional(),

  // Order Details
  date_order: z.string().optional(),
  validity_date: z.string().optional(),
  client_order_ref: z.string().optional(),

  // Commercial Info
  pricelist_id: many2oneSchema.optional(),
  payment_term_id: many2oneSchema.optional(),
  user_id: many2oneSchema.optional(),

  // Order Lines
  order_line: z.array(
    z.object({
      product_id: many2oneSchema.optional(),
      product_uom_qty: z.coerce.number().nonnegative().default(1),
      price_unit: z.coerce.number().nonnegative(),
      discount: z.coerce.number().min(0).max(100).optional(),
      tax_id: many2manySchema.optional(),
      name: z.string().optional(),
    })
  ).default([]),

  // Notes
  note: z.string().optional(),
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export function extractMany2oneId(field: z.infer<typeof many2oneSchema> | undefined): number | undefined {
  if (field === undefined || field === null) return undefined
  return typeof field === "number" ? field : field.id
}

export function formToOdooCreate(formData: z.infer<typeof saleOrderFormSchema>) {
  return {
    partner_id: extractMany2oneId(formData.partner_id),
    partner_invoice_id: extractMany2oneId(formData.partner_invoice_id),
    partner_shipping_id: extractMany2oneId(formData.partner_shipping_id),
    pricelist_id: extractMany2oneId(formData.pricelist_id),
    payment_term_id: extractMany2oneId(formData.payment_term_id),
    user_id: extractMany2oneId(formData.user_id),

    ...(formData.date_order && { date_order: formData.date_order }),
    ...(formData.validity_date && { validity_date: formData.validity_date }),
    ...(formData.client_order_ref && { client_order_ref: formData.client_order_ref }),
    ...(formData.note && { note: formData.note }),

    order_line: formData.order_line
      .filter(line => line.product_id)
      .map(line => [
        0,
        0,
        {
          product_id: Number(line.product_id),
          product_uom_qty: Number(line.product_uom_qty),
          price_unit: Number(line.price_unit),
          discount: line.discount,
          name: line.name,
          tax_id: line.tax_id?.length
            ? [6, 0, line.tax_id.map(extractMany2oneId).filter(Boolean)]
            : [],
        },
      ])
  }
}
