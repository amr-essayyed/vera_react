import type { many2oneSchema } from "@/types/odooSchemas";
import type { tPurchaseOrderLineForm } from "@/types/purchaseOrder";
import { imageToBase64 } from "@/utils/imageUtils";
import {z} from "zod";
import { useCreateMultipleResources } from "./useResource";

export function useOrderLine(orderModel: string) {

    const { mutateAsync: mutatePurchaseOrderLine } = useCreateMultipleResources(orderModel);
    const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");
    
    async function onOrderLineFormSubmit(values: tPurchaseOrderLineForm, orderId: z.infer<typeof many2oneSchema>, products: any) {
        // Filter out empty lines (lines without product names)
        const validOrderLines = (values.order_lines || []).filter((line) => line.name && line.name.trim().length > 0);
    
        // Process all order lines and convert images to base64
        const newProducts = validOrderLines.filter((product) => !products?.some((p: any) => p.name === product.name));
    
        const productsToCreate = await Promise.all(
            newProducts.map(async (line) => {
                const imageBase64 = line.image ? await imageToBase64(line.image) : null;
    
                // Build the product object
                const product: any = {
                    name: line.name,
                    list_price: line.price_unit,
                    image_1920: imageBase64,
                };
    
                return product;
            })
        );
    
        // Step 1: Create all products first
        const createdProducts = await mutateProduct(productsToCreate);
    
        // Step 3: Create purchase order lines with purchase order and product references
        const purchaseOrderLinesToCreate = validOrderLines.map((line, index) => ({
            order_id: orderId, // Reference to purchase order
            product_id: createdProducts[index]?.id, // Reference to created product
            product_qty: line.product_qty, // Using product_qty field
            price_unit: line.price_unit,
            name: line.name,
        }));
        
        // Only create purchase order lines if there are valid lines
        if (purchaseOrderLinesToCreate.length > 0) {
            await mutatePurchaseOrderLine(purchaseOrderLinesToCreate);
        }
    }

    return {
        onOrderLineFormSubmit,
    }
}