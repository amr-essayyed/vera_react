import type { ApiResponse } from "../types/apiResponse.ts";
import apiClient from "./apiClient.ts";

class ResourceService {
    // C
    static async create<T>(resourceName: string, resourceInstance: T) {
        const response: ApiResponse = await apiClient(resourceName, {method:"POST", body: JSON.stringify(resourceInstance)});
        return response; /* Data or Error */
    }

    // R
    static async getAll(resourceName: string) {
        const response: ApiResponse  = await apiClient(resourceName, {method:"GET"});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            return response.parsedBody;
        }
    }

    static async getById(resourceName: string, id: string) {
        const response: ApiResponse = await apiClient(resourceName+'/'+id, {method:"GET"});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            return response.parsedBody;
        }
    }
    
    static async getByProp<T>(resourceName: string, propName: string, propValue:T) {
        //! depends on the API = for now use query parameters of the search string
        const response: ApiResponse = await apiClient(resourceName+'?'+propName+'='+propValue, {method:"GET"});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            return response.parsedBody[0];
        }
    }

    // U
    static async updateById<T>(resourceName: string, id: string, resourceInstance: T) {
        const response: ApiResponse = await apiClient(resourceName+'/'+id, {method:"PUT", body: JSON.stringify(resourceInstance)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            return response.parsedBody;
        }
    }

    // D
    static async deleteById(resourceName: string, id: string) {
        const response: ApiResponse = await apiClient(resourceName+'/'+id, {method:"DELETE"});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            return response.parsedBody;
        }
    }
}

export {
    ResourceService
}


// Test
// console.log(await ResourceService.getAll('posts'));