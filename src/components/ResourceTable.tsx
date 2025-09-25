import { useAllResource } from "@/hooks/useResource";
import LoadingSubPage from "./LoadingSubPage";
import type { WithId } from "@/types/withId";

type ResourceTableProps = {
	ResourceRow: React.ComponentType<any>;
	resourceName: string;
	columns: string[];
};

export default function ResourceTable<T extends WithId>({ ResourceRow, resourceName, columns }: ResourceTableProps) {
	const { data, isLoading, error } = useAllResource(resourceName);

	if (isLoading) return <LoadingSubPage />;
	if (error) return <div className="text-red-500 p-4">Error loading data: {error.message}</div>;

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
				<thead className="bg-gray-50">
					<tr>
						{columns.map((column) => (
							<th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
								{column.replace("_", " ")}
							</th>
						))}
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200">
					{data?.length ? (
						data.map((item: T) => {
							const props = { [resourceName]: item };
							return <ResourceRow {...props} key={item.id} />;
						})
					) : (
						<tr>
							<td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
								No data available
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
