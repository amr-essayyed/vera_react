import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAllResource, useCreateMultipleResources, useCreateResource } from "@/hooks/useResource";
import ItemsTable from "@/components/ItemsTable";
import { many2oneSchema, purchaseOrderFormSchema, purchaseOrderLineFormSchema, type tPurchaseOrderForm, type tPurchaseOrderLineForm } from "@/types/purchaseOrder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingCart, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SupplierCreateDialog from "@/components/SupplierCreateDialog";
import { toast } from "sonner";
import AppSelectFormField from "@/components/AppSelectFormField";
import { imageToBase64 } from "@/utils/imageUtils";
import AppInputFormField from "@/components/AppInputFormField";
import type z from "zod";
import { normalizeDateFields } from "@/utils/dateUtils";

export default function PurchaseOrderCreatePage() {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { mutateAsync: mutatePurchaseOrder } = useCreateResource("purchaseOrder");
	const { mutateAsync: mutatePurchaseOrderLine } = useCreateMultipleResources("purchaseOrderLine");
	const { mutateAsync: mutateProduct } = useCreateMultipleResources("product");

	// use query: getAll suppliers and products
	// const { data: suppliers, isLoading: isSuppliersLoading, error: suppliersError } = useAllResource("contact" /* , [["supplier_rank", ">", 0]] */);
	const contactState = useAllResource("contact" /* , [["customer_rank", ">", 0]] */);
	const { data: products, isLoading: isProductsLoading, error: productsError } = useAllResource("product");

	// Additional data for form fields
	// const { data: currencies, isLoading: isCurrenciesLoading, error: currenciesError } = useAllResource("currency");
	// const { data: companies, isLoading: isCompaniesLoading, error: companiesError } = useAllResource("company");
	// const { data: users, isLoading: isUsersLoading, error: usersError } = useAllResource("user");
	// const { data: pickingTypes, isLoading: isPickingTypesLoading, error: pickingTypesError } = useAllResource("pickingType");
	// const { data: paymentTerms, isLoading: isPaymentTermsLoading, error: paymentTermsError } = useAllResource("paymentTerm");
	// const { data: fiscalPositions, isLoading: isFiscalPositionsLoading, error: fiscalPositionsError } = useAllResource("fiscalPosition");
	// const { data: incoterms, isLoading: isIncotermsLoading, error: incotermsError } = useAllResource("incoterm");

	const purchaseOrderForm = useForm({
		resolver: zodResolver(purchaseOrderFormSchema),
		defaultValues: {
			state: "draft",
			order_status: "pending",
		},
	});

	const purchaseOrderLineForm = useForm({
		resolver: zodResolver(purchaseOrderLineFormSchema)
	});

    var purchaseOrderIdGlobal: z.infer<typeof many2oneSchema>;
	// Submit handler
	const onPurchaseOrderFormSubmit = async (values: tPurchaseOrderForm) => {
        console.log("PO Form values:", values);

        setIsSubmitting(true);

        const purchaseOrderData = normalizeDateFields(values);
        // Create PO
        const createdPurchaseOrder = await mutatePurchaseOrder(purchaseOrderData);
        // Extract the ID from the response - it might be just the number or in a different property
        const purchaseOrderId = createdPurchaseOrder.id || createdPurchaseOrder || (typeof createdPurchaseOrder === "number" ? createdPurchaseOrder : null);

        if (!purchaseOrderId) {
            throw new Error("Failed to get purchase order ID from response");
        }
        purchaseOrderIdGlobal = purchaseOrderId;
	};

    async function onPurchaseOrderLineFormSubmit(values: tPurchaseOrderLineForm, purchaseOrderId: z.infer<typeof many2oneSchema>) {
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
            order_id: purchaseOrderId, // Reference to purchase order
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

    async function handleSaveForms() {
        console.log('handle Save forms');
        
        try {
            const isPurchaseOrderValid = await purchaseOrderForm.trigger();
            const isPurchaseOrderLineValid = await purchaseOrderLineForm.trigger();
            
            if (!isPurchaseOrderValid || !isPurchaseOrderLineValid) {
                toast.error("Fix fields before submitting")
                throw new Error("Validation Erro");
            }

            // Trigger form submission for both forms
            await purchaseOrderForm.handleSubmit(onPurchaseOrderFormSubmit)();
            await purchaseOrderLineForm.handleSubmit((values) => onPurchaseOrderLineFormSubmit(values, purchaseOrderIdGlobal))();

            toast.success("Purchase order created successfully!");
            navigate("/purchase-orders");
        } catch (error) {
            toast.error("Failed to save forms. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

	const isLoading = isProductsLoading || contactState.isLoading //|| isCompaniesLoading || isUsersLoading || isCurrenciesLoading || isProjectsLoading || isPickingTypesLoading || isPaymentTermsLoading || isFiscalPositionsLoading || isIncotermsLoading;
	const hasErrors = productsError || contactState.error //|| currenciesError //|| companiesError || usersError || projectsError || pickingTypesError || paymentTermsError || fiscalPositionsError || incotermsError;

	// Handle supplier creation
	const handleSupplierCreated = (newSupplier: any) => {
		// Refresh suppliers data would be ideal, but for now we can set the form value
		const supplierId = newSupplier.id || newSupplier;
		purchaseOrderForm.setValue("partner_id", supplierId);
		console.log("New supplier created:", newSupplier);
	};

	// Check if form has been modified
	const POformValues = purchaseOrderForm.watch();
	const POLineformValues = purchaseOrderLineForm.watch();
	const hasUnsavedChanges =
		POformValues.partner_id ||
		// || formValues.partner_ref
		POformValues.notes ||
		(POLineformValues.order_lines || []).some((line) => line.name || (line.product_qty || 0) > 1 || (line.price_unit || 0) > 0);

	// Warn before leaving if there are unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges && !isSubmitting) {
				e.preventDefault();
				// Modern browsers ignore the returnValue, but we set it for compatibility
				return (e.returnValue = "You have unsaved changes. Are you sure you want to leave?");
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges, isSubmitting]);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-black">
			{/* Header */}
			<div className="bg-white dark:bg-gray-900 border-b">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link to="/purchase-orders">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Purchase Orders
								</Button>
							</Link>
							<div className="flex items-center space-x-3">
								<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
									<ShoppingCart className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Purchase Order</h1>
									<p className="text-sm text-gray-500">Create a new purchase order for your supplier</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Error and Loading States */}
			<div className="max-w-6xl mx-auto px-4 py-4">
				{hasErrors && (
					<Alert className="mb-4" variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{productsError && `Error loading products: ${productsError.message}. `}
							{contactState.error && `Error loading contacts: ${contactState.error.message}. `}
							{/* {customerState.error && `Error loading customers: ${customerState.error.message}. `} */}
							{/* {companiesError && `Error loading companies: ${companiesError.message}. `} */}
							{/* {usersError && `Error loading users: ${usersError.message}. `} */}
							{/* {currenciesError && `Error loading currencies: ${currenciesError.message}. `} */}
							{/* {projectsError && `Error loading projects: ${projectsError.message}. `} */}
							{/* {pickingTypesError && `Error loading picking types: ${pickingTypesError.message}. `} */}
							{/* {paymentTermsError && `Error loading payment terms: ${paymentTermsError.message}. `} */}
							{/* {fiscalPositionsError && `Error loading fiscal positions: ${fiscalPositionsError.message}. `} */}
							{/* {incotermsError && `Error loading incoterms: ${incotermsError.message}.`} */}
						</AlertDescription>
					</Alert>
				)}

				{isLoading && (
					<Alert className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Loading data... Please wait before submitting the form.</AlertDescription>
					</Alert>
				)}
			</div>

			{/* Form */}
			<div className="max-w-6xl mx-auto px-4 pb-6">
				<Form {...purchaseOrderForm}>
					{/* Field Information Alert */}
					<Alert className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							<strong>Required:</strong> Supplier selection.
							<strong>Optional:</strong> All other fields are optional and will use system defaults if not specified.
							<strong>Auto-calculated:</strong> PO number, totals, taxes calculated by Odoo.
						</AlertDescription>
					</Alert>

					<form onSubmit={purchaseOrderForm.handleSubmit(onPurchaseOrderFormSubmit)} className="space-y-6">
						{/* Order Information */}
						<Card>
							<CardHeader>
								<CardTitle>Order Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AppSelectFormField 
                                        formControl={purchaseOrderForm.control}
                                        name="partner_id"
                                        label="supplier"
                                        resourceState={contactState}
                                        createNew={<SupplierCreateDialog onSupplierCreated={handleSupplierCreated} />}
                                    />
									<AppSelectFormField
                                        formControl={purchaseOrderForm.control}
                                        name="customer_id"
                                        label="customer"
                                        resourceState={contactState}
                                    />
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* <FormField
										control={form.control}
										name="date_order"
										render={({ field }) => (
											<FormItem>
												<Label>Order Date</Label>
												<FormControl>
													<Input {...field} type="date" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
                                    {/* Depects the date within which the Quotoation should be confirmed and covnerted to a purchase order */}
                                    {/* <AppInputFormField
                                        formControl={form.control}
                                        name="date_order"
                                        label="Order Deadline"
                                        type='date'
                                    /> */}
                                    <AppInputFormField
                                        formControl={purchaseOrderForm.control}
                                        name="date_planned"
                                        label="Expected Delivery Date"
                                        type="datetime-local"
                                    />
								</div>
								<AppInputFormField
                                    formControl={purchaseOrderForm.control}
                                    name="partner_ref"
                                    label="Supplier Reference"
                                    type="text"  
                                />
							</CardContent>
						</Card>

						{/* Business Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Business Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* <FormField
										control={form.control}
										name="company_id"
										render={({ field }) => (
											<FormItem>
												<Label>Company</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isCompaniesLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isCompaniesLoading ? "Loading companies..." : "Select Company (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="default">Default Company</SelectItem>
															{companies?.map((company: any) => (
																<SelectItem key={company.id} value={String(company.id)}>
																	{company.name}
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
										name="user_id"
										render={({ field }) => (
											<FormItem>
												<Label>Responsible User</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isUsersLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isUsersLoading ? "Loading users..." : "Select User (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="current">Current User</SelectItem>
															{users?.map((user: any) => (
																<SelectItem key={user.id} value={String(user.id)}>
																	{user.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* <FormField
										control={form.control}
										name="currency_id"
										render={({ field }) => (
											<FormItem>
												<Label>Currency</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isCurrenciesLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isCurrenciesLoading ? "Loading currencies..." : "Select Currency (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="default">Default Currency</SelectItem>
															{currencies?.map((currency: any) => (
																<SelectItem key={currency.id} value={String(currency.id)}>
																	{currency.name} ({currency.symbol || currency.name})
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
										name="project_id"
										render={({ field }) => (
											<FormItem>
												<Label>Project</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isProjectsLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isProjectsLoading ? "Loading projects..." : "Select Project (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="none">No Project</SelectItem>
															{projects?.map((project: any) => (
																<SelectItem key={project.id} value={String(project.id)}>
																	{project.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
								</div>
							</CardContent>
						</Card>

						{/* Logistics & Terms */}
						<Card>
							<CardHeader>
								<CardTitle>Logistics & Terms</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* <FormField
										control={form.control}
										name="picking_type_id"
										render={({ field }) => (
											<FormItem>
												<Label>Picking Type</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isPickingTypesLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isPickingTypesLoading ? "Loading picking types..." : "Select Picking Type (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="default">Default Picking Type</SelectItem>
															{pickingTypes?.map((pickingType: any) => (
																<SelectItem key={pickingType.id} value={String(pickingType.id)}>
																	{pickingType.name}
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
										name="payment_term_id"
										render={({ field }) => (
											<FormItem>
												<Label>Payment Terms</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isPaymentTermsLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isPaymentTermsLoading ? "Loading payment terms..." : "Select Payment Terms (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="default">Default Payment Terms</SelectItem>
															{paymentTerms?.map((paymentTerm: any) => (
																<SelectItem key={paymentTerm.id} value={String(paymentTerm.id)}>
																	{paymentTerm.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* <FormField
										control={form.control}
										name="fiscal_position_id"
										render={({ field }) => (
											<FormItem>
												<Label>Fiscal Position</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isFiscalPositionsLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isFiscalPositionsLoading ? "Loading fiscal positions..." : "Select Fiscal Position (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="default">Default Fiscal Position</SelectItem>
															{fiscalPositions?.map((fiscalPosition: any) => (
																<SelectItem key={fiscalPosition.id} value={String(fiscalPosition.id)}>
																	{fiscalPosition.name}
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
										name="incoterm_id"
										render={({ field }) => (
											<FormItem>
												<Label>Incoterm</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""} disabled={isIncotermsLoading}>
														<SelectTrigger>
															<SelectValue placeholder={isIncotermsLoading ? "Loading incoterms..." : "Select Incoterm (Optional)"} />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="none">No Incoterm</SelectItem>
															{incoterms?.map((incoterm: any) => (
																<SelectItem key={incoterm.id} value={String(incoterm.id)}>
																	{incoterm.name} - {incoterm.code}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
								</div>
							</CardContent>
						</Card>

						{/* Status Fields */}
						<Card>
							<CardHeader>
								<CardTitle>Status Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={purchaseOrderForm.control}
										name="order_status"
										render={({ field }) => (
											<FormItem>
												<Label>Order Status</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""}>
														<SelectTrigger>
															<SelectValue placeholder="Select Order Status (Optional)" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="pending">pending</SelectItem>
															<SelectItem value="processing">processing</SelectItem>
															<SelectItem value="shipped">shipped</SelectItem>
															<SelectItem value="delivered">delivered</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									{/* <FormField
										control={form.control}
										name="shipping_status"
										render={({ field }) => (
											<FormItem>
												<Label>Shipping Status</Label>
												<FormControl>
													<Input {...field} placeholder="Shipping status (optional)" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="payment_status"
										render={({ field }) => (
											<FormItem>
												<Label>Payment Status</Label>
												<FormControl>
													<Input {...field} placeholder="Payment status (optional)" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* <FormField
										control={form.control}
										name="invoice_status"
										render={({ field }) => (
											<FormItem>
												<Label>Invoice Status</Label>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value || ""}>
														<SelectTrigger>
															<SelectValue placeholder="Select Invoice Status (Optional)" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="default">Default</SelectItem>
															<SelectItem value="no">Nothing to Invoice</SelectItem>
															<SelectItem value="to invoice">To Invoice</SelectItem>
															<SelectItem value="invoiced">Fully Invoiced</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="date_approve"
										render={({ field }) => (
											<FormItem>
												<Label>Approval Date</Label>
												<FormControl>
													<Input {...field} type="date" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/> */}
								</div>
							</CardContent>
						</Card>

						{/* Additional Information */}
						<Card>
							<CardHeader>
								<CardTitle>Additional Information</CardTitle>
							</CardHeader>
							<CardContent>
								<FormField
									control={purchaseOrderForm.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<Label>Notes & Terms</Label>
											<FormControl>
												<Textarea {...field} placeholder="Enter any notes, terms, or special instructions..." rows={4} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Actions */}
						{/*  */}
					</form>
				</Form>
                <Form {...purchaseOrderLineForm}>
                    <form className="space-y-6">
                        						{/* Order Lines */}
						<Card>
							<CardHeader>
								<CardTitle>Order Items (Optional)</CardTitle>
								<p className="text-sm text-gray-500 mt-1">Add items to your purchase order. You can paste data from spreadsheets (Ctrl+V) or add items manually. Leave empty to create a purchase order without specific items.</p>
							</CardHeader>
							<CardContent>
								<ItemsTable form={purchaseOrderLineForm} isLoading={isLoading} />

								{/* Order Summary */}
								<div className="mt-6 pt-4 border-t">
									<div className="flex justify-end">
										<div className="w-64 space-y-2">
											<div className="flex justify-between text-sm">
												<span>Subtotal:</span>
												<span className="font-medium">
													$
													{purchaseOrderLineForm.watch("order_lines")
														?.reduce((total, line) => total + (line.product_qty || 0) * (line.price_unit || 0), 0)
														.toFixed(2) || "0.00"}
												</span>
											</div>
											<div className="flex justify-between text-base font-semibold border-t pt-2">
												<span>Total:</span>
												<span>
													$
													{purchaseOrderLineForm
														.watch("order_lines")
														?.reduce((total, line) => total + (line.product_qty || 0) * (line.price_unit || 0), 0)
														.toFixed(2) || "0.00"}
												</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
                    </form>
                </Form>
                {/* Actions master */}
                <div className="flex justify-end space-x-4">
                    <Link to="/purchase-orders">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button 
                        // type="submit" 
                        onClick={handleSaveForms}
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Purchase Order
                            </>
                        )}
                    </Button>
                </div>
			</div>
		</div>
	);
}