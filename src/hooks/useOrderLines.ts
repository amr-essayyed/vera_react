import { imageToBase64 } from "@/utils/imageUtils";
import { useCreateMultipleResources } from "./useResource";
import type { tc_Product, tr_Product } from "@/types/product";
// import { useQueryClient } from "@tanstack/react-query";
import { ResourceService } from "@/services/resourceService";
import type { tcpart_OrderLine, tfpart_OrderLine } from "@/types/orderLine";

export function useProducts() {
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");

	async function createProducts(orderLines: tfpart_OrderLine[]/* , products: tProductRead[]*/) {
		// Filter out empty lines
		const validOrderLines = (orderLines || []).filter((line) => line.product_name && line.product_name.trim().length > 0);
		console.log("validOrderLines", validOrderLines);

		// Identify which products don't exist yet
        const existingProducts: tr_Product[] = await ResourceService.getManyByName("product", validOrderLines.map((line) => line.product_name));        
		const newProducts = validOrderLines.filter((line) => !existingProducts?.some((p) => p.name === line.product_name));

		// Prepare data for creation
		const productsToCreate = await Promise.all(
			newProducts.map(async (line) => {
				var imageBase64 = line.image;
				
				if(line.image instanceof File){
					imageBase64 = await imageToBase64(line.image);
				}
				console.log(imageBase64);
				

				const product: tc_Product = {
					name: line.product_name,
					standard_price: line.price_cost || 0,
					image_1920: imageBase64?.split(",")[1] as string,
				};

				return product;
			})
		);

		// Create new products
		console.log("creating new products:", productsToCreate);
		const createdProducts: number[] = await mutateProduct(productsToCreate);
		console.log("created products:", createdProducts);
        
        // Refetch products after creation
        const newGotProducts: tr_Product[] = await ResourceService.getManyById("product",createdProducts);
		
        const lineProducts = [...newGotProducts, ...existingProducts]
		console.log("Line prod", lineProducts);
		
		// Build order lines using the updated product list

		const orderLinesWithProducts: tcpart_OrderLine[] = validOrderLines.map((line) => {
			console.log("newLine");
			const newLine = {
				...line,
                product_id: lineProducts.find((p) => p.name === line.product_name)!.product_variant_id[0] ,
				image: lineProducts.find((p) => p.name === line.product_name)!.image_1920 || undefined ,
            }
			console.log(newLine);
			
			return(newLine)
		});	

		console.log("orderLinesWithProducts", orderLinesWithProducts);
		return orderLinesWithProducts;
	}

	return {
		createProducts,
	};
}