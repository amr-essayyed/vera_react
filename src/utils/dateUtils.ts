export function normalizeDateFields(formValues: Record<string, any>) {
  const result = { ...formValues };

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string" && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      // Handle datetime-local
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        result[key] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
    } 
    // else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    //   // Handle date only
    //   result[key] = `${value} 00:00:00`;
    // }
  }

  return result;
}