import type { tOrderLineForm, tOrderLineCreate } from "@/types/purchaseOrder";
import { imageToBase64 } from "@/utils/imageUtils";
import { useCreateMultipleResources } from "./useResource";
import type { tProductCreate, tProductRead } from "@/types/product";
import { omit } from "@/utils/miscUtils";
// import { useQueryClient } from "@tanstack/react-query";
import { ResourceService } from "@/services/resourceService";

export function useProducts() {
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");

	async function createProducts(orderLines: tOrderLineForm[], products: tProductRead[]) {
		// Filter out empty lines
		const validOrderLines = (orderLines || []).filter((line) => line.product_name && line.product_name.trim().length > 0);
		console.log("validOrderLines", validOrderLines);

		// Identify which products don't exist yet
        const existingProducts: tProductRead[] = await ResourceService.getManyByName("product", validOrderLines.map((line) => line.product_name));
        console.log("existingProducts", existingProducts);
        
		const newProducts = validOrderLines.filter((line) => !existingProducts?.some((p) => p.name === line.product_name));
		const existProducts = products.filter((p) => validOrderLines?.some((line) => p.name === line.product_name));

		// Prepare data for creation
		const productsToCreate = await Promise.all(
			newProducts.map(async (line) => {
				const imageBase64 = line.image? await imageToBase64(line.image) : null;

				const product: tProductCreate = {
					name: line.product_name,
					standard_price: line.price_unit || 0,
					image_1920: imageBase64,
				};

				return product;
			})
		);

		// Create new products
		console.log("creating new products:", productsToCreate);
		const createdProducts: number[] = await mutateProduct(productsToCreate);
		console.log("created products:", createdProducts);
        
        // Refetch products after creation
        const newGotProducts: tProductRead[] = await ResourceService.getManyById("product",createdProducts);
        const lineProducts = [...newGotProducts, ...existProducts]

		// Build order lines using the updated product list
		const orderLinesWithProducts: tOrderLineCreate[] = validOrderLines.map((line) => ({
                product_id: lineProducts.find((p) => p.name === line.product_name)?.product_variant_id[0],
                ...omit(line, ["product_name", "image"]),
            }));

		console.log("orderLinesWithProducts", orderLinesWithProducts);
		return orderLinesWithProducts;
	}

	return {
		createProducts,
	};
}
