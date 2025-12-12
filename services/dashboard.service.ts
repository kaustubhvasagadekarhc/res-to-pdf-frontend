import api from "@/lib/api";
import { DashboardUserResponse, ResumeParseResponse, ResumeUploadResponse } from "./dashboard.types";

export interface User {
    id: string;
    name: string;
    email: string;
    jobTitle?: string;
    userType: string;
}

export interface ConnectionRequest {
    id: string;
    senderId: string;
    receiverId: string;
    
}

export const dashboardService = {
  async uploadResume(
    file: File,
    username: string
  ): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('username', username);

    const response = await api.post<ResumeUploadResponse>(
      '/api/resume/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async parseResume(
    resumeUrl: string,
    resumeId: string
  ): Promise<ResumeParseResponse> {
    const response = await api.post<ResumeParseResponse>('/api/resume/parse', {
      resumeUrl,
      resumeId,
    });
    return response.data;
  },

  async getUserDashboard(userId: string): Promise<DashboardUserResponse> {
    const response = await api.post<DashboardUserResponse>(
      '/api/dashboard/user',
      {
        userId,
      }
    );
    return response.data;
  },
};

    
    
    

export interface Notification {
    id: string;
    userId: string;
    type: 'REQUEST_RECEIVED' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'INTERVIEW_REQUEST';
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface APIResponse<T> {
    status: string;
    data: T;
}

export const connectionService = {
    // Service for handling connection related API calls
    async searchUsers(query: string): Promise<APIResponse<User[]>> {
        const response = await api.get<APIResponse<User[]>>(`/api/connection/users/search?query=${query}`);
        return response.data;
    },

    async sendRequest(data: { receiverId?: string; email?: string; type: 'CONNECTION' | 'INTERVIEW'; message?: string }): Promise<APIResponse<ConnectionRequest>> {
        console.log('Sending request to /api/connection/requests');
        const response = await api.post<APIResponse<ConnectionRequest>>("/api/connection/requests", data);
        return response.data;
    },

    async getRequests(): Promise<APIResponse<ConnectionRequest[]>> {
        console.log('Fetching requests from /api/connection/requests');
        const response = await api.get<APIResponse<ConnectionRequest[]>>("/api/connection/requests");
        return response.data;
    },

    async getInvitations(): Promise<APIResponse<ConnectionRequest[]>> {
        const response = await api.get<APIResponse<ConnectionRequest[]>>("/api/connection/invitations");
        return response.data;
    },

    async getShortlisted(): Promise<APIResponse<ConnectionRequest[]>> {
        const response = await api.get<APIResponse<ConnectionRequest[]>>("/api/connection/shortlisted");
        return response.data;
    },

    async getInterviews(): Promise<APIResponse<ConnectionRequest[]>> {
        const response = await api.get<APIResponse<ConnectionRequest[]>>("/api/connection/interviews");
        return response.data;
    },

    async getSentRequests(): Promise<APIResponse<ConnectionRequest[]>> {
        const response = await api.get<APIResponse<ConnectionRequest[]>>("/api/connection/sent");
        return response.data;
    },

    async respondToRequest(requestId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<APIResponse<ConnectionRequest>> {
        const response = await api.put<APIResponse<ConnectionRequest>>(`/api/connection/requests/${requestId}`, { status });
        return response.data;
    },

    async getNotifications(): Promise<APIResponse<Notification[]>> {
        const response = await api.get<APIResponse<Notification[]>>("/api/connection/notifications");
        return response.data;
    },

    async markAsRead(notificationId: string): Promise<void> {
        await api.put(`/api/connection/notifications/${notificationId}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.put("/api/connection/notifications/read-all");
    }
};
