import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { UseFormReturn } from "react-hook-form";
import { ProductCombobox } from "./ProductCompBox";

interface ResourceState<T> {
  data: T[] | undefined;
  isLoading: boolean;
}

interface SaleOrderRowProps {
  index: number;
  form: UseFormReturn<any>;
  productsState: ResourceState<any>;
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (row: number, col: number) => void;
  onRemove: () => void;
}

export function SaleOrderRow({
  index,
  form,
  productsState,
  selectedCell,
  onSelectCell,
  onRemove,
}: SaleOrderRowProps) {
  const qty = form.watch(`order_line.${index}.product_uom_qty`) || 0;
  const price = form.watch(`order_line.${index}.price_unit`) || 0;



  return (
    <TableRow>
      {/* Image Field */}
      <TableCell
        onClick={() => onSelectCell(index, 0)}
        className={`cursor-pointer ${selectedCell?.row === index && selectedCell?.col === 0 ? "bg-blue-100" : ""}`}
      >
        <FormField
          control={form.control}
          name={`order_line.${index}.image`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                  {field.value instanceof File && (
                    <img
                      src={URL.createObjectURL(field.value)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      {/* Product Name */}
      <TableCell onClick={() => onSelectCell(index, 1)}>
        <FormField
          control={form.control}
          name={`order_line.${index}.name`}
          render={() => (
            <FormItem>
              <FormControl>
                <ProductCombobox
                  products={productsState.data || []}
                  value={form.watch(`order_line.${index}.name`) || ""}
                  onChange={(value) => form.setValue(`order_line.${index}.name`, value)}
                  onSelectProduct={(product) => {
                    if (product) {
                      form.setValue(`order_line.${index}.product_id`, product.id);
                      form.setValue(`order_line.${index}.price_unit`, product.list_price || 0);
                    } else {
                      form.setValue(`order_line.${index}.product_id`, false);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      {/* Quantity */}
      <TableCell onClick={() => onSelectCell(index, 2)}>
        <FormField
          control={form.control}
          name={`order_line.${index}.product_uom_qty`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>

      {/* Unit Price */}
      <TableCell onClick={() => onSelectCell(index, 3)}>
        <FormField
          control={form.control}
          name={`order_line.${index}.price_unit`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.value}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>

      {/* Subtotal */}
      <TableCell className="text-right font-medium">${(qty * price).toFixed(2)}</TableCell>

      {/* Actions */}
      <TableCell>
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
