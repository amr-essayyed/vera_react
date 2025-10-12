// AppProductSelect.tsx (Conceptual)
import { useController, type UseFormReturn } from 'react-hook-form';
// import your UI components (Combobox, Select, Button)

interface AppProductSelectProps {
    control: UseFormReturn<any>['control'];
    name: string; // Should be the 'product_id' field name
    productsState: any;
    onSelectCreateNew: () => void;
    displayField: string;
}

const AppProductSelect = ({ control, name, productsState, onSelectCreateNew, displayField }: AppProductSelectProps) => {
    const { field } = useController({ control, name });

    const products = productsState.data || [];

    // Combine products and a "Create New" option
    const options = [
        ...products.map((p: any) => ({ label: p[displayField], value: p.id })),
        { label: "✨ Create and Edit...", value: "NEW_PRODUCT_SENTINEL" }
    ];

    const handleChange = (selectedValue: any) => {
        if (selectedValue === "NEW_PRODUCT_SENTINEL") {
            // Trigger the modal opener function
            onSelectCreateNew();
        } else {
            // Standard product selection
            field.onChange(selectedValue);


        }
    };

    return (
        // RENDER YOUR CUSTOM SELECT COMPONENT HERE
        <select value={field.value || ""} onChange={(e) => handleChange(Number(e.target.value) || e.target.value)}>
            <option value="">Select a Product</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
export default AppProductSelect;