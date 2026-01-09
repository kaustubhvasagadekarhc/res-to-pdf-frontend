"use client";

import { Button } from "@/components/ui/button";
import { Resume } from "@/contexts/UserContext";
import {
  Download,
  Edit3,
  Eye,
  FileEdit,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { ResumeMenuState } from "@/lib/resume/resume-filters.types";

interface ActionsMenuProps {
  resume: Resume;
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

export const ActionsMenu = ({
  resume,
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
}: ActionsMenuProps) => {
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

      {menuState.openMenuId === resume.id && (
        <div
          id={`resume-menu-${resume.id}`}
          className={`absolute right-0 ${
            menuState.menuAbove[resume.id]
              ? "bottom-full mb-2"
              : "top-full mt-2"
          } w-48 bg-white border border-gray-100 rounded-sm shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {resume.status === "Generated" && (
            <button
              onClick={() => {
                handleViewResume(resume);
                setOpenMenuId(null);
              }}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors group"
            >
              <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />{" "}
              View
            </button>
          )}
          <button
            onClick={() => {
              handleEditResume(resume);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors group"
          >
            <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />{" "}
            Edit
          </button>
          <button
            onClick={() => {
              handleDownloadResume(resume);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-3 transition-colors group"
          >
            <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />{" "}
            Download
          </button>
          <button
            onClick={() => {
              openRenameDialog(resume);
            }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-3 transition-colors group"
          >
            <FileEdit className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />{" "}
            Rename
          </button>
          <div className="h-px bg-gray-50 mx-2 my-1" />
          <button
            onClick={() => openDeleteConfirm(resume)}
            disabled={deletingId === resume.id}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors group disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />{" "}
            {deletingId === resume.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
};

