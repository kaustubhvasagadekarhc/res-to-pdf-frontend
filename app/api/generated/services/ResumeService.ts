/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ResumeService {
    /**
     * Get user resume sections
     * @returns any Resume sections retrieved successfully
     * @throws ApiError
     */
    public static getResumeSections({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<{
        status?: string;
        data?: Array<Record<string, any>>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/resume/sections/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * Upload and parse a resume PDF
     * @returns any Resume parsed successfully
     * @throws ApiError
     */
    public static postUpload({
        formData,
    }: {
        formData: {
            file?: Blob;
        },
    }): CancelablePromise<{
        uploaded?: Record<string, any>;
        parsed?: Record<string, any>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `File is missing`,
                500: `Internal server error`,
            },
        });
    }
}
