"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser, Resume } from "@/contexts/UserContext";
import { ResumeFilters, ResumeMenuState, ResumeDialogState } from "@/lib/resume/resume-filters.types";
import { filterResumes } from "@/lib/resume/resume-filters.utils";
import {
  deleteResume as deleteResumeApi,
  renameResumeFile,
  prepareResumeForEdit,
  downloadResumeFile,
  viewResume,
} from "@/lib/resume/resume-operations.api";

export const useResumes = () => {
  const router = useRouter();
  const { user, resumes, loadingResumes, refreshResumes, removeResume } = useUser();

  // Filters
  const [filters, setFilters] = useState<ResumeFilters>({
    searchQuery: "",
    statusFilter: "all",
    dateFilter: "",
  });

  // Menu state
  const menuButtonRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [menuState, setMenuState] = useState<ResumeMenuState>({
    openMenuId: null,
    menuAbove: {},
  });

  // Dialog state
  const [dialogState, setDialogState] = useState<ResumeDialogState>({
    confirmResume: null,
    renameResume: null,
    newFileName: "",
    deletingId: null,
    renamingId: null,
    toastMessage: null,
  });

  // Trigger fetch if needed
  useEffect(() => {
    if (user?.id) {
      refreshResumes();
    }
  }, [user?.id, refreshResumes]);

  // Filtered resumes
  const filteredResumes = useMemo(
    () => filterResumes(resumes, filters),
    [resumes, filters]
  );

  // Menu helpers
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
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const dropdownHeight = 140;

    const container = getOverflowParent(el);
    const containerRect = container.getBoundingClientRect();
    const spaceBelow = containerRect.bottom - rect.bottom;
    const spaceAbove = rect.top - containerRect.top;

    const above = spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;

    if (
      !above &&
      window.innerHeight - rect.bottom < dropdownHeight &&
      rect.top >= dropdownHeight
    ) {
      setMenuState((prev) => ({
        ...prev,
        menuAbove: { ...prev.menuAbove, [id]: true },
      }));
    } else {
      setMenuState((prev) => ({
        ...prev,
        menuAbove: { ...prev.menuAbove, [id]: above },
      }));
    }

    setMenuState((prev) => ({
      ...prev,
      openMenuId: prev.openMenuId === id ? null : id,
    }));
  };

  // Close menu on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!menuState.openMenuId) return;
      const btn = menuButtonRefs.current.get(menuState.openMenuId);
      const drop = document.getElementById(`resume-menu-${menuState.openMenuId}`);
      if (btn && btn.contains(e.target as Node)) return;
      if (drop && drop.contains(e.target as Node)) return;
      setMenuState((prev) => ({ ...prev, openMenuId: null }));
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuState((prev) => ({ ...prev, openMenuId: null }));
      }
    };
    window.addEventListener("click", handleDocClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", handleDocClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuState.openMenuId]);

  // Handlers
  const handleEditResume = async (resume: Resume) => {
    try {
      prepareResumeForEdit(resume);
      router.push(`/user/edit-resume?id=${resume.id}`);
    } catch (error) {
      console.error("Error preparing resume for editing:", error);
      toast.error("Failed to load resume data for editing");
    }
  };

  const handleViewResume = (resume: Resume) => {
    if (resume.fileUrl) {
      viewResume(resume);
    } else {
      router.push(`/user/edit-resume?id=${resume.id}`);
    }
  };

  const handleDownloadResume = (resume: Resume) => {
    if (resume.fileUrl) {
      downloadResumeFile(resume);
    } else {
      alert("Resume file not available for download");
    }
  };

  const openDeleteConfirm = (resume: Resume) => {
    setDialogState((prev) => ({
      ...prev,
      confirmResume: resume,
    }));
    setMenuState((prev) => ({ ...prev, openMenuId: null }));
  };

  const cancelDelete = () => {
    setDialogState((prev) => ({ ...prev, confirmResume: null }));
  };

  const performDelete = async () => {
    if (!dialogState.confirmResume) return;
    const resume = dialogState.confirmResume;
    
    setDialogState((prev) => ({ ...prev, deletingId: resume.id }));
    
    try {
      await deleteResumeApi(resume.id);
      removeResume(resume.id);
      setDialogState((prev) => ({
        ...prev,
        confirmResume: null,
        toastMessage: "Resume deleted",
      }));
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setDialogState((prev) => ({
        ...prev,
        toastMessage: "Failed to delete resume",
      }));
    } finally {
      setDialogState((prev) => ({ ...prev, deletingId: null }));
      setTimeout(() => {
        setDialogState((prev) => ({ ...prev, toastMessage: null }));
      }, 3000);
    }
  };

  const openRenameDialog = (resume: Resume) => {
    setDialogState((prev) => ({
      ...prev,
      renameResume: resume,
      newFileName: resume.fileName.replace(/\.pdf$/i, ""),
    }));
    setMenuState((prev) => ({ ...prev, openMenuId: null }));
  };

  const cancelRename = () => {
    setDialogState((prev) => ({
      ...prev,
      renameResume: null,
      newFileName: "",
    }));
  };

  const performRename = async () => {
    if (
      !dialogState.renameResume ||
      !dialogState.newFileName.trim() ||
      dialogState.renamingId === dialogState.renameResume.id
    ) {
      return;
    }

    const originalName = dialogState.renameResume.fileName.replace(/\.pdf$/i, "");
    if (dialogState.newFileName.trim() === originalName) {
      toast.error("Please enter a different name");
      return;
    }

    setDialogState((prev) => ({
      ...prev,
      renamingId: prev.renameResume!.id,
    }));

    try {
      await renameResumeFile(
        dialogState.renameResume.id,
        dialogState.newFileName.trim()
      );
      await refreshResumes(true);
      setDialogState((prev) => ({
        ...prev,
        renameResume: null,
        newFileName: "",
      }));
      toast.success("Resume renamed successfully");
    } catch (err) {
      console.error("Failed to rename resume:", err);
      toast.error("Failed to rename resume");
    } finally {
      setDialogState((prev) => ({ ...prev, renamingId: null }));
    }
  };

  return {
    // Data
    resumes,
    filteredResumes,
    loadingResumes,
    user,

    // Filters
    filters,
    setFilters,
    setSearchQuery: (query: string) =>
      setFilters((prev) => ({ ...prev, searchQuery: query })),
    setStatusFilter: (status: string) =>
      setFilters((prev) => ({ ...prev, statusFilter: status })),
    setDateFilter: (date: string) =>
      setFilters((prev) => ({ ...prev, dateFilter: date })),

    // Menu
    menuState,
    menuButtonRefs,
    toggleMenu,
    setOpenMenuId: (id: string | null) =>
      setMenuState((prev) => ({ ...prev, openMenuId: id })),

    // Dialogs
    dialogState,
    setNewFileName: (name: string) =>
      setDialogState((prev) => ({ ...prev, newFileName: name })),

    // Actions
    handleEditResume,
    handleViewResume,
    handleDownloadResume,
    openDeleteConfirm,
    cancelDelete,
    performDelete,
    openRenameDialog,
    cancelRename,
    performRename,
  };
};

