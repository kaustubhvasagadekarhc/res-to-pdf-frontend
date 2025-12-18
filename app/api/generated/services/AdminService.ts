/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Get all users
     * @returns any List of users retrieved successfully
     * @throws ApiError
     */
    public static getAdminUsers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Get user by ID
     * @returns any User details retrieved successfully
     * @throws ApiError
     */
    public static getAdminUsers1({
        id,
    }: {
        /**
         * User ID
         */
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Delete a user
     * @returns any User deleted successfully
     * @throws ApiError
     */
    public static deleteAdminUsers({
        id,
    }: {
        /**
         * User ID
         */
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Update user role
     * @returns any User role updated successfully
     * @throws ApiError
     */
    public static patchAdminUsersRole({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            userType?: 'USER' | 'ADMIN';
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/admin/users/{id}/role',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid user type`,
                500: `Server error`,
            },
        });
    }
    /**
     * Update user verification status
     * @returns any User verification updated successfully
     * @throws ApiError
     */
    public static patchAdminUsersVerify({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            isVerified?: boolean;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/admin/users/{id}/verify',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Get system statistics
     * @returns any System stats retrieved successfully
     * @throws ApiError
     */
    public static getAdminStats(): CancelablePromise<{
        status?: string;
        data?: {
            totalUsers?: number;
            totalResumes?: number;
            totalGenerated?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/stats',
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Invite a new user (Create with temp password)
     * @returns any User invited successfully
     * @throws ApiError
     */
    public static postAdminUsersInvite({
        requestBody,
    }: {
        requestBody: {
            email: string;
            name: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/users/invite',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `User already exists`,
                500: `Server error`,
            },
        });
    }
    /**
     * Parse resume for Admin preview
     * @returns any Resume parsed successfully
     * @throws ApiError
     */
    public static postAdminResumeParse({
        formData,
    }: {
        formData: {
            resume?: Blob;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/resume/parse',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `No file uploaded`,
                500: `Server error`,
            },
        });
    }
}
