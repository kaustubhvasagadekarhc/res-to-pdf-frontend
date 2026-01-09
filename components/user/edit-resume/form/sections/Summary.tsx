"use client";

import { ResumeData } from "@/lib/resume/resume.types";
import { AutoHeightTextarea } from "../../AutoHeightTextarea";

interface SummaryProps {
  resumeData: ResumeData;
  updateSummary: (value: string) => void;
}

export const Summary = ({ resumeData, updateSummary }: SummaryProps) => {
  return (
    <div className="space-y-4 pl-4">
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Professional Summary{" "}
          <span className="text-rose-500">*</span>
        </label>
        <AutoHeightTextarea
          value={resumeData?.summary}
          onChange={(e) => updateSummary(e.target.value)}
          className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[250px] resize-none"
          placeholder="Write a brief summary of your career highlights..."
        />
      </div>
      <div className="flex justify-end pr-2">
        <span className="text-xs text-slate-400">
          {resumeData.summary.length} characters
        </span>
      </div>
    </div>
  );
};

