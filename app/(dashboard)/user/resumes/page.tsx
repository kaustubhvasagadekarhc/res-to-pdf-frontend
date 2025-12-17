"use client";

import { apiClient, dashboardService } from "@/app/api/client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  Calendar,
  Download,
  Edit3,
  Eye,
  FileIcon,
  FileText,
  MoreVertical,
  Search,
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
  jobTitle?: string;
  status: "completed" | "processing" | "failed";
}

export default function ResumesPage() {
  useAuthGuard("User");
  const router = useRouter();
  const { user } = useUser();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          jobTitle: item.jobTitle || "",
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

  const filteredResumes = resumes.filter(
    (resume) =>
      resume.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[var(--success-100)] text-[var(--success-800)] px-3 py-1 rounded-full text-xs font-medium";
      case "processing":
        return "bg-[var(--warning-100)] text-[var(--warning-800)] px-3 py-1 rounded-full text-xs font-medium";
      case "failed":
        return "bg-[var(--danger-100)] text-[var(--danger-800)] px-3 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-[var(--muted)] text-[var(--muted-foreground)] px-3 py-1 rounded-full text-xs font-medium";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Published";
      case "processing":
        return "Processing";
      case "failed":
        return "Draft";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--primary)] mb-1">
                My Resumes{" "}
                <span className="text-slate-500">({resumes.length})</span>
              </h1>
              <p className="text-slate-600">
                Manage, edit, and download your generated professional resumes.
              </p>
            </div>
            <Button
              onClick={() => router.push("/user/upload")}
              className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] whitespace-nowrap font-medium"
            >
              + Create New Resume
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            {/* focus ring uses the primary color token */}
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-700)] focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-[var(--danger-100)] border border-[#fecaca] text-[var(--danger-800)] p-4 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50">
              <div className="col-span-1 text-xs font-semibold text-slate-600 uppercase">
                #
              </div>
              <div className="col-span-4 text-xs font-semibold text-slate-600 uppercase">
                File Name
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-600 uppercase">
                Job Title
              </div>
              <div className="col-span-1 text-xs font-semibold text-slate-600 uppercase">
                Version
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-600 uppercase">
                Created
              </div>
              <div className="col-span-2 text-right text-xs font-semibold text-slate-600 uppercase">
                Status
              </div>
            </div>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-b-0 items-center"
              >
                <div className="col-span-1">
                  <div className="h-4 w-6 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <div className="h-6 w-6 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No resumes yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You haven&apos;t generated any resumes yet. Upload a resume
              template or create one to get started.
            </p>
            <Button
              onClick={() => router.push("/user/upload")}
              className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] font-medium"
            >
              + Create New Resume
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50">
              <div className="col-span-1 text-xs font-semibold text-slate-600 uppercase">
                #
              </div>
              <div className="col-span-4 text-xs font-semibold text-slate-600 uppercase">
                File Name
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-600 uppercase">
                Job Title
              </div>
              <div className="col-span-1 text-xs font-semibold text-slate-600 uppercase">
                Version
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-600 uppercase">
                Created
              </div>
              <div className="col-span-2 text-right text-xs font-semibold text-slate-600 uppercase">
                Status
              </div>
            </div>
            {filteredResumes.map((resume, index) => (
              <div
                key={resume.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-b-0 items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-1 text-sm text-slate-600 font-medium">
                  {index + 1}
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary-50)] rounded-lg text-[var(--primary)]">
                    <FileIcon className="w-4 h-4" />
                  </div>
                  <span className="truncate font-medium text-slate-900">
                    {resume.fileName.replace(".pdf", "")}
                  </span>
                </div>
                <div className="col-span-2 text-slate-600 text-sm">
                  {resume.jobTitle || "-"}
                </div>
                <div className="col-span-1 text-slate-600 text-sm font-medium">
                  v{resume.version}
                </div>
                <div className="col-span-2 text-slate-600 text-sm flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatDate(resume.createdAt)}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <div className={getStatusBadgeClass(resume.status)}>
                    {getStatusLabel(resume.status)}
                  </div>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8 hover:bg-slate-100"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </Button>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                      <button
                        onClick={() => handleViewResume(resume)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditResume(resume)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadResume(resume)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
