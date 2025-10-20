import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppSelectFormField from "@/components/AppSelectFormField"
import AppInputFormField from "@/components/AppInputFormField"
import { formatCurrency } from "@/utils/formatter"

interface SalesOrderDetailsFormProps {
    salesOrder: any
    isEditable: boolean
    isEditableForm: boolean
    control: any
    contactState: any
    paymentTerms: any
}

export const SalesOrderDetailsForm = ({
    salesOrder,
    isEditable,
    isEditableForm,
    control,
    contactState,
    paymentTerms
}: SalesOrderDetailsFormProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        label="Customer"
                        value={salesOrder?.partner_id?.[1]}
                        isEditable={isEditable && isEditableForm}
                        renderInput={() => (
                            <AppSelectFormField
                                formControl={control}
                                label="Customer"
                                name="partner_id"
                                resourceState={contactState}
                            />
                        )}
                    />
                    <FormField
                        label="Invoice Address"
                        value={salesOrder?.partner_invoice_id?.[1]}
                        isEditable={isEditable}
                        renderInput={() => (
                            <AppSelectFormField
                                formControl={control}
                                label="Invoice Address"
                                name="partner_invoice_id"
                                resourceState={contactState}
                            />
                        )}
                    />
                    <FormField
                        label="Delivery Address"
                        value={salesOrder?.partner_shipping_id?.[1]}
                        isEditable={isEditable}
                        renderInput={() => (
                            <AppSelectFormField
                                formControl={control}
                                label="Delivery Address"
                                name="partner_shipping_id"
                                resourceState={contactState}
                            />
                        )}
                    />
                    <FormField
                        label="Expected Delivery Date"
                        value={salesOrder?.validity_date}
                        isEditable={isEditable && isEditableForm}
                        renderInput={() => (
                            <AppInputFormField
                                formControl={control}
                                name="validity_date"
                                label="Expected Delivery Date"
                                type="datetime-local"
                            />
                        )}
                    />
                    <FormField
                        label="Payment Terms"
                        value={salesOrder?.payment_term_id?.[1]}
                        isEditable={isEditable}
                        renderInput={() => (
                            <AppSelectFormField
                                formControl={control}
                                label="Payment Term"
                                name="payment_term_id"
                                resourceState={paymentTerms}
                            />
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Status & Amounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Untaxed:</span>
                            <span>{formatCurrency(salesOrder?.amount_untaxed)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tax:</span>
                            <span>{formatCurrency(salesOrder?.amount_tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span className="text-green-600">
                                {formatCurrency(salesOrder?.amount_total)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

interface FormFieldProps {
    label: string
    value: any
    isEditable: boolean
    renderInput: () => React.ReactNode
}

const FormField = ({ label, value, isEditable, renderInput }: FormFieldProps) => {
    return (
        <div>
            {isEditable ? (
                renderInput()
            ) : (
                <>
                    <label className="text-sm font-medium text-gray-600">{label}</label>
                    <p className="text-lg">{value}</p>
                </>
            )}
        </div>
    )
}
