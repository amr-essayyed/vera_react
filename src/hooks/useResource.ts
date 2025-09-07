import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResourceService } from "../services/resourceService";
import type { ResourceData } from "../types/resourceData";

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

// function useCreateResource<T>(resourceName: string, resourceInstance: T){
function useCreateResource(resourceName: string){
    const queryClient = useQueryClient();
    return useMutation<any,Error,ResourceData,unknown>({
        mutationFn: (resourceData)=>ResourceService.create(resourceData.resourceName, resourceData.resourceInstance),
        onSuccess: (data) => {console.log(data); queryClient.invalidateQueries({queryKey: [resourceName]})},
    })
}

export {
    useAllResource,
    useResourceByProp,
    useCreateResource,
};