import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppSelectField from "@/components/AppSelectField";
import { useEffect, useRef, useState, useMemo } from "react";
import useCustomColumns from "../hooks/useCustomColumns";
import type { tr_MasterOrderLine } from "@/types/masterOrderLine";  
import type { tr_Product } from "@/types/product";

type Cell = { row: number; col: number };

interface MasterOrderLineTableCustomProps {
    name: string;
    data?: tr_MasterOrderLine[];
    vendors: any;
    products: tr_Product;
    setPurchaseCost: (val:any)=> void;
}

const   MasterOrderLineTableCustom: React.FC<MasterOrderLineTableCustomProps> = ({ name, data, vendors, products, setPurchaseCost }) => {
    const { columns, addCustomColumn, removeCustomColumn, getFieldByIndex, setColumns } = useCustomColumns();
    const [rowCount, setRowCount] = useState<number[]>([0]);
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    const [imagePreviewsFromFile, setImagePreviewsFromFile] = useState<{ [key: string]: string }>({});
    // Array of refs for file inputs, one per row
    const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const [quantity, setQuantity] = useState<string[]>([""]);
    const [priceCost, setPriceCost] = useState<string[]>([""]);
    const [priceSale, setPriceSale] = useState<string[]>([""]);
    const [vendorId, setVendorId] = useState<string[]>([""]);

    // Memoize subtotal calculation so it's not recomputed unnecessarily
    const priceSubtotalSale: number[] = useMemo(() => {
        const arr: number[] = [];
        const len = Math.max(quantity.length, priceSale.length);
        for (let i = 0; i < len; i++) {
            arr[i] = Number(priceSale[i] ?? 0) * Number(quantity[i] ?? 0);
        }
        return arr;
    }, [priceSale, quantity]);

    const purchaseCost = useMemo(()=>{
        return priceSubtotalSale.reduce((sum, sub)=> sum+sub, 0);
    }, [priceSubtotalSale])
    setPurchaseCost(purchaseCost);

    const addRow = () => {
        setRowCount(prev => [...prev, prev.length]);
        // Extend state arrays to match new row count
        setQuantity(prev => [...prev, ""]);
        setPriceCost(prev => [...prev, ""]);
        setPriceSale(prev => [...prev, ""]);
        setVendorId(prev => [...prev, ""]);
    };
    
    const deleteRow = (index: number) => {
        setRowCount(prev => prev.filter((_, i) => i !== index));
        // Remove from state arrays
        setQuantity(prev => prev.filter((_, i) => i !== index));
        setPriceCost(prev => prev.filter((_, i) => i !== index));
        setPriceSale(prev => prev.filter((_, i) => i !== index));
        setVendorId(prev => prev.filter((_, i) => i !== index));
        // Remove image preview for this row
        setImagePreviewsFromFile(prev => {
            const updated = { ...prev };
            // Shift all keys after the deleted index down by 1
            const newPreviews: { [key: string]: string } = {};
            Object.keys(updated).forEach(key => {
                const k = parseInt(key, 10);
                if (k < index) newPreviews[k] = updated[k];
                else if (k > index) newPreviews[k - 1] = updated[k];
                // else (k === index) skip
            });
            return newPreviews;
        });
        // Remove file input ref for this row
        if (fileInputRefs.current) {
            fileInputRefs.current.splice(index, 1);
        }
    };

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
        // Split rows, then columns, and sanitize each value
        // For number fields, remove all non-numeric characters except . and -
        const sanitizeValue = (value: string, field: string | undefined) => {
            let v = value.replace(/[\r\n]/g, '').trim();
            // If the field is price_cost, price_sale, or quantity, strip non-numeric except . and -
            if (["price_cost", "price_sale", "quantity"].includes(field || "")) {
                v = v.replace(/[^0-9.-]/g, '');
            }
            return v;
        };
        const parsed = text.trim().split("\n").map(r => r.split("\t"));

        const startRow = selectedCell.row;
        const startCol = selectedCell.col;

        const neededRows = startRow + parsed.length - rowCount.length;
        if (neededRows > 0) {
            setRowCount(prev => [...prev, ...Array.from({ length: neededRows }, (_, i) => prev.length + i)]);
            // Also extend state arrays
            setQuantity(prev => [...prev, ...Array.from({ length: neededRows }, () => "")]);
            setPriceCost(prev => [...prev, ...Array.from({ length: neededRows }, () => "")]);
            setPriceSale(prev => [...prev, ...Array.from({ length: neededRows }, () => "")]);
            setVendorId(prev => [...prev, ...Array.from({ length: neededRows }, () => "")]);
        }

        setTimeout(() => {
            const tempQuantity = [...quantity];
            const tempPriceCost = [...priceCost];
            const tempPriceSale= [...priceSale];
            const tempVedorId= [...vendorId];
            parsed.forEach((rowData, rIdx) => {
                const targetRow = startRow + rIdx;

                rowData.forEach((value, cIdx) => {
                    const col = startCol + cIdx;
                    const field = getFieldByIndex(col);
                    if (!field) return;

                    // Sanitize value for number fields
                    const cleanValue = sanitizeValue(value, field);

                    const input = document.querySelector(
                        `input[name="${name}[${targetRow}][${field}]"]`
                    ) as HTMLInputElement;
                    
                    if(field === "quantity") {
                        tempQuantity[targetRow] = cleanValue;
                        setQuantity(tempQuantity);
                    }else
                    if(field === "price_cost") {
                        tempPriceCost[targetRow] = cleanValue;
                        setPriceCost(tempPriceCost);
                    }else
                    if(field === "price_sale") {
                        tempPriceSale[targetRow] = cleanValue;
                        setPriceSale(tempPriceSale);
                    }else
                    if(field === "vendor_id") {
                        tempVedorId[targetRow] = cleanValue;
                        setVendorId(tempVedorId);
                    }else

                    if (input) {
                        input.value = cleanValue;
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

        if (col.field === "vendor_id") {
            // Prepare vendor options: { value, label }
            const vendorOptions = Array.isArray(vendors)
                ? vendors.map((v: any) => ({ value: v.id, label: v.name }))
                : [];
            const defaultVal = data?.[rowIndex]?.vendor_id ? String(data[rowIndex].vendor_id) : undefined;
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`}>
                    <AppSelectField
                        name={`${name}[${rowIndex}][vendor_id]`}
                        label="Vendor"
                        values={vendorOptions}
                        value={vendorId[rowIndex]}
                        onValueChange={(value)=> setPriceCost(prev => { const n = [...prev]; n[rowIndex] = value; return n; })}
                        // defaultValue={defaultVal}
                    />
                </TableCell>
            );
        }

        if(col.field === "price_cost") {
            // const field = col.field ?? `col_${colIndex}`;
            const defaultVal = (data?.[rowIndex] as any)?.["price_cost"];
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <Input type="number" name={`${name}[${rowIndex}][price_cost]`} placeholder={col.header} defaultValue={defaultVal} value={priceCost[rowIndex]} onChange={(e)=> setPriceCost(prev => { const n = [...prev]; n[rowIndex] = e.target.value; return n; })} />
                </TableCell>
            )
        }
        
        if(col.field === "price_sale") {
            const defaultVal = (data?.[rowIndex] as any)?.["price_sale"];
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <Input type="number" name={`${name}[${rowIndex}][price_sale]`} placeholder={col.header} defaultValue={defaultVal} value={priceSale[rowIndex]} onChange={(e)=> setPriceSale(prev => { const n = [...prev]; n[rowIndex] = e.target.value; return n; })} />
                </TableCell>
            )
        }

        if (col.field === "quantity") {
            const defaultVal = (data?.[rowIndex] as any)?.["quantity"];
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <div className="flex gap-1">
                        <Input type="number" name={`${name}[${rowIndex}][quantity]`} placeholder="0" defaultValue={defaultVal} value={quantity[rowIndex]} onChange={(e)=> setQuantity(prev => { const n = [...prev]; n[rowIndex] = e.target.value; return n; })} />
                        <span className="text-gray-500">pcs</span>
                    </div>
                </TableCell>
            );
        }
        
        if (col.id === "price_subtotal_sale") {

            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`}>
                    <Input disabled placeholder="0.00" type="number" value={priceSubtotalSale[rowIndex]} style={{color: priceSubtotalSale[rowIndex]==0? "black": priceSubtotalSale[rowIndex]>0? "green" : "red"}} />
                </TableCell>
            );
        }

        if (col.type === "file") {
            const hasImage = (data && data?.[rowIndex]?.image_1920) || imagePreviewsFromFile[`${rowIndex}`];
            // Ensure the ref array is long enough
            if (!fileInputRefs.current[rowIndex]) fileInputRefs.current[rowIndex] = null;

            // Remove image handler
            const handleRemoveImage = (e: React.MouseEvent) => {
                e.stopPropagation();
                setImagePreviewsFromFile(prev => {
                    const updated = { ...prev };
                    delete updated[`${rowIndex}`];
                    return updated;
                });
                // Reset file input value
                if (fileInputRefs.current[rowIndex]) {
                    fileInputRefs.current[rowIndex]!.value = "";
                }
            };

            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <div className="relative w-24 h-24 group">
                        {hasImage ? (
                            <>
                                <img
                                    src={data && data?.[rowIndex]?.image_1920 ? `data:image/png;base64,${data?.[rowIndex]?.image_1920}` : imagePreviewsFromFile[`${rowIndex}`]}
                                    alt="prd"
                                    className="w-full h-full object-cover rounded-md"
                                />
                                {/* Remove image button */}
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow cursor-pointer hover:bg-red-100 z-20 border border-gray-200"
                                    title="Remove image"
                                >
                                    <Trash size={16} className="text-red-500" />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full border-2 border-dashed rounded-md bg-gray-50 flex flex-col items-center justify-center text-gray-500">
                                <Image size={20} />
                                <span className="text-xs text-center mt-1">Paste or<br/>.</span>
                            </div>
                        )}
                        {/* Upload button */}
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
                            ref={el => { fileInputRefs.current[rowIndex] = el }}
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
            const defaultVal = field === "product_name" ? data?.[rowIndex]?.product_id?.[1] : (data?.[rowIndex] as any)?.[field];
            // if (field === "quantity") {
            //     return (
            //         <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
            //             <div className="flex gap-1">
            //                 <Input type="number" name={`${name}[${rowIndex}][${field}]`} placeholder="0" defaultValue={defaultVal} value={quantity} onChange={(e)=> setQuantity(e.target.value)} />
            //                 <span className="text-gray-500">pcs</span>
            //             </div>
            //         </TableCell>
            //     );
            // }

            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`} onClick={onClick}>
                    <Input name={`${name}[${rowIndex}][${field}]`} placeholder={col.header} defaultValue={defaultVal} />
                </TableCell>
            );
        }

        if (col.type === "calculated") {
            return (
                <TableCell className="border" key={`${rowIndex}-${col.id}`}>
                    <Input disabled placeholder="0.00" type="number" />
                </TableCell>
            );
        }
        
        // if (col.type === "number") {
        //     return (
        //         <TableCell className="border" key={`${rowIndex}-${col.id}`}>
        //             <Input placeholder="0.00" type="number" />
        //         </TableCell>
        //     );
        // }

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
            setRowCount(Array.from({ length: data.length }, (_, i) => i));

            // Initialize input arrays from incoming data to avoid extra re-renders later
            setQuantity(Array.from({ length: data.length }, (_, i) => String((data[i] as any)?.quantity ?? "")));
            setPriceCost(Array.from({ length: data.length }, (_, i) => String((data[i] as any)?.price_cost ?? "")));
            setPriceSale(Array.from({ length: data.length }, (_, i) => String((data[i] as any)?.price_sale ?? "")));

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
                        {columns.map((col) => (
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
                    {rowCount.map((_, i) => (
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
