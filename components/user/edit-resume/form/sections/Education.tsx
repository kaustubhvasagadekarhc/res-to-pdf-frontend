"use client";

import { ResumeData } from "@/lib/resume/resume.types";
import { Trash2, Plus, Calendar } from "lucide-react";
import { MonthYearPicker } from "../../MonthYearPicker";

interface EducationProps {
  resumeData: ResumeData;
  updateEducation: (index: number, field: string, value: string) => void;
  addEducation: () => void;
  deleteEducation: (index: number) => void;
}

export const Education = ({
  resumeData,
  updateEducation,
  addEducation,
  deleteEducation,
}: EducationProps) => {
  return (
    <div className="space-y-6 pl-4">
      {resumeData.education.map((edu, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-sm border border-slate-300 relative group transition-all"
        >
          <button
            onClick={() => deleteEducation(index)}
            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Institution{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                value={edu.institution}
                onChange={(e) =>
                  updateEducation(index, "institution", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="University Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Degree{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                value={edu.degree}
                onChange={(e) =>
                  updateEducation(index, "degree", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="e.g. Bachelor's in CS"
              />
            </div>
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Field of Study
              </label>
              <input
                value={edu.field || ""}
                onChange={(e) =>
                  updateEducation(index, "field", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="Major"
              />
            </div>
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Graduation Date
              </label>
              <MonthYearPicker
                value={edu.graduation_year}
                onChange={(value) => updateEducation(index, "graduation_year", value)}
                placeholder="Select graduation date"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addEducation}
        className="w-full py-4 border border-dashed border-slate-300 rounded-sm text-slate-500 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
        Add Education
      </button>
    </div>
  );
};

