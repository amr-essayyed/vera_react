const resourceNameResolver: { [key: string]: {modelName: string, fields:{}} } = {
    "masterOrder": {
        modelName:"at.master.order",
        fields: {
            "fields": [
            "id",
            "name",
            "project_name",
            "workflow_type",
            "client_id",
            "vendor_id",
            "date_order",
            "date_expected",
            "priority",
            "amount_total"
            ],
            "limit": 10
        }
    },
    "purchaseOrder": {
        modelName:"purchase.order",
        fields: {
            "fields": [
            "id",
            "name",
            "partner_id",
            "date_planned",
            "date_order",
            "amount_total"
            ],
            "limit": 10
        }
    },
    "product": {
        modelName: "product.template",
        fields: {
            fields: [
                "id",
                "name",
                "standard_price",
                "list_price",
                "image_1920"
            ]
        }
    }
}

export default resourceNameResolver;