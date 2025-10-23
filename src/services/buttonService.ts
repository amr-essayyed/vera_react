import type { Model } from "@/resourceNameResolver";
import resourceNameResolver from "@/resourceNameResolver";
import type { IdRef } from "@/types/odooSchemas";
import apiClient from "./apiClient";
import type { ApiResponse } from "@/types/apiResponse";

class ButtonService {
    static async callConfirm(resourceName: Model, orderId: IdRef) { // array of arrays and logic operators ["|", ["prop", "op", "val"], ...]
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
                        "button_confirm",               
                        [[orderId]],
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
}

export {
    ButtonService
}