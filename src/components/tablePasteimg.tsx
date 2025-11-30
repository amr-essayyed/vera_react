// import React, { useState, useCallback } from "react";
// import DataGrid from "react-data-grid";
// import { Button } from "@/components/ui/button";
// import "react-data-grid/lib/styles.css";

// // Image Cell Renderer
// function ImageCell({ row, column, onRowChange }) {
//   const handleChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       onRowChange({ ...row, [column.key]: reader.result });
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center gap-2">
//       {row[column.key] && (
//         <img
//           src={row[column.key]}
//           alt="preview"
//           className="w-16 h-16 object-cover rounded-xl"
//         />
//       )}
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleChange}
//         className="text-xs"
//       />
//     </div>
//   );
// }

// export default function PastingTable({ onChange }) {
//   const [columns, setColumns] = useState([
//     { key: "name", name: "Name", editable: true, frozen: true },
//     { key: "price", name: "Price", editable: true },
//     { key: "image", name: "Image", renderCell: ImageCell }
//   ]);

//   const [rows, setRows] = useState([
//     { id: 1, name: "", price: "", image: null }
//   ]);

//   const handleRowsChange = useCallback(
//     (newRows) => {
//       setRows(newRows);
//       onChange?.(newRows); // map to parent form fields
//     },
//     [onChange]
//   );

//   const addRow = () => {
//     setRows([...rows, { id: rows.length + 1, name: "", price: "", image: null }]);
//   };

//   const addColumn = () => {
//     const key = `col_${columns.length}`;
//     setColumns([
//       ...columns,
//       { key, name: `Column ${columns.length + 1}`, editable: true }
//     ]);
//   };

//   return (
//     <div className="p-4 grid gap-4">
//       <div className="flex gap-2">
//         <Button onClick={addRow}>Add Row</Button>
//         <Button onClick={addColumn}>Add Column</Button>
//       </div>

//       <div className="rounded-2xl shadow-md overflow-hidden">
//         <DataGrid
//           columns={columns}
//           rows={rows}
//           onRowsChange={handleRowsChange}
//           enableCellCopyPaste
//           className="min-h-[300px]"
//         />
//       </div>
//     </div>
//   );
// }
