import { Resume } from "@/contexts/UserContext";
import { ResumeFilters } from "./resume-filters.types";

/**
 * Filter resumes based on search query, status, and date
 */
export const filterResumes = (
  resumes: Resume[],
  filters: ResumeFilters
): Resume[] => {
  return resumes.filter((resume) => {
    const matchesSearch =
      resume.fileName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      resume.jobTitle?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesStatus =
      filters.statusFilter === "all" || resume.status === filters.statusFilter;

    let matchesDate = true;
    if (filters.dateFilter) {
      const resumeDate = new Date(resume.createdAt).toLocaleDateString();
      const filterDate = new Date(filters.dateFilter).toLocaleDateString();
      matchesDate = resumeDate === filterDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
};

/**
 * Format date for full display (desktop)
 */
export const formatDateFull = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date for short display (mobile)
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format time for mobile display
 */
export const formatTimeMobile = (dateString: string): string => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get status badge CSS classes
 */
export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "Generated":
      return "bg-[var(--success-100)] text-[var(--success-800)] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    case "Draft":
      return "bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
    default:
      return "bg-[var(--muted)] text-[var(--muted-foreground)] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";
  }
};

/**
 * Get status badge CSS classes for mobile
 */
export const getStatusBadgeClassMobile = (status: string): string => {
  switch (status) {
    case "Generated":
      return "bg-green-100 text-green-700";
    case "Draft":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

