import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClipboardHandler } from "@/hooks/useClipboardHandler"
import { useImagePasteHandler } from "@/hooks/useImagePasteHandler"
import { Loader2 } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { SaleOrderRow } from "./SaleOrderLineRow"

interface ResourceState<T> {
  data: T[] | undefined
  isLoading: boolean
}

interface SaleOrderItemsTableProps {
  form: UseFormReturn<any>
  isLoading?: boolean
  productsState: ResourceState<any>
  taxesState?: ResourceState<any>
  salesOrder: any
  onreferesh?: () => Promise<void>
}

export default function SaleOrderItemsTable({
  form,
  // isLoading,
  productsState,
  // taxesState,
  onreferesh

}: SaleOrderItemsTableProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "order_line",
  })
  const handleImagePaste = useImagePasteHandler(form)





  const { handlePaste, isProcessing } = useClipboardHandler({
    append,
    fields,
    form,
    handleImagePaste,
    selectedCell,
    onRefresh: onreferesh,
    orderId: form.getValues().id,
  })

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col })
  }, [])

  return (
    <>
      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">
            Processing products... Searching and creating products as needed.
          </span>
        </div>
      )}

      <Table ref={tableRef} onPaste={handlePaste}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Image</TableHead>
            <TableHead className="min-w-48">Product Name</TableHead>
            <TableHead className="w-24">Quantity</TableHead>
            <TableHead className="w-32">Unit Price</TableHead>
            <TableHead className="w-32">Subtotal</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {fields.map((field, index) => (
            <SaleOrderRow
              key={field.id}
              index={index}
              form={form}
              productsState={productsState}
              selectedCell={selectedCell}
              onSelectCell={handleCellClick}
              onRemove={() => remove(index)}
            />
          ))}
        </TableBody>
      </Table>

      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: "", product_uom_qty: 1, price_unit: 0 })}
          disabled={isProcessing}
        >
          Add Item
        </Button>

        {fields.length > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const emptyIndices = fields
                .map((_, i) => ({ i, line: form.watch(`order_line.${i}`) }))
                .filter(({ line }) => !line.name && line.product_uom_qty <= 0 && line.price_unit <= 0)
                .map(({ i }) => i)
                .slice(0, -1)

              emptyIndices.reverse().forEach((i) => remove(i))


            }}
            disabled={isProcessing}
          >
            Clear Empty Rows
          </Button>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-1">💡 Tips for pasting:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Copy from Excel with columns: Product Name, Quantity, Price</li>
          <li>Click on a cell in the table, then paste (Ctrl+V / Cmd+V)</li>
          <li>Products will be automatically searched or created if they don't exist</li>
          <li>New products will be created with the pasted name and price</li>
        </ul>
      </div>
    </>
  )
}
