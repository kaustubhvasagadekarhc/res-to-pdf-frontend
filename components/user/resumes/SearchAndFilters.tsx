"use client";

import { ChevronDown, Search } from "lucide-react";
import { ResumeFilters } from "@/lib/resume/resume-filters.types";

interface SearchAndFiltersProps {
  filters: ResumeFilters;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setDateFilter: (date: string) => void;
}

export const SearchAndFilters = ({
  filters,
  setSearchQuery,
  setStatusFilter,
  setDateFilter,
}: SearchAndFiltersProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-0 w-full">
        {/* Search Bar - Left Side */}
        <div className="relative flex-[3] min-w-0 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters - Right Side */}
        <div className="flex gap-3 flex-1 sm:justify-end w-full">
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filters.statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none bg-white border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors w-full sm:min-w-[130px] ${
                filters.statusFilter !== "all"
                  ? "border-blue-400"
                  : "border-gray-300 hover:border-gray-300"
              }`}
            >
              <option value="all">All Status</option>
              <option value="Generated">Generated</option>
              <option value="Draft">Draft</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              onClick={() =>
                (
                  document.getElementById("date-filter") as HTMLInputElement
                ).showPicker()
              }
              className={`flex items-center justify-between gap-2 bg-white border rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors w-full sm:min-w-[130px] ${
                filters.dateFilter
                  ? "border-blue-400"
                  : "border-gray-300 hover:border-gray-300"
              }`}
            >
              <span>
                {filters.dateFilter
                  ? new Date(filters.dateFilter).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "All Dates"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
            </button>
            <input
              id="date-filter"
              type="date"
              value={filters.dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="absolute opacity-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

