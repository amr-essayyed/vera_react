import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateResource } from "@/hooks/useResource";
import { toast } from "sonner";

// Simple supplier schema for quick creation
const quickSupplierSchema = z.object({
	name: z.string().min(1, "Company name is required"),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	phone: z.string().optional(),
});

type QuickSupplierForm = z.infer<typeof quickSupplierSchema>;

interface SupplierCreateDialogProps {
	onSupplierCreated?: (supplier: any) => void;
}

export default function SupplierCreateDialog({ onSupplierCreated }: SupplierCreateDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mutateAsync: createSupplier } = useCreateResource("contact");

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<QuickSupplierForm>({
		resolver: zodResolver(quickSupplierSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	const onSubmit = async (data: QuickSupplierForm) => {
		setIsSubmitting(true);
		try {
			const supplierData = {
				...data,
				supplier_rank: 1, // Mark as supplier
				is_company: true,
			};

			const createdSupplier = await createSupplier(supplierData);
			console.log("Created supplier:", createdSupplier);

			onSupplierCreated?.(createdSupplier);
			toast.success("Supplier created successfully!");
			reset();
			setOpen(false);
		} catch (error) {
			console.error("Error creating supplier:", error);
			toast.error("Failed to create supplier. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" size="sm" variant="outline" title="Create New Supplier">
					<Plus className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create New Supplier</DialogTitle>
					<DialogDescription>Add a new supplier to your database. You can edit more details later.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<Label htmlFor="name">Company Name *</Label>
						<Input id="name" {...register("name")} placeholder="Enter company name" className={errors.name ? "border-red-500" : ""} />
						{errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
					</div>

					<div>
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" {...register("email")} placeholder="Enter email address" className={errors.email ? "border-red-500" : ""} />
						{errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
					</div>

					<div>
						<Label htmlFor="phone">Phone</Label>
						<Input id="phone" {...register("phone")} placeholder="Enter phone number" />
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Creating...
								</>
							) : (
								"Create Supplier"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
