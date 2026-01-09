"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ResumesHeaderProps {
  resumeCount: number;
}

export const ResumesHeader = ({ resumeCount }: ResumesHeaderProps) => {
  const router = useRouter();

  return (
    <div className="mb-2">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-1">
            My Resumes{" "}
            <span className="text-slate-500 text-xl">({resumeCount})</span>
          </h1>
          <p className="text-slate-600">
            Manage, edit, and download your generated professional resumes.
          </p>
        </div>
        <div className="hidden md:flex items-center">
          <Button
            onClick={() => router.push("/user/upload")}
            className="ml-3 bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] whitespace-nowrap font-medium"
          >
            Create New Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

