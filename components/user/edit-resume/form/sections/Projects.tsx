"use client";

import { ResumeData } from "@/lib/resume/resume.types";
import { Trash2, Plus, X } from "lucide-react";
import { AutoHeightTextarea } from "../../AutoHeightTextarea";

interface ProjectsProps {
  resumeData: ResumeData;
  projectTechInputs: { [key: number]: string };
  setProjectTechInputs: (value: { [key: number]: string }) => void;
  updateStandaloneProject: (index: number, field: string, value: string) => void;
  addStandaloneProject: () => void;
  deleteStandaloneProject: (index: number) => void;
  addProjectTech: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  removeProjectTech: (index: number, techToRemove: string) => void;
}

export const Projects = ({
  resumeData,
  projectTechInputs,
  setProjectTechInputs,
  updateStandaloneProject,
  addStandaloneProject,
  deleteStandaloneProject,
  addProjectTech,
  removeProjectTech,
}: ProjectsProps) => {
  return (
    <div className="space-y-6 pl-4">
      {resumeData.projects.map((proj, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-sm border border-slate-300 relative group transition-all"
        >
          <button
            onClick={() => deleteStandaloneProject(index)}
            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Project Name
              </label>
              <input
                value={proj.name}
                onChange={(e) =>
                  updateStandaloneProject(index, "name", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="Project Name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Description
              </label>
              <AutoHeightTextarea
                value={proj.description}
                onChange={(e) =>
                  updateStandaloneProject(index, "description", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[120px] resize-none"
                placeholder="Briefly describe what you built..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Technologies
              </label>
              <input
                value={projectTechInputs[index] || ""}
                onChange={(e) =>
                  setProjectTechInputs({
                    ...projectTechInputs,
                    [index]: e.target.value,
                  })
                }
                onKeyDown={(e) => addProjectTech(e, index)}
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="Add technology (Press Enter)"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {proj.technologies.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="bg-white text-blue-600 px-2.5 py-1 rounded-sm text-xs font-medium flex items-center gap-1 border border-slate-200 shadow-sm"
                  >
                    {tech}
                    <button
                      onClick={() => removeProjectTech(index, tech)}
                      className="hover:text-rose-500 transition-colors p-0.5"
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
      <button
        onClick={addStandaloneProject}
        className="w-full py-4 border border-dashed border-slate-300 rounded-sm text-slate-500 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
        Add Project
      </button>
    </div>
  );
};

