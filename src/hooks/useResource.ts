import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResourceService } from "../services/resourceService";
import type { ResourceData } from "../types/resourceData";
import type { WithId } from "@/types/withId";

function useAllResource(resourceName: string){
    return useQuery({
        queryKey: [resourceName],
        queryFn: async () => await ResourceService.getAll(resourceName),
    })
}

function useResourceById<T extends WithId>(resourceName: string, idValue: string){
    console.log("id value: ", idValue);
    
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: [resourceName, idValue],
        queryFn: async () => await ResourceService.getById(resourceName,idValue),
        initialData: ()=> {
            const resourceData = queryClient.getQueryData<T[]>([resourceName]);
            const data: T | undefined = resourceData?.find((d)=> String(d.id) === String(idValue));            
            return data;
        }
    })
}

function useResourceByProp<T>(resourceName: string, propName: string, propValue:T){
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: [resourceName, propName, propValue],
        queryFn: async () => await ResourceService.getByProp(resourceName, propName, propValue),
        initialData: ()=> {
            const data = queryClient.getQueryData<any[]>([resourceName]);
            return data?.find((d)=> d[propName] === propValue)
        }
    })
}

// function useCreateResource<T>(resourceName: string, resourceInstance: T){
function useCreateResource(resourceName: string){
    const queryClient = useQueryClient();
    // return useMutation<any,Error,ResourceData,unknown>({
    return useMutation<any,Error,any,unknown>({
        mutationFn: (resourceInstance)=>ResourceService.create(resourceName, resourceInstance),
        onSuccess: (data) => {console.log(data); queryClient.invalidateQueries({queryKey: [resourceName]})},
    })
}

function useCreateMultipleResources(resourceName: string){
    const queryClient = useQueryClient();
    return useMutation<any,Error,any[],unknown>({
        mutationFn: (resourceInstances)=>ResourceService.createMultiple(resourceName, resourceInstances),
        onSuccess: (data) => {console.log(data); queryClient.invalidateQueries({queryKey: [resourceName]})},
    })
}

function useUpdateResource(resourceName: string) {
    const queryClient = useQueryClient();
    return useMutation<any, Error, { id: string; resourceInstance: any }, unknown>({
        mutationFn: ({ id, resourceInstance }) => ResourceService.updateById(resourceName, id, resourceInstance),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resourceName] });
        },
    });
}

function useDeleteResource(resourceName: string) {
    const queryClient = useQueryClient();
    return useMutation<any, Error, string, unknown>({
        mutationFn: (id) => ResourceService.deleteById(resourceName, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resourceName] });
        },
    });
}

export {
    useAllResource,
    useResourceById,
    useResourceByProp,
    useCreateResource,
    useCreateMultipleResources,
    useUpdateResource,
    useDeleteResource,
};