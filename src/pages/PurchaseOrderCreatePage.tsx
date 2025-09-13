import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useCallback, useRef } from "react";
import { useCreateMultipleResources } from "@/hooks/useResource";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const itemSchema = z.object({
  image: z.instanceof(File).optional(),
  name: z.string().min(1, "Required"),
  quantity: z.number().int().positive("Must be > 0"),
  price: z.number().nonnegative("Must be ≥ 0"),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type formType = z.infer<typeof formSchema>;

type CustomColumn = {
  id: string;
  name: string;
  type: "text" | "number" | "date";
};

export default function PurchaseOrderCreatePage() {
  const { mutateAsync } = useCreateMultipleResources("product");
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [customColumnData, setCustomColumnData] = useState<
    Record<string, Record<string, any>>
  >({});
  const tableRef = useRef<HTMLTableElement>(null);

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: "someItem", quantity: 1, price: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Handle custom column management
  const addCustomColumn = useCallback(() => {
    const newColumn: CustomColumn = {
      id: `custom_${Date.now()}`,
      name: `Column ${customColumns.length + 1}`,
      type: "text",
    };
    setCustomColumns((prev) => [...prev, newColumn]);
  }, [customColumns.length]);

  const removeCustomColumn = useCallback((columnId: string) => {
    setCustomColumns((prev) => prev.filter((col) => col.id !== columnId));
    setCustomColumnData((prev) => {
      const newData = { ...prev };
      delete newData[columnId];
      return newData;
    });
  }, []);

  const updateCustomColumnName = useCallback(
    (columnId: string, newName: string) => {
      setCustomColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, name: newName } : col
        )
      );
    },
    []
  );

  const updateCustomColumnType = useCallback(
    (columnId: string, newType: "text" | "number" | "date") => {
      setCustomColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, type: newType } : col
        )
      );
    },
    []
  );

  const updateCustomCellData = useCallback(
    (columnId: string, rowIndex: number, value: any) => {
      setCustomColumnData((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          [rowIndex]: value,
        },
      }));
    },
    []
  );

  // Handle image paste functionality
  const handleImagePaste = useCallback(
    async (e: React.ClipboardEvent, rowIndex: number) => {
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();

          if (blob) {
            // Convert blob to File object
            const file = new File([blob], `pasted-image-${Date.now()}.png`, {
              type: blob.type,
            });

            // Update the form field
            form.setValue(`items.${rowIndex}.image`, file);
          }
          break;
        }
      }
    },
    [form]
  );

  // Handle paste functionality
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      if (!selectedCell) return;

      // Check if we're pasting into an image cell (column 0)
      if (selectedCell.col === 0) {
        await handleImagePaste(e, selectedCell.row);
        return;
      }

      e.preventDefault();
      const clipboardText = e.clipboardData.getData("text");
      const pastedData = parseClipboardData(clipboardText);

      if (pastedData.length === 0) return;

      const startRow = selectedCell.row;
      const startCol = selectedCell.col;

      // Calculate how many new rows we need
      const requiredRows = startRow + pastedData.length;
      const currentRows = fields.length;

      // Add new rows if needed
      if (requiredRows > currentRows) {
        const rowsToAdd = requiredRows - currentRows;
        for (let i = 0; i < rowsToAdd; i++) {
          append({ name: "", quantity: 1, price: 0 });
        }
      }

      // Update form values with pasted data
      pastedData.forEach((row, rowIndex) => {
        const targetRowIndex = startRow + rowIndex;

        row.forEach((cellValue, colIndex) => {
          const targetColIndex = startCol + colIndex;

          // Map column indices to field names (skip image column at index 0)
          switch (targetColIndex) {
            case 1: // Name column
              form.setValue(`items.${targetRowIndex}.name`, cellValue || "");
              break;
            case 2: // Quantity column
              const quantity = parseInt(cellValue) || 1;
              form.setValue(`items.${targetRowIndex}.quantity`, quantity);
              break;
            case 3: // Price column
              const price = parseFloat(cellValue) || 0;
              form.setValue(`items.${targetRowIndex}.price`, price);
              break;
            default:
              // Handle custom columns (starting from index 4)
              const customColIndex = targetColIndex - 4;
              if (
                customColIndex >= 0 &&
                customColIndex < customColumns.length
              ) {
                const column = customColumns[customColIndex];
                const value =
                  column.type === "number"
                    ? parseFloat(cellValue) || 0
                    : cellValue || "";
                updateCustomCellData(column.id, targetRowIndex, value);
              }
              break;
          }
        });
      });
    },
    [
      selectedCell,
      fields.length,
      append,
      form,
      handleImagePaste,
      customColumns,
      updateCustomCellData,
    ]
  );

  // Handle cell selection
  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
  }, []);

  // 2. Define a submit handler.
  async function onSubmit(values: formType) {
    console.log("Form submitted with values:", values);
    try {
      // Process all items and convert images to base64
      const productsToCreate = await Promise.all(
        values.items.map(async (item, index) => {
          const imageBase64 = item.image ? await imageToBase64(item.image) : null;
          
          // Build the product object
          const product: any = {
            name: item.name,
            list_price: item.price,
            image_1920: imageBase64,
          };

          // Add custom column data if any exists for this row
          customColumns.forEach((column) => {
            const customValue = customColumnData[column.id]?.[index];
            if (customValue !== undefined && customValue !== '') {
              // Use column name as field name (you might want to sanitize this)
              product[column.name.toLowerCase().replace(/\s+/g, '_')] = customValue;
            }
          });

          return product;
        })
      );

      console.log("Creating products:", productsToCreate);
      
      // Create all products at once
      const result = await mutateAsync(productsToCreate);
      
      console.log(`Successfully created ${productsToCreate.length} products!`, result);
    } catch (error) {
      console.error("Error creating products:", error);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Table ref={tableRef} onPaste={handlePaste}>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                {customColumns.map((column) => (
                  <TableHead key={column.id} className="relative group">
                    <div className="flex items-center gap-2">
                      <Input
                        value={column.name}
                        onChange={(e) =>
                          updateCustomColumnName(column.id, e.target.value)
                        }
                        className="h-8 text-sm font-medium"
                        placeholder="Column name"
                      />
                      <select
                        value={column.type}
                        onChange={(e) =>
                          updateCustomColumnType(
                            column.id,
                            e.target.value as "text" | "number" | "date"
                          )
                        }
                        className="h-8 text-xs border rounded px-2"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomColumn(column.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </Button>
                    </div>
                  </TableHead>
                ))}
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addCustomColumn}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell
                    onClick={() => handleCellClick(index, 0)}
                    className={`cursor-pointer ${
                      selectedCell?.row === index && selectedCell?.col === 0
                        ? "bg-blue-100"
                        : ""
                    }`}
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.image`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  field.onChange(e.target.files?.[0])
                                }
                                onBlur={field.onBlur}
                                name={field.name}
                                onFocus={() => handleCellClick(index, 0)}
                              />
                              {selectedCell?.row === index &&
                                selectedCell?.col === 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Click to select file or paste image (Ctrl+V)
                                  </div>
                                )}
                              {field.value && (
                                <div className="mt-2">
                                  <img
                                    src={URL.createObjectURL(field.value)}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => handleCellClick(index, 1)}
                    className={
                      selectedCell?.row === index && selectedCell?.col === 1
                        ? "bg-blue-100"
                        : ""
                    }
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Name"
                              onFocus={() => handleCellClick(index, 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => handleCellClick(index, 2)}
                    className={
                      selectedCell?.row === index && selectedCell?.col === 2
                        ? "bg-blue-100"
                        : ""
                    }
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onFocus={() => handleCellClick(index, 2)}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => handleCellClick(index, 3)}
                    className={
                      selectedCell?.row === index && selectedCell?.col === 3
                        ? "bg-blue-100"
                        : ""
                    }
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onFocus={() => handleCellClick(index, 3)}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  {customColumns.map((column, colIndex) => {
                    const actualColIndex = 4 + colIndex; // Start after the 4 fixed columns
                    return (
                      <TableCell
                        key={column.id}
                        onClick={() => handleCellClick(index, actualColIndex)}
                        className={
                          selectedCell?.row === index &&
                          selectedCell?.col === actualColIndex
                            ? "bg-blue-100"
                            : ""
                        }
                      >
                        <Input
                          type={
                            column.type === "number"
                              ? "number"
                              : column.type === "date"
                              ? "date"
                              : "text"
                          }
                          value={customColumnData[column.id]?.[index] || ""}
                          onChange={(e) => {
                            const value =
                              column.type === "number"
                                ? parseFloat(e.target.value) || 0
                                : e.target.value;
                            updateCustomCellData(column.id, index, value);
                          }}
                          onFocus={() => handleCellClick(index, actualColIndex)}
                          placeholder={`Enter ${column.name.toLowerCase()}`}
                          step={column.type === "number" ? "0.01" : undefined}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell></TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              onClick={() => append({ name: "", quantity: 1, price: 0 })}
            >
              Add Row
            </Button>
            <Button type="button" variant="outline" onClick={addCustomColumn}>
              Add Column
            </Button>
            <Button type="submit">Submit</Button>
          </div>

          {customColumns.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Custom Columns Data:</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(customColumnData, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

function parseClipboardData(clipboardText: string) {
  return clipboardText
    .trim()
    .split("\n")
    .map((row) => row.split("\t"));
}

function imageToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]); // strip prefix
    reader.onerror = reject;
  });
}
