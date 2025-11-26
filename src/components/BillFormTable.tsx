import React, { useState } from 'react';
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { Button } from './ui/button';
import { Select } from './ui/select';
import AppSelectField from './AppSelectField';
import { useAllResource } from '@/hooks/useResource';
import type { tr_Product } from '@/types/product';

interface Props extends React.HtmlHTMLAttributes<HTMLTableElement> {fields: string []};

export default function BillFormTable({fields}: Props) {
    const [tableRows, setTableRows] = useState([]);
    const productState = useAllResource("product")

    const tableRow = (i:number) => 
        (<tr>
            {/* <td><Input type="number" name={`invoice_line_ids[${i}][product_id]`} className={cn(false && "border-red-500")}/></td> */}
            <td>
                <AppSelectField 
                    name={`invoice_line_ids[${i}][product_id]`}
                    label="Product"
                    values={productState.data?.map((p:tr_Product)=> ({value: p.product_variant_id[0], label: p.product_variant_id[1]}) )}
                    isLoading={productState.isLoading}

                />
            </td>
            <td><Input type="number" name={`invoice_line_ids[${i}][quantity]`} className={cn(false && "border-red-500")}/></td>
            <td><Input type="number" name={`invoice_line_ids[${i}][price_unit]`} className={cn(false && "border-red-500")}/></td>
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

