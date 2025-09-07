/**
 * the methods of this class takes the api response and return the data or the error 
 * the data and the error is caught by TanStack Query Library.
 * TanStack provides them in the output object of the hook (useQuery or useMutation)
 */

import type { ApiResponse } from "../types/apiResponse.ts";
import apiClient from "./apiClient.ts";

class RestResourceService {
    // C
    static async create<T>(resourceName: string, resourceInstance: T) {
        const response: ApiResponse = await apiClient(resourceName, {method:"POST", body: JSON.stringify(resourceInstance)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string) // this is catched by Tanstack Query Library
        }else {
            return response.parsedBody;
        }
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

class JsonRpcResourceService {
    // C
    static async create<T>(resourceName: string, resourceInstance: T) {
        const response: ApiResponse = await apiClient(resourceName, {method:"POST", body: JSON.stringify(resourceInstance)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string) // this is catched by Tanstack Query Library
        }else {
            return response.parsedBody;
        }
    }

    // R
    static async getAll(resourceName: string) {

        const OdooModelsResolver: { [key: string]: string } = {
            "master_orders": "at.master.order",
        }
        const serverResourceName = OdooModelsResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                "veradb", // database name               
                2,          // user id                    
                "admin",    // 
                serverResourceName,            
                "search_read",               
                [
                    [["workflow_type", "=", "type1"]]   
                ],
                {
                    "fields": [
                    "name",
                    "project_name",
                    "workflow_type",
                    "client_id",
                    "vendor_id",
                    "date_order",
                    "date_expected",
                    "priority",
                    "amount_total"
                    ],
                    "limit": 10
                }
                ]
            },
            "id": 1
        };
        resourceName = 'jsonrpc'
        const response: ApiResponse  = await apiClient(resourceName, {method:"POST", body:JSON.stringify(body)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            if(response.parsedBody.error){
                
                throw new Error(response.parsedBody.error.data.message as string)
            }
            return response.parsedBody.result;
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

const ResourceService = JsonRpcResourceService;

export {
    ResourceService
}


// Test

console.log('ResourceService Test: ', await ResourceService.getAll('master_orders'));