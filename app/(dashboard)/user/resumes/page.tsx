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
  content?: string;
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
  const [dateFilter, setDateFilter] = useState("");

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
          content: item.content,
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

      let matchesDate = true;
      if (dateFilter) {
        const resumeDate = new Date(resume.createdAt).toLocaleDateString();
        const filterDate = new Date(dateFilter).toLocaleDateString();
        matchesDate = resumeDate === filterDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    }
  );

  const handleEditResume = async (resume: ResumeCard) => {
    try {
      sessionStorage.setItem("resumeId", resume.id);
      sessionStorage.setItem("resumeFileName", resume.fileName);

      if (resume.content) {
        sessionStorage.setItem("resumeData", resume.content);
      }

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
        return "bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "Draft":
        return "bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold";
      case "Failed":
        return "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold";
      default:
        return "bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Generated":
        return "Published";
      case "Draft":
        return "Draft";
      case "Failed":
        return "Failed";
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
              // onClick={() => router.push("/user/timesheet")}
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

              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-sm px-4 py-3 text-slate-600 font-semibold focus:outline-none focus:border-b-2 focus:border-[var(--primary)] transition-all h-[46px] cursor-pointer"
                />
              </div>
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
          <div className="bg-white rounded-sm border border-slate-200 overflow-visible">
            <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-white">
              <div className="col-span-1 px-4 py-1 bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase tracking-wider">
                #
              </div>
              <div className="col-span-3 px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Job Title
              </div>
              <div className="col-span-2 px-4 py-1 bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase tracking-wider">
                Version
              </div>
              <div className="col-span-3 px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Created
              </div>
              <div className="col-span-2 px-4 py-1 bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status
              </div>
              <div className="col-span-1 px-4 py-1 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                Actions
              </div>
            </div>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-0 border-b border-slate-100 last:border-b-0 items-center bg-white"
              >
                <div className="col-span-1 px-4 py-1 bg-[#F8FAFC]">
                  <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-3 px-4 py-1 flex items-center gap-3">
                  <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2 px-4 py-1 bg-[#F8FAFC]">
                  <div className="h-6 w-12 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-3 px-4 py-1">
                  <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2 px-4 py-1 bg-[#F8FAFC]">
                  <div className="h-6 w-20 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1 px-4 py-1 flex justify-end">
                  <div className="h-6 w-6 bg-slate-100 rounded animate-pulse"></div>
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
          <div className="bg-white rounded-sm border border-slate-200 overflow-visible">
            <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-white">
              <div className="col-span-1 px-4 py-2 bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase tracking-wider">
                #
              </div>
              <div className="col-span-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Job Title
              </div>
              <div className="col-span-1 px-4 py-2 bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase tracking-wider">
                Version
              </div>
              <div className="col-span-3 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Created
              </div>
              <div className="col-span-2 px-4 py-2 bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status
              </div>
              <div className="col-span-1 px-4 py-2 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                Actions
              </div>
            </div>
            {filteredResumes.map((resume, index) => (
              <div
                key={resume.id}
                className="grid grid-cols-12 gap-0 border-b border-slate-100 last:border-b-0 items-center hover:bg-slate-50 transition-colors bg-white group"
              >
                <div className="col-span-1 px-4 py-3 bg-[#F8FAFC] group-hover:bg-slate-100/50 transition-colors text-slate-500 font-medium">
                  {index + 1}
                </div>
                <div className="col-span-4 px-4 py-2 text-slate-900 font-medium">
                  {resume.jobTitle || resume.fileName.replace(".pdf", "")}
                </div>
                <div className="col-span-1 px-4 py-2 bg-[#F8FAFC] group-hover:bg-slate-100/50 transition-colors">
                  <span className="inline-flex items-center px-2.5 py-2 rounded bg-slate-200/60 text-slate-700 text-xs font-bold">
                    v{resume.version.toFixed(1)}
                  </span>
                </div>
                <div className="col-span-3 px-4 py-2 text-slate-500 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatDate(resume.createdAt)}</span>
                </div>
                <div className="col-span-2 px-4 py-3 bg-[#F8FAFC] group-hover:bg-slate-100/50 transition-colors">
                  <div className={`inline-block ${getStatusBadgeClass(resume.status)}`}>
                    {getStatusLabel(resume.status)}
                  </div>
                </div>
                <div className="col-span-1 px-4 py-2 flex justify-end items-center">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      ref={(el) => { if (el) { menuButtonRefs.current.set(resume.id, el); } else { menuButtonRefs.current.delete(resume.id); } }}
                      onClick={(e) => toggleMenu(e, resume.id)}
                      aria-expanded={openMenuId === resume.id}
                      className="p-0 h-8 w-8 hover:bg-slate-200 rounded-full"
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