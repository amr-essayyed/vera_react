import { purchaseOrderKeys, purchaseOrderLineKeys } from "./types/purchaseOrder";

const resourceNameResolver: { [key: string]: { modelName: string; fields: {} } } = {
	masterOrder: {
		modelName: "at.master.order",
		fields: {
			fields: ["id", "name", "project_name", "workflow_type", "client_id", "vendor_id", "date_order", "date_expected", "priority", "amount_total", "line_ids", "commission_rate"],
			// limit: 10,
		},
	},
	masterOrderLine: {
		modelName: "at.master.order.line",
		fields: {
			fields: ["id", "name", "master_id", "vendor_id", "quantity", "price_unit", "currency_id", "price_subtotal"],
		},
	},
	purchaseOrder: {
		modelName: "purchase.order",
		fields: {
			fields: [...purchaseOrderKeys],
			// limit: 10,
			// offset: 0
		},
	},
	purchaseOrderLine: {
		modelName: "purchase.order.line",
		fields: {
			fields: [...purchaseOrderLineKeys],
			// limit: 10,
			// offset: 0
		},
	},
	invoice: {
		modelName: "account.move",
		fields: {
			fields: ["id", "name", "partner_id", "date", "amount_total", "state", "invoice_payment_state", "user_id"],
			// limit: 10,
			// offset: 0
		},
	},
	invoiceLine: {
		modelName: "account.move.line",
		fields: {
			fields: ["id", "name", "move_id", "product_id", "quantity", "price_unit", "currency_id", "price_subtotal"],
			// limit: 10,
			// offset: 0
		},
	},
	productCategory: {
		modelName: "product.category",
		fields: {
			fields: ["id", "name", "parent_id"],
			// limit: 10,
		},
	},
	product: {
		modelName: "product.template",
		fields: {
			fields: ["id", "name", "standard_price", "list_price"],
			// limit: 10,
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
	contact: {
		modelName: "res.partner",
		fields: {
			fields: [
                "id", 
                "name", 
                "email", 
                "phone", 
                "mobile",
                "website",
                "street",
                "street2",
                "city",
                "state_id",
                "zip",
                "country_id",
                "vat",
                "is_company",
                "supplier_rank",
                "customer_rank",
                "category_id",
                "comment",
                "avatar_1024"
            ],
		},
	},
};

export default resourceNameResolver;


                // "id", 
                // "name", 
                // "partner_ref", 
                // "customer_id", 
                // "order_status", 
                // "shipping_status", 
                // "payment_status", 
                // "date_approve", 
                // "project_id", 
                // "date_planned", 
                // "date_order",
                // "partner_id" , // ref res.partner (supplier)
                // "currency_id", // ref res.currency
                // "amount_total",
                // "order_line", // ref purchase.order.line
                // "invoice_ids", // ref account.move
                // "invoice_count",
                // "invoice_status" // select