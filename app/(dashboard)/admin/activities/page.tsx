"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/app/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ActivityLog, PaginatedResponse } from "../../../../types/api";

// Helper to determine color based on string (e.g. user name)
const getStringColor = (str: string) => {
    const colors = [
        { bg: "bg-emerald-100", text: "text-emerald-700" },
        { bg: "bg-rose-100", text: "text-rose-700" },
        { bg: "bg-blue-100", text: "text-blue-700" },
        { bg: "bg-amber-100", text: "text-amber-700" },
        { bg: "bg-violet-100", text: "text-violet-700" },
        { bg: "bg-indigo-100", text: "text-indigo-700" },
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

    const totalPages = Math.ceil(total / limit);

    // Group activities by date
    const groupedActivities = activities.reduce((groups, activity) => {
        const date = new Date(activity.createdAt);
        let key = format(date, "d MMMM, yyyy");
        if (isToday(date)) key = "TODAY";
        if (isYesterday(date)) key = "YESTERDAY";

        if (!groups[key]) groups[key] = [];
        groups[key].push(activity);
        return groups;
    }, {} as Record<string, ActivityLog[]>);

    // Helper to get status icon
    const getStatusIcon = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('delete') || lower.includes('fail')) return <XCircle className="w-5 h-5 text-rose-500 fill-white" />;
        if (lower.includes('warn')) return <AlertCircle className="w-5 h-5 text-amber-500 fill-white" />;
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />;
    };

    const getInitials = (name?: string, email?: string) => {
        const source = name || email || "System";
        return source.substring(0, 1).toUpperCase();
    };

    const getUserName = (user?: { name?: string, email: string }) => {
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return "System";
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans text-slate-900">
            {/* Header */}
            <div className="flex items-center mb-10">
                <h1 className="text-2xl font-bold text-slate-800 mr-3">Activity Logs</h1>
                <Button variant="ghost" size="icon" onClick={fetchActivities} disabled={loading} className="hover:bg-slate-100 rounded-full">
                    <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {loading && activities.length === 0 ? (
                <div className="py-20 flex justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : activities.length === 0 ? (
                <div className="py-20 text-center text-slate-500">No activities found</div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedActivities).map(([dateLabel, groupLogs]) => (
                        <div key={dateLabel}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                {dateLabel}
                            </h3>

                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[80px] top-3 bottom-0 w-px  bg-slate-200" />

                                <div className="space-y-8">
                                    {groupLogs.map((log) => {
                                        const userName = getUserName(log.user);
                                        const userColor = getStringColor(userName);

                                        return (
                                            <div key={log.id} className="grid grid-cols-[60px_40px_1fr] gap-0 relative group">
                                                {/* Time */}
                                                <div className="text-right  pr-2">
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {format(new Date(log.createdAt), "hh:mm a")}
                                                    </span>
                                                </div>

                                                {/* Timeline Node */}
                                                <div className="flex justify-center pt-0.5 z-0">
                                                    <div className="bg-white">
                                                        {getStatusIcon(log.action)}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="pl-2 pt-0.5 pb-2">
                                                    <div className="flex flex-wrap items-start gap-2 text-sm leading-6">
                                                        {/* Avatar */}
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${userColor.bg} ${userColor.text} ring-2 ring-white`}>
                                                            {getInitials(log.user?.name, log.user?.email)}
                                                        </div>

                                                        {/* Text Content */}

                                                        <div className="flex-1">
                                                            <div>
                                                                <span className="font-bold text-slate-800">
                                                                    {userName}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs flex items-center gap-1 mb-1">
                                                                <span className="text-slate-500">{log.user?.email}</span>
                                                                <span className="text-slate-400">-</span>
                                                                <span className="text-slate-900">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Message / Details Card */}
                                                    {(!!log.details || (log.description && log.description.length > 10)) && (
                                                        <div className="mt-2 ml-8 p-3 bg-white border border-slate-200 rounded-sm shadow-sm">
                                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                                                Details
                                                            </div>
                                                            <div className="text-sm text-slate-600">
                                                                {log.description && (
                                                                    <p className="mb-2 font-medium">{log.description}</p>
                                                                )}
                                                                {!!log.details && (
                                                                    <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto text-slate-500 font-mono">
                                                                        {JSON.stringify(log.details, null, 2)}
                                                                    </pre>
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
                    ))}
                </div>
            )}

            {/* Simple Pagination */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="text-slate-500 hover:text-slate-900"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Newer
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="text-slate-500 hover:text-slate-900"
                >
                    Older <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
