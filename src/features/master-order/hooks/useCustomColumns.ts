import { useCallback, useState } from "react";

export type Column = {
  id: string;
  header: string;
  field?: string; // name used for input fields
  type?: "text" | "file" | "calculated" | "actions";
  removable?: boolean;
};

export default function useCustomColumns(initial?: Column[]) {
  const defaultColumns: Column[] = [
    { id: "image", header: "Image", field: "image", type: "file", removable: false },
    { id: "product_name", header: "Product Name", field: "product_name", type: "text", removable: false },
    { id: "name", header: "Description", field: "name", type: "text", removable: false },
    { id: "quantity", header: "Qty", field: "quantity", type: "text", removable: false },
    { id: "price_cost", header: "Unit Price", field: "price_cost", type: "text", removable: false },
    { id: "subtotal", header: "Subtotal", type: "calculated", removable: false },
    { id: "actions", header: "Actions", type: "actions", removable: false },
  ];

  const [columns, setColumns] = useState<Column[]>(initial && initial.length ? initial : defaultColumns);

  const addCustomColumn = useCallback((header?: string) => {
    const id = `custom_${Date.now()}`;
    const field = `custom_${Object.keys(columns).length}_${Date.now()}`;
    const col: Column = { id, header: header ?? "Custom", field, type: "text", removable: true };
    setColumns((prev) => {
      // insert before actions column if present
      const actionsIndex = prev.findIndex((c) => c.type === "actions");
      if (actionsIndex >= 0) {
        const copy = [...prev];
        copy.splice(actionsIndex, 0, col);
        return copy;
      }
      return [...prev, col];
    });
    return id;
  }, [columns]);

  const removeCustomColumn = useCallback((id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getFieldByIndex = useCallback((index: number) => {
    const col = columns[index];
    return col?.field ?? null;
  }, [columns]);

  return { columns, addCustomColumn, removeCustomColumn, getFieldByIndex, setColumns };
}
