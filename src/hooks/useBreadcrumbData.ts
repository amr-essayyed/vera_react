import { useEffect } from 'react';
import { useBreadcrumbContext } from '@/contexts/BreadcrumbContext';

/**
 * Hook for pages to contribute data to breadcrumbs
 * This allows pages to set resource data that will be used in breadcrumb labels
 */
export function useBreadcrumbData(data: any) {
	const { setResourceData } = useBreadcrumbContext();

	useEffect(() => {
		if (data) {
			setResourceData(data);
		}
		
		// Cleanup when component unmounts
		return () => {
			setResourceData(null);
		};
	}, [data, setResourceData]);
}

/**
 * Hook for pages to set custom breadcrumb segments
 * Useful for complex nested pages or when you need full control
 */
export function useCustomBreadcrumbs(breadcrumbs: Array<{ label: string; href?: string }>) {
	const { setCustomBreadcrumbs } = useBreadcrumbContext();

	useEffect(() => {
		setCustomBreadcrumbs(breadcrumbs);
		
		// Cleanup when component unmounts
		return () => {
			setCustomBreadcrumbs([]);
		};
	}, [breadcrumbs, setCustomBreadcrumbs]);
}