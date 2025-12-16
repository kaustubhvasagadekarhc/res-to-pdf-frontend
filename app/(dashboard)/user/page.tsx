"use client";
import { apiClient, dashboardService } from "@/app/api/client";
import { useUser } from "@/contexts/UserContext";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useEffect, useState } from "react";
import ResumesPage from "./resumes/page";
import UploadPage from "./upload/page";

// Interface for displaying resumes in the UI
interface ResumeCard {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  status: "completed" | "processing" | "failed";
}

export default function UserDashboard() {
  useAuthGuard("User");
  const { user } = useUser();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        setResumes([]);
        return;
      }

      apiClient.refreshTokenFromCookies();

      const response = await dashboardService.postDashboardResumes({
        requestBody: { userId: user.id },
      });

      if (response && Array.isArray(response.data)) {
        // Map the response to our ResumeCard interface
        const mappedResumes = response.data.map((item) => ({
          id: item.id || "",
          fileName: item.jobTitle
            ? `${item.jobTitle || "Resume"}.pdf`
            : "Resume.pdf",
          fileUrl: "", // In a real implementation, this would come from the API
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          status: "completed" as const,
        }));
        setResumes(mappedResumes);
      } else {
        setResumes([]);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // Show a loading state while fetching resumes
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  // Show the appropriate page based on whether the user has any resumes
  return resumes.length > 0 ? <ResumesPage /> : <UploadPage />;
}
