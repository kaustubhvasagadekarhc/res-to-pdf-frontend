"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { motion } from "framer-motion";
import {
  Activity,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
  MoreHorizontal,
  // ArrowUpRight,
  Loader2,
  Clock,
  Trash2,
  UserX,
  Edit,
  ShieldCheck,
  ArrowRight,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/app/context/admin-context";

// import { adminService } from "@/app/api/client";
// import { ActivityLog } from "../../../types/api";

// Helper to get icon and color based on action type - elegant rounded square style
const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("delete") || actionLower.includes("deleted")) {
    return { icon: Trash2, bgColor: "bg-red-50", iconColor: "text-red-600" };
  }
  if (actionLower.includes("trigger") || actionLower.includes("triggered")) {
    return { icon: Play, bgColor: "bg-orange-50", iconColor: "text-orange-600" };
  }
  if (actionLower.includes("patch") || actionLower.includes("patched") || actionLower.includes("edit") || actionLower.includes("updated")) {
    return { icon: Edit, bgColor: "bg-blue-50", iconColor: "text-blue-600" };
  }
  if (actionLower.includes("verify") || actionLower.includes("verified")) {
    return { icon: ShieldCheck, bgColor: "bg-green-50", iconColor: "text-green-600" };
  }
  return { icon: Activity, bgColor: "bg-indigo-50", iconColor: "text-indigo-600" };
};

// Helper to extract action code/details from activity
const getActionDetails = (activity: { action: string; description?: string; details?: unknown }) => {
  const actionUpper = activity.action.toUpperCase();
  const details = activity.details;
  
  // Check if details has endpoint or action code
  if (details && typeof details === "object" && details !== null) {
    const detailsObj = details as Record<string, unknown>;
    if ("endpoint" in detailsObj && typeof detailsObj.endpoint === "string") {
      return detailsObj.endpoint;
    }
    if ("actionCode" in detailsObj && typeof detailsObj.actionCode === "string") {
      return detailsObj.actionCode;
    }
  }
  
  // Try to extract from description
  if (activity.description) {
    const match = activity.description.match(/([A-Z_]+)/);
    if (match) return match[1];
  }
  
  // Generate from action
  return actionUpper.replace(/\s+/g, "_");
};

export default function AdminDashboard() {
  useAuthGuard("Admin");
  const router = useRouter();
  const { stats, recentActivities, isLoading } = useAdmin();

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      trend: "up",
      gradient: "bg-indigo-500",
      ring: "ring-indigo-100",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: "+4.3%",
      icon: UserCheck,
      trend: "up",
      gradient: "bg-emerald-500",
      ring: "ring-emerald-100",
    },
    {
      title: "Total Resumes",
      value: stats.totalResumes.toLocaleString(),
      change: "+28.4%",
      icon: FileText,
      trend: "up",
      gradient: "from-violet-500 to-purple-600",
      ring: "ring-violet-100",
    },
    {
      title: "Generated PDFs",
      value: stats.todayResumes.toLocaleString(),
      change: "-2.1%",
      icon: TrendingUp,
      trend: "down",
      gradient: "bg-orange-500",
      ring: "ring-amber-100",
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      href: "/admin/users",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: Settings,
      href: "/admin/settings",
      iconColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Activity Logs",
      description: "Monitor system activity",
      icon: Activity,
      href: "/admin/activities",
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-slate-500 font-medium">Loading Overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end  md:justify-between">
        {/* flex items-end justify-between */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--primary)]">
            Admin Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back to your control center.
          </p>
        </div>
        {/* <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800" onClick={() => { }}>Export Report</Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white transition-all hover:-translate-y-0.5" onClick={() => { }}>Create User</Button>
        </div> */}
      </div>

      {/* Stats Grid - KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          // Map gradients to pastel colors for icon backgrounds
          const iconBgMap: { [key: string]: { bg: string; icon: string } } = {
            "bg-indigo-500": { bg: "bg-blue-50", icon: "text-blue-600" },
            "bg-emerald-500": { bg: "bg-green-50", icon: "text-green-600" },
            "from-violet-500 to-purple-600": { bg: "bg-purple-50", icon: "text-purple-600" },
            "bg-orange-500": { bg: "bg-orange-50", icon: "text-orange-600" },
          };
          
          const iconStyle = iconBgMap[card.gradient] || { bg: "bg-indigo-50", icon: "text-indigo-600" };

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-lg bg-white p-6 border border-slate-200 shadow-sm group transition-all duration-300 hover:shadow-md"
            >
              {/* Icon in top right corner with rounded square background */}
              <div className="absolute top-4 right-4">
                <div className={`${iconStyle.bg} rounded-lg p-2.5`}>
                  <card.icon className={`w-5 h-5 ${iconStyle.icon}`} strokeWidth={2} />
                </div>
              </div>

              {/* Content */}
              <div className="relative pr-16">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                    {card.value}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
                <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Monitoring user actions & system logs
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/activities")}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1.5 transition-all hover:gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Activity List */}
          <div className="relative">
            {recentActivities.length === 0 ? (
              <div className="pl-14 py-12">
                <p className="text-slate-400 text-sm font-medium">No recent activities.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Elegant subtle timeline */}
                <div className="absolute left-5 top-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"></div>
                
                <div className="space-y-10">
                  {recentActivities.slice(0, 5).map((activity, index) => {
                    const { icon: ActionIcon, bgColor, iconColor } = getActionIcon(activity.action);
                    const actionDetails = getActionDetails(activity);
                    const userName = activity.user?.email || "System";
                    const timestamp = activity.createdAt
                      ? new Date(activity.createdAt).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "-";

                    return (
                      <div key={activity.id} className="relative pl-14 group">
                        {/* Elegant rounded square icon with soft pastel background */}
                        <div className={`absolute left-0 top-0 h-9 w-9 rounded-lg ${bgColor} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
                          <ActionIcon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
                        </div>

                        {/* Content with professional spacing */}
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-8">
                            <div className="flex-1 space-y-2.5 min-w-0">
                              {/* User and Action */}
                              <p className="text-sm leading-relaxed text-slate-700">
                                <span className="font-semibold text-slate-900">
                                  {userName}
                                </span>{" "}
                                <span className="text-slate-600">
                                  {activity.description || activity.action}
                                </span>
                              </p>
                              
                              {/* Action Details - elegant styling */}
                              {actionDetails && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  {activity.action.toLowerCase().includes("trigger") && (
                                    <span className="text-orange-500 text-[10px] font-bold leading-none">▲</span>
                                  )}
                                  {activity.action.toLowerCase().includes("verify") && (
                                    <span className="text-green-500 text-[10px] font-bold leading-none">●</span>
                                  )}
                                  <span className="text-[11px] text-slate-500 font-mono tracking-wide">
                                    {actionDetails}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Timestamp - elegantly positioned */}
                            <div className="flex-shrink-0 pt-0.5">
                              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                {timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            {recentActivities.length > 5 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push("/admin/activities")}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Load earlier activity
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-md border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center p-3 rounded-md hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group active:scale-95"
                >
                  <div
                    className={`${action.bgColor} ${action.iconColor} p-3 rounded-md mr-4 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {action.description}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
