/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecommendationService {
    /**
     * Analyze resume JSON for improvements and ATS score
     * @returns any Analysis successful
     * @throws ApiError
     */
    public static postRecommendationAnalyze({
        requestBody,
    }: {
        requestBody: Record<string, any>,
    }): CancelablePromise<{
        status?: string;
        data?: {
            atsScore?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/recommendation/analyze',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing resume data`,
                500: `Server error`,
            },
        });
    }
}
