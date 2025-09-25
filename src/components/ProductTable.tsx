import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductImage from "@/components/ProductImage";
// Using text icons for now - you can replace with your preferred icon library

interface Product {
	id: number;
	name: string;
	standard_price: number;
	list_price: number;
}

interface ProductTableProps {
	products: Product[];
	onUpdate: (id: string, productData: any) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	isLoading: boolean;
}

export default function ProductTable({ products, onUpdate, onDelete, isLoading }: ProductTableProps) {
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editData, setEditData] = useState<Partial<Product>>({});

	const handleEdit = (product: Product) => {
		setEditingId(product.id);
		setEditData({
			name: product.name,
			standard_price: product.standard_price,
			list_price: product.list_price,
		});
	};

	const handleSave = async (id: number) => {
		try {
			await onUpdate(String(id), editData);
			setEditingId(null);
			setEditData({});
		} catch (error) {
			console.error("Error saving product:", error);
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditData({});
	};

	const handleDelete = async (id: number) => {
		try {
			await onDelete(String(id));
		} catch (error) {
			console.error("Error deleting product:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
				))}
			</div>
		);
	}

	if (!products || products.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="text-gray-500 text-lg mb-2">No products found</div>
				<div className="text-gray-400">Add your first product to get started</div>
			</div>
		);
	}

	return (
		<div className="border rounded-lg overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-20">Image</TableHead>
						<TableHead>Name</TableHead>
						<TableHead className="w-32">Standard Price</TableHead>
						<TableHead className="w-32">List Price</TableHead>
						<TableHead className="w-32">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.map((product) => (
						<TableRow key={product.id}>
							<TableCell>
								<ProductImage
									productId={product.id}
									productName={product.name}
									size="128"
									className="w-12 h-12 object-cover rounded"
								/>
							</TableCell>
							<TableCell>
								{editingId === product.id ? (
									<Input
										value={editData.name || ""}
										onChange={(e) => setEditData({ ...editData, name: e.target.value })}
										className="w-full"
									/>
								) : (
									<div className="font-medium">{product.name}</div>
								)}
							</TableCell>
							<TableCell>
								{editingId === product.id ? (
									<Input
										type="number"
										step="0.01"
										value={editData.standard_price || ""}
										onChange={(e) => setEditData({ ...editData, standard_price: parseFloat(e.target.value) || 0 })}
										className="w-full"
									/>
								) : (
									<div>${product.standard_price.toFixed(2)}</div>
								)}
							</TableCell>
							<TableCell>
								{editingId === product.id ? (
									<Input
										type="number"
										step="0.01"
										value={editData.list_price || ""}
										onChange={(e) => setEditData({ ...editData, list_price: parseFloat(e.target.value) || 0 })}
										className="w-full"
									/>
								) : (
									<div>${product.list_price.toFixed(2)}</div>
								)}
							</TableCell>
							<TableCell>
								<div className="flex space-x-2">
									{editingId === product.id ? (
										<>
											<Button
												size="sm"
												onClick={() => handleSave(product.id)}
												className="h-8 w-8 p-0"
											>
												💾
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={handleCancel}
												className="h-8 w-8 p-0"
											>
												❌
											</Button>
										</>
									) : (
										<>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleEdit(product)}
												className="h-8 w-8 p-0"
											>
												✏️
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => handleDelete(product.id)}
												className="h-8 w-8 p-0"
											>
												🗑️
											</Button>
										</>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}