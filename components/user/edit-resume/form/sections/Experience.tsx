"use client";

import { ResumeData, ValidationErrors } from "@/lib/resume/resume.types";
import { Trash2, Plus, X, Calendar } from "lucide-react";
import { AutoHeightTextarea } from "../../AutoHeightTextarea";
import { MonthYearPicker } from "../../MonthYearPicker";

interface ExperienceProps {
  resumeData: ResumeData;
  workExpDateErrors: ValidationErrors;
  workExpTechInputs: { [key: string]: string };
  setWorkExpTechInputs: (value: { [key: string]: string }) => void;
  updateWorkExperience: (index: number, field: string, value: string) => void;
  addWorkExperience: () => void;
  deleteWorkExperience: (index: number) => void;
  addProject: (expIndex: number) => void;
  deleteProject: (expIndex: number, projIndex: number) => void;
  updateProjectField: (expIndex: number, projIndex: number, field: string, value: string) => void;
  addWorkExpTech: (e: React.KeyboardEvent<HTMLInputElement>, expIndex: number, projIndex: number) => void;
  removeWorkExpTech: (expIndex: number, projIndex: number, techToRemove: string) => void;
}

export const Experience = ({
  resumeData,
  workExpDateErrors,
  workExpTechInputs,
  setWorkExpTechInputs,
  updateWorkExperience,
  addWorkExperience,
  deleteWorkExperience,
  addProject,
  deleteProject,
  updateProjectField,
  addWorkExpTech,
  removeWorkExpTech,
}: ExperienceProps) => {
  return (
    <div className="space-y-6 pl-4">
      {resumeData.work_experience.map((exp, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-sm border border-slate-300 relative group transition-all"
        >
          <button
            onClick={() => deleteWorkExperience(index)}
            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                value={exp.company}
                onChange={(e) =>
                  updateWorkExperience(index, "company", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700">
                Position <span className="text-rose-500">*</span>
              </label>
              <input
                value={exp.position}
                onChange={(e) =>
                  updateWorkExperience(index, "position", e.target.value)
                }
                className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300"
                placeholder="Job Title"
              />
            </div>
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Start Date <span className="text-rose-500">*</span>
              </label>
              <MonthYearPicker
                value={exp.period_from}
                onChange={(value) => updateWorkExperience(index, "period_from", value)}
                placeholder="Select start date"
                error={!!workExpDateErrors[`workExp_${index}_dates`]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-md px-2 font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                End Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <MonthYearPicker
                  value={exp.period_to.toLowerCase() === "present" ? "" : exp.period_to}
                  onChange={(value) => updateWorkExperience(index, "period_to", value)}
                  placeholder="Select end date"
                  error={!!workExpDateErrors[`workExp_${index}_dates`]}
                  disabled={exp.period_to.toLowerCase() === "present"}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (exp.period_to.toLowerCase() === "present") {
                      updateWorkExperience(index, "period_to", "");
                    } else {
                      updateWorkExperience(index, "period_to", "Present");
                    }
                  }}
                  className={`px-4 py-3 border rounded-sm border-slate-300 transition-all duration-200 text-sm font-medium ${exp.period_to.toLowerCase() === "present"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  Present
                </button>
              </div>

            </div>

            {workExpDateErrors[`workExp_${index}_dates`] && (
              <div className="col-span-2">
                <p className="text-xs text-rose-500 px-2 mt-1">
                  {workExpDateErrors[`workExp_${index}_dates`]}
                </p>
              </div>
            )}

          </div>
          <div className="space-y-1">
            <label className="text-md px-2 font-semibold text-slate-700">
              Job Responsibilities <span className="text-rose-500">*</span>
            </label>
            <AutoHeightTextarea
              value={exp.responsibilities?.join('\n') || ''}
              onChange={(e) =>
                updateWorkExperience(index, "responsibilities", e.target.value)
              }
              className="w-full bg-white border rounded-sm px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 min-h-[100px] resize-none"
              placeholder="List your key responsibilities (each line will be a bullet point)"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
              Key Highlights / Projects
            </h4>

            <div className="space-y-3">
              {exp.projects.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-slate-50 p-6 rounded-sm border border-slate-200 relative group/proj space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-sm px-2 font-semibold text-slate-700">
                      Highlight Name
                    </label>
                    <input
                      value={proj.name}
                      onChange={(e) =>
                        updateProjectField(index, pIdx, "name", e.target.value)
                      }
                      placeholder="e.g. Lead Frontend Development"
                      className="w-full bg-white border rounded-sm border-slate-300 px-4 py-2 border-b  transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm px-2 font-semibold text-slate-700">
                      Description / Responsibilities
                    </label>
                    <AutoHeightTextarea
                      value={proj.description}
                      onChange={(e) =>
                        updateProjectField(index, pIdx, "description", e.target.value)
                      }
                      placeholder="What did you achieve? Use bullet points if needed..."
                      className="w-full bg-white border rounded-sm  px-4 py-2 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-sm min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm px-2 font-semibold text-slate-700">
                      Technologies
                    </label>
                    <input
                      value={workExpTechInputs[`${index}-${pIdx}`] || ""}
                      onChange={(e) =>
                        setWorkExpTechInputs({
                          ...workExpTechInputs,
                          [`${index}-${pIdx}`]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => addWorkExpTech(e, index, pIdx)}
                      placeholder="Add tech (Press Enter)"
                      className="w-full bg-white border rounded-sm  px-4 py-2 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 text-xs"
                    />
                    <div className="flex flex-wrap gap-1 mb-2">
                      {proj.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-white text-slate-700 px-2 py-0.5 rounded-sm text-xs font-medium flex items-center gap-1 border border-slate-200"
                        >
                          {tech}
                          <button
                            onClick={() => removeWorkExpTech(index, pIdx, tech)}
                            className="hover:text-rose-500 transition-colors p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteProject(index, pIdx)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => addProject(index)}
              className="mt-4 text-sm font-bold text-[var(--primary)] flex items-center gap-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 px-4 py-2 rounded-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Highlight
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addWorkExperience}
        className="w-full py-4 border border-dashed border-slate-300 rounded-sm text-slate-500 font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
        Add New Experience
      </button>
    </div>
  );
};

