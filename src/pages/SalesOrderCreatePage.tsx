import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAllResource } from "@/hooks/useResource";
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form"
import { SaleOrderLineFormSchema, type SalesOrderLineForm } from "@/types/salesOrder";
import { useEffect } from "react";
import OdooSelectField from "@/components/odooSelectedFeild";

const SalesOrderCreatePage = () => {

    const form = useForm<SalesOrderLineForm>({
        resolver: zodResolver(SaleOrderLineFormSchema),
        defaultValues: {
            partner_id: "",
            partner_invoice_id: "",
            partner_shipping_id: "",
        }
    });

    const selectedPartnerId = form.watch("partner_id");
    const { data: accountPaymentTerm, isLoading: isAcountPaymentTermLoading, error: accountPaymentTermError } = useAllResource("accountPaymentTerm");
    const { data: mainCustomers, isLoading: isMainCustomersLoading, error: mainCustomersError } = useAllResource("contact", [
        ["is_company", "=", true], ["customer_rank", ">", 0]
    ]);

    console.log(mainCustomers, "mainCustomers");

    // Convert selectedPartnerId to number for the API call
    const partnerIdNumber = selectedPartnerId ? Number(selectedPartnerId) : null;
    const { data: subAddress, isLoading: isAddressLoading } = useAllResource("contact", [["parent_id", "=", partnerIdNumber]]
    );


    const rawAvailableAddresses = [
        ...(mainCustomers?.filter((c: any) => c.id === Number(selectedPartnerId)) || []), // Selected Main Customer
        ...(subAddress || []) // All Sub-Addresses
    ];

    const uniqueAddressesMap = new Map();
    rawAvailableAddresses.forEach((addr: any) => {
        // This ensures only the first occurrence of an ID is kept
        if (addr && addr.id) {
            uniqueAddressesMap.set(addr.id, addr);
        }
    });

    const allAvailableAddresses = Array.from(uniqueAddressesMap.values());
    // console.log(allAvailableAddresses);  
    console.log(form.watch(), "");






    return (
        <div>
            <PageHeader
                title="Sales Orders"
                description="Create your Sales Order here"
            />
            {
                accountPaymentTermError && (<div className="max-w-6xl mx-auto px-4 py-2">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Error loading products:</strong> {accountPaymentTermError.message}
                    </div>
                </div>)
            }
            {isAcountPaymentTermLoading && (
                <div className="max-w-6xl mx-auto px-4 py-2">
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                        Loading data...
                        {isAcountPaymentTermLoading && " Sales Orders "}
                        {" - Please wait before submitting the form."}
                    </div>
                </div>

            )}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <Form {...form}>
                    <FormField
                        name="partner_id"
                        control={form.control}
                        render={({ field }) => (

                            < FormItem className="w-fit">
                                <FormLabel>Customers</FormLabel>
                                <div className="flex gap-1">
                                    <FormControl>

                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isMainCustomersLoading}
                                        >
                                            <SelectTrigger className="w-[300px]">
                                                <SelectValue
                                                    placeholder={
                                                        isMainCustomersLoading
                                                            ? "Loading customers..."
                                                            : "Select Customer"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {!isMainCustomersLoading &&
                                                    mainCustomers?.map((contact: any) => (
                                                        <SelectItem value={String(contact.id)} key={contact.id}>
                                                            {contact.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <Button type="button" onClick={() => { }}>
                                        +
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    <FormField
                        name="partner_invoice_id"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Address *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    // Disable if no customer is selected
                                    disabled={!selectedPartnerId || isAddressLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isAddressLoading ? "Loading Addresses..." : "Select Invoice Address"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Show main customer + sub-addresses */}
                                        {allAvailableAddresses.map((addr: any) => (
                                            <SelectItem key={addr.id} value={String(addr.id)}>
                                                {addr.name} ({addr.type === 'contact' ? 'Main' : addr.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* --- 3. Delivery Address (partner_shipping_id) --- */}
                    <FormField
                        name="partnerShipping_id"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Delivery Address *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!selectedPartnerId || isAddressLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isAddressLoading ? "Loading Addresses..." : "Select Delivery Address"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {/* Show main customer + sub-addresses */}
                                        {allAvailableAddresses.map((addr: any) => (
                                            <SelectItem key={addr.id} value={String(addr.id)}>
                                                {addr.name} ({addr.type === 'contact' ? 'Main' : addr.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* --- 4. Payment Terms (payment_term_id) --- */}
                    <FormField
                        name="payment_term_id"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Terms</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Payment Term" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accountPaymentTerm?.map((term: any) => (
                                            <SelectItem key={term.id} value={String(term.id)}>
                                                {term.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            </div>

        </div>
    )

}

export default SalesOrderCreatePage