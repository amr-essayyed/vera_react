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

export default function MasterOrderCreatePage() {
	const { mutateAsync: mutatemasterOrder } = useCreateResource("masterOrder");
	const { mutateAsync: mutatemasterOrderLine } = useCreateMultipleResources("masterOrderLine");
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");
    
	// use query: getAll clients and vendors
	const { data: clients, isLoading: isClientsLoading } = useAllResource("client");
	const { data: vendors, isLoading: isVendorsLoading } = useAllResource("vendor");

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
		try {
            //! search for a product of line.name
            // var productToOtder =[];
            // Process all order lines and convert images to base64
			const productsToCreate = await Promise.all(
				values.order_line
                    // .filter((line)=> clients.find((c)=>c.name === line.name))
                    .map(async (line) => {

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

			console.log("clientId", values.client_id);
			console.log("vendorId", values.vendor_id);
			console.log("workflowType", values.workflow_type);
			console.log("commissionRate", values.commission_rate);
			console.log("dateExpected", values.date_expected);

			// Step 2: Create master order first (without order lines)
			const masterOrderData = {
				// name: `Master Order ${new Date().toISOString()}`,
				project_name: values.project_name,
				client_id: values.client_id,
				vendor_id: values.vendor_id,
				workflow_type: values.workflow_type,
				commission_rate: values.commission_rate,
				date_expected: values.date_expected,
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

	return (
		<div>
			<PageHeader title="Master Orders" description="Create Your Order here. You can link or related workflow and processes here." />
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
												<Button title="Create Client" type="button" onClick={()=>{}}>+</Button> {/* add functionality: open ClientCreateDialog */}
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
												<Button title="Create Vendor" type="button" onClick={()=>{}}>+</Button> {/* add functionality: open VendorCreateDialog */}
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
										<Input 
											{...field}
											type="number"
											min="0"
											max="100"
											step="0.01"
											placeholder="Enter commission rate"
											className="w-[200px]"
											onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
										/>
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
										<Input 
											{...field}
											type="date"
											className="w-[200px]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<ItemsTable form={form} />
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
