/**
 * Utility function to extract name from relational field (client_id, vendor_id, etc.)
 * @param relationField - Can be a string, number, boolean, or array [id, name]
 * @returns The name or null
 */
export function getRelationName(relationField: string | number | boolean | [number, string] | undefined): string | null {
  if (!relationField || relationField === false) return null;
  
  // If it's an array (Odoo format), return the name (second element)
  if (Array.isArray(relationField)) {
    return relationField[1] || null;
  }
  
  // If it's a string or number, return as is (fallback)
  return String(relationField);
}

/**
 * Utility function to extract client name from client_id field
 * @param clientId - Can be a string, number, or array [id, name]
 * @returns The client name or null
 */
export function getClientName(clientId: string | number | [number, string] | undefined): string | null {
  return getRelationName(clientId);
}

/**
 * Custom hook to get client name from client_id
 * Since the API already returns client name in the client_id array, no additional fetch needed
 * @param clientId - The client ID field from the API
 * @returns Object with client name (no loading state needed)
 */
export function useClientName(clientId: string | number | [number, string] | undefined) {
  const clientName = getClientName(clientId);
  
  return {
    clientName,
    isLoading: false, // No API call needed
    error: null,
    clientData: Array.isArray(clientId) ? { id: clientId[0], name: clientId[1] } : null
  };
}

/**
 * Custom hook to get vendor name from vendor_id
 * Since the API already returns vendor name in the vendor_id array, no additional fetch needed
 * @param vendorId - The vendor ID field from the API
 * @returns Object with vendor name (no loading state needed)
 */
export function useVendorName(vendorId: string | number | boolean | [number, string] | undefined) {
  const vendorName = getRelationName(vendorId);
  
  return {
    vendorName,
    isLoading: false, // No API call needed
    error: null,
    vendorData: Array.isArray(vendorId) ? { id: vendorId[0], name: vendorId[1] } : null
  };
}