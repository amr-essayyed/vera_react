import { Button } from "./ui/button";
import { Link } from "react-router-dom";

type ResourceRowProps = {
  item: any;
  resourceName: string;
  fields: string[];
};

export default function ResourceRow({ item, resourceName, fields }: ResourceRowProps) {
    const formatValue = (value: any, field: string) => {
        if (value === null || value === undefined) return '-';
        
        // Format currency fields
        if (field.includes('amount') || field.includes('price')) {
            return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
        }
        
        // Format date fields
        if (field.includes('date')) {
            return value ? new Date(value).toLocaleDateString() : '-';
        }
        
        // Format boolean fields
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        
        return value.toString();
    };

    return (
        <tr className="hover:bg-gray-50">
            {fields.map((field) => (
                <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatValue(item[field], field)}
                </td>
            ))}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <Button variant="ghost" size="sm">
                    <Link to={`/${resourceName}s/${item.id}`}>View</Link>
                </Button>
            </td>
        </tr>
    );
}