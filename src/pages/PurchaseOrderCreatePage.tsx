import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAllResource, useCreateMultipleResources, useCreateResource, useUpdateManyResource, useUpdateResource, /* useCreateResourceWithChild */ } from "@/hooks/useResource";
import ItemsTable from "@/components/ItemsTable";
import { purchaseOrderFormSchema, type tOrderLineCreate, type tPurchaseOrder, type tPurchaseOrderForm } from "@/types/purchaseOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SupplierCreateDialog from "@/components/SupplierCreateDialog";
import { toast } from "sonner";
import AppSelectFormField from "@/components/AppSelectFormField";
import AppInputFormField from "@/components/AppInputFormField";
// import type z from "zod";
import { normalizeDateFields } from "@/utils/dateUtils";
import { useProducts } from "@/hooks/useOrderLines";
import type { IdRef } from "@/types/odooSchemas";
import ButtonPanel from "@/components/ButtonPanel";
import { useQuery } from "@tanstack/react-query";
import { ResourceService } from "@/services/resourceService";
// import type { many2oneSchema } from "@/types/odooSchemas";

export default function PurchaseOrderCreatePage() {
	const navigate = useNavigate();
    const {id} = useParams()
	const [isSubmitting, setIsSubmitting] = useState(false);
    // const [isOrder, setIsOrder] = useState(false);
    var isOrder = id ? true : false;
    var orderId: IdRef = parseInt(id||'') || null;
    // const [orderId, setOrderId] = useState<IdRef>(parseInt(id||'') || null);

	const { mutateAsync: createPurchaseOrder } = useCreateResource("purchaseOrder");
    const {mutateAsync: updatePurchaseOrder} = useUpdateResource("purchaseOrder");
	const { mutateAsync: createPurchaseOrderLine } = useCreateMultipleResources("purchaseOrderLine");
	const { mutateAsync: updatePurchaseOrderLines } = useUpdateManyResource("purchaseOrderLine");
	// const { mutateAsync: mutatePurchaseOrder } = useCreateResourceWithChild("purchaseOrder","order_line");

	const { data: products, isLoading: isProductsLoading, error: productsError } = useAllResource("product");
	const contactState = useAllResource("contact" /* , [["customer_rank", ">", 0]] */);
	const currencyState = useAllResource("currency");
	const userState = useAllResource("user");
	// const { data: companies, isLoading: isCompaniesLoading, error: companiesError } = useAllResource("company");
	// const { data: pickingTypes, isLoading: isPickingTypesLoading, error: pickingTypesError } = useAllResource("pickingType");
	// const { data: paymentTerms, isLoading: isPaymentTermsLoading, error: paymentTermsError } = useAllResource("paymentTerm");
	// const { data: fiscalPositions, isLoading: isFiscalPositionsLoading, error: fiscalPositionsError } = useAllResource("fiscalPosition");
	// const { data: incoterms, isLoading: isIncotermsLoading, error: incotermsError } = useAllResource("incoterm");

    const {data:PO} = useQuery<unknown,Error,tPurchaseOrder>({
        queryKey: ["purchaseOrder", orderId],
        queryFn: () => ResourceService.getById("purchaseOrder", orderId),
        enabled: !!orderId, // Only run the query if orderId is not null
    })
    
    const {createProducts} = useProducts();

	const form = useForm({
		resolver: zodResolver(purchaseOrderFormSchema),
		defaultValues: {
			state: "draft",
			order_status: "pending",
            order_line: []
		},
	});

    useEffect(() => {
        form.reset(PO); // user has { id, name, email }
    }, [PO, form.reset]);

	// Submit handler
	const onFormSubmit = async (formData: tPurchaseOrderForm) => {
        console.log("PO Form values:", formData);

        setIsSubmitting(true);
        try {
            const lines = await createProducts(formData.order_line, products);
            const {order_line, ...purchaseOrderCreate} = formData

            const purchaseOrderData = normalizeDateFields(purchaseOrderCreate);
            // if (!isOrder){
            //* Create PO
            console.log("[purchaseOrderData]: ", purchaseOrderData);
            var createdPurchaseOrder = await createPurchaseOrder(purchaseOrderData);
            console.log("[createdPurchaseOrder]: ", createdPurchaseOrder);
            
            orderId = createdPurchaseOrder // setOrderId(createdPurchaseOrder);
            console.log("[orderId]", orderId);
            
            //* Create PO Lines
            const purchaseOrderLineData = lines.map((line: tOrderLineCreate) => {
                return {...line, order_id: createdPurchaseOrder};
            });
            await createPurchaseOrderLine(purchaseOrderLineData);
            
            // }
            // else if (isOrder) {
            //     const updatedPurchaseOrder = await updatePurchaseOrder({id: orderId, resourceInstance: purchaseOrderData});
            //     const purchaseOrderLineData = lines.map((line: tOrderLineCreate) => {
            //         return {...line, order_id: orderId};
            //     });
                
            //     await updatePurchaseOrderLine(purchaseOrderLineData);
            // }

            navigate(`/purchase-orders/${createdPurchaseOrder}`);

            // Extract the ID from the response - it might be just the number or in a different property
            // const purchaseOrderId = createdPurchaseOrder.id || createdPurchaseOrder || (typeof createdPurchaseOrder === "number" ? createdPurchaseOrder : null);

            // if (!purchaseOrderId) {
            //     throw new Error("Failed to get purchase order ID from response");
            // }
        } catch (error) {
            toast.error("Failed to save form. Please try again.");
            console.error("error: ", error);
        } finally {
            setIsSubmitting(false);
            isOrder = true//setIsOrder(true);
            toast.success("Purchase order created successfully!");

        }
        // purchaseOrderIdGlobal = purchaseOrderId;
	};

    const onFormSave = async (formData: tPurchaseOrderForm) => {
        console.log("FormData: ", formData);

        setIsSubmitting(true);
        try {
            console.log("[on edit]");
            
            // const lines = await createProducts(formData.order_line, products);
            // const {order_line, ...purchaseOrderCreate} = formData

            // const purchaseOrderData = normalizeDateFields(purchaseOrderCreate);
            //* Update PO
            // console.log("[purchaseOrderData]: ", purchaseOrderData);
            // await updatePurchaseOrder({id: orderId, resourceInstance: purchaseOrderData});            
            // console.log("[orderId]", orderId);
            
            //* Update PO Lines
            // const purchaseOrderLineData = lines.map( (line: tOrderLineCreate) => ({...line, order_id: orderId}) );
            // await updatePurchaseOrderLines({ids:PO?.order_line, resourceInstances: purchaseOrderLineData});

        } catch (error) {
            toast.error("Failed to save form. Please try again.");
            console.error("[Submit Error]: ", error);
        } finally {
            setIsSubmitting(false);
            toast.success("Purchase order Updated successfully!");

        }
        // purchaseOrderIdGlobal = purchaseOrderId;

        
    }

    const onSubmit = isOrder? onFormSave: onFormSubmit;

    // async function handleSaveForms() {
    //     console.log('handle Save forms');
        
    //     try {
    //         const isPurchaseOrderValid = await purchaseOrderForm.trigger();
    //         const isPurchaseOrderLineValid = await purchaseOrderLineForm.trigger();
            
    //         if (!isPurchaseOrderValid || !isPurchaseOrderLineValid) {
    //             toast.error("Fix fields before submitting")
    //             throw new Error("Validation Erro");
    //         }

    //         // Trigger form submission for both forms
    //         await purchaseOrderForm.handleSubmit(onPurchaseOrderFormSubmit)();
    //         await purchaseOrderLineForm.handleSubmit((values) => onOrderLineFormSubmit(values, purchaseOrderIdGlobal, products))();

    //         toast.success("Purchase order created successfully!");
    //         navigate("/purchase-orders");
    //     } catch (error) {
    //         toast.error("Failed to save forms. Please try again.");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // }

	const isLoading = isProductsLoading || contactState.isLoading //|| isCompaniesLoading || isUsersLoading || isCurrenciesLoading || isPickingTypesLoading || isPaymentTermsLoading || isFiscalPositionsLoading || isIncotermsLoading;
	const hasErrors = productsError || contactState.error //|| currenciesError //|| companiesError || usersError || pickingTypesError || paymentTermsError || fiscalPositionsError || incotermsError;

	// Handle supplier creation
	const handleSupplierCreated = (newSupplier: any) => {
		// Refresh suppliers data would be ideal, but for now we can set the form value
		const supplierId = newSupplier.id || newSupplier;
		form.setValue("partner_id", supplierId);
		console.log("New supplier created:", newSupplier);
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-black">
			{/* Header */}
			<div className="bg-white dark:bg-gray-900 border-b">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link to="/purchase-orders"><Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />Back to Purchase Orders
                            </Button></Link>
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
				{/* debuging only */}
                {hasErrors && (
					<Alert className="mb-4" variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{productsError && `Error loading products: ${productsError.message}. `}
							{contactState.error && `Error loading contacts: ${contactState.error.message}. `}
							{/* {companiesError && `Error loading companies: ${companiesError.message}. `} */}
							{userState.error && `Error loading users: ${userState.error.message}. `}
							{currencyState.error && `Error loading currencies: ${currencyState.error.message}. `}
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

            <div className="max-w-6xl mx-auto px-4 pb-6">
                <ButtonPanel
                    orderId={orderId} />
            </div>

			{/* Form */}
			<div className="max-w-6xl mx-auto px-4 pb-6">
				<Form {...form}>
					{/* Field Information Alert */}

					<form 
                        onSubmit={form.handleSubmit(onSubmit)} 
                        className="space-y-6"
                    >
						{/* Order Information */}
						<Card>
							<CardHeader>
								<CardTitle>Order Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AppSelectFormField 
                                        formControl={form.control}
                                        name="partner_id"
                                        label="supplier"
                                        resourceState={contactState}
                                        createNew={<SupplierCreateDialog onSupplierCreated={handleSupplierCreated} />}
                                    />
									<AppSelectFormField
                                        formControl={form.control}
                                        name="customer_id"
                                        label="customer"
                                        resourceState={contactState}
                                    />
                                    {/* <AppSelectFormField
                                        formControl={purchaseOrderForm.control}
                                        name="company_id"
                                        label="Company"
                                        resourceState={companyState}
                                    />
                                    <AppSelectFormField
                                        formControl={purchaseOrderForm.control}
                                        name="user_id"
                                        label="Responsible User"
                                        resourceState={userState}
                                    />
                                    */}

                                    {/* Depects the date within which the Quotoation should be confirmed and covnerted to a purchase order */}
                                    {/* <AppInputFormField
                                        formControl={form.control}
                                        name="date_order"
                                        label="Order Deadline"
                                        type='date'
                                    /> */}
                                    <AppInputFormField
                                        formControl={form.control}
                                        name="date_planned"
                                        label="Expected Delivery Date"
                                        type="datetime-local"
                                    />
								
                                    <AppInputFormField
                                        formControl={form.control}
                                        name="partner_ref"
                                        label="Supplier Reference"
                                        type="text"  
                                    />
                                    <AppSelectFormField
                                        formControl={form.control}
                                        name="currency_id"
                                        label="Currency"
                                        resourceState={currencyState}
                                    />
                                    {/* <AppSelectFormField
                                        formControl={form.control}
                                        name="picking_type_id"
                                        label="Picking Type"
                                        resourceState={pickingTypeState}
                                    /> */}
                                    {/* <AppSelectFormField
                                        formControl={form.control}
                                        name="payment_term_id"
                                        label="Payment Terms"
                                        resourceState={paymentTermState}
                                    /> */}
                                    {/* <AppSelectFormField
                                        formControl={form.control}
                                        name="fiscal_position_id"
                                        label="Fiscal Position"
                                        resourceState={fiscalPositionState}
                                    /> */}
                                    {/* <AppSelectFormField
                                        formControl={form.control}
                                        name="incoterm_id"
                                        label="Incoterms"
                                        resourceState={incotermState}
                                    /> */}
                                        <AppSelectFormField
                                            formControl={form.control}
                                            name="order_status"
                                            label="Order Status"
                                            options={[
                                                ["pending", "Pending"],
                                                ["processing", "Processing"],
                                                ["shipped", "Shipped"],
                                                ["delivered", "Delivered"],
                                            ]}
                                        />
                                        <AppSelectFormField
                                            formControl={form.control}
                                            name="invoice_status"
                                            label="Invoice Status"
                                            options={[
                                                ["no", "Nothing to Invoice"], 
                                                ["to invoice", "To Invoice"], 
                                                ["invoiced", "Fully Invoiced"]
                                            ]}
                                        />
                                    </div>

                                    <br />
                                    <CardTitle>Order Items (Optional)</CardTitle>
                                    <div>
                                        <ItemsTable form={form} isLoading={isLoading} />

                                        {/* Order Summary */}
                                        {/* <div className="mt-6 pt-4 border-t">
                                            <div className="flex justify-end">
                                                <div className="w-64 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Subtotal:</span>
                                                        <span className="font-medium">
                                                            $
                                                            {purchaseOrderLineForm.watch("order_line")
                                                                ?.reduce((total, line) => total + (line.product_qty || 0) * (line.price_unit || 0), 0)
                                                                .toFixed(2) || "0.00"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-base font-semibold border-t pt-2">
                                                        <span>Total:</span>
                                                        <span>
                                                            $
                                                            {purchaseOrderLineForm
                                                                .watch("order_line")
                                                                ?.reduce((total, line) => total + (line.product_qty || 0) * (line.price_unit || 0), 0)
                                                                .toFixed(2) || "0.00"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
							</CardContent>
						</Card>

						{/* Actions */}
						<div className="flex justify-end space-x-4">
                            <Link to="/purchase-orders">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                // onClick={handleSaveForms}
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
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
					</form>
				</Form>
                
                {/* <Form {...purchaseOrderLineForm}>
                    <form className="space-y-6">
                        						order Lines here
						<Card>
							<CardHeader>
								<CardTitle>Order Items (Optional)</CardTitle>
								<p className="text-sm text-gray-500 mt-1">Add items to your purchase order. You can paste data from spreadsheets (Ctrl+V) or add items manually. Leave empty to create a purchase order without specific items.</p>
							</CardHeader>
							<CardContent>
								
							</CardContent>
						</Card>
                    </form>
                </Form> */}

                {/* Actions master */}
                
			</div>
		</div>
	);
}