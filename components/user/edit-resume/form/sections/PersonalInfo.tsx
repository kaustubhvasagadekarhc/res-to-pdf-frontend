"use client";

import { ResumeData, ValidationErrors } from "@/lib/resume/resume.types";

interface PersonalInfoProps {
  resumeData: ResumeData;
  validationErrors: ValidationErrors;
  updatePersonal: (field: string, value: string) => void;
  formatNameInput: (value: string) => string;
  formatLocationInput: (value: string) => string;
  formatMobileInput: (value: string) => string;
}

export const PersonalInfo = ({
  resumeData,
  validationErrors,
  updatePersonal,
  formatNameInput,
  formatLocationInput,
  formatMobileInput,
}: PersonalInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Full Name
        </label>
        <input
          value={resumeData?.personal.name || ""}
          onChange={(e) => {
            const formatted = formatNameInput(e.target.value);
            updatePersonal("name", formatted);
          }}
          className={`w-full bg-white border rounded-sm ${
            validationErrors.name
              ? "border-rose-500"
              : "border-slate-300"
          } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
          placeholder="John Doe"
        />
        {validationErrors.name && (
          <p className="text-xs text-rose-500 px-2 mt-1">
            {validationErrors.name}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Job Title
        </label>
        <input
          value={resumeData?.personal.designation || ""}
          onChange={(e) => {
            const formatted = formatNameInput(e.target.value);
            updatePersonal("designation", formatted);
          }}
          className={`w-full bg-white border rounded-sm ${
            validationErrors.designation
              ? "border-rose-500"
              : "border-slate-300"
          } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
          placeholder="Software Engineer"
        />
        {validationErrors.designation && (
          <p className="text-xs text-rose-500 px-2 mt-1">
            {validationErrors.designation}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Email
        </label>
        <input
          value={resumeData?.personal.email || ""}
          onChange={(e) => updatePersonal("email", e.target.value)}
          className={`w-full bg-white border rounded-sm ${
            validationErrors.email
              ? "border-rose-500"
              : "border-slate-300"
          } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
          placeholder="john@example.com"
        />
        {validationErrors.email && (
          <p className="text-xs text-rose-500 px-2 mt-1">
            {validationErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Mobile
        </label>
        <input
          value={resumeData?.personal.mobile || "+91"}
          onChange={(e) => {
            const formatted = formatMobileInput(e.target.value);
            updatePersonal("mobile", formatted);
          }}
          className={`w-full bg-white border rounded-sm ${
            validationErrors.mobile
              ? "border-rose-500"
              : "border-slate-300"
          } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
          placeholder="+91 00000 00000"
        />
        {validationErrors.mobile && (
          <p className="text-xs text-rose-500 px-2 mt-1">
            {validationErrors.mobile}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Location
        </label>
        <input
          value={resumeData?.personal.location || ""}
          onChange={(e) => {
            const formatted = formatLocationInput(e.target.value);
            updatePersonal("location", formatted);
          }}
          className={`w-full bg-white border rounded-sm ${
            validationErrors.location
              ? "border-rose-500"
              : "border-slate-300"
          } px-4 py-3 border-b border-gray-300 transition-colors duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300`}
          placeholder="New York, USA"
        />
        {validationErrors.location && (
          <p className="text-xs text-rose-500 px-2 mt-1">
            {validationErrors.location}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-md px-2 font-semibold text-slate-700">
          Gender
        </label>
        <select
          value={resumeData?.personal.gender || ""}
          onChange={(e) => updatePersonal("gender", e.target.value)}
          className="w-full bg-white border rounded-sm border-slate-300 px-4 py-3 border-b border-gray-300 transition-colors transition-[border-width] duration-200 focus:outline-none focus:border-b-2 focus:border-[var(--primary)] placeholder:text-slate-300 transition-all"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

