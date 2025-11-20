import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAllResource, useCreateMultipleResources, useCreateResource, useResourceByProp } from "@/hooks/useResource";
import ItemsTable from "@/components/ItemsTable";
import { masterOrderFormSchema, type tMasterOrderForm, workflowTypeOptions } from "@/types/masterOrder";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function __MasterOrderCreatePage() {
	const { mutateAsync: mutatemasterOrder } = useCreateResource("masterOrder");
	const { mutateAsync: mutatemasterOrderLine } = useCreateMultipleResources("masterOrderLine");
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");

	// use query: getAll clients and vendors
	const { data: clients, isLoading: isClientsLoading, error: clientsError } = useAllResource("client");
	const { data: vendors, isLoading: isVendorsLoading, error: vendorsError } = useAllResource("vendor");
	const { data: products, isLoading: isProductsLoading, error: productsError } = useAllResource("product");

	const form = useForm<tMasterOrderForm>({
		resolver: zodResolver(masterOrderFormSchema),
		defaultValues: {
			order_line: [
				{
					name: "someItem",
					quantity: 1,
					price_unit: 1,
				},
			],
			// customColumns: [],
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: tMasterOrderForm) {
		console.log("Form submitted with values:", values);
		console.log("Products data:", products);
		console.log("Products loading:", isProductsLoading);

		// Check if any data is still loading
		if (isProductsLoading || isClientsLoading || isVendorsLoading) {
			console.error("Data is still loading, please wait...");
			alert("Please wait for all data to load before submitting the form.");
			return;
		}

		// Check if required data failed to load
		if (!products || !clients || !vendors) {
			console.error("Required data failed to load:", { products: !!products, clients: !!clients, vendors: !!vendors });
			alert("Some required data failed to load. Please refresh the page and try again.");
			return;
		}

		try {
			//! search for a product of line.name
			// var productToOtder =[];
			// Process all order lines and convert images to base64

			const newProducts = values.order_line.filter((product) => !products?.some((p: any) => p.name === product.name));
			console.log("newProducts:", newProducts);

			const productsToCreate = await Promise.all(
				// values.order_line
				// .filter((line)=> clients.find((c)=>c.name === line.name))
				newProducts.map(async (line) => {
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

			// Step 1: Create all products first
			const createdProducts = await mutateProduct(productsToCreate);
			console.log(`Successfully created ${productsToCreate.length} products!`, createdProducts);

			// Step 2: Create master order first (without order lines)
			const masterOrderData = {
				// name: `Master Order ${new Date().toISOString()}`,
				project_name: values.project_name,
				client_id: values.client_id,
				vendor_id: values.vendor_id,
				workflow_type: values.workflow_type,
				commission_rate: values.commission_rate,
				date_expected: values.date_expected,
				line_ids: values.order_line.map((line) => line.id),
			};

			console.log("Creating master order:", masterOrderData);
			const createdMasterOrder = await mutatemasterOrder(masterOrderData);
			console.log("Successfully created master order!", createdMasterOrder);

			// Extract the ID from the response - it might be just the number or in a different property
			const masterOrderId = createdMasterOrder.id || createdMasterOrder || (typeof createdMasterOrder === "number" ? createdMasterOrder : null);
			console.log("Master order ID:", masterOrderId);

			if (!masterOrderId) {
				throw new Error("Failed to get master order ID from response");
			}

			// Step 3: Create master order lines with master order and product references
			const masterOrderLinesToCreate = values.order_line.map((line, index) => ({
				master_id: masterOrderId, // Use the extracted ID with original field name
				product_id: createdProducts[index]?.id, // Reference to created product
				quantity: line.quantity, // Using quantity field
				price_unit: line.price_unit,
				name: line.name,
			}));

			console.log("Master order lines to create:", JSON.stringify(masterOrderLinesToCreate, null, 2));

			console.log("Creating master order lines:", masterOrderLinesToCreate);
			const createdMasterOrderLines = await mutatemasterOrderLine(masterOrderLinesToCreate);
			console.log("Successfully created master order lines!", createdMasterOrderLines);
		} catch (error) {
			console.error("Error in order creation process:", error);
		}
	}

	// Debug logging (can be removed in production)
	console.log("Data loading status - Products:", !!products, "Clients:", !!clients, "Vendors:", !!vendors);

	return (
		<div>
			<PageHeader title="Master Orders" description="Create Your Order here. You can link or related workflow and processes here." />
			{productsError && (
				<div className="max-w-6xl mx-auto px-4 py-2">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						<strong>Error loading products:</strong> {productsError.message}
					</div>
				</div>
			)}
			{(isProductsLoading || isClientsLoading || isVendorsLoading) && (
				<div className="max-w-6xl mx-auto px-4 py-2">
					<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
						Loading data...
						{isProductsLoading && " Products"}
						{isClientsLoading && " Clients"}
						{isVendorsLoading && " Vendors"}
						{" - Please wait before submitting the form."}
					</div>
				</div>
			)}
			<div className="max-w-6xl mx-auto px-4 py-4">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name={"project_name"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Project Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter project name" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex gap-4">
							<div className="flex flex-col gap-1">
								<FormField
									control={form.control}
									name={"client_id"}
									render={({ field }) => (
										<FormItem className="w-fit">
											<FormLabel>Client</FormLabel>
											<div className="flex gap-1">
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""}>
														<SelectTrigger className="w-[180px]">
															<SelectValue placeholder="Select Client" />
														</SelectTrigger>
														<SelectContent>
															{!isClientsLoading &&
																clients?.map((client: any) => (
																	<SelectItem key={client.id} value={String(client.id)}>
																		{client.name}
																	</SelectItem>
																))}
														</SelectContent>
													</Select>
												</FormControl>
												<Button title="Create Client" type="button" onClick={() => {}}>
													+
												</Button>{" "}
												{/* add functionality: open ClientCreateDialog */}
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<FormField
									control={form.control}
									name={"vendor_id"}
									render={({ field }) => (
										<FormItem className="w-fit">
											<FormLabel>Vendor</FormLabel>
											<div className="flex gap-1">
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""}>
														<SelectTrigger className="w-[180px]">
															<SelectValue placeholder="Select Vendor" />
														</SelectTrigger>
														<SelectContent>
															{!isVendorsLoading &&
																vendors?.map((vendor: any) => (
																	<SelectItem key={vendor.id} value={String(vendor.id)}>
																		{vendor.name}
																	</SelectItem>
																))}
														</SelectContent>
													</Select>
												</FormControl>
												<Button title="Create Vendor" type="button" onClick={() => {}}>
													+
												</Button>{" "}
												{/* add functionality: open VendorCreateDialog */}
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<FormField
							control={form.control}
							name={"workflow_type"}
							render={({ field }) => (
								<FormItem className="w-fit">
									<FormLabel>Workflow Type</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="w-[400px]">
												<SelectValue placeholder="Select Workflow Type" />
											</SelectTrigger>
											<SelectContent>
												{workflowTypeOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"commission_rate"}
							render={({ field }) => (
								<FormItem className="w-fit">
									<FormLabel>Commission Rate (%)</FormLabel>
									<FormControl>
										<Input {...field} type="number" min="0" max="100" step="0.01" placeholder="Enter commission rate" className="w-[200px]" onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"date_expected"}
							render={({ field }) => (
								<FormItem className="w-fit">
									<FormLabel>Expected Date</FormLabel>
									<FormControl>
										<Input {...field} type="date" className="w-[200px]" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<ItemsTable form={form} isLoading={isProductsLoading || isClientsLoading || isVendorsLoading} />
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
