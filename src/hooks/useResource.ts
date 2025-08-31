import { useQuery } from "@tanstack/react-query";
import { ResourceService } from "../services/resourceService";

function useAllResource(resourceName: string){
    return useQuery({
        queryKey: [resourceName],
        queryFn: async () => await ResourceService.getAll(resourceName),
    })
}

function useResourceByProp<T>(resourceName: string, propName: string, propValue:T){
    return useQuery({
        queryKey: [resourceName, propName, propValue],
        queryFn: async () => await ResourceService.getByProp(resourceName, propName, propValue),
    })
}

export {
    useAllResource,
    useResourceByProp
};