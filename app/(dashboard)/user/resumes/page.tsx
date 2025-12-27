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
  History,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResumeCard {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  jobTitle?: string;
  status: "Generated" | "Draft";
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

  const fetchResumes = useCallback(async () => {
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
        const mappedResumes = response.data.map(
          (item: Record<string, unknown>) => {
            const fileUrl =
              (item.resumeurl as string) || (item.fileUrl as string) || "";
            return {
              id: (item.id as string) || "",
              fileName: item.jobTitle
                ? `${(item.jobTitle as string) || "Resume"}.pdf`
                : "Resume.pdf",
              fileUrl: fileUrl,
              createdAt: (item.createdAt as string) || new Date().toISOString(),
              updatedAt: (item.updatedAt as string) || new Date().toISOString(),
              version: (item.version as number) || 1,
              jobTitle: (item.jobTitle as string) || "",
              content: item.content as string,
              status: fileUrl ? ("Generated" as const) : ("Draft" as const),
            };
          }
        );
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
  }, [user?.id]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch =
      resume.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || resume.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      const resumeDate = new Date(resume.createdAt).toLocaleDateString();
      const filterDate = new Date(dateFilter).toLocaleDateString();
      matchesDate = resumeDate === filterDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleEditResume = async (resume: ResumeCard) => {
    try {
      // In a real implementation, you'd fetch the specific resume data
      // For now, we'll just pass the ID to the edit page
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

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Shorter date for mobile (omits year)
  // const formatShortDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleString("en-US", {
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  // Mobile full date in dd/mm/yyyy format and separate time line
  // const formatDateMobile = (dateString: string) => {
  //   const d = new Date(dateString);
  //   const dd = String(d.getDate()).padStart(2, "0");
  //   const mm = String(d.getMonth() + 1).padStart(2, "0");
  //   const yyyy = d.getFullYear();
  //   return `${dd}/${mm}/${yyyy}`;
  // };

  const formatTimeMobile = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
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
      setToastMessage("Resume deleted");
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setError("Failed to delete resume. Please try again later.");
      setToastMessage("Failed to delete resume");
    } finally {
      setDeletingId(null);
      // clear toast after 3s
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Generated":
        return "bg-[var(--success-100)] text-[var(--success-800)] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
      case "Draft":
        return "bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
      default:
        return "bg-[var(--muted)] text-[var(--muted-foreground)] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    }
  };

  // const getStatusLabel = (status: string) => {
  //   return status;
  // };

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
      if (
        (overflowY && overflowY !== "visible" && overflowY !== "clip") ||
        (overflow && overflow !== "visible")
      ) {
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
    if (
      !above &&
      window.innerHeight - rect.bottom < dropdownHeight &&
      rect.top >= dropdownHeight
    ) {
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
    <div className="min-h-screen bg-[#f8f9fa] pb-24 sm:pb-8">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-3xl font-bold text-[#1a56db]">
              My Resumes{" "}
              <span className="text-gray-500 font-normal">
                ({resumes.length})
              </span>
            </h1>
            <p className="text-gray-500 text-sm">
              Manage, edit, and download your generated professional resumes.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-sm px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="Generated">Generated</option>
                  <option value="Draft">Draft</option>
                </select>
                <MoreVertical className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() =>
                    (
                      document.getElementById("date-filter") as HTMLInputElement
                    ).showPicker()
                  }
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    {dateFilter
                      ? new Date(dateFilter).toLocaleDateString()
                      : "Date"}
                  </span>
                </button>
                <input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>

              <Button
                variant="outline"
                className="shrink-0 rounded-sm border-gray-200 bg-white text-blue-600 hover:text-blue-700 font-medium px-4 py-2.5 h-auto text-sm shadow-sm flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Timesheet
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          {loading ? (
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
                  Sr. No.
                </div>
                <div className="col-span-4 text-xs font-bold text-gray-400 uppercase">
                  File Name
                </div>
                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">
                  Job Title
                </div>
                <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
                  Version
                </div>
                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">
                  Created
                </div>
                <div className="col-span-2 text-right text-xs font-bold text-gray-400 uppercase">
                  Status
                </div>
              </div>
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-5 border-b border-gray-50 items-center"
                >
                  <div className="col-span-1">
                    <div className="h-4 w-6 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="col-span-4">
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="col-span-1">
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResumes.length === 0 ? (
            <EmptyState router={router} />
          ) : (
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
                  Sr No
                </div>
                <div className="col-span-4 text-xs font-bold text-gray-400 uppercase">
                  File Name
                </div>
                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">
                  Job Title
                </div>
                <div className="col-span-1 text-xs font-bold text-gray-400 uppercase text-center">
                  Version
                </div>
                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">
                  Created
                </div>
                <div className="col-span-2 text-right text-xs font-bold text-gray-400 uppercase pr-8">
                  Actions
                </div>
              </div>
              {filteredResumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className="grid grid-cols-12 gap-4 p-5 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-sm">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-semibold text-gray-800 truncate">
                      {resume.fileName.replace(".pdf", "")}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {resume.jobTitle || "-"}
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      v{resume.version}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {formatDateFull(resume.createdAt)}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-3 pr-4">
                    <div className={getStatusBadgeClass(resume.status)}>
                      {resume.status}
                    </div>
                    <ActionsMenu
                      resume={resume}
                      handleViewResume={handleViewResume}
                      handleEditResume={handleEditResume}
                      handleDownloadResume={handleDownloadResume}
                      openDeleteConfirm={openDeleteConfirm}
                      deletingId={deletingId}
                      menuButtonRefs={menuButtonRefs}
                      toggleMenu={toggleMenu}
                      openMenuId={openMenuId}
                      menuAbove={menuAbove}
                      setOpenMenuId={setOpenMenuId}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden space-y-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-sm p-4 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-gray-100 rounded-sm" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex justify-between">
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          ) : filteredResumes.length === 0 ? (
            <EmptyState router={router} />
          ) : (
            filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-sm p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 bg-[#e7f0ff] rounded-sm flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {resume.jobTitle || "Resume"}
                        {resume.status === "Draft" && " (Draft)"}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none uppercase">
                          v{resume.version}
                        </span>
                        <span className="text-[10px]">•</span>
                        <span>{formatDateShort(resume.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ActionsMenu
                    resume={resume}
                    handleViewResume={handleViewResume}
                    handleEditResume={handleEditResume}
                    handleDownloadResume={handleDownloadResume}
                    openDeleteConfirm={openDeleteConfirm}
                    deletingId={deletingId}
                    menuButtonRefs={menuButtonRefs}
                    toggleMenu={toggleMenu}
                    openMenuId={openMenuId}
                    menuAbove={menuAbove}
                    setOpenMenuId={setOpenMenuId}
                  />
                </div>
                <div className="h-px bg-gray-100 -mx-4 my-4" />
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-sm text-xs font-bold leading-none ${
                      resume.status === "Generated"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {resume.status}
                  </span>
                  <span className="text-gray-500 text-sm font-medium">
                    {formatTimeMobile(resume.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <button
          onClick={() => router.push("/user/upload")}
          className="sm:hidden fixed right-6 bottom-24 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center text-white z-50 hover:bg-blue-700 transition-colors active:scale-95"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        {/* Bottom Navigation */}
        {/* <div className="sm:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40">
          <button className="flex flex-col items-center gap-1 group">
            <FileText className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Resumes
            </span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 group">
            <Briefcase className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Jobs
            </span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 group">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Profile
            </span>
          </button>
        </div> */}

        {/* Delete Confirmation Dialog */}
        {confirmResume && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="absolute inset-0 bg-black opacity-40" />
            <div className="relative bg-white rounded-sm p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-red-50 rounded-sm flex items-center justify-center mb-4 text-red-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Resume?
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="text-gray-900 font-semibold">
                  {confirmResume.fileName.replace(".pdf", "")}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1 rounded-sm h-12 border-gray-200 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={performDelete}
                  className="flex-1 text-white rounded-sm h-12 bg-red-600 hover:bg-red-700 font-bold"
                >
                  {deletingId === confirmResume.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[70] animate-in slide-in-from-bottom-5">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-sm shadow-xl font-medium text-sm">
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
      <div className="mx-auto w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No resumes yet</h3>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        You haven&apos;t generated any resumes yet. Create your first
        professional resume now!
      </p>
      <Button
        onClick={() => router.push("/user/upload")}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-sm shadow-lg shadow-blue-200"
      >
        Create New Resume
      </Button>
    </div>
  );
}

interface ActionsMenuProps {
  resume: ResumeCard;
  handleViewResume: (resume: ResumeCard) => void;
  handleEditResume: (resume: ResumeCard) => void;
  handleDownloadResume: (resume: ResumeCard) => void;
  openDeleteConfirm: (resume: ResumeCard) => void;
  deletingId: string | null;
  menuButtonRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  toggleMenu: (e: React.MouseEvent, id: string) => void;
  openMenuId: string | null;
  menuAbove: Record<string, boolean>;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
}

function ActionsMenu({
  resume,
  handleViewResume,
  handleEditResume,
  handleDownloadResume,
  openDeleteConfirm,
  deletingId,
  menuButtonRefs,
  toggleMenu,
  openMenuId,
  menuAbove,
  setOpenMenuId,
}: ActionsMenuProps) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        ref={(el) => {
          if (el) menuButtonRefs.current.set(resume.id, el);
          else menuButtonRefs.current.delete(resume.id);
        }}
        onClick={(e) => toggleMenu(e, resume.id)}
        className="p-1 h-8 w-8 hover:bg-gray-100 rounded-sm"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </Button>

      {openMenuId === resume.id && (
        <div
          id={`resume-menu-${resume.id}`}
          className={`absolute right-0 ${
            menuAbove[resume.id] ? "bottom-full mb-2" : "top-full mt-2"
          } w-48 bg-white border border-gray-100 rounded-sm shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {resume.status === "Generated" && (
            <button
              onClick={() => {
                handleViewResume(resume);
                setOpenMenuId(null);
              }}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
            >
              <Eye className="w-4 h-4" /> View
            </button>
          )}
          <button
            onClick={() => {
              handleEditResume(resume);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => {
              handleDownloadResume(resume);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <div className="h-px bg-gray-50 mx-2 my-1" />
          <button
            onClick={() => openDeleteConfirm(resume)}
            disabled={deletingId === resume.id}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />{" "}
            {deletingId === resume.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
