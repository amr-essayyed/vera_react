import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { addColumn, addLine, completeTableTobe, removeColumn, removeLine, setCellValue } from '@/state/masterOrder/masterOrderLinesSlice';
import type { RootState } from '@/state/store';
import { Trash, Upload } from 'lucide-react';
import type React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function MasterOrderLineTableContr() {
    // Hooks
    const dispatch = useDispatch();

    // States
    const table = useSelector((state: RootState) => state.masterOrderLines.value);
    const numberOfRows = table.length - 1;
    const numberOfColumns = table[0].length;
    const numberOfCustomColumns = (table[0].length)-6;
    
    const handlePaste = (e: React.ClipboardEvent<HTMLTableCellElement>, r: number, c: number) => {
        e.preventDefault();
        const textRaw = e.clipboardData.getData("text");
        const text = textRaw
            .replace(/\r/g, '')                               // remove carriage return only
            .replace(/\u00A0/g, ' ')                          // non-breaking space
            .replace(/[\u200B-\u200D\uFEFF]/g, '')            // zero-width chars
            .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // control chars except \t (0x09) and \n (0x0A)

        console.log("text");
        console.log(text);
        
        var pastedTable = []
        const lines = text.split('\n');
        for(let line of lines) {
            pastedTable.push(line.split("\t"));
        }
        console.log("arr");
        console.log(pastedTable);
        
        if(pastedTable.length > table.length) {
            dispatch(completeTableTobe(pastedTable.length))
        }
        for(let i=0; i<pastedTable.length; i++) {
            for(let j=0; j<numberOfColumns-c; j++) {
                console.log(pastedTable[i][j]);
                
                dispatch(setCellValue({row: r+1+i, col: c+j, value: pastedTable[i][j] }))
            }
        }
        
    };


    const handlePasteImage = (e: React.ClipboardEvent<HTMLInputElement>, r: number, c: number) => {
        e.preventDefault();

        const items = e.clipboardData.items;
        if(items.length > table.length) {
            dispatch(completeTableTobe(items.length))
        }
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.kind === "string") {
                item.getAsString((str) => {
                    const imgMatch = str.match(/<img[^>]+src="([^"]+)"/);
                    if(imgMatch){
                        const base64 = imgMatch[1]; // the Base64 data URL
                        dispatch(setCellValue({row: r+1+i, col: c, value: base64 }))
                    } 
                });
            }

            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file){
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = ()=> dispatch(setCellValue({row: r+1+i, col: c, value: reader.result }))
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

    const textCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}><Input  type='text' value={table[r+1][c] || ''} onChange={(e) => dispatch(setCellValue({row: r+1, col: c, value: e.target.value }))} ></Input></TableCell>;
    const numberCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border" onPaste={(e)=>handlePaste(e,r,c)}><Input  type='number' value={table[r+1][c]|| ''} onChange={(e) => dispatch(setCellValue({row: r+1, col: c, value: e.target.value }))}></Input></TableCell>;
    const imageCell = (r: number,c: number) => <TableCell key={`${r}${c}`} className="border"><Upload className="w-6 h-6 text-gray-500 absolute cursor-pointer" /><Input  type='file' accept='image/*' onPaste={(e)=>handlePasteImage(e,r,c)} className='w-6 h-6 float-left absolute cursor-pointer opacity-0' onChange={(e)=>handleImageChange(e,r,c)}></Input><img src={table[r+1][c]||undefined} className='max-w-20 max-h-20' /></TableCell>;

    const tableRow =(k: number) => ( 
        <TableRow key={k}>
            <TableCell>{k}</TableCell>
            {imageCell(k,0)}
            {textCell(k,1)}
            {textCell(k,2)}
            {numberCell(k,3)}
            {numberCell(k,4)}
            <TableCell></TableCell>
            {[...Array(numberOfCustomColumns)].map((_,i)=>(textCell(k,i+6)))}
            <TableCell className="border"><Button type="button" variant="destructive" onClick={() => dispatch(removeLine(k+1))}><Trash /></Button></TableCell>
        </TableRow>
    )

    return (
        <>
        {/* Buttons */}
        <div className="flex justify-end gap-3 mb-3">
            <Button type="button" onClick={()=>dispatch(addLine())}>+ Add Line</Button>
            <Button type="button" onClick={()=>dispatch(addColumn("Custom"))}>+ Add Column</Button>
            <Button type="button" onClick={()=>console.log("value: ", table)}>Show me Value</Button>
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
                <TableHead className="border">Subtotal</TableHead>
                {table?.[0].slice(6).map((columnName:string, i: number)=>(
                <TableHead key={`columnName${i}`} className="border">
                        <div className='flex justify-between items-center'>
                            <Input value={columnName} onChange={(e)=>dispatch(setCellValue({row: 0, col: 6+i, value: e.target.value}))} className='flex-' />
                            <Button type='button' variant="ghost" onClick={()=>dispatch(removeColumn(6+i))} className='cursor-pointer hover:text-red-500'>x</Button>
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
