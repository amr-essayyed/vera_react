import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import useCustomColumns from "../hooks/useCustomColumns";
import type { tr_MasterOrderLine } from "@/types/masterOrderLine";  

type Cell = { row: number; col: number };

interface MasterOrderLineTableCustomProps {
    name: string;
    data?: tr_MasterOrderLine[];
}

const MasterOrderLineTableCustom: React.FC<MasterOrderLineTableCustomProps> = ({ name, data }) => {
    const { columns, addCustomColumn, removeCustomColumn, getFieldByIndex, setColumns } = useCustomColumns();
    const [rows, setRows] = useState<number[]>([0]);
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    const [imagePreviewsFromFile, setImagePreviewsFromFile] = useState<{ [key: string]: string }>({});
    // Array of refs for file inputs, one per row
    const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const addRow = () => setRows(prev => [...prev, prev.length]);
    const deleteRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

    const handlePaste = async (e: React.ClipboardEvent) => {
        if (!selectedCell) return;
        // if clipboard contains image(s) delegate to image paste handler
        const items = e.clipboardData?.items;
        if (items && Array.from(items).some(it => it.type && it.type.includes("image"))) {
            // call existing handler which will set the file input and preview
            await handleImagePaste(e, selectedCell.row);
            return;
        }

        e.preventDefault();

        const text = e.clipboardData.getData("text");
        const parsed = text.trim().split("\n").map(r => r.split("\t"));

        const startRow = selectedCell.row;
        const startCol = selectedCell.col;

        const neededRows = startRow + parsed.length - rows.length;
        if (neededRows > 0) {
            setRows(prev => [...prev, ...Array.from({ length: neededRows }, (_, i) => prev.length + i)]);
        }

        setTimeout(() => {
            parsed.forEach((rowData, rIdx) => {
                const targetRow = startRow + rIdx;

                rowData.forEach((value, cIdx) => {
                    const col = startCol + cIdx;
                    const field = getFieldByIndex(col);
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

    const renderCell = (col: any, colIndex: number, rowIndex: number) => {
        const onClick = () => setSelectedCell({ row: rowIndex, col: colIndex });

        if (col.type === "file") {
            const hasImage = (data && data?.[rowIndex]?.image_1920) || imagePreviewsFromFile[`${rowIndex}`];
            // Ensure the ref array is long enough
            if (!fileInputRefs.current[rowIndex]) fileInputRefs.current[rowIndex] = null;
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <div className="relative w-24 h-24 group">
                        {hasImage ? (
                            <img 
                                src={data && data?.[rowIndex]?.image_1920 ? `data:image/png;base64,${data?.[rowIndex]?.image_1920}` : imagePreviewsFromFile[`${rowIndex}`]} 
                                alt="prd" 
                                className="w-full h-full object-cover rounded-md" 
                            />
                        ) : (
                            <div className="w-full h-full border-2 border-dashed rounded-md bg-gray-50 flex flex-col items-center justify-center text-gray-500">
                                <Image size={20} />
                                <span className="text-xs text-center mt-1">Click or<br/>Paste</span>
                            </div>
                        )}
                        {/* Button only, not overlay */}
                        <button
                            type="button"
                            onClick={e => {
                                e.stopPropagation();
                                fileInputRefs.current[rowIndex]?.click();
                            }}
                            className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow cursor-pointer hover:bg-white z-10 border border-gray-200"
                        >
                            <Image size={16} />
                            <span className="text-xs">Upload</span>
                        </button>
                        <Input
                            ref={el => (fileInputRefs.current[rowIndex] = el)}
                            name={`${name}[${rowIndex}][${col.field ?? "image"}]`}
                            type="file"
                            accept="image/*"
                            onPaste={(e) => handleImagePaste(e, rowIndex)}
                            onChange={(e) => handleImageChange(e, rowIndex)}
                            className="hidden"
                        />
                    </div>
                </TableCell>
            );
        }

        if (col.type === "text") {
            const field = col.field ?? `col_${colIndex}`;
            const defaultVal = field === "product_name" ? data?.[rowIndex]?.product_id?.[1] : data?.[rowIndex]?.[field];
            if (field === "quantity") {
                return (
                    <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                        <div className="flex gap-1">
                            <Input name={`${name}[${rowIndex}][${field}]`} placeholder="0" defaultValue={defaultVal} />
                            <span className="text-gray-500">pcs</span>
                        </div>
                    </TableCell>
                );
            }

            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <Input name={`${name}[${rowIndex}][${field}]`} placeholder={col.header} defaultValue={defaultVal} />
                </TableCell>
            );
        }

        if (col.type === "calculated") {
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`}>
                    <Input disabled placeholder="$0.00" />
                </TableCell>
            );
        }

        if (col.type === "actions") {
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`}>
                    <Button type="button" variant="destructive" onClick={() => deleteRow(rowIndex)}>
                        <Trash />
                    </Button>
                </TableCell>
            );
        }

        return (
            <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                <Input name={`${name}[${rowIndex}][${col.field ?? `col_${colIndex}`}]`} />
            </TableCell>
        );
    };

    useEffect(()=>{
        if (data) {
            setRows(Array.from({ length: data.length }, (_, i) => i));
            
            const imagePreviews: { [key: string]: string } = {};
            data.forEach((line, index) => {
                if (line.image_1920) {
                    if (typeof line.image_1920 === 'string') {
                        imagePreviews[`${index}`] = line.image_1920;
                    } else {
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
                <Button type="button" variant="outline" onClick={() => addCustomColumn("Custom")}>+ Add Custom Column</Button>
            </div>

            <Table className="border" onPaste={handlePaste}>
                <TableHeader>
                    <TableRow className="bg-gray-100">
                        {columns.map((col, idx) => (
                            <TableHead className="border" key={col.id}>
                                <div className="flex items-center justify-between gap-2">
                                    {col.removable ? (
                                        <Input
                                            className="w-28 px-1 py-0 text-xs h-7"
                                            value={col.header}
                                            onChange={e => {
                                                const newHeader = e.target.value;
                                                setColumns(cols => cols.map(c => c.id === col.id ? { ...c, header: newHeader } : c));
                                            }}
                                        />
                                    ) : (
                                        <span>{col.header}</span>
                                    )}
                                    {col.removable ? (
                                        <Button type="button" variant="ghost" onClick={() => removeCustomColumn(col.id)}>x</Button>
                                    ) : null}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rows.map((_, i) => (
                        <TableRow key={i}>
                            {columns.map((col, cIdx) => renderCell(col, cIdx, i))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default MasterOrderLineTableCustom;
