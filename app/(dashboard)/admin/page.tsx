"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
  MoreHorizontal,
  ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  useAuthGuard("Admin");
  const router = useRouter();
  const [stats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalResumes: 3456,
    todayResumes: 45,
  });

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      trend: "up",
      gradient: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/25",
      ring: "ring-indigo-100"
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: "+4.3%",
      icon: UserCheck,
      trend: "up",
      gradient: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/25",
      ring: "ring-emerald-100"
    },
    {
      title: "Total Resumes",
      value: stats.totalResumes.toLocaleString(),
      change: "+28.4%",
      icon: FileText,
      trend: "up",
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
      ring: "ring-violet-100"
    },
    {
      title: "Today's Resumes",
      value: stats.todayResumes.toLocaleString(),
      change: "-2.1%",
      icon: TrendingUp,
      trend: "down",
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/25",
      ring: "ring-amber-100"
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      href: "/dashboard/admin/users",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      icon: BarChart3,
      href: "/dashboard/admin/analytics",
      iconColor: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: Settings,
      href: "/dashboard/admin/settings",
      iconColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Activity Logs",
      description: "Monitor system activity",
      icon: Activity,
      href: "/dashboard/admin/logs",
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Admin Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back to your control center.
          </p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" className="hidden sm:flex border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800" onClick={() => {}}>Export Report</Button>
             <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5" onClick={() => {}}>Create User</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 ring-1 ${card.ring}`}
          >
            <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
               <card.icon className="w-32 h-32 transform rotate-12" />
            </div>
            
            <div className="relative">
                <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md ${card.shadow}`}>
                        <card.icon className="w-6 h-6" />
                    </div>
                    {/* Tiny sparkline placeholder or similar could go here */}
                </div>
                
                <div className="space-y-1">
                     <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-[11px]">{card.title}</p>
                     <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</h3>
                </div>

                <div className="mt-5 flex items-center text-xs font-bold">
                    <span 
                      className={`flex items-center gap-1 ${card.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2.5 py-1 rounded-full`}
                    >
                        {card.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5 rotate-180" />}
                        {card.change}
                    </span>
                    <span className="text-slate-400 ml-2 font-medium">vs last month</span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium">View All</Button>
          </div>
          <div className="relative border-l-2 border-indigo-50 ml-3 space-y-8">
            {[
              {
                user: "John Doe",
                action: "uploaded a new resume",
                time: "2 mins ago", 
                avatar: "JD",
                color: "bg-blue-100 text-blue-600"
              },
              {
                user: "Jane Smith",
                action: "generated PDFs for 3 clients",
                time: "15 mins ago",
                 avatar: "JS",
                 color: "bg-purple-100 text-purple-600"
              },
              { user: "Mike Johnson", action: "registered a new account", time: "1 hr ago", avatar: "MJ", color: "bg-orange-100 text-orange-600" },
              {
                user: "Sarah Williams",
                action: "updated profile settings",
                time: "2 hrs ago",
                avatar: "SW",
                color: "bg-emerald-100 text-emerald-600"
              },
            ].map((activity, index) => (
              <div key={index} className="relative pl-8 group">
                <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-indigo-200 group-hover:bg-indigo-500 transition-colors shadow-sm" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 -m-3 rounded-xl hover:bg-slate-50 transition-colors">
                   <div>
                       <p className="text-sm text-slate-600 font-medium">
                          <span className="font-bold text-slate-800">{activity.user}</span> {activity.action}
                       </p>
                       <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      onClick={() => router.push(action.href)}
                      className="w-full flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group active:scale-95"
                    >
                      <div className={`${action.bgColor} ${action.iconColor} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-sm`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{action.description}</p>
                      </div>
                      <div className="bg-slate-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
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
