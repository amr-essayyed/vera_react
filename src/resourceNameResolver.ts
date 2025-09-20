const resourceNameResolver: { [key: string]: { modelName: string; fields: {} } } = {
	masterOrder: {
		modelName: "at.master.order",
		fields: {
			fields: ["id", "name", "project_name", "workflow_type", "client_id", "vendor_id", "date_order", "date_expected", "priority", "amount_total", "line_ids", "commission_rate"],
			limit: 10,
		},
	},
	masterOrderLine: {
		modelName: "at.master.order.line",
		fields: {
			fields: ["id", "name", "master_id", "vendor_id", "quantity", "price_unit", "currency_id", "price_subtotal", "image_1920"],
		},
	},
	purchaseOrder: {
		modelName: "purchase.order",
		fields: {
			fields: ["id", "name", "partner_id", "date_planned", "date_order", "amount_total"],
			limit: 10,
		},
	},
	product: {
		modelName: "product.template",
		fields: {
			fields: ["id", "name", "standard_price", "list_price", "image_1920"],
		},
	},
	client: {
		modelName: "res.partner",
		fields: {
			fields: ["id", "name", "avatar_1024", "company_id", "company_name"],
		},
	},
	vendor: {
		modelName: "res.partner",
		fields: {
			fields: ["id", "name", "avatar_1024", "company_id", "company_name"],
		},
	},
};

export default resourceNameResolver;
