import SaleOrderItemsTable from "@/components/saleOrderLineItemTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatter"
import type { UseFormReturn } from "react-hook-form"

interface SalesOrderLinesTabProps {
  lines: any[],
  isEditable?: boolean
  isEditableForm?: boolean
  orderLineState: any
  saleOrderId: number
  form: UseFormReturn<any>
  onreferesh?: () => Promise<void>
}


interface ILine {
  id: number,
  name: string,
  product_uom_qty: number,
  price_unit: number,
  price_subtotal: number,
  isEditable: boolean,
  form: UseFormReturn<any>
  productsState: any
  saleOrderid: number
  onreferesh?: () => Promise<void>
}

export const SalesOrderLinesTab = ({ lines, isEditable, isEditableForm, form, orderLineState, saleOrderId, onreferesh }: SalesOrderLinesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Lines</CardTitle>
      </CardHeader>
      <CardContent>
        {lines.length ? (
          (isEditable && isEditableForm) ? (
            <SaleOrderItemsTable
              form={form}
              isLoading
              productsState={orderLineState}
              salesOrder={saleOrderId}
              onreferesh={onreferesh}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(line => (
                  <RowData form={form} key={line.id} {...line} />
                ))}
              </tbody>
            </table>
          )
        ) : (
          <p className="text-center text-gray-500 py-6">No order lines</p>
        )}

      </CardContent>
    </Card>
  )
}



const RowData = ({ onreferesh, id, name, product_uom_qty, price_unit, price_subtotal, isEditable, form, productsState, saleOrderid }: ILine) => {
  return (<tr key={id} className="border-b">
    <td>{name}</td>
    <td className="text-right">{product_uom_qty}</td>
    <td className="text-right">{formatCurrency(price_unit)}</td>
    <td className="text-right font-semibold">
      {formatCurrency(price_subtotal)}
    </td>
  </tr>)
}
