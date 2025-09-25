import { useParams, Link } from "react-router-dom";
import { useResourceById } from "@/hooks/useResource";
import type { Supplier } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    Building2, 
    Mail, 
    Globe, 
    MapPin, 
    FileText,
    Edit,
    Trash2
} from "lucide-react";

export default function SupplierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: supplier, isLoading, error } = useResourceById("supplier", id!) as { data: Supplier | undefined, isLoading: boolean, error: any };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading supplier details...</p>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error loading supplier details</p>
                    <Link to="/suppliers" className="text-blue-600 hover:underline mt-2 inline-block">
                        Back to Suppliers
                    </Link>
                </div>
            </div>
        );
    }

    const formatAddress = () => {
        const parts = [
            supplier.street,
            supplier.street2,
            supplier.city,
            typeof supplier.state_id === 'object' ? supplier.state_id?.name : '',
            supplier.zip,
            typeof supplier.country_id === 'object' ? supplier.country_id?.name : ''
        ].filter(Boolean);
        return parts.join(", ");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/suppliers">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Suppliers
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-4">
                                {supplier.avatar_1024 ? (
                                    <img 
                                        className="h-16 w-16 rounded-full object-cover" 
                                        src={`data:image/png;base64,${supplier.avatar_1024}`} 
                                        alt={supplier.name}
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {supplier.name}
                                    </h1>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant={supplier.supplier_rank > 0 ? "default" : "secondary"}>
                                            {supplier.supplier_rank > 0 ? 'Active Supplier' : 'Inactive'}
                                        </Badge>
                                        {supplier.is_company && (
                                            <Badge variant="outline">Company</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Mail className="h-5 w-5 mr-2" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier.email && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm text-gray-900">
                                        <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:underline">
                                            {supplier.email}
                                        </a>
                                    </p>
                                </div>
                            )}
                            {supplier.phone && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm text-gray-900">
                                        <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline">
                                            {supplier.phone}
                                        </a>
                                    </p>
                                </div>
                            )}
                            {supplier.mobile && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Mobile</label>
                                    <p className="text-sm text-gray-900">
                                        <a href={`tel:${supplier.mobile}`} className="text-blue-600 hover:underline">
                                            {supplier.mobile}
                                        </a>
                                    </p>
                                </div>
                            )}
                            {supplier.website && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Website</label>
                                    <p className="text-sm text-gray-900">
                                        <a 
                                            href={supplier.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            <Globe className="h-4 w-4 mr-1" />
                                            {supplier.website}
                                        </a>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {formatAddress() ? (
                                <p className="text-sm text-gray-900 whitespace-pre-line">
                                    {formatAddress()}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500">No address information</p>
                            )}
                            {supplier.vat && (
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-500">VAT Number</label>
                                    <p className="text-sm text-gray-900">{supplier.vat}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {supplier.comment ? (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Notes</label>
                                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                                        {supplier.comment}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No additional notes</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Purchase Orders Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Recent Purchase Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
                            Purchase order history will be displayed here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}