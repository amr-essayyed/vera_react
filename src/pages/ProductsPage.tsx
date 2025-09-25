import { useState } from "react";
import { useAllResource, useCreateResource, useUpdateResource, useDeleteResource } from "@/hooks/useResource";
import PageHeader from "@/components/PageHeader";
import ProductTable from "@/components/ProductTable";
import ProductCreateDialog from "@/components/ProductCreateDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Using text icons for now - you can replace with your preferred icon library

export default function ProductsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const { data: products, isLoading, error } = useAllResource("product");
	const { mutateAsync: createProduct } = useCreateResource("product");
	const { mutateAsync: updateProduct } = useUpdateResource("product");
	const { mutateAsync: deleteProduct } = useDeleteResource("product");

	// Filter products based on search term
	const filteredProducts = products?.filter((product: any) => product.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

	const handleCreateProduct = async (productData: any) => {
		try {
			await createProduct(productData);
			setIsCreateDialogOpen(false);
		} catch (error) {
			console.error("Error creating product:", error);
		}
	};

	const handleUpdateProduct = async (id: string, productData: any) => {
		try {
			await updateProduct({ id, resourceInstance: productData });
		} catch (error) {
			console.error("Error updating product:", error);
		}
	};

	const handleDeleteProduct = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			try {
				await deleteProduct(id);
			} catch (error) {
				console.error("Error deleting product:", error);
			}
		}
	};

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					<strong>Error loading products:</strong> {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<PageHeader title="Products" description="Manage your product catalog. Add, edit, and organize your products." />

			{/* Actions Bar */}
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center space-x-2">
					<div className="relative">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
						<Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
					</div>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>
					<span className="mr-2">+</span>
					Add Product
				</Button>
			</div>

			{/* Loading State */}
			{isLoading && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">Loading products...</div>}

			{/* Products Table */}
			<ProductTable products={filteredProducts} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} isLoading={isLoading} />

			{/* Create Product Dialog */}
			<ProductCreateDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSubmit={handleCreateProduct} />
		</div>
	);
}
