/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Get user resumes for dashboard
     * @returns any User resumes retrieved successfully
     * @throws ApiError
     */
    public static getDashboardResumes(): CancelablePromise<{
        status?: string;
        data?: Array<{
            id?: string;
            fileName?: string;
            createdAt?: string;
            updatedAt?: string;
            latestVersion?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/resumes',
        });
    }
}
