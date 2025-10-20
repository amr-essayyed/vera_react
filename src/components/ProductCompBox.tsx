import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCreateResource } from "@/hooks/useResource"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

type Product = {
  id: number
  name: string
  list_price?: number
  standard_price?: number
  default_code?: string
}

interface ProductComboboxProps {
  products: Product[]
  value: string
  onChange: (value: string) => void
  onSelectProduct?: (product: Product | null) => void
  isLoading?: boolean
}

export const ProductCombobox: React.FC<ProductComboboxProps> = ({
  products,
  value,
  onChange,
  onSelectProduct,
  isLoading = false,
}) => {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtered, setFiltered] = useState<Product[]>(products)

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    default_code: "",
    list_price: 0,
    standard_price: 0,
    type: "consu", // consumable, service, product
  })

  const createProduct = useCreateResource("product", {
    onSuccess: (data: any) => {
      toast.success("Product created successfully! 🎉")
      
      // Create a product object from the response

      const createdProductId = data;

      const createdProduct: Product = {
        id: data, // Odoo returns the ID
        name: newProduct.name,
        list_price: newProduct.list_price,
        standard_price: newProduct.standard_price,
        default_code: newProduct.default_code,
      }

      // Select the newly created product
      onChange(newProduct.name)
      onSelectProduct?.({ ...newProduct, id: createdProductId })

      // Reset and close
      setDialogOpen(false)
      setOpen(false)
      setNewProduct({
        name: "",
        default_code: "",
        list_price: 0,
        standard_price: 0,
        type: "consu",
      })
    },
    onError: (error: any) => {
      toast.error(`Failed to create product: ${error.message}`)
    },
  }
  )



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    // Filter products based on input
    const lowerVal = val.toLowerCase()
    const matchedProducts = products.filter((p) =>
      p.name.toLowerCase().includes(lowerVal) ||
      p.default_code?.toLowerCase().includes(lowerVal)
    )
    setFiltered(matchedProducts)
  }

  const handleSelect = (product: Product) => {
    onChange(product.name)
    onSelectProduct?.(product)
    setOpen(false)
  }

  const handleOpenDialog = () => {
    // Pre-fill the name with what user typed
    setNewProduct((prev) => ({
      ...prev,
      name: value,
    }))
    setDialogOpen(true)
  }

  const handleCreateProduct = async () => {
    // Validate required fields
    if (!newProduct.name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (newProduct.list_price < 0 || newProduct.standard_price < 0) {
      toast.error("Prices cannot be negative")
      return
    }

    // Create the product
    const payload = {
      name: newProduct.name.trim(),
      default_code: newProduct.default_code.trim() || false,
      list_price: Number(newProduct.list_price),
      standard_price: Number(newProduct.standard_price),
      type: newProduct.type,
      sale_ok: true, // Can be sold
      purchase_ok: true, // Can be purchased
    }

    await createProduct.mutateAsync(payload)
  }

  const isCreating = createProduct.isPending

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : value ? (
              value
            ) : (
              "Select or type product..."
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-2" align="start" side="bottom">
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder="Type to search or create new..."
            className="mb-2"
            autoFocus
          />

          <div className="max-h-64 overflow-y-auto rounded-md border bg-white shadow-sm">
            {filtered.length > 0 ? (
              <ul>
                {filtered.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0 transition-colors"
                  >
                    <div className="font-medium">{product.name}</div>
                    {product.default_code && (
                      <div className="text-xs text-gray-500">
                        Code: {product.default_code}
                      </div>
                    )}
                    {product.list_price !== undefined && (
                      <div className="text-xs text-gray-600">
                        ${product.list_price.toFixed(2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  No products found for "{value}"
                </p>
                <Button
                  onClick={handleOpenDialog}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Product
                </Button>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <Button
                onClick={handleOpenDialog}
                variant="ghost"
                className="w-full text-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create "{value}" as new product
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Create Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your Odoo inventory. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Product Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Office Chair"
                autoFocus
              />
            </div>

            {/* Internal Reference / SKU */}
            <div className="grid gap-2">
              <Label htmlFor="default_code">Internal Reference (SKU)</Label>
              <Input
                id="default_code"
                value={newProduct.default_code}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    default_code: e.target.value,
                  }))
                }
                placeholder="e.g., CHAIR-001"
              />
            </div>

            {/* Sales Price */}
            <div className="grid gap-2">
              <Label htmlFor="list_price">Sales Price</Label>
              <Input
                id="list_price"
                type="number"
                step="0.01"
                min="0"
                value={newProduct.list_price}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    list_price: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
              />
            </div>

            {/* Cost Price */}
            <div className="grid gap-2">
              <Label htmlFor="standard_price">Cost Price</Label>
              <Input
                id="standard_price"
                type="number"
                step="0.01"
                min="0"
                value={newProduct.standard_price}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    standard_price: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
              />
            </div>

            {/* Product Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Product Type</Label>
              <select
                id="type"
                value={newProduct.type}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, type: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="consu">Consumable</option>
                <option value="service">Service</option>
                <option value="product">Storable Product</option>
              </select>
              <p className="text-xs text-gray-500">
                {newProduct.type === "consu" && "No inventory tracking"}
                {newProduct.type === "service" && "Intangible product"}
                {newProduct.type === "product" && "Inventory tracked"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateProduct}
              disabled={isCreating || !newProduct.name.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}