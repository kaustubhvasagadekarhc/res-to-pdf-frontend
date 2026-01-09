"use client";

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
}

export const RenameModal = ({
  isOpen,
  onOpenChange,
  tempPdfName,
  setTempPdfName,
  isRenameClicked,
  handleSavePdfName,
  currentStep,
  setCurrentStep,
}: RenameModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Input
              id="name"
              value={tempPdfName}
              onChange={(e) => setTempPdfName(e.target.value)}
              placeholder="e.g. My_Resume_2024"
              className="col-span-3 h-10 border-slate-200 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <button
            onClick={() => {
              // Save tempPdfName even when skipping (preserves any partial input)
              // The actual update is handled in the hook via handleSavePdfName
              onOpenChange(false);
              setCurrentStep(currentStep + 1);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-sm border border-slate-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSavePdfName}
            disabled={isRenameClicked || tempPdfName.trim().length === 0}
            className="px-4 py-2 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
          >
            Save & Continue
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

