"use client";

import { Button } from "@/components/ui/button";
import { Resume } from "@/contexts/UserContext";

interface DeleteConfirmDialogProps {
  confirmResume: Resume | null;
  deletingId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({
  confirmResume,
  deletingId,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  if (!confirmResume) return null;

  return (
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
            onClick={onCancel}
            className="flex-1 rounded-sm h-12 border-gray-200 font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 text-white rounded-sm h-12 bg-red-600 hover:bg-red-700 font-bold"
          >
            {deletingId === confirmResume.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

