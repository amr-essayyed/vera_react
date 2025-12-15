import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllResource } from '@/hooks/useResource';
import { cn } from '@/lib/utils';
import { addColumn, addLine, completeTableTobe, removeColumn, removeLine, setCellValue } from '@/state/masterOrder/masterOrderLinesSlice';
import type { RootState } from '@/state/store';
import type { Contact } from '@/types/contact';
import { CheckIcon, ChevronsUpDownIcon, FileSpreadsheet, Trash, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseGoogleSheetsClipboard } from '../utils/parseGoogleSheetsClipboard';
import { FieldError } from '@/components/ui/field';
import ExcelJS from 'exceljs';

export default function MasterOrderLineTableContr({errors}:any) {
    // Hooks
    const dispatch = useDispatch();

    // States
    const table = useSelector((state: RootState) => state.masterOrderLines.value);
    const {data: contacts}= useAllResource('contact')    
    const numberOfRows = table.length - 1;
    const numberOfColumns = table[0].length;
    const numberOfBaseColumns =8;
    const numberOfCustomColumns = (table[0].length)-numberOfBaseColumns;
    const [open, setOpen] = useState<number | null>(null)

    // Computes
    const subtotals = table.slice(1).map((row)=> ((Number(row[3])||0) * (Number(row[5])||0)) )
    
    const handlePaste = async (e: React.ClipboardEvent<HTMLTableCellElement>, r: number, c: number) => {
        e.preventDefault();
        const textRaw = e.clipboardData.getData("text");
        const text = textRaw
            .replace(/\r/g, '')                               // remove carriage return only
            .replace(/\u00A0/g, ' ')                          // non-breaking space
            .replace(/[\u200B-\u200D\uFEFF]/g, '')            // zero-width chars
            .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // control chars except \t (0x09) and \n (0x0A)

        console.log("text");
        console.log(text);
        
        var pastedTable = await parseGoogleSheetsClipboard(e);
        // var pastedTable = []
        // const lines = text.split('\n');
        // for(let line of lines) {
        //     pastedTable.push(line.split("\t"));
        // }
        console.log("pastedTable");
        console.log(pastedTable);
        
        if(pastedTable.length+r > table.length-1) {
            dispatch(completeTableTobe(pastedTable.length+r))
        }
        for(let i=0; i<pastedTable.length; i++) {
            for(let j=0; j<numberOfColumns-c; j++) {
                // console.log(i, j);
                // console.log(pastedTable[i][j]);
                let pastedValue = pastedTable[i][j];
                if(pastedTable[i][j]){
                    if(table[0][c+j] === 'number') {                        
                        pastedValue = pastedTable[i][j].replace(/[^0-9.-]/g, '').replace(/\.(?=.*\.)/, '').replace(/(?!^)-/g, '')
                    }
                    dispatch(setCellValue({row: r+1+i, col: c+j, value: pastedValue}))
                }
            }
        }
        
    };


    const handlePasteImage = (e: React.ClipboardEvent<HTMLInputElement>, r: number, c: number) => {
        e.preventDefault();
        console.log("item");

        const items = e.clipboardData.items;
        if(items.length > table.length) {
            dispatch(completeTableTobe(items.length))
        }
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(item);
            

            if (item.kind === "string") {
                item.getAsString((str) => {
                    const imgMatch = str.match(/<img[^>]+src="([^"]+)"/);
                    if(imgMatch){
                        const base64 = imgMatch[1]; // the Base64 data URL
                        dispatch(setCellValue({row: r+1+i, col: c, value: base64 }));
                    } 
                });
            }

            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file){
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = ()=> dispatch(setCellValue({row: r+1+i, col: c, value: reader.result }));
                }
            }
        }

        // method 1 to access image file
        // const cbItems = e.clipboardData.items;
        // const ImageFile1 = cbItems[0].getAsFile();
        
        // // method 2
        // const cbFiles = e.clipboardData.files;
        // const imageFile = cbFiles[0];
        // const imageUrl = URL.createObjectURL(imageFile)

        // // method 1 of storge: store as a URL
        // dispatch(setCellValue({row: r+1, col: c, value: imageUrl }))
        
        // // method 2 of storge: store as a base64 string
        // const reader = new FileReader();
        // reader.readAsDataURL(imageFile);
        // reader.onload = ()=> dispatch(setCellValue({row: r+1, col: c, value: reader.result }))

    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, r: number, c: number) => {
        const files = e.target.files
        if (files) {
            const imageFile = files[0]
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = ()=> dispatch(setCellValue({row: r+1, col: c, value: reader.result }))
        }
    }

    const textCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}><Input  type='text' value={table[r+1][c] || ''} onChange={(e) => dispatch(setCellValue({row: r+1, col: c, value: e.target.value || '' }))}></Input></TableCell>;
    const prodcutNameCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}><Input  type='text' value={table[r+1][c] || ''} onChange={(e) => dispatch(setCellValue({row: r+1, col: c, value: e.target.value || '' }))} className={cn(`w-[180px]`, errors?.[r]?.product_name?._errors?.[0] && "border-red-500")} /><FieldError>{errors?.[r]?.product_name?._errors?.[0]}</FieldError></TableCell>;
    const descriptionCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}><Input  type='text' value={table[r+1][c] || ''} onChange={(e) => dispatch(setCellValue({row: r+1, col: c, value: e.target.value || '' }))} className={cn(`w-[180px]`, errors?.[r]?.name?._errors?.[0] && "border-red-500")} /><FieldError>{errors?.[r]?.name?._errors?.[0]}</FieldError></TableCell>;
    const numberCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}><Input  type='number' value={table[r+1][c]===undefined || table[r+1][c] === '' ?'':table[r+1][c]} onChange={(e) => dispatch(setCellValue({row: r+1, col: c, value: e.target.value || '' }))} /></TableCell>;
    const imageCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border"><Upload className="w-6 h-6 text-gray-500 absolute cursor-pointer" /><Input  type='file' accept='image/*' onPaste={(e)=>handlePasteImage(e,r,c)} className='w-6 h-6 float-left absolute cursor-pointer opacity-0' onChange={(e)=>handleImageChange(e,r,c)}></Input><img src={table[r+1][c]||undefined} className='max-w-20 max-h-20' /></TableCell>;
    const selectCell = (r: number,c: number) => (
        <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}>
            <Popover open={open === r} onOpenChange={(isOpen) => setOpen(isOpen ? r : null)}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open === r}
                        className="w-[200px] justify-between"
                    >
                    {table[r+1][c]
                        ? contacts && contacts.find((contact: Contact) => String(contact.id) === table[r+1][c])?.name
                        : "Select Vendor..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search Vendor..." />
                        <CommandList>
                            <CommandEmpty>No Vendor found.</CommandEmpty>
                            <CommandGroup>
                                {contacts && contacts.map((contact: Contact) => (
                                    <CommandItem
                                        key={contact.id}
                                        value={contact.name}   // 👈 searchable name
                                        onSelect={() => {
                                            dispatch(setCellValue({row: r+1, col: c, value: String(contact.id ||'') }))
                                            setOpen(null)
                                        }}
                                    >
                                        <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            table[r+1][c] === String(contact.id) ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {contact.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </TableCell>
    );

    const tableRow =(k: number) => ( 
        <TableRow key={k}>
            <TableCell>{k+1}</TableCell>
            {imageCell(k,0)}
            {prodcutNameCell(k,1)}
            {descriptionCell(k,2)}
            {numberCell(k,3)}
            {numberCell(k,4)}
            {numberCell(k,5)}
            {selectCell(k,6)}
            {/* sales subtotal */}
            <TableCell>{subtotals[k]}</TableCell>
            {[...Array(numberOfCustomColumns)].map((_,i)=>(textCell(k,i+numberOfBaseColumns)))}
            <TableCell className="border"><Button type="button" variant="destructive" onClick={() => dispatch(removeLine(k+1))}><Trash /></Button></TableCell>
        </TableRow>
    )

    // Helper function to process base64 images for Excel
    const processImageForExcel = (base64String: string): ArrayBuffer | null => {
        try {
            if (!base64String || !base64String.startsWith('data:image/')) {
                return null;
            }
            
            // Extract the base64 data (remove the data:image/...;base64, prefix)
            const base64Data = base64String.split(',')[1];
            if (!base64Data) return null;
            
            // Convert base64 to ArrayBuffer
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        } catch (error) {
            console.error('Error processing image:', error);
            return null;
        }
    }

    // Helper function to get image extension from base64 string
    const getImageExtension = (base64String: string): 'png' | 'jpeg' | 'gif' => {
        if (base64String.includes('data:image/png')) return 'png';
        if (base64String.includes('data:image/jpeg') || base64String.includes('data:image/jpg')) return 'jpeg';
        if (base64String.includes('data:image/gif')) return 'gif';
        return 'png'; // default
    }

    const handleExport = async () => {
        try {
            // Create a new workbook using ExcelJS
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Master Order Lines');
            
            // Define headers
            const headers = [
                '#', 'Image', 'Product Name', 'Description', 'Qty', 
                'Unit Price', 'Sale Price', 'Vendor', 'Subtotal',
                ...table[0].slice(numberOfBaseColumns)
            ];
            
            // Add header row
            const headerRow = worksheet.addRow(headers);
            
            // Style header row
            headerRow.eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF3F4F6' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });
            
            // Set column widths
            worksheet.columns = [
                { width: 5 },   // #
                { width: 15 },  // Image
                { width: 20 },  // Product Name
                { width: 25 },  // Description
                { width: 8 },   // Qty
                { width: 12 },  // Unit Price
                { width: 12 },  // Sale Price
                { width: 20 },  // Vendor
                { width: 12 },  // Subtotal
                ...Array(numberOfCustomColumns).fill({ width: 15 })
            ];
            
            // Add data rows with images
            for (let i = 0; i < numberOfRows; i++) {
                const rowData = [];
                
                // Row number
                rowData.push(i + 1);
                
                // Image placeholder (we'll add the actual image after)
                rowData.push('');
                
                // Product name
                rowData.push(table[i + 1][1] || '');
                
                // Description
                rowData.push(table[i + 1][2] || '');
                
                // Qty (convert to number if possible)
                const qty = table[i + 1][3];
                rowData.push(qty && !isNaN(Number(qty)) ? Number(qty) : qty || '');
                
                // Unit Price (convert to number if possible)
                const unitPrice = table[i + 1][4];
                rowData.push(unitPrice && !isNaN(Number(unitPrice)) ? Number(unitPrice) : unitPrice || '');
                
                // Sale Price (convert to number if possible)
                const salePrice = table[i + 1][5];
                rowData.push(salePrice && !isNaN(Number(salePrice)) ? Number(salePrice) : salePrice || '');
                
                // Vendor - convert ID to name if possible
                const vendorId = table[i + 1][6];
                const vendor = contacts?.find((contact: Contact) => String(contact.id) === vendorId);
                rowData.push(vendor ? vendor.name : vendorId || '');
                
                // Subtotal (calculated)
                rowData.push(subtotals[i] || 0);
                
                // Custom columns
                for (let j = numberOfBaseColumns; j < table[0].length; j++) {
                    rowData.push(table[i + 1][j] || '');
                }
                
                // Add the row
                const excelRow = worksheet.addRow(rowData);
                
                // Set row height to accommodate images
                excelRow.height = 60;
                
                // Style data cells with borders
                excelRow.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { vertical: 'middle' };
                });
                
                // Handle image embedding
                const imageData = table[i + 1][0];
                if (imageData && imageData.startsWith('data:image/')) {
                    try {
                        const imageBuffer = processImageForExcel(imageData);
                        if (imageBuffer) {
                            const imageExtension = getImageExtension(imageData);
                            
                            // Add image to workbook
                            const imageId = workbook.addImage({
                                buffer: imageBuffer,
                                extension: imageExtension,
                            });
                            
                            // Add image to worksheet at the specific cell
                            worksheet.addImage(imageId, {
                                tl: { col: 1, row: i + 1 }, // Image column (B), data row
                                ext: { width: 80, height: 50 }, // Image size
                                editAs: 'oneCell'
                            });
                        }
                    } catch (imageError) {
                        console.error(`Error adding image for row ${i + 1}:`, imageError);
                        // Set a text indicator if image fails
                        excelRow.getCell(2).value = 'Image Error';
                    }
                }
            }
            
            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `master-order-lines-${dateStr}.xlsx`;
            
            // Write and download the file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log(`Excel file exported: ${filename}`);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export Excel file. Please try again.');
        }
    }

    return (
        <>
        {/* Buttons */}
        <div className="flex justify-end gap-3 mb-3">
            <Button type="button" onClick={()=>dispatch(addLine())}>+ Add Line</Button>
            <Button type="button" onClick={()=>dispatch(addColumn("Custom"))}>+ Add Column</Button>
            <Button type="button" onClick={()=>console.log("value: ", table)}>Show me Value</Button>
            <Button type="button" onClick={handleExport}><FileSpreadsheet />Export table</Button>
        </div>

        {/* Table */}
        <Table className="border" /*onPaste={handlePaste}*/>
            <TableHeader>
            <TableRow className="bg-gray-100">
                <TableHead className="border">#</TableHead>
                <TableHead className="border">Image</TableHead>
                <TableHead className="border">Product Name</TableHead>
                <TableHead className="border">Description</TableHead>
                <TableHead className="border">Qty</TableHead>
                <TableHead className="border">Unit Price</TableHead>
                <TableHead className="border">Sale Price</TableHead>
                <TableHead className="border">Vendor</TableHead>
                <TableHead className="border">Subtotal</TableHead>
                {table?.[0].slice(numberOfBaseColumns).map((columnName:string, i: number)=>(
                <TableHead key={`columnName${i}`} className="border">
                        <div className='flex justify-between items-center'>
                            <Input value={columnName} onChange={(e)=>dispatch(setCellValue({row: 0, col: numberOfBaseColumns+i, value: e.target.value}))} className='flex-' />
                            <Button type='button' variant="ghost" onClick={()=>dispatch(removeColumn(numberOfBaseColumns+i))} className='cursor-pointer hover:text-red-500'>x</Button>
                        </div>
                </TableHead>))
                }
                <TableHead className="border">Actions</TableHead>
            </TableRow>
            </TableHeader>
    
            <TableBody>
                {[...Array(numberOfRows)].map((_,i)=>tableRow(i))}
            </TableBody>
        </Table>
        </>
    )
}
