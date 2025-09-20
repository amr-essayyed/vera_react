import { createContext, useContext, useState, type ReactNode } from 'react';

interface BreadcrumbContextType {
	resourceData: any;
	setResourceData: (data: any) => void;
	customBreadcrumbs: Array<{ label: string; href?: string }>;
	setCustomBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
	const [resourceData, setResourceData] = useState<any>(null);
	const [customBreadcrumbs, setCustomBreadcrumbs] = useState<Array<{ label: string; href?: string }>>([]);

	return (
		<BreadcrumbContext.Provider value={{
			resourceData,
			setResourceData,
			customBreadcrumbs,
			setCustomBreadcrumbs
		}}>
			{children}
		</BreadcrumbContext.Provider>
	);
}

export function useBreadcrumbContext() {
	const context = useContext(BreadcrumbContext);
	if (context === undefined) {
		throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
	}
	return context;
}