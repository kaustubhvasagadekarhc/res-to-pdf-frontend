"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { adminService } from "@/app/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
 
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Shield,
  ChevronDown,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ActivityLog, PaginatedResponse } from "../../../../types/api";

// Type guard for details with endpoint
interface DetailsWithEndpoint {
  endpoint: string;
  [key: string]: unknown;
}

const hasEndpoint = (details: unknown): details is DetailsWithEndpoint => {
  return (
    typeof details === "object" &&
    details !== null &&
    "endpoint" in details &&
    typeof (details as DetailsWithEndpoint).endpoint === "string"
  );
};

// Helper to determine color based on string (e.g. user name)
const getStringColor = (str: string) => {
  const lower = str.toLowerCase();
  
  // Special cases for System and Admin - white text on colored backgrounds
  if (lower.includes("system") || lower === "sys") {
    return { bg: "bg-purple-200", text: "text-white" };
  }
  if (lower.includes("admin") || lower === "adm") {
    return { bg: "bg-blue-200", text: "text-white" };
  }
  
  // Default colors for users - white text on colored backgrounds
  const colors = [
    { bg: "bg-pink-200", text: "text-white" },
    { bg: "bg-rose-200", text: "text-white" },
    { bg: "bg-emerald-200", text: "text-white" },
    { bg: "bg-amber-200", text: "text-white" },
    { bg: "bg-violet-200", text: "text-white" },
    { bg: "bg-indigo-200", text: "text-white" },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await adminService.getAdminActivities({
        page,
        limit,
      })) as unknown as PaginatedResponse<ActivityLog>;

      if (res && res.data) {
        setActivities(res.data);
        setTotal(res.pagination?.total || 0);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Failed to load activities", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  const totalPages = Math.ceil(total / limit);

  // Helper function to get user name
  const getUserName = (user?: { name?: string; email: string }) => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "System";
  };

  // Filter activities by search query and filters
  const filteredActivities = activities.filter((activity) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const userName = getUserName(activity.user).toLowerCase();
      const userEmail = activity.user?.email?.toLowerCase() || "";
      const action = activity.action.toLowerCase();
      const description = activity.description?.toLowerCase() || "";
      
      const matchesSearch = (
        userName.includes(query) ||
        userEmail.includes(query) ||
        action.includes(query) ||
        description.includes(query)
      );
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== "all") {
      const actionLower = activity.action.toLowerCase();
      if (statusFilter === "success" && (actionLower.includes("delete") || actionLower.includes("fail"))) {
        return false;
      }
      if (statusFilter === "error" && !actionLower.includes("delete") && !actionLower.includes("fail")) {
        return false;
      }
      if (statusFilter === "warning" && !actionLower.includes("warn")) {
        return false;
      }
    }
    
    // Action type filter
    if (actionTypeFilter !== "all") {
      const actionLower = activity.action.toLowerCase();
      if (actionTypeFilter === "admin" && !actionLower.includes("admin") && !actionLower.includes("verification")) {
        return false;
      }
      if (actionTypeFilter === "auth" && !actionLower.includes("auth") && !actionLower.includes("login") && !actionLower.includes("logout")) {
        return false;
      }
      if (actionTypeFilter === "system" && !actionLower.includes("system") && getUserName(activity.user) !== "System") {
        return false;
      }
    }
    
    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.createdAt);
    let key = format(date, "MMMM d, yyyy");
    if (isToday(date)) key = "TODAY";
    if (isYesterday(date)) key = "YESTERDAY";

    if (!groups[key]) groups[key] = [];
    groups[key].push(activity);
    return groups;
  }, {} as Record<string, ActivityLog[]>);

  // Helper to get status icon
  const getStatusIcon = (action: string, user?: { name?: string; email: string }) => {
    const lower = action.toLowerCase();
    const userName = getUserName(user);
    const isAdmin = userName.toLowerCase().includes("admin") || userName.toLowerCase().includes("system admin");
    
    if (lower.includes("delete") || lower.includes("fail"))
      return <XCircle className="w-5 h-5 text-rose-500 fill-white" />;
    if (lower.includes("warn"))
      return <AlertCircle className="w-5 h-5 text-amber-500 fill-white" />;
    if (isAdmin || lower.includes("admin") || lower.includes("verification"))
      return <Shield className="w-5 h-5 text-blue-500 fill-white" />;
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />;
  };

  const getInitials = (name?: string, email?: string) => {
    const source = name || email || "System";
    if (source === "System" || source.toLowerCase().includes("system")) {
      return "SYS";
    }
    if (source.toLowerCase().includes("admin")) {
      return "ADM";
    }
    // Get first 2-3 letters for names
    if (name && name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return source.substring(0, 1).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--primary)] mb-1">
                Activity Logs
              </h1>
              <p className="text-slate-600">
                Track system events and user actions in real-time.
              </p>
            </div>

            {/* Search, Filter, and Refresh */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-[250px]"
                />
              </div>

              {/* Filter Button with Dropdown */}
              <div className="relative" ref={filterDropdownRef}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`h-10 w-10 border-gray-200  hover:bg-gray-50 ${(statusFilter !== "all" || actionTypeFilter !== "all") ? "border-blue-400 bg-blue-50" : ""}`}
                  title="Filter logs"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                </Button>
                
                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs  font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border  border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <option value="all">All Status</option>
                          <option value="success">Success</option>
                          <option value="error">Error</option>
                          <option value="warning">Warning</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-700  uppercase tracking-wide mb-2 block">
                          Action Type
                        </label>
                        <select
                          value={actionTypeFilter}
                          onChange={(e) => setActionTypeFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <option value="all">All Types</option>
                          <option value="admin">Admin Actions</option>
                          <option value="auth">Authentication</option>
                          <option value="system">System Events</option>
                        </select>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStatusFilter("all");
                            setActionTypeFilter("all");
                          }}
                          className="flex-1 text-blue-600 text-xs"
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowFilterDropdown(false)}
                          className="flex-1 text-white text-xs bg-blue-600 hover:bg-blue-400"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={fetchActivities}
                disabled={loading}
                className="h-10 px-4 border-gray-200 hover:bg-gray-50 text-gray-700"
                title="Refresh logs"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

      {loading && filteredActivities.length === 0 && activities.length === 0 ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          {searchQuery ? "No activities found matching your search" : "No activities found"}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {Object.entries(groupedActivities).map(([dateLabel, groupLogs]) => {
            const date = groupLogs[0] ? new Date(groupLogs[0].createdAt) : new Date();
            const formattedDate = format(date, "MMMM d, yyyy");
            const displayLabel = dateLabel === "TODAY" ? "TODAY'S ACTIVITY" : dateLabel === "YESTERDAY" ? "YESTERDAY'S ACTIVITY" : dateLabel.toUpperCase();
            
            return (
            <div key={dateLabel} className="p-6">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  {displayLabel}
                </h3>
                <span className="text-sm font-medium text-slate-500">
                  {dateLabel === "TODAY" ? format(new Date(), "MMMM d, yyyy") : dateLabel === "YESTERDAY" ? format(new Date(Date.now() - 86400000), "MMMM d, yyyy") : formattedDate}
                </span>
              </div>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[80px] top-3 bottom-0 w-px bg-slate-200" />

                <div className="space-y-6">
                  {groupLogs.map((log) => {
                    const userName = getUserName(log.user);
                    const userColor = getStringColor(userName);

                    return (
                      <div
                        key={log.id}
                        className="grid grid-cols-[60px_40px_1fr] gap-0 relative group"
                      >
                        {/* Time */}
                        <div className="text-right  pr-2">
                          <span className="text-xs font-medium text-slate-400">
                            {format(new Date(log.createdAt), "hh:mm a")}
                          </span>
                        </div>

                        {/* Timeline Node */}
                        <div className="flex justify-center pt-0.5 z-0">
                          <div className="bg-white">
                            {getStatusIcon(log.action, log.user)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="pl-2 pt-0.5 pb-2">
                          <div className="flex flex-wrap items-start gap-2 text-sm leading-6">
                            {/* Avatar Badge */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm ${userColor.bg} ${userColor.text} ring-2 ring-white`}
                            >
                              {getInitials(log.user?.name, log.user?.email)}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-800">
                                  {userName === "System" ? "System" : userName}
                                </span>
                                {log.action.toLowerCase().includes("automatic") && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded uppercase">
                                    AUTOMATIC
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                {log.action.replace(/_/g, " ").split(" ").map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(" ")}
                              </div>
                              {log.user?.email && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {log.user.email}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Message / Details Card */}
                          {(!!log.details ||
                            (log.description &&
                              log.description.length > 10)) && (
                            <div className="mt-3 ml-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                {log.action.toLowerCase().includes("endpoint") || log.action.toLowerCase().includes("auth") ? (
                                  <>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      &lt;&gt; ENDPOINT ACCESSED
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      ACTION DETAILS
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-sm text-slate-700">
                                {log.description && (
                                  <p className="mb-2">
                                    {log.description}
                                  </p>
                                )}
                                {!!log.details && typeof log.details === 'object' && (
                                  <div className="space-y-1 text-xs">
                                    {Object.entries(log.details).map(([key, value]) => (
                                      <div key={key} className="flex items-center gap-2 text-slate-600">
                                        {key.toLowerCase().includes('status') && (
                                          <>
                                            <span className="font-medium">{key}:</span>
                                            <span>{String(value)}</span>
                                          </>
                                        )}
                                        {key.toLowerCase().includes('ip') && (
                                          <>
                                            <span className="font-medium">IP:</span>
                                            <span>{String(value)}</span>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {log.action.toLowerCase().includes("endpoint") && hasEndpoint(log.details) && (
                                  <a 
                                    href={log.details.endpoint} 
                                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                                  >
                                    {log.details.endpoint}
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

        {/* Load More Button */}
        {!loading && filteredActivities.length > 0 && page < totalPages && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading}
              className="px-6 py-2 border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              Load older logs
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
