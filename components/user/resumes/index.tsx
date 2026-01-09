"use client";

import { useResumes } from "@/hooks/user/useResumes";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ResumesHeader } from "./ResumesHeader";
import { SearchAndFilters } from "./SearchAndFilters";
import { ResumesTable } from "./ResumesTable";
import { ResumesList } from "./ResumesList";
import { EmptyState } from "./EmptyState";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { RenameDialog } from "./dialogs/RenameDialog";
import { useRouter } from "next/navigation";

export const ResumesContainer = () => {
  useAuthGuard("User");
  const router = useRouter();

  const {
    resumes,
    filteredResumes,
    loadingResumes,
    filters,
    setSearchQuery,
    setStatusFilter,
    setDateFilter,
    menuState,
    menuButtonRefs,
    toggleMenu,
    setOpenMenuId,
    dialogState,
    setNewFileName,
    handleEditResume,
    handleViewResume,
    handleDownloadResume,
    openDeleteConfirm,
    cancelDelete,
    performDelete,
    openRenameDialog,
    cancelRename,
    performRename,
  } = useResumes();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] pb-8 sm:pb-8">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ResumesHeader resumeCount={resumes.length} />

        <SearchAndFilters
          filters={filters}
          setSearchQuery={setSearchQuery}
          setStatusFilter={setStatusFilter}
          setDateFilter={setDateFilter}
        />

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          {filteredResumes.length === 0 && !loadingResumes ? (
            <EmptyState />
          ) : (
            <ResumesTable
              resumes={filteredResumes}
              loading={loadingResumes}
              handleViewResume={handleViewResume}
              handleEditResume={handleEditResume}
              handleDownloadResume={handleDownloadResume}
              openDeleteConfirm={openDeleteConfirm}
              openRenameDialog={openRenameDialog}
              deletingId={dialogState.deletingId}
              menuButtonRefs={menuButtonRefs}
              toggleMenu={toggleMenu}
              menuState={menuState}
              setOpenMenuId={setOpenMenuId}
            />
          )}
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden space-y-4">
          {filteredResumes.length === 0 && !loadingResumes ? (
            <EmptyState />
          ) : (
            <ResumesList
              resumes={filteredResumes}
              loading={loadingResumes}
              handleViewResume={handleViewResume}
              handleEditResume={handleEditResume}
              handleDownloadResume={handleDownloadResume}
              openDeleteConfirm={openDeleteConfirm}
              openRenameDialog={openRenameDialog}
              deletingId={dialogState.deletingId}
              menuButtonRefs={menuButtonRefs}
              toggleMenu={toggleMenu}
              menuState={menuState}
              setOpenMenuId={setOpenMenuId}
            />
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <button
          onClick={() => router.push("/user/upload")}
          className="sm:hidden fixed right-6 bottom-10 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center text-white z-50 hover:bg-blue-700 transition-colors active:scale-95"
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          confirmResume={dialogState.confirmResume}
          deletingId={dialogState.deletingId}
          onCancel={cancelDelete}
          onConfirm={performDelete}
        />

        {/* Rename Dialog */}
        <RenameDialog
          renameResume={dialogState.renameResume}
          newFileName={dialogState.newFileName}
          renamingId={dialogState.renamingId}
          onCancel={cancelRename}
          onConfirm={performRename}
          onFileNameChange={setNewFileName}
        />

        {/* Toast */}
        {dialogState.toastMessage && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[70] animate-in slide-in-from-bottom-5">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-sm shadow-xl font-medium text-sm">
              {dialogState.toastMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

