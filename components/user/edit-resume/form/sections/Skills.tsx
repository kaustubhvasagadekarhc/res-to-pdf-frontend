"use client";

import { ResumeData } from "@/lib/resume/resume.types";
import { X } from "lucide-react";

interface SkillsProps {
  resumeData: ResumeData;
  skillInput: string;
  setSkillInput: (value: string) => void;
  addSkill: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  removeSkill: (skill: string) => void;
}

export const Skills = ({
  resumeData,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
}: SkillsProps) => {
  return (
    <div className="space-y-4 pl-4">
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Key Skills
        </label>
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
          placeholder="Type a skill and press Enter..."
        />
        <div className="p-4 border border-slate-200 rounded-sm bg-white min-h-[120px] mb-3">
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.length === 0 && (
              <p className="text-slate-400 text-sm italic">
                No skills added yet...
              </p>
            )}
            {resumeData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-slate-100 text-blue-600 px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-1 border border-slate-200"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

