import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatter"

interface SalesOrderLinesTabProps {
    lines: any[]
}

export const SalesOrderLinesTab = ({ lines }: SalesOrderLinesTabProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Lines</CardTitle>
            </CardHeader>
            <CardContent>
                {lines.length ? (
                    <div className="overflow-x-auto">
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
                                    <tr key={line.id} className="border-b">
                                        <td>{line.name}</td>
                                        <td className="text-right">{line.product_uom_qty}</td>
                                        <td className="text-right">{formatCurrency(line.price_unit)}</td>
                                        <td className="text-right font-semibold">
                                            {formatCurrency(line.price_subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-6">No order lines</p>
                )}
            </CardContent>
        </Card>
    )
}
