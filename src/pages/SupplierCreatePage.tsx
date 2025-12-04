import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactForm } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Save } from "lucide-react";

export default function SupplierCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ContactForm>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            mobile: "",
            website: "",
            street: "",
            street2: "",
            city: "",
            zip: "",
            vat: "",
            comment: "",
        },
    });

    const onSubmit = async (data: ContactForm) => {
        setIsSubmitting(true);
        try {
            // TODO: Implement API call to create supplier
            console.log("Creating supplier:", data);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Navigate back to suppliers list
            navigate("/suppliers");
        } catch (error) {
            console.error("Error creating supplier:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/suppliers">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Suppliers
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Add New Supplier
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Create a new supplier profile
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Company Name *</Label>
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder="Enter company name"
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="vat">VAT Number</Label>
                                    <Input
                                        id="vat"
                                        {...register("vat")}
                                        placeholder="Enter VAT number"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        placeholder="Enter email address"
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        {...register("website")}
                                        placeholder="https://example.com"
                                        className={errors.website ? "border-red-500" : ""}
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        {...register("phone")}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input
                                        id="mobile"
                                        {...register("mobile")}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    {...register("street")}
                                    placeholder="Enter street address"
                                />
                            </div>
                            <div>
                                <Label htmlFor="street2">Street Address 2</Label>
                                <Input
                                    id="street2"
                                    {...register("street2")}
                                    placeholder="Apartment, suite, etc."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        {...register("city")}
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                                    <Input
                                        id="zip"
                                        {...register("zip")}
                                        placeholder="Enter ZIP code"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country_id">Country</Label>
                                    <Input
                                        id="country_id"
                                        {...register("country_id", { valueAsNumber: true })}
                                        placeholder="Country ID"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="comment">Notes</Label>
                                <Textarea
                                    id="comment"
                                    {...register("comment")}
                                    placeholder="Enter any additional notes about this supplier"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Link to="/suppliers">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Create Supplier
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}