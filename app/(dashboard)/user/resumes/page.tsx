"use client";

import { apiClient, dashboardService } from "@/app/api/client";
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  Calendar,
  Download,
  Edit3,
  Eye,
  // Clock,
  // Trash2,
  FileIcon,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ResumeCard {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: "completed" | "processing" | "failed";
}

export default function ResumesPage() {
  useAuthGuard("User");
  const router = useRouter();
  const { user } = useUser();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);

      apiClient.refreshTokenFromCookies();

      // For now, using the dashboard service to fetch user's resume sections as a placeholder
      // In a real implementation, you'd have an endpoint that returns completed resume files
      // like /api/resumes/user or similar
      const response = await dashboardService.postDashboardResumes({
        requestBody: { userId: user?.id || "" },
      });

      if (response && Array.isArray(response.data)) {
        // Map the response to our ResumeCard interface
        // In a real implementation, you'd have actual file URLs from a completed resumes endpoint
        const mappedResumes = response.data.map((item) => ({
          id: item.id || "",
          fileName: item.jobTitle
            ? `${item.jobTitle || "Resume"}.pdf`
            : "Resume.pdf",
          fileUrl: "", // In a real implementation, this would come from the API
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          version: item.version || 1,
          status: "completed" as const,
        }));
        setResumes(mappedResumes);
      } else {
        setResumes([]);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      setError("Failed to load your resumes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = async (resume: ResumeCard) => {
    try {
      // In a real implementation, you'd fetch the specific resume data
      // For now, we'll just pass the ID to the edit page
      sessionStorage.setItem("resumeId", resume.id);
      sessionStorage.setItem("resumeFileName", resume.fileName);

      // You might also want to fetch the resume data here and store it
      // This would depend on your backend API structure
      router.push(`/user/edit?id=${resume.id}`);
    } catch (error) {
      console.error("Error preparing resume for editing:", error);
      setError("Failed to load resume data for editing");
    }
  };

  const handleViewResume = (resume: ResumeCard) => {
    if (resume.fileUrl) {
      window.open(resume.fileUrl, "_blank");
    } else {
      // If no file URL exists, navigate to edit page
      router.push(`/user/edit?id=${resume.id}`);
    }
  };

  const handleDownloadResume = (resume: ResumeCard) => {
    if (resume.fileUrl) {
      const link = document.createElement("a");
      link.href = resume.fileUrl;
      link.download = resume.fileName;
      link.click();
    } else {
      // If no file URL, show an error or message
      alert("Resume file not available for download");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const getStatusBadgeVariant = (status: string) => {
  //   switch (status) {
  //     case "completed":
  //       return "bg-green-100 text-green-800";
  //     case "processing":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "failed":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            My Resumes
          </h1>
          <p className="text-slate-500">
            View and manage all your generated resumes
          </p>
        </div>
        <Button
          onClick={() => router.push("/user/upload")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
        >
          Create New Resume
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium">
            <div className="col-span-5">File Name</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1">Version</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-b-0">
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-3 w-full bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-1">
                <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No resumes yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            You haven &apos; t generated any resumes yet. Upload a resume
            template or create one to get started.
          </p>
          <Button
            onClick={() => router.push("/user/upload")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Create New Resume
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium">
            <div className="col-span-5">File Name</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1">Version</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {resumes.map((resume) => (
            <div key={resume.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-b-0 items-center hover:bg-slate-50/50 transition-colors">
              <div className="col-span-5 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <FileIcon className="w-4 h-4" />
                </div>
                <span className="truncate font-medium">{resume.fileName.replace('.pdf', '')}</span>
              </div>
              <div className="col-span-2 text-slate-600 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(resume.createdAt)}</span>
                </div>
              </div>
              <div className="col-span-1 text-slate-600 text-sm">
                v{resume.version}
              </div>
              <div className="col-span-2">
                {/* <div
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs capitalize ${getStatusBadgeVariant(resume.status)}`}
                >
                  {resume.status}
                </div> */}
              </div>
              <div className="col-span-2 flex justify-end gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs h-8 px-2"
                  onClick={() => handleViewResume(resume)}
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs h-8 px-2"
                  onClick={() => handleEditResume(resume)}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs h-8 px-2"
                  onClick={() => handleDownloadResume(resume)}
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
