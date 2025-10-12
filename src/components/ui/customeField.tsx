import { Input } from "./input";

export function CustomerField({
  values,
  onChange,
}: {
  values: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-col">
      <label className="text-sm font-medium text-gray-700 select-none">
        Taxes
      </label>

      <Input
        list="tax-options"
        type="number"
        step="0.01"
        min="0"
        value={values}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="mt-1 w-28"
      />

      <datalist className="bg-amber-50" id="tax-options">
        <option value="5" />
        <option value="60" />
        <option value="15" />
      </datalist>
    </div>
  );
}
