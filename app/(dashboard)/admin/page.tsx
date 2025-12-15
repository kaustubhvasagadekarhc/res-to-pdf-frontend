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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      icon: Users,
      color: "from-primary to-action",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },

    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Resumes",
      value: stats.totalResumes.toLocaleString(),
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Today's Resumes",
      value: stats.todayResumes.toLocaleString(),
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      href: "/dashboard/admin/users",
      color: "from-primary to-action",
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      icon: BarChart3,
      href: "/dashboard/admin/analytics",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: Settings,
      href: "/dashboard/admin/settings",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Activity Logs",
      description: "Monitor system activity",
      icon: Activity,
      href: "/dashboard/admin/logs",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 pb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Manage your platform and view statistics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {card.title}
            </h3>
            <p
              className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
            >
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => router.push(action.href)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:scale-[1.02] transition-all duration-300 group"
            >
              <div
                className={`bg-gradient-to-r ${action.color} p-3 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              user: "John Doe",
              action: "uploaded a resume",
              time: "2 minutes ago",
            },
            {
              user: "Jane Smith",
              action: "generated a PDF",
              time: "15 minutes ago",
            },
            { user: "Mike Johnson", action: "registered", time: "1 hour ago" },
            {
              user: "Sarah Williams",
              action: "updated profile",
              time: "2 hours ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-action rounded-full flex items-center justify-center text-white font-semibold">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
