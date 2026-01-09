"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempPdfName: string;
  setTempPdfName: (name: string) => void;
  isRenameClicked: boolean;
  handleSavePdfName: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  canClose?: boolean; // Allow closing only if validation passes
}

// Validation function for PDF name
const validatePdfName = (name: string): string | null => {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return "Name cannot be empty";
  }

  // Check for blank spaces
  if (trimmed.includes(" ")) {
    return "Name cannot contain spaces. Use underscores (_) or hyphens (-) instead";
  }

 

  // Check for consecutive special characters (2 or more consecutive special chars)
  // Special characters: !@#$%^&*()_+-=[]{}|;:'",.<>?/~`
  if (/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~`]{2,}/.test(trimmed)) {
    return "Name cannot contain consecutive special characters";
  }

  return null;
};

export const RenameModal = ({
  isOpen,
  onOpenChange,
  tempPdfName,
  setTempPdfName,
  isRenameClicked,
  handleSavePdfName,

 
  
}: RenameModalProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    // Always allow closing via X button or ESC key
    // The canClose prop is for preventing accidental closes, but X button should work
    if (!open) {
      setValidationError(null);
    }
    onOpenChange(open);
  };

  const handleInputChange = (value: string) => {
    setTempPdfName(value);
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Your PDF</DialogTitle>
          <DialogDescription>
            Give your resume a name. This will be the file name when you
            download the generated PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right font-medium">
              Name
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="name"
                value={tempPdfName}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g. My_Resume_2024"
                className={`h-10 border-slate-200 focus:ring-[var(--primary)] ${
                  validationError ? "border-red-500 focus:border-red-500" : ""
                }`}
                onBlur={() => {
                  // Validate on blur
                  const error = validatePdfName(tempPdfName);
                  setValidationError(error);
                }}
              />
              {validationError && (
                <p className="text-xs text-red-500 mt-1">{validationError}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                The .pdf extension will be added automatically
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <button
            onClick={() => {
              // Just close the modal, don't proceed to next step
              // User must click "Next" button to proceed
              onOpenChange(false);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-sm border border-slate-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => {
              // Validate before saving
              const error = validatePdfName(tempPdfName);
              if (error) {
                setValidationError(error);
                return;
              }
              setValidationError(null);
              handleSavePdfName();
            }}
            disabled={isRenameClicked || tempPdfName.trim().length === 0 || !!validationError}
            className="px-4 py-2 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
          >
            Save & Continue
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

