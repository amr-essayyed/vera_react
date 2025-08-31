interface ApiResponse {
    ok: boolean;
    status: number; //!enum
    statusText: string; //!enum
    redirected: boolean;
    bodyUsed: boolean;
    // parsedBody: unknown | null;
    parsedBody: any;
    errorMessage: string | null;
}

export type {ApiResponse};