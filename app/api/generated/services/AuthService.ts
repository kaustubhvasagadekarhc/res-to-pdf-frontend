/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Get API token
     * @returns any Token generated successfully
     * @throws ApiError
     */
    public static getAuthToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/token',
        });
    }
    /**
     * Register new user
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static postAuthRegister({
        requestBody,
    }: {
        requestBody: {
            email?: string;
            password?: string;
            name?: string;
            userType?: 'USER' | 'ADMIN';
            jobTitle?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * User login
     * @returns any Login successful
     * @throws ApiError
     */
    public static postAuthLogin({
        requestBody,
    }: {
        requestBody: {
            email?: string;
            password?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Verify OTP
     * @returns any OTP verified successfully
     * @throws ApiError
     */
    public static postAuthVerifyOtp({
        requestBody,
    }: {
        requestBody: {
            email?: string;
            otp?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-otp',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Resend OTP
     * @returns any OTP resent successfully
     * @throws ApiError
     */
    public static postAuthResendOtp({
        requestBody,
    }: {
        requestBody: {
            email?: string;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/resend-otp',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * User logout
     * @returns any Logout successful
     * @throws ApiError
     */
    public static postAuthLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Get current user
     * @returns any User data retrieved successfully
     * @throws ApiError
     */
    public static getAuthMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
        });
    }
}
