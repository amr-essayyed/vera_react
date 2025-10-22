import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";

export function useImagePasteHandler(form: UseFormReturn<any>) {
    return useCallback(async (e: React.ClipboardEvent, rowIndex: number) => {
        const items = e.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                e.preventDefault();
                const blob = item.getAsFile();
                if (!blob) return;

                const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
                form.setValue(`order_line.${rowIndex}.image`, file as any);
                break;
            }
        }
    }, [form]);
}
