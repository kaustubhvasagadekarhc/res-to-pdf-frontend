/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PdfService {
    /**
     * Generate PDF from resume data
     * @returns binary PDF file generated
     * @throws ApiError
     */
    public static postGeneratePdf({
        requestBody,
    }: {
        requestBody: {
            personal?: {
                name?: string;
                email?: string;
            };
            summary?: string;
            skills?: Record<string, any>;
            work_experience?: any[];
            education?: any[];
            projects?: any[];
        },
    }): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/generate/pdf',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Resume data is required`,
                500: `Server error`,
            },
        });
    }
}
