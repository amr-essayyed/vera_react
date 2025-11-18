/**
 * the methods of this class takes the api response and return the data or the error 
 * the data and the error is caught by TanStack Query Library.
 * TanStack provides them in the output object of the hook (useQuery or useMutation)
 */

import resourceNameResolver, { type Model } from "@/resourceNameResolver.ts";
import type { ApiResponse } from "../types/apiResponse.ts";
import apiClient from "./apiClient.ts";
import type { WithStringKeys } from "@/types/withStringKeyes.ts";
import type { IdRef } from "@/types/odooSchemas.ts";

// class RestResourceService {
//     // C
//     static async create<T>(resourceName: string, resourceInstance: T) {
//         const response: ApiResponse = await apiClient(resourceName, {method:"POST", body: JSON.stringify(resourceInstance)});
//         if(! response.ok) {
//             throw new Error(response.errorMessage as string) // this is catched by Tanstack Query Library
//         }else {
//             return response.parsedBody;
//         }
//     }

//     // R
//     static async getAll(resourceName: string) {
//         const response: ApiResponse  = await apiClient(resourceName, {method:"GET"});
//         if(! response.ok) {
//             throw new Error(response.errorMessage as string)
//         }else {
//             return response.parsedBody;
//         }
//     }

//     static async getById(resourceName: string, id: string) {
//         const response: ApiResponse = await apiClient(resourceName+'/'+id, {method:"GET"});
//         if(! response.ok) {
//             throw new Error(response.errorMessage as string)
//         }else {
//             return response.parsedBody;
//         }
//     }
    
//     static async getByProp<T>(resourceName: string, propName: string, propValue:T) {
//         //! depends on the API = for now use query parameters of the search string
//         const response: ApiResponse = await apiClient(resourceName+'?'+propName+'='+propValue, {method:"GET"});
//         if(! response.ok) {
//             throw new Error(response.errorMessage as string)
//         }else {
//             return response.parsedBody[0];
//         }
//     }

//     // U
//     static async updateById<T>(resourceName: string, id: string, resourceInstance: T) {
//         const response: ApiResponse = await apiClient(resourceName+'/'+id, {method:"PUT", body: JSON.stringify(resourceInstance)});
//         if(! response.ok) {
//             throw new Error(response.errorMessage as string)
//         }else {
//             return response.parsedBody;
//         }
//     }

//     // D
//     static async deleteById(resourceName: string, id: string) {
//         const response: ApiResponse = await apiClient(resourceName+'/'+id, {method:"DELETE"});
//         if(! response.ok) {
//             throw new Error(response.errorMessage as string)
//         }else {
//             return response.parsedBody;
//         }
//     }
// }

