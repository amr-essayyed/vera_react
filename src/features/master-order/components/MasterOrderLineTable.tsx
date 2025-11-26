import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { tr_MasterOrderLine } from "@/types/masterOrderLine";  

type Cell = { row: number; col: number };

export default function MasterOrderLineTable({ name, data }: { name: string, data?: tr_MasterOrderLine[] }) {
    const [rows, setRows] = useState<number[]>([0]);
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    const [imagePreviewsFromFile, setImagePreviewsFromFile] = useState<{ [key: string]: string }>({});



    const addRow = () => setRows(prev => [...prev, prev.length]);
    const deleteRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

    const handlePaste = (e: React.ClipboardEvent) => {
        if (!selectedCell) return;
        e.preventDefault();

        const text = e.clipboardData.getData("text");
        const parsed = text.trim().split("\n").map(r => r.split("\t"));

        const startRow = selectedCell.row;
        const startCol = selectedCell.col;

        // 1️⃣ Calculate how many new rows are needed
        const neededRows = startRow + parsed.length - rows.length;
        if (neededRows > 0) {
            setRows(prev => [...prev, ...Array.from({ length: neededRows }, (_, i) => prev.length + i)]);
        }

        // 2️⃣ Use setTimeout 0 to wait for the new rows to render
        setTimeout(() => {
            parsed.forEach((rowData, rIdx) => {
                const targetRow = startRow + rIdx;

                rowData.forEach((value, cIdx) => {
                    const col = startCol + cIdx;
                    const field = getFieldName(col);
                    if (!field) return;

                    const input = document.querySelector(
                    `input[name="${name}[${targetRow}][${field}]"]`
                    ) as HTMLInputElement;

                    if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                });
            });
        }, 0);
    };

    const handleImagePaste = async (e: React.ClipboardEvent, row: number) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.includes("image")) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) return;

                const input = document.querySelector(
                `input[name="${name}[${row}][image]"]`
                ) as HTMLInputElement;

                if (input) {
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                input.dispatchEvent(new Event("change", { bubbles: true }));
                
                // Create preview from file
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreviewsFromFile(prev => ({
                        ...prev,
                        [`${row}`]: e.target?.result as string
                    }));
                };
                reader.readAsDataURL(file);
                }
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, row: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreviewsFromFile(prev => ({
                ...prev,
                [`${row}`]: event.target?.result as string
            }));
        };
        reader.readAsDataURL(file);
    };


    const tableRow = (k: number) => (
        <TableRow key={k}>
        <TableCell className="border" onClick={() => setSelectedCell({ row: k, col: 0 })}>
            <div className="relative w-20 h-20">
            <Input
                name={`${name}[${k}][image]`}
                type="file"
                accept="image/*"
                onPaste={(e) => handleImagePaste(e, k)}
                onChange={(e) => handleImageChange(e, k)}
                className="absolute inset-0 opacity-0 cursor-pointer hover: border-2 border-red-400"
            />
            {
                data? <img src={`data:image/png;base64,${data?.[k]?.image_1920}`} alt="prd" className="w-full h-full object-cover rounded-md" />:
                imagePreviewsFromFile[`${k}`] ? 
                <img src={imagePreviewsFromFile[`${k}`]} alt="prd" className="w-full h-full object-cover rounded-md" />:
                <div className="w-full h-full border-2 border-dashed rounded-md bg-gray-50 flex flex-col items-center justify-center text-gray-500">
                    <Image />
                    <span className="text-sm">Click / Paste</span>
                </div>
            }
            
            
            </div>
        </TableCell>

        <TableCell className="border" onClick={() => setSelectedCell({ row: k, col: 1 })}>
            <Input name={`${name}[${k}][product_name]`} placeholder="Product Name" defaultValue={data?.[k]?.product_id?.[1]} />  {/* this is name in form but id in details */}
        </TableCell>

        <TableCell className="border" onClick={() => setSelectedCell({ row: k, col: 2 })}>
            <Input name={`${name}[${k}][name]`} placeholder="Description" defaultValue={data?.[k]?.name} />
        </TableCell>

        <TableCell className="border" onClick={() => setSelectedCell({ row: k, col: 3 })}>
            <div className="flex gap-1">
            <Input name={`${name}[${k}][quantity]`} placeholder="0" defaultValue={data?.[k]?.quantity} />
            <span className="text-gray-500">pcs</span>
            </div>
        </TableCell>

        <TableCell className="border" onClick={() => setSelectedCell({ row: k, col: 4 })}>
            <Input name={`${name}[${k}][price_cost]`} placeholder="0.00" defaultValue={data?.[k]?.price_cost} />
        </TableCell>

        <TableCell className="border">
            <Input disabled placeholder="$0.00" />
        </TableCell>

        <TableCell className="border">
            <Button
            type="button"
            variant="destructive"
            onClick={() => deleteRow(k)}
            >
            <Trash />
            </Button>
        </TableCell>
        </TableRow>
    );

    useEffect(()=>{
        if (data) {
            setRows(Array.from({ length: data.length }, (_, i) => i));
            
            // Initialize image previews from existing data
            const imagePreviews: { [key: string]: string } = {};
            data.forEach((line, index) => {
                if (line.image_1920) {
                    // If it's a string (base64), use it directly
                    if (typeof line.image_1920 === 'string') {
                        imagePreviews[`${index}`] = line.image_1920;
                    } else {
                        // If it's a Blob/File, convert to base64
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            setImagePreviewsFromFile(prev => ({
                                ...prev,
                                [`${index}`]: e.target?.result as string
                            }));
                        };
                        reader.readAsDataURL(line.image_1920 as Blob);
                    }
                }
            });
            setImagePreviewsFromFile(imagePreviews);
        }
    }, [data]);

    return (
        <>
        <div className="flex justify-end gap-3 mb-3">
            <Button type="button" onClick={addRow}>+ Add Line</Button>
        </div>

        <Table className="border" onPaste={handlePaste}>
            <TableHeader>
            <TableRow className="bg-gray-100">
                <TableHead className="border">Image</TableHead>
                <TableHead className="border">Product Name</TableHead>
                <TableHead className="border">Description</TableHead>
                <TableHead className="border">Qty</TableHead>
                <TableHead className="border">Unit Price</TableHead>
                <TableHead className="border">Subtotal</TableHead>
                <TableHead className="border">Actions</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {rows.map((_, i) => tableRow(i))}
            </TableBody>
        </Table>
        </>
    );
}

function getFieldName(col: number) {
    switch (col) {
        case 1: return "product_name";
        case 2: return "name";
        case 3: return "quantity";
        case 4: return "price_cost";
        default: return null;
    }
}

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Image, Trash } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useState, type JSX } from "react";

// export default function MasterOrderLineTable({name}: {name: string}): JSX.Element {

//     const [rows, setRows] = useState<JSX.Element[]>([]);

//     const tableRow = (k: number) => (
//         <TableRow key={k}>
//             <TableCell className="border">
//                 <div className="relative w-20 h-20">
//                     <Input
//                         name={`${name}[${k}][image]`}
//                         type="file"
//                         accept="image/*"
//                         className="absolute inset-0 opacity-0 cursor-pointer"
//                     />

//                     <div className="w-full h-full border-2 border-dashed rounded-md bg-gray-50 flex flex-col items-center justify-center text-center text-gray-500">
//                         <Image />
//                         <span className="text-sm">Click or<br/> paste</span>
//                     </div>
//                 </div>
//             </TableCell>
//             <TableCell className="border"><Input type="text" name={`${name}[${k}][product_name]`} placeholder="Enter Product Name" /></TableCell>
//             <TableCell className="border"><Input type="text" name={`${name}[${k}][name]`} placeholder="Enter Product Description (Name)" /></TableCell>
//             <TableCell className="border"><div className="flex items-center gap-1"><Input type="text" name={`${name}[${k}][quantity]`} placeholder="0" /><span className="text-gray-500">pcs</span></div></TableCell>
//             <TableCell className="border"><Input type="text" name={`${name}[${k}][price_cost]`} placeholder="0.00" /></TableCell>
//             <TableCell className="border"><Input type="text" placeholder="$0.00" /></TableCell>
//             <TableCell className="border"><Button type="button" variant={"destructive"} onClick={() => handleDeleteLine(k)}><Trash /></Button></TableCell>
//         </TableRow>
//     )

//     const handleAddLine = () => {
//         setRows((prev) => [...prev, tableRow(prev.length)]);
//     }

//     const handleDeleteLine = (index: number) => {
//         setRows((prev) => prev.filter((_, i) => i !== index));
//     }

//     const handlePaste = () => {
//         console.log("pasted");
        
//     }

//     return (
//         <>
//         <div className="flex flex-row-reverse gap-3">
//             <Button type="button" onClick={handleAddLine}>+ Add Line</Button>
//             <Button type="button" variant={"outline"} className="border-purple-200 text-purple-500 bg-purple-100">+ Add Custom Column</Button>
//         </div>

//         <Table className="border border-border" onPaste={handlePaste} >
//             <TableHeader>
//                 <TableRow className="bg-gray-100">
//                     <TableHead className="border">Image</TableHead>
//                     <TableHead className="border">Product Name</TableHead>
//                     <TableHead className="border">Product Desc</TableHead>
//                     <TableHead className="border">Qty</TableHead>
//                     <TableHead className="border">Unit Price</TableHead>
//                     <TableHead className="border">Subtotal</TableHead>
//                     <TableHead className="border">Actions</TableHead>
//                 </TableRow>
//             </TableHeader>
//             <TableBody>
//                 {rows}
//             </TableBody>
//         </Table>
//         </>
//     )
// }
