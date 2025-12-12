export interface ResumeUploadResponse {
  status: string;
  message: string;
  data: {
    resumeId: string;
    fileUrl: string;
    fileName: string;
  };
}

export interface ResumeParseResponse {
  status: string;
  message: string;
  data: {
    summary: string;
    sections: Record<string, unknown>;
  };
}

export interface DashboardUserResponse {
  status: string;
  message: string;
  data: {
    name: string;
    email: string;
    userType?: string;
    user?: {
      userType?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}