class JsonRpcResourceService {
    // C
    static async create<T>(resourceName: Model, resourceInstance: T) {
        const serverResource = resourceNameResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    serverResource.modelName,
                    "create",
                    [resourceInstance]
                ]
            },
            "id": 1
        };
        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        if (!response.ok) {
            console.log("response",response);
            
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }

    // Bulk Create - for creating multiple resources at once
    static async createMultiple<T>(resourceName: Model, resourceInstances: T[]) {
        const serverResource = resourceNameResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    serverResource.modelName,
                    "create",
                    [resourceInstances] // Wrap the array in another array, like single create does
                ]
            },
            "id": 1
        };
        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        if (!response.ok) {
            console.log("response",response);
            
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }

    static async createWithChild(resourceName: Model, childField: string, resourceInstance: Record<string, WithStringKeys>) {
        const serverResource = resourceNameResolver[resourceName];
        console.log("childField: ", childField);
        
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    serverResource.modelName,
                    "create",
                    [
                        {
                            ...resourceInstance,
                            [childField]: resourceInstance[childField].map( (childInstance:unknown) => (
                                [
                                    0,0,
                                    childInstance
                                ]
                            )),

                        }
                    ]
                ]
            },
            "id": 1
        };

        console.log("[body]: ", body);
        

        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        
        if (!response.ok) {
            console.log("response",response);
            
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }

    // R
    static async getAll(resourceName: Model, condition?: any[]) { // array of arrays and logic operators ["|", ["prop", "op", "val"], ...]
        const serverResource = resourceNameResolver[resourceName];
        
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
                    serverResource.modelName,            
                    "search_read",               
                    [condition],
                    serverResource.fields
                ]
            },
            "id": 1
        };
        
        console.log("body", body);
        const response: ApiResponse  = await apiClient('jsonrpc', {method:"POST", body:JSON.stringify(body)});
        console.log("response", response);

        if(! response.ok) {
            throw new Error("[service] Client Error: " + response.errorMessage as string)
        }else {
            if(response.parsedBody.error){
                console.error("[service] JSON-RPC Error: ", response.parsedBody.error);
                throw new Error("[service] JSON-RPC Error: " + response.parsedBody.error.data.message as string)
            }
            return response.parsedBody.result;
        }
    }

    static async getById(resourceName: Model, id: IdRef) {

        const serverResource = resourceNameResolver[resourceName];
        
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
                serverResource.modelName,            
                "search_read",               
                [
                    [["id", "=", id]]   
                ],
                serverResource.fields
                ]
            },
            "id": 1
        };

        const response: ApiResponse = await apiClient('jsonrpc', {method:"POST", body:JSON.stringify(body)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            if(response.parsedBody.error){
                
                throw new Error(response.parsedBody.error.data.message as string)
            }
            return response.parsedBody.result;
        }
    }
    
    static async getManyById(resourceName: Model, ids: number[]) {

        const serverResource = resourceNameResolver[resourceName];
        
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
                serverResource.modelName,            
                "search_read",               
                [[["id", "in", Array.isArray(ids) ? ids : [ids]]]],
                serverResource.fields
                ]
            },
            "id": 1
        };

        const response: ApiResponse = await apiClient('jsonrpc', {method:"POST", body:JSON.stringify(body)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            if(response.parsedBody.error){
                
                throw new Error(response.parsedBody.error.data.message as string)
            }
            return response.parsedBody.result;
        }
    }
    static async getManyByName(resourceName: Model, names: string[]) {

        const serverResource = resourceNameResolver[resourceName];
        
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                "veradb", 
                2,                              
                "admin",     
                serverResource.modelName,            
                "search_read",               
                [[["name", "in", Array.isArray(names) ? names : [names]]]],
                serverResource.fields
                ]
            },
            "id": 1
        };

        const response: ApiResponse = await apiClient('jsonrpc', {method:"POST", body:JSON.stringify(body)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            if(response.parsedBody.error){
                
                throw new Error(response.parsedBody.error.data.message as string)
            }
            return response.parsedBody.result;
        }
    }
    
    static async getByProp<T>(resourceName: Model, propName: string, propValue:T) {
        //! depends on the API = for now use query parameters of the search string
        const serverResource = resourceNameResolver[resourceName];
        
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
                serverResource.modelName,            
                "search_read",               
                [
                    [[propName, "=", propValue]]   
                ],
                serverResource.fields
                ]
            },
            "id": 1
        };

        const response: ApiResponse = await apiClient('jsonrpc', {method:"POST", body:JSON.stringify(body)});
        if(! response.ok) {
            throw new Error(response.errorMessage as string)
        }else {
            if(response.parsedBody.error){
                
                throw new Error(response.parsedBody.error.data.message as string)
            }
            return response.parsedBody.result;
        }
    }

    // U
    static async updateById<T>(resourceName: Model, id: IdRef, resourceInstance: T) {
        const serverResource = resourceNameResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    serverResource.modelName,
                    "write",
                    [[id], resourceInstance]
                ]
            },
            "id": 1
        };
        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        if (!response.ok) {
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }
    static async updateByIdWithChild(resourceName: Model, childField: string, resourceInstance: Record<string, WithStringKeys>) {
        const serverResource = resourceNameResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    serverResource.modelName,
                    "write",
                    [
                        {
                            [childField]: resourceInstance[childField].map( (childInstance:unknown) => (
                                [
                                    1,
                                    0, //! id
                                    childInstance
                                ]
                            )),
                            ...resourceInstance
                        }
                    ]
                ]
            },
            "id": 1
        };
        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        if (!response.ok) {
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }

    static async updateManyById<T>(resourceName: Model, ids: IdRef[], resourceInstances: T[]) {
        const serverResource = resourceNameResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    ids.map( (id, index)=> [
                        serverResource.modelName,
                        "write",
                        [[id], resourceInstances[index]]
                    ])
                ]
            },
            "id": 1
        };
        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        if (!response.ok) {
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }

    // D
    static async deleteById(resourceName: Model, id: string) {
        const serverResource = resourceNameResolver[resourceName];
        const body = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": "object",
                "method": "execute_kw",
                "args": [
                    "veradb", // database name
                    2, // user id
                    "admin",
                    serverResource.modelName,
                    "unlink",
                    [[id]]
                ]
            },
            "id": 1
        };
        const response: ApiResponse = await apiClient('jsonrpc', {method: "POST", body: JSON.stringify(body)});
        if (!response.ok) {
            throw new Error(response.errorMessage as string);
        } else {
            if (response.parsedBody.error) {
                throw new Error(response.parsedBody.error.data.message as string);
            }
            return response.parsedBody.result;
        }
    }
}

const ResourceService = JsonRpcResourceService;

export {
    ResourceService
}


// Test

// console.log('ResourceService Test: ', await ResourceService.getAll('purchaseOrder'));