import { useAllResource } from "@/hooks/useResource"
import LoadingSubPage from "./LoadingSubPage";
import type { WithId } from "@/types/withId";

// import { type MasterOrder } from "@/types/masterOrder";
// import MasterOrderCard from "./MasterOrderCard";



type ResourceListProps = {
  ResourceCard: React.ComponentType<any>;
  resourceName: string;
};

export default function ResourceList<T extends WithId>({
  ResourceCard,
  resourceName,
}: ResourceListProps) {
    const {data, isLoading} = useAllResource(resourceName);
    
    if(isLoading) return <LoadingSubPage />

    return (
            <div className="flex flex-col gap-4">
                {data.map((item: T)=> {
                    const props = { [resourceName]: item };
                    return <ResourceCard {...props} key={item.id} />
                } )}
            </div>
    )
}
