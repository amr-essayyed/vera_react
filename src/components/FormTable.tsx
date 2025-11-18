import { useState } from 'react';
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { Button } from './ui/button';

type props = {fields: string []};

export default function FormTable({fields}: props) {
    const [tableRows, setTableRows] = useState([]);

    const tableRow = (i:number) => 
        (<tr>
            { fields.map( (field) => <td key={field}><Input type="text" name={`invoice_line_ids[${i}][${field}]`} className={cn(false && "border-red-500")}/></td> )}
        </tr>);

    function addTableRow () {
        const tableRowsTemp = [...tableRows];
        tableRowsTemp.push(tableRow(tableRows.length) as never)        
        setTableRows(tableRowsTemp);
    }
    
    function removeTableRow () {
        const tableRowsTemp = [...tableRows];
        tableRowsTemp.pop()        
        setTableRows(tableRowsTemp);
    }

    return (
        <>
            <table>
                <thead>
                    <tr>{ fields.map( (field) => <th key={field}>{field}</th> )}</tr>
                </thead>
                <tbody>
                    {...tableRows}
                </tbody>
            </table>

            <div className='flex gap-6'>
                <Button type='button' onClick={addTableRow}>add row</Button>
                <Button type='button' onClick={removeTableRow} variant={'destructive'}>remove row</Button>
            </div>
        </>
    )
}

