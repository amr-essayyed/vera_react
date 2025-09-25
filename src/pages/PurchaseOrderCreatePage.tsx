import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAllResource, useCreateMultipleResources, useCreateResource } from "@/hooks/useResource";
import ItemsTable from "@/components/ItemsTable";
import { purchaseOrderFormSchema, type PurchaseOrderForm } from "@/types/purchaseOrder";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PurchaseOrderCreatePage() {
	const { mutateAsync: mutatePurchaseOrder } = useCreateResource("purchaseOrder");
	const { mutateAsync: mutatePurchaseOrderLine } = useCreateMultipleResources("purchaseOrderLine");
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");

	// use query: getAll suppliers and products
	const { data: suppliers, isLoading: isSuppliersLoading, error: suppliersError } = useAllResource("supplier");
	const { data: products, isLoading: isProductsLoading, error: productsError } = useAllResource("product");

	const form = useForm<PurchaseOrderForm>({
		resolver: zodResolver(purchaseOrderFormSchema),
		defaultValues: {
			order_line: [
				{
					name: "someItem",
					product_qty: 1,
					price_unit: 1,
				},
			],
			// customColumns: [],
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: PurchaseOrderForm) {
		console.log("Form submitted with values:", values);
		console.log("Products data:", products);
		console.log("Products loading:", isProductsLoading);

		// Check if any data is still loading
		if (isProductsLoading || isSuppliersLoading) {
			console.error("Data is still loading, please wait...");
			alert("Please wait for all data to load before submitting the form.");
			return;
		}

		// Check if required data failed to load
		if (!products || !suppliers) {
			console.error("Required data failed to load:", { products: !!products, suppliers: !!suppliers });
			alert("Some required data failed to load. Please refresh the page and try again.");
			return;
		}

		try {
			// Process all order lines and convert images to base64
			const newProducts = values.order_line.filter((product) => !products?.some((p: any) => p.name === product.name));
			console.log("newProducts:", newProducts);

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

			console.log("Creating products:", productsToCreate);

			// Step 1: Create all products first
			const createdProducts = await mutateProduct(productsToCreate);
			console.log(`Successfully created ${productsToCreate.length} products!`, createdProducts);

			// Step 2: Create purchase order first (without order lines)
			const purchaseOrderData = {
				partner_id: parseInt(values.partner_id),
				partner_ref: values.partner_ref,
				date_order: values.date_order,
				notes: values.notes,
				order_line: values.order_line.map((line) => line.id),
			};

			console.log("Creating purchase order:", purchaseOrderData);
			const createdPurchaseOrder = await mutatePurchaseOrder(purchaseOrderData);
			console.log("Successfully created purchase order!", createdPurchaseOrder);

			// Extract the ID from the response - it might be just the number or in a different property
			const purchaseOrderId = createdPurchaseOrder.id || createdPurchaseOrder || (typeof createdPurchaseOrder === "number" ? createdPurchaseOrder : null);
			console.log("Purchase order ID:", purchaseOrderId);

			if (!purchaseOrderId) {
				throw new Error("Failed to get purchase order ID from response");
			}

			// Step 3: Create purchase order lines with purchase order and product references
			const purchaseOrderLinesToCreate = values.order_line.map((line, index) => ({
				order_id: purchaseOrderId, // Reference to purchase order
				product_id: createdProducts[index]?.id, // Reference to created product
				product_qty: line.product_qty, // Using product_qty field
				price_unit: line.price_unit,
				name: line.name,
			}));

			console.log("Purchase order lines to create:", JSON.stringify(purchaseOrderLinesToCreate, null, 2));

			console.log("Creating purchase order lines:", purchaseOrderLinesToCreate);
			const createdPurchaseOrderLines = await mutatePurchaseOrderLine(purchaseOrderLinesToCreate);
			console.log("Successfully created purchase order lines!", createdPurchaseOrderLines);
		} catch (error) {
			console.error("Error in purchase order creation process:", error);
		}
	}

	// Debug logging (can be removed in production)
	console.log("Data loading status - Products:", !!products, "Suppliers:", !!suppliers);

	return (
		<div>
			<PageHeader title="Purchase Orders" description="Create Your Purchase Order here. You can manage supplier orders and procurement processes." />
			{productsError && (
				<div className="max-w-6xl mx-auto px-4 py-2">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						<strong>Error loading products:</strong> {productsError.message}
					</div>
				</div>
			)}
			{suppliersError && (
				<div className="max-w-6xl mx-auto px-4 py-2">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						<strong>Error loading suppliers:</strong> {suppliersError.message}
					</div>
				</div>
			)}
			{(isProductsLoading || isSuppliersLoading) && (
				<div className="max-w-6xl mx-auto px-4 py-2">
					<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
						Loading data...
						{isProductsLoading && " Products"}
						{isSuppliersLoading && " Suppliers"}
						{" - Please wait before submitting the form."}
					</div>
				</div>
			)}
			<div className="max-w-6xl mx-auto px-4 py-4">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<div className="flex flex-col gap-1">
							<FormField
								control={form.control}
								name={"partner_id"}
								render={({ field }) => (
									<FormItem className="w-fit">
										<FormLabel>Supplier</FormLabel>
										<div className="flex gap-1">
											<FormControl>
												<Select onValueChange={field.onChange} value={field.value || ""}>
													<SelectTrigger className="w-[300px]">
														<SelectValue placeholder="Select Supplier" />
													</SelectTrigger>
													<SelectContent>
														{!isSuppliersLoading &&
															suppliers?.map((supplier: any) => (
																<SelectItem key={supplier.id} value={String(supplier.id)}>
																	{supplier.name}
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</FormControl>
											<Button title="Create Supplier" type="button" onClick={() => {}}>
												+
											</Button>{" "}
											{/* add functionality: open SupplierCreateDialog */}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name={"partner_ref"}
							render={({ field }) => (
								<FormItem className="w-fit">
									<FormLabel>Supplier Reference</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter supplier reference" className="w-[300px]" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"date_order"}
							render={({ field }) => (
								<FormItem className="w-fit">
									<FormLabel>Order Date</FormLabel>
									<FormControl>
										<Input {...field} type="date" className="w-[200px]" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"notes"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea {...field} placeholder="Enter any notes or terms..." className="w-full max-w-2xl" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<ItemsTable form={form} isLoading={isProductsLoading || isSuppliersLoading} />
					</form>
				</Form>
			</div>
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
