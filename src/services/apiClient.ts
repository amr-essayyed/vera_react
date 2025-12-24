/**
 * This apiClient function is a wrapper around fetch API.
 * It intercepts HTTP requests and responses.
 * To provide general configuration (e.g. authentication) for the HTTP requests of App.
 * And to provide a neat response format (for data or erros) for the services using fetch API.
 */

import type { ApiResponse } from "../types/apiResponse";

// export const   BASE_URL = "https://jsonplaceholder.typicode.com/";
// export const   BASE_URL = "http://154.26.136.133:10025/";
export const BASE_URL = "http://106.75.152.117:3001/api/";

async function apiClient
    (
        inputIntercepted: RequestInfo | URL,
        initIntercepted?: RequestInit
    ): Promise<ApiResponse> {
    const { input, init } = modifyRequest(inputIntercepted, initIntercepted);

    const response: Response = await fetch(input, init);

    const apiResponse = modifyResponse(response);
    return apiResponse;
}



function modifyRequest
    (
        inputIntercepted: RequestInfo | URL,
        initIntercepted?: RequestInit
    ) {
    const input = `${BASE_URL}${inputIntercepted}`;
    const init = {
        ...initIntercepted, headers: {
            ...initIntercepted?.headers,
            "Content-Type": "application/json"
        }
    };

    return { input, init };
}

async function modifyResponse(response: Response) {
    const apiResponse: ApiResponse = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        redirected: response.redirected,
        bodyUsed: response.bodyUsed,
        parsedBody: null,
        errorMessage: null,
    };

    if (response.ok /* && response.bodyUsed */) {
        apiResponse.parsedBody = await response.json();
        // console.log("Response body:", apiResponse.parsedBody);

    } else if (!response.ok) {
        //errors:
        // unauthenticated (forbidden)
        // 401: unautherized
        // 404: notfound
        // server error
        // database inaccissable
        // validation error (e.g. if response data don not match schema for resource)

        // console.log(await (await resource_data).json());
        let errorMessage = null;
        if (response.status === 404) errorMessage = "Resource Not found! Sorry!";
        if (response.status === 500) errorMessage = "Bad Request! Try different one!";
        apiResponse.errorMessage = errorMessage || response.statusText; //! maybe put real custom err msgs        
    }

    return apiResponse
}

export default apiClient;