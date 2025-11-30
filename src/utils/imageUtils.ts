/**
 * Utility functions for handling Odoo images
 */

import { BASE_URL } from "@/services/apiClient";

// Get the base URL for Odoo - using the same base as API but without /api
const ODOO_BASE_URL = BASE_URL; // Adjust this to your Odoo server URL

/**
 * Generate image URL for Odoo records
 * @param model - The Odoo model name (e.g., 'product.template')
 * @param recordId - The record ID
 * @param fieldName - The image field name (e.g., 'image_1920', 'image_512', 'image_256')
 * @returns Complete image URL
 */
export function getOdooImageUrl(model: string, recordId: number | string, fieldName: string = 'image_1920'): string {
  return `${ODOO_BASE_URL}/web/image/${model}/${recordId}/${fieldName}`;
}

/**
 * Generate product image URL
 * @param productId - The product ID
 * @param size - Image size ('1920', '512', '256', '128')
 * @returns Product image URL
 */
export function getProductImageUrl(productId: number | string, size: string = '1920'): string {
  return getOdooImageUrl('product.template', productId, `image_${size}`);
}

/**
 * Generate partner (client/vendor) avatar URL
 * @param partnerId - The partner ID
 * @param size - Image size ('1024', '512', '256', '128')
 * @returns Partner avatar URL
 */
export function getPartnerAvatarUrl(partnerId: number | string, size: string = '1024'): string {
  return getOdooImageUrl('res.partner', partnerId, `avatar_${size}`);
}

/**
 * Check if an image exists by trying to load it
 * @param imageUrl - The image URL to check
 * @returns Promise that resolves to true if image exists, false otherwise
 */
export function checkImageExists(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}

export function imageToBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		// reader.onload = () => resolve((reader.result as string).split(",")[1]); // strip prefix
		reader.onload = () => resolve(reader.result as string); // strip prefix
		reader.onerror = reject;
	});
}
