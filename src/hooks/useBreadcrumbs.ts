import { useLocation, useParams } from "react-router-dom";
import { useMemo } from "react";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	isCurrentPage?: boolean;
}

interface RouteConfig {
	pattern: string;
	label: string | ((params: any, resourceData?: any) => string);
	parent?: string;
	resourceType?: string; // For fetching additional context
}

// Route configuration mapping
const routeConfigs: RouteConfig[] = [
	{ pattern: '/dashboard', label: 'Dashboard' },
	{ pattern: '/posts', label: 'Posts' },
	{ pattern: '/master-orders', label: 'Master Orders' },
	{ pattern: '/master-orders/create', label: 'Create Master Order', parent: '/master-orders' },
	{ 
		pattern: '/master-orders/:id', 
		label: (params, resourceData) => {
			// If we have resource data, use the actual name, otherwise fallback to ID
			return resourceData?.name || `Master Order #${params.id}`;
		}, 
		parent: '/master-orders',
		resourceType: 'masterOrder'
	},
	{ pattern: '/purchase-orders', label: 'Purchase Orders' },
	{ pattern: '/purchase-orders/create', label: 'Create Purchase Order', parent: '/purchase-orders' },
	{ 
		pattern: '/purchase-orders/:id', 
		label: (params, resourceData) => {
			return resourceData?.name || `Purchase Order #${params.id}`;
		}, 
		parent: '/purchase-orders',
		resourceType: 'purchaseOrder'
	},
];

export function useBreadcrumbs(resourceData?: any) {
	const location = useLocation();
	const params = useParams();

	const breadcrumbs = useMemo(() => {
		const items: BreadcrumbItem[] = [];
		const currentPath = location.pathname;

		// Always start with Dashboard if not already there
		if (currentPath !== '/dashboard') {
			items.push({ label: 'Dashboard', href: '/dashboard' });
		}

		// Find matching route config
		const matchedConfig = routeConfigs.find(config => {
			if (config.pattern.includes(':')) {
				// Handle dynamic routes
				const pattern = config.pattern.replace(/:[\w]+/g, '[^/]+');
				const regex = new RegExp(`^${pattern}$`);
				return regex.test(currentPath);
			}
			return config.pattern === currentPath;
		});

		if (matchedConfig) {
			// Add parent breadcrumbs if they exist
			if (matchedConfig.parent) {
				const parentConfig = routeConfigs.find(config => config.pattern === matchedConfig.parent);
				if (parentConfig) {
					const parentLabel = typeof parentConfig.label === 'function' 
						? parentConfig.label(params) 
						: parentConfig.label;
					items.push({ 
						label: parentLabel, 
						href: matchedConfig.parent 
					});
				}
			}

			// Add current page
			const currentLabel = typeof matchedConfig.label === 'function' 
				? matchedConfig.label(params, resourceData) 
				: matchedConfig.label;
			
			items.push({ 
				label: currentLabel, 
				isCurrentPage: true 
			});
		} else {
			// Fallback for unmatched routes
			const segments = currentPath.split('/').filter(Boolean);
			if (segments.length > 0) {
				items.push({ 
					label: segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
					isCurrentPage: true 
				});
			}
		}

		return items;
	}, [location.pathname, params, resourceData]);

	return breadcrumbs;
}

// Helper function to get the resource type for current route
export function getCurrentRouteResourceType(pathname: string): string | null {
	const matchedConfig = routeConfigs.find(config => {
		if (config.pattern.includes(':')) {
			const pattern = config.pattern.replace(/:[\w]+/g, '[^/]+');
			const regex = new RegExp(`^${pattern}$`);
			return regex.test(pathname);
		}
		return config.pattern === pathname;
	});

	return matchedConfig?.resourceType || null;
}