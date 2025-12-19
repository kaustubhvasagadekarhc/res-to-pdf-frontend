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
  FileText,
  MoreVertical,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ResumeCard {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  jobTitle?: string;
  status: "Generated" | "Draft" | "Failed";
}

export default function ResumesPage() {
  useAuthGuard("User");
  const router = useRouter();
  const { user } = useUser();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
          status: (
            // item.status || 
            "Generated") as "Generated" | "Draft" | "Failed",
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
    (resume) => {
      const matchesSearch = resume.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || resume.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
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

  // Delete handling (confirm modal + toast)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmResume, setConfirmResume] = useState<ResumeCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openDeleteConfirm = (resume: ResumeCard) => {
    setConfirmResume(resume);
    setOpenMenuId(null);
  };

  const cancelDelete = () => setConfirmResume(null);

  const performDelete = async () => {
    if (!confirmResume) return;
    const resume = confirmResume;
    setDeletingId(resume.id);
    try {
      apiClient.refreshTokenFromCookies();
      await apiClient.delete(`/resume/${resume.id}`);

      // Remove resume from local state
      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      setConfirmResume(null);
      setToastMessage('Resume deleted');
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setError('Failed to delete resume. Please try again later.');
      setToastMessage('Failed to delete resume');
    } finally {
      setDeletingId(null);
      // clear toast after 3s
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Generated":
        return "bg-[var(--success-100)] text-[var(--success-800)] px-3 py-1 rounded-full text-xs font-medium";
      case "Draft":
        return "bg-[var(--warning-100)] text-[var(--warning-800)] px-3 py-1 rounded-full text-xs font-medium";
      case "Failed":
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

  // Dropdown/menu state and helpers (click-driven, stable, and flips above if not enough space)
  const menuButtonRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAbove, setMenuAbove] = useState<Record<string, boolean>>({});

  // Find the nearest ancestor that can clip (overflow not visible) — typically the table container
  const getOverflowParent = (el: HTMLElement | null): HTMLElement => {
    let node = el?.parentElement || null;
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      const overflow = style.overflow;
      if ((overflowY && overflowY !== "visible" && overflowY !== "clip") || (overflow && overflow !== "visible")) {
        return node as HTMLElement;
      }
      node = node.parentElement;
    }
    return document.documentElement as HTMLElement;
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    // prevent document click handler from immediately closing menu
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const dropdownHeight = 140; // estimated height for 3 items

    // Measure available space inside the nearest overflow container so we don't get clipped
    const container = getOverflowParent(el);
    const containerRect = container.getBoundingClientRect();
    const spaceBelow = containerRect.bottom - rect.bottom;
    const spaceAbove = rect.top - containerRect.top;

    // Prefer opening above if there's not enough space below inside the container
    const above = spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;

    // Fallback: if above not possible but viewport has space above, prefer above to avoid clipping
    if (!above && (window.innerHeight - rect.bottom) < dropdownHeight && rect.top >= dropdownHeight) {
      setMenuAbove((prev) => ({ ...prev, [id]: true }));
    } else {
      setMenuAbove((prev) => ({ ...prev, [id]: above }));
    }

    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!openMenuId) return;
      const btn = menuButtonRefs.current.get(openMenuId);
      const drop = document.getElementById(`resume-menu-${openMenuId}`);
      if (btn && btn.contains(e.target as Node)) return;
      if (drop && drop.contains(e.target as Node)) return;
      setOpenMenuId(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    window.addEventListener("click", handleDocClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", handleDocClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [openMenuId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--primary)] mb-1">
                My Resumes{" "}
                <span className="text-slate-500 text-xl">({resumes.length})</span>
              </h1>
              <p className="text-slate-600">
                Manage, edit, and download your generated professional resumes.
              </p>
            </div>
            <div className="flex items-center"> <Button
              onClick={() => router.push("/user/timesheet")}
              className="bg-white border border-slate-200 text-[var(--primary)] hover:bg-slate-50 whitespace-nowrap font-bold rounded-sm py-6 px-6"
            >
              Timesheet
            </Button>
              <Button
                onClick={() => router.push("/user/upload")}
                className="ml-3 bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] whitespace-nowrap font-bold rounded-sm py-6 px-6"
              >
                Create New Resume
              </Button>


            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-sm bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-48 appearance-none bg-white border border-slate-200 rounded-sm px-4 py-3 pr-10 text-slate-600 font-semibold focus:outline-none focus:border-b-2 focus:border-[var(--primary)] transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Published</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Draft</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MoreVertical className="w-4 h-4 text-slate-400 rotate-90" />
                </div>
              </div>

              <Button
                variant="outline"
                className="p-3 rounded-sm border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <Calendar className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* {error && (
          <div className="mb-6 bg-[var(--danger-100)] border border-[#fecaca] text-[var(--danger-800)] p-4 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )} */}

        {loading ? (
          <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-slate-50">
              <div className="col-span-1 p-4 text-xs font-semibold text-slate-600 uppercase">
                Sr. No.
              </div>
              <div className="col-span-4 p-4 bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                File Name
              </div>
              <div className="col-span-2 p-4 text-xs font-semibold text-slate-600 uppercase">
                Job Title
              </div>
              <div className="col-span-1 p-4 bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                Version
              </div>
              <div className="col-span-2 p-4 text-xs font-semibold text-slate-600 uppercase">
                Created
              </div>
              <div className="col-span-1 p-4 bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                Status
              </div>
              <div className="col-span-1 p-4 text-center text-xs font-semibold text-slate-600 uppercase">
                Action
              </div>
            </div>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-0 border-b border-slate-100 last:border-b-0 items-center bg-white"
              >
                <div className="col-span-1 p-4">
                  <div className="h-4 w-6 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-4 p-4 bg-slate-50/50 flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="col-span-2 p-4">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1 p-4 bg-slate-50/50">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2 p-4">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1 p-4 bg-slate-50/50">
                  <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1 p-4 flex justify-center">
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
              className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] font-bold rounded-sm py-6 px-6"
            >
              + Create New Resume
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-slate-50">
              <div className="col-span-1 p-4 text-xs font-semibold text-slate-600 uppercase">
                #
              </div>
              <div className="col-span-4 p-4 bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                File Name
              </div>
              <div className="col-span-2 p-4 text-xs font-semibold text-slate-600 uppercase">
                Job Title
              </div>
              <div className="col-span-1 p-4 bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                Version
              </div>
              <div className="col-span-2 p-4 text-xs font-semibold text-slate-600 uppercase">
                Created
              </div>
              <div className="col-span-1 p-4 bg-slate-200 text-xs font-semibold text-slate-600 uppercase">
                Status
              </div>
              <div className="col-span-1 p-4 text-center text-xs font-semibold text-slate-600 uppercase">
                Action
              </div>
            </div>
            {filteredResumes.map((resume, index) => (
              <div
                key={resume.id}
                className="grid grid-cols-12 gap-0 border-b border-slate-100 last:border-b-0 items-center hover:bg-slate-50 transition-colors bg-white font-serif"
              >
                <div className="col-span-1 p-4 text-sm text-slate-600 font-medium font-sans">
                  {index + 1}
                </div>
                <div className="col-span-4 p-4 bg-slate-50/50 flex items-center gap-3">
                  <span className="truncate font-medium text-slate-900 font-sans">
                    {resume.fileName.replace(".pdf", "")}
                  </span>
                </div>
                <div className="col-span-2 p-4 text-slate-600 text-sm font-sans">
                  {resume.jobTitle || "-"}
                </div>
                <div className="col-span-1 p-4 bg-slate-50/50 text-slate-600 text-sm font-medium font-sans">
                  v{resume.version}
                </div>
                <div className="col-span-2 p-4 text-slate-600 text-sm flex items-center gap-1 font-sans">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatDate(resume.createdAt)}</span>
                </div>
                <div className="col-span-1 p-4 bg-slate-50/50 font-sans">
                  <div className={getStatusBadgeClass(resume.status)}>
                    {getStatusLabel(resume.status)}
                  </div>
                </div>
                <div className="col-span-1 p-4 font-sans flex justify-end items-center">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      ref={(el) => { if (el) { menuButtonRefs.current.set(resume.id, el); } else { menuButtonRefs.current.delete(resume.id); } }}
                      onClick={(e) => toggleMenu(e, resume.id)}
                      aria-expanded={openMenuId === resume.id}
                      className="p-0 h-8 w-8 hover:bg-slate-100"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </Button>

                    {/* Dropdown menu (click to open; flips above when needed) */}
                    {openMenuId === resume.id && (
                      <div
                        id={`resume-menu-${resume.id}`}
                        className={`absolute right-0 ${menuAbove[resume.id] ? "bottom-full mb-1" : "top-full mt-1"} w-40 bg-white border border-slate-200 rounded-sm z-50`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { handleViewResume(resume); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => { handleEditResume(resume); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => { handleDownloadResume(resume); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>

                        <button
                          onClick={() => openDeleteConfirm(resume)}
                          disabled={deletingId === resume.id}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                        >
                          {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Confirm delete modal */}
        {confirmResume && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
            <div className="absolute inset-0 bg-black opacity-40" onClick={cancelDelete} />
            <div className="relative bg-white rounded-sm w-full max-w-sm p-6 z-10 border border-slate-200">
              <h3 id="delete-dialog-title" className="text-lg font-semibold mb-2">Delete Resume</h3>

              <p className="text-sm text-slate-600 mb-4">Are you sure you want to permanently delete &quot;{confirmResume.fileName.replace('.pdf', '')}&quot;? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={cancelDelete} className="bg-slate-50 hover:bg-slate-100">Cancel</Button>
                <Button onClick={performDelete} className="bg-red-600 text-white hover:bg-red-700">{deletingId === confirmResume.id ? 'Deleting...' : 'Delete'}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast (bottom-center) */}
        {toastMessage && (
          <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 z-50">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-md shadow">{toastMessage}</div>
          </div>
        )}

      </div>
    </div>
  );
}