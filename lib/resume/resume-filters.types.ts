import { Resume } from "@/contexts/UserContext";

export interface ResumeFilters {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
}

export interface ResumeMenuState {
  openMenuId: string | null;
  menuAbove: Record<string, boolean>;
}

export interface ResumeDialogState {
  confirmResume: Resume | null;
  renameResume: Resume | null;
  newFileName: string;
  deletingId: string | null;
  renamingId: string | null;
  toastMessage: string | null;
}

