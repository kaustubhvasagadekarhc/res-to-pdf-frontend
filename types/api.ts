export interface ActivityLog {
    id: string;
    createdAt: string;
    user?: {
        email: string;
        name?: string;
    };
    action: string;
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
