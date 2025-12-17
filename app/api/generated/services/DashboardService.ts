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
    public static postDashboardResumes({
        requestBody,
    }: {
        requestBody: {
            /**
             * The ID of the user whose resumes to retrieve
             */
            userId: string;
        },
    }): CancelablePromise<{
        status?: string;
        data?: Array<{
            id?: string;
            jobTitle?: string;
            resumeurl?: string;
            section?: string;
            content?: string;
            version?: number;
            createdAt?: string;
            updatedAt?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dashboard/resumes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing userId in request body`,
                401: `Authentication required`,
            },
        });
    }
}
