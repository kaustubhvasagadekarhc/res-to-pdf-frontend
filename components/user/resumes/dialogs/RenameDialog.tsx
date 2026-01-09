"use client";

import { Resume } from "@/contexts/UserContext";

interface RenameDialogProps {
  renameResume: Resume | null;
  newFileName: string;
  renamingId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  onFileNameChange: (name: string) => void;
}

export const RenameDialog = ({
  renameResume,
  newFileName,
  renamingId,
  onCancel,
  onConfirm,
  onFileNameChange,
}: RenameDialogProps) => {
  if (!renameResume) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-dialog-title"
    >
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="relative bg-white rounded-sm p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Rename Resume
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Enter a new name for{" "}
          <span className="text-gray-900 font-semibold">
            {renameResume.fileName.replace(".pdf", "")}
          </span>
        </p>
        <div className="mb-4">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            placeholder="Enter new file name"
            disabled={renamingId === renameResume.id}
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                newFileName.trim() &&
                renamingId !== renameResume.id
              ) {
                onConfirm();
              } else if (e.key === "Escape") {
                onCancel();
              }
            }}
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">
            The .pdf extension will be added automatically
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-sm border border-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              renamingId === renameResume.id ||
              (newFileName?.trim()?.length ?? 0) < 1
            }
            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {renamingId === renameResume.id ? "Renaming..." : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
};

