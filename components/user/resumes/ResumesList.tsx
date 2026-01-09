"use client";

import { Resume } from "@/contexts/UserContext";
import { FileText } from "lucide-react";
import {
  formatDateShort,
  formatTimeMobile,
  getStatusBadgeClassMobile,
} from "@/lib/resume/resume-filters.utils";
import { ActionsMenu } from "./ActionsMenu";
import { ResumeMenuState } from "@/lib/resume/resume-filters.types";

interface ResumesListProps {
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

export const ResumesList = ({
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
}: ResumesListProps) => {
  if (loading) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
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
        ))}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
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
                  {resume.fileName.replace(".pdf", "") || resume.jobTitle || "Resume"}
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
              openRenameDialog={openRenameDialog}
              deletingId={deletingId}
              menuButtonRefs={menuButtonRefs}
              toggleMenu={toggleMenu}
              menuState={menuState}
              setOpenMenuId={setOpenMenuId}
            />
          </div>
          <div className="h-px bg-gray-100 -mx-4 my-4" />
          <div className="flex items-center justify-between">
            <span
              className={`px-2.5 py-1 rounded-sm text-xs font-bold leading-none ${getStatusBadgeClassMobile(
                resume.status
              )}`}
            >
              {resume.status}
            </span>
            <span className="text-gray-500 text-sm font-medium">
              {formatTimeMobile(resume.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

