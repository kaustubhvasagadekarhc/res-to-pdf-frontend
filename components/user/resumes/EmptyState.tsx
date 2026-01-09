"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export const EmptyState = () => {
  const router = useRouter();

  return (
    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
      <div className="mx-auto w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No resumes yet</h3>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        You haven&apos;t generated any resumes yet. Create your first
        professional resume now!
      </p>
      <Button
        onClick={() => router.push("/user/upload")}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-sm shadow-lg shadow-blue-200"
      >
        Create New Resume
      </Button>
    </div>
  );
};

