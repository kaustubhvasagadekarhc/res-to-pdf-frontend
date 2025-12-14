/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ResumeService {
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
