import {
  	Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMultipleResources } from "@/hooks/useResource";
import ItemsTable from "@/components/ItemsTable";
import { purchaseOrderFormSchema, type PurchaseOrderForm } from "@/types/purchaseOrder";



export default function PurchaseOrderCreatePage() {
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");



	const form = useForm<PurchaseOrderForm>({
		resolver: zodResolver(purchaseOrderFormSchema),
		defaultValues: {
		order_line: [{ 
			name: "someItem", 
			product_qty: 1, 
			price_unit: 1 
		}],
		// customColumns: [],
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: PurchaseOrderForm) {
		console.log("Form submitted with values:", values);
		try {
		// Process all order lines and convert images to base64
		const productsToCreate = await Promise.all(
			values.order_line.map(async (line) => {
			const imageBase64 = line.image ? await imageToBase64(line.image) : null;
			
			// Build the product object
			const product: any = {
				name: line.name,
				list_price: line.price_unit,
				image_1920: imageBase64,
			};

			// Add custom column data directly as properties
			// values.customColumns.forEach(column => {
			// 	const customValue = (line as any)[column.id];
			// 	if (customValue !== undefined && customValue !== null && customValue !== "") {
			// 		product[`custom_${column.name.toLowerCase().replace(/\s+/g, '_')}`] = customValue;
			// 	}
			// });

			return product;
			})
		);

		console.log("Creating products:", productsToCreate);
		// console.log("Custom columns:", values.customColumns);
		
		// Create all products at once
		const result = await mutateProduct(productsToCreate);
		
		console.log(`Successfully created ${productsToCreate.length} products!`, result);
		} catch (error) {
		console.error("Error creating products:", error);
		}
	}

	return (
		<div>
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
			
				<ItemsTable form={form} />
			
			</form>
		</Form>
		</div>
	);
}



function imageToBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve((reader.result as string).split(",")[1]); // strip prefix
		reader.onerror = reject;
	});
}
