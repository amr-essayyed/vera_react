import { currencyKeys } from "./types/currency";
import { productKeys } from "./types/product";
import { purchaseOrderKeys, purchaseOrderLineKeys } from "./types/purchaseOrder";

const resourceNameResolver= {
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
			fields: purchaseOrderKeys,
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
			fields: productKeys,
			limit: 10,
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
    user: {
		modelName: "res.users",
		fields: {
			fields: ["id", "name", "email", "phone", "mobile", "website", "street", "street2", "city", "state_id", "zip", "country_id", "vat", "is_company", "supplier_rank", "customer_rank", "category_id", "comment", "avatar_1024"],
		},
	},
	salesOrder: {
		modelName: "sale.order",
		fields: {
			fields: ["id", "name", "partner_id", "partner_invoice_id", "partner_shipping_id", "sale_order_template_id", "validity_date", "pricelist_id", "payment_term_id", "state", "date_order", "user_id", "order_line", "amount_total",],
		}

	},
	accountPaymentTerm: {
		modelName: "account.payment.term",
		fields: {
			fields: [],
		}

	},
	accountTax: {
		modelName: "account.tax",
		fields: {
			fields: ["id", "name", "amount", "type_tax_use", "price_include"],
		},
	},
    currency: {
		modelName: "res.currency",
		fields: {fields: currencyKeys},
	},

};

export default resourceNameResolver;

export type Model =  keyof typeof resourceNameResolver;

