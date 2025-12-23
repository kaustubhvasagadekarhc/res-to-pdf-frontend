export interface ActivityLog {
    id: string;
    createdAt: string;
    user?: {
        email: string;
        name?: string;
    };
    action: string;
    description: string;
    details: unknown;
    ipAddress?: string;
}

export interface PaginatedResponse<T> {
    status: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface User {
    id: string;
    name?: string;
    email: string;
    userType: "USER" | "ADMIN";
    isVerified: boolean;
    createdAt?: string;
    updatedAt?: string;
}
