"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/app/api/client";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
    id: string;
    createdAt: string;
    user?: {
        email: string;
    };
    action: string;
    details: unknown;
    ipAddress?: string;
}

interface ApiResponse {
    status: string;
    data: ActivityLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState<string | undefined>(undefined);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const res = (await adminService.getAdminActivities({
                page,
                limit,
                type: filterType,
            })) as ApiResponse;

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
    }, [page, limit, filterType]);

    useEffect(() => {
        void fetchActivities();
    }, [fetchActivities]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                        Activity Logs
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Monitor system-wide events and actions
                    </p>
                </div>
                <Button variant="outline" onClick={fetchActivities} disabled={loading}>
                    Refresh
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                            disabled
                        />
                    </div>
                    <Select
                        value={filterType || "ALL"}
                        onValueChange={(val) => {
                            setFilterType(val === "ALL" ? undefined : val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-slate-200">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <SelectValue placeholder="Filter by Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="USER_LOGIN">User Login</SelectItem>
                            <SelectItem value="USER_UPDATE">User Update</SelectItem>
                            <SelectItem value="USER_DELETE">User Delete</SelectItem>
                            {/* Add other types as discovered */}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[150px]">User</TableHead>
                                <TableHead className="w-[150px]">Action</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="w-[120px]">IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : activities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No activities found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.map((log: ActivityLog) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                                        <TableCell className="text-slate-600 font-medium">
                                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-900">{log.user?.email || 'System'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate text-slate-500">
                                            {/* Assuming details is JSON or string */}
                                            {JSON.stringify(log.details) || '-'}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-mono">
                                            {log.ipAddress || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-slate-500">
                        Page {page} of {totalPages || 1}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="rounded-xl border-slate-200"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                            className="rounded-xl border-slate-200"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
