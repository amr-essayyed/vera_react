import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductCreateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (productData: any) => Promise<void>;
}

export default function ProductCreateDialog({ isOpen, onClose, onSubmit }: ProductCreateDialogProps) {
	const [formData, setFormData] = useState({
		name: "",
		standard_price: 0,
		list_price: 0,
		description: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onSubmit(formData);
			// Reset form
			setFormData({
				name: "",
				standard_price: 0,
				list_price: 0,
				description: "",
			});
		} catch (error) {
			console.error("Error creating product:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			setFormData({
				name: "",
				standard_price: 0,
				list_price: 0,
				description: "",
			});
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create New Product</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Product Name *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="Enter product name"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="standard_price">Standard Price</Label>
							<Input
								id="standard_price"
								type="number"
								step="0.01"
								min="0"
								value={formData.standard_price}
								onChange={(e) => setFormData({ ...formData, standard_price: parseFloat(e.target.value) || 0 })}
								placeholder="0.00"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="list_price">List Price</Label>
							<Input
								id="list_price"
								type="number"
								step="0.01"
								min="0"
								value={formData.list_price}
								onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0 })}
								placeholder="0.00"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Enter product description (optional)"
							rows={3}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
							{isSubmitting ? "Creating..." : "Create Product"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}