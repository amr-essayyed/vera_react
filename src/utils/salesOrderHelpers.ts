export const computePermissions = (state?: string) => ({
    canEdit: ["draft", "sent"].includes(state || ""),
    isCanceled: state === "cancel",
    canCanceled: ["sale","draft","sent"].includes(state || ""),

})

export const normalizeId = (value: any): any =>
    typeof value === "number" ? value : value?.id

export const normalizeSalesOrderPayload = (data: any) => ({
    ...data,
    partner_id: normalizeId(data.partner_id),
    partner_invoice_id: normalizeId(data.partner_invoice_id),
    partner_shipping_id: normalizeId(data.partner_shipping_id),
    payment_term_id: normalizeId(data.payment_term_id),
})