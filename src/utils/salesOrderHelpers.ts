
export const computePermissions = (state?: string) => ({
  canEdit: ["draft", "sent"].includes(state || ""),
  isCanceled: state === "cancel",
  canCanceled: ["sale", "draft", "sent"].includes(state || ""),

})

export const normalizeId = (value: any): any =>
  typeof value === "number" ? value : value?.id

export const normalizeSalesOrderPayload = (data: any) => ({
  ...data,
  partner_id: normalizeId(data.partner_id),
  partner_invoice_id: normalizeId(data.partner_invoice_id),
  partner_shipping_id: normalizeId(data.partner_shipping_id),
  payment_term_id: normalizeId(data.payment_term_id),

  // For existing lines:
  order_line: Array.isArray(data.order_line)
    ? data.order_line.map((line: any) => {
      const productId = normalizeId(line.product_id)

      if (line.id) {
        return [1, line.id, {
          name: line.name,
          product_id: productId,
          product_uom_qty: line.product_uom_qty,
          price_unit: line.price_unit,
        }]
      } else {
        // Create new line
        return [0, 0, {
          name: line.name,
          product_id: productId,
          product_uom_qty: line.product_uom_qty,
          price_unit: line.price_unit,
        }]
      }
    })
    : [],
})
