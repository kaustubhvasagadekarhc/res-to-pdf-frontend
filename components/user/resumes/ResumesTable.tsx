"use client";

import { Resume } from "@/contexts/UserContext";
import { FileText } from "lucide-react";
import { formatDateFull, getStatusBadgeClass } from "@/lib/resume/resume-filters.utils";
import { ActionsMenu } from "./ActionsMenu";
import { ResumeMenuState } from "@/lib/resume/resume-filters.types";

interface ResumesTableProps {
  resumes: Resume[];
  loading: boolean;
  handleViewResume: (resume: Resume) => void;
  handleEditResume: (resume: Resume) => void;
  handleDownloadResume: (resume: Resume) => void;
  openDeleteConfirm: (resume: Resume) => void;
  openRenameDialog: (resume: Resume) => void;
  deletingId: string | null;
  menuButtonRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  toggleMenu: (e: React.MouseEvent, id: string) => void;
  menuState: ResumeMenuState;
  setOpenMenuId: (id: string | null) => void;
}

export const ResumesTable = ({
  resumes,
  loading,
  handleViewResume,
  handleEditResume,
  handleDownloadResume,
  openDeleteConfirm,
  openRenameDialog,
  deletingId,
  menuButtonRefs,
  toggleMenu,
  menuState,
  setOpenMenuId,
}: ResumesTableProps) => {
  if (loading) {
    return (
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
          <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
            Created
          </div>
          <div className="col-span-2 text-right text-xs font-bold text-gray-400 uppercase">
            Status
          </div>
          <div className="col-span-2 text-left text-xs font-bold text-gray-400 uppercase pr-8">
            Actions
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
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-visible">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
          Sr No
        </div>
        <div className="col-span-3 text-xs font-bold text-gray-400 uppercase">
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
        <div className="col-span-2 text-center text-xs font-bold text-gray-400 uppercase">
          Status
        </div>
        <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
          Actions
        </div>
      </div>
      {resumes.map((resume, index) => (
        <div
          key={resume.id}
          className="grid grid-cols-12 gap-4 p-5 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors"
        >
          <div className="col-span-1 text-sm font-semibold text-gray-600">
            {index + 1}
          </div>
          <div className="col-span-3 flex items-center gap-3">
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
          <div className="col-span-2 flex items-center justify-center gap-3">
            <div className={getStatusBadgeClass(resume.status)}>
              {resume.status}
            </div>
          </div>
          <div className="col-span-1 flex items-start justify-start gap-3 pr-4">
            <ActionsMenu
              resume={resume}
              handleViewResume={handleViewResume}
              handleEditResume={handleEditResume}
              handleDownloadResume={handleDownloadResume}
              openDeleteConfirm={openDeleteConfirm}
              openRenameDialog={openRenameDialog}
              deletingId={deletingId}
              menuButtonRefs={menuButtonRefs}
              toggleMenu={toggleMenu}
              menuState={menuState}
              setOpenMenuId={setOpenMenuId}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

