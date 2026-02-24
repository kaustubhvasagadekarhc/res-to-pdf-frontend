"use client";

import {
  DEFAULT_SKILL_CATEGORIES,
  ResumeData,
} from "@/lib/resume/resume.types";
import { normalizeSkills } from "@/lib/resume/resume.utils";
import { X } from "lucide-react";
// import { useState } from "react";

interface SkillsProps {
  resumeData: ResumeData;
  skillInputs: Record<string, string>;
  setSkillInputs: (value: Record<string, string>) => void;
  addSkillToCategory: (
    e: React.KeyboardEvent<HTMLInputElement>,
    category: string,
  ) => void;
  removeSkillFromCategory: (category: string, skill: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
}

export const Skills = ({
  resumeData,
  skillInputs,
  setSkillInputs,
  addSkillToCategory,
  removeSkillFromCategory,
  // addCategory,
  removeCategory,
}: SkillsProps) => {
  // const [newCategoryInput, setNewCategoryInput] = useState("");
  const skills = normalizeSkills(resumeData.skills);

  // Ensure default categories exist on first render
  const categories: string[] = [...DEFAULT_SKILL_CATEGORIES];

  // Initialize default categories if skills is empty
  if (Object.keys(skills).length === 0) {
    DEFAULT_SKILL_CATEGORIES.forEach((cat) => {
      if (!skills[cat]) {
        skills[cat] = [];
      }
    });
  }

  const isDefaultCategory = (cat: string) =>
    (DEFAULT_SKILL_CATEGORIES as readonly string[]).includes(cat);

  // const handleAddCategory = () => {
  //   const name = newCategoryInput.trim();
  //   if (name && !categories.includes(name)) {
  //     addCategory(name);
  //     setNewCategoryInput("");
  //   }
  // };

  return (
    <div className="space-y-4 pl-4">
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Skill Set
        </label>
        <p className="text-sm px-2 text-slate-500">
          Add skills under each category. Press Enter to add a skill.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category}
            className="border border-slate-200 rounded-sm bg-white"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                {category}
              </span>
              {!isDefaultCategory(category) && (
                <button
                  onClick={() => removeCategory(category)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-slate-200"
                  title="Remove category"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Input + Tags */}
            <div className="p-3">
              <input
                type="text"
                value={skillInputs[category] || ""}
                onChange={(e) =>
                  setSkillInputs({ ...skillInputs, [category]: e.target.value })
                }
                onKeyDown={(e) => addSkillToCategory(e, category)}
                className="w-full bg-white border rounded-sm border-slate-300 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder={`Type a skill and press Enter...`}
              />

              <div className="mt-2 min-h-[36px]">
                <div className="flex flex-wrap gap-2">
                  {(skills[category] || []).length === 0 && (
                    <p className="text-slate-400 text-xs italic py-1">
                      No skills added yet...
                    </p>
                  )}
                  {(skills[category] || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-blue-600 px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-1 border border-slate-200"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkillFromCategory(category, skill)}
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
        ))}

        {/* Add Custom Category */}
        {/* <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            className="flex-1 bg-white border rounded-sm border-slate-300 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
            placeholder="Add a custom category..."
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryInput.trim()}
            className="px-3 py-2 rounded-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-700)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div> */}
      </div>
    </div>
  );
};
