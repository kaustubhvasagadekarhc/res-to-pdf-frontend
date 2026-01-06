"use client";

import { useAdmin } from "@/app/context/admin-context";
import { toast } from "sonner";
import { adminService } from "@/app/api/client";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  Check,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  X,
  UserPlus,
  Upload,
  Mail,
  Loader2,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function UserManagementPage() {
  useAuthGuard("Admin");

  const { users, isLoading: ctxLoading, refreshData, updateLocalUser } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteFile, setInviteFile] = useState<File | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Sync local loading state with context loading
  useEffect(() => {
    setLoading(ctxLoading);
  }, [ctxLoading]);

  const handleRoleUpdate = async (
    userId: string,
    currentRole: "USER" | "ADMIN" = "USER"
  ) => {
    try {
      const newRole = currentRole === "USER" ? "ADMIN" : "USER";
      // Optimistic update
      updateLocalUser(userId, { userType: newRole });

      await adminService.patchAdminUsersRole({
        id: userId,
        requestBody: { userType: newRole },
      });
      // Refresh to ensure consistency
      refreshData();
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update user role");
      // Revert optimization if needed (or just refresh)
      refreshData();
    }
  };

  const handleVerifyUpdate = async (userId: string, isVerified: boolean) => {
    try {
      // Optimistic update
      updateLocalUser(userId, { isVerified: !isVerified });

      await adminService.patchAdminUsersVerify({
        id: userId,
        requestBody: { isVerified: !isVerified },
      });
      refreshData();
    } catch (error) {
      console.error("Failed to update verification:", error);
      toast.error("Failed to update verification status");
      refreshData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminService.deleteAdminUsers({ id: userId });
      refreshData(); // Refresh list
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInviteFile(file);
      setIsParsing(true);
      try {
        const response = await adminService.postAdminResumeParse({
          formData: { resume: file },
        });

        // Backend response structure is { status: 'success', data: { parsed: { personal: { ... } } } }
        const personal = response?.data?.parsed?.personal;

        if (personal) {
          setInviteEmail(personal.email || "");
          setInviteName(personal.name || "");
          toast.success("Resume parsed and details auto-filled!");
        } else {
          setInviteEmail("");
          setInviteName("");
          toast.info("Resume parsed but no contact details were found.");
        }
      } catch (error) {
        console.error("Failed to parse resume:", error);
        toast.error("Failed to parse resume");
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Please provide name and email");
      return;
    }
    setIsInviting(true);
    setInviteError(null);
    try {
      await adminService.postAdminUsersInvite({
        requestBody: { email: inviteEmail, name: inviteName },
      });
      setShowInviteDialog(false);
      setInviteFile(null);
      setInviteName("");
      toast.success("User invited successfully");
      refreshData();
    } catch (error: unknown) {
      console.error("Failed to invite user:", error);
      const apiError = error as {
        status?: number;
        body?: { message?: string };
      };
      if (
        apiError.status === 409 ||
        apiError.body?.message?.includes("exists")
      ) {
        setInviteError("This user already exists in the system.");
      } else {
        toast.error("Failed to invite user");
      }
    } finally {
      setIsInviting(false);
    }
  };

  // Calculate KPI metrics
  const totalUsers = users.length;
  const adminCount = users.filter((user) => user.userType === "ADMIN").length;
  const verifiedCount = users.filter((user) => user.isVerified).length;
  const unverifiedCount = users.filter((user) => !user.isVerified).length;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.userType === "ADMIN") ||
      (roleFilter === "user" && user.userType === "USER");
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && user.isVerified) ||
      (statusFilter === "unverified" && !user.isVerified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--primary)] mb-1">
                User Management
              </h1>
              <p className="text-slate-600">
                Manage system users, roles, and access.
              </p>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] whitespace-nowrap font-medium gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Upload a resume to auto-fill details or enter them manually.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Custom File Upload Area */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">
                      Resume (Optional)
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 flex flex-col items-center justify-center gap-2 group cursor-pointer
                                                ${isParsing
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-300 hover:border-[var(--primary)] hover:bg-slate-50"
                        }`}
                      onClick={() =>
                        document.getElementById("resume-upload")?.click()
                      }
                    >
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isParsing}
                      />
                      <div className="p-3 bg-slate-100 rounded-full group-hover:bg-[var(--primary-50)] transition-colors">
                        {isParsing ? (
                          <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                        ) : inviteFile ? (
                          <Check className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-[var(--primary)]" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">
                          {isParsing
                            ? "Parsing Resume..."
                            : inviteFile
                              ? inviteFile.name
                              : "Click to upload resume"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {inviteFile
                            ? "Resume uploaded successfully"
                            : "PDF files only (max 5MB)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {inviteError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      {inviteError}
                    </div>
                  )}

                  <div className="grid w-full items-center gap-2">
                    <Label
                      htmlFor="name"
                      className="text-slate-700 font-semibold"
                    >
                      Name
                    </Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="John Doe"
                        className="pl-10 h-11 border-slate-200 focus:border-[var(--primary)] focus:ring-[var(--primary-50)]"
                      />
                    </div>
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-semibold"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="pl-10 h-11 border-slate-200 focus:border-[var(--primary)] focus:ring-[var(--primary-50)]"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="ghost"
                    onClick={() => setShowInviteDialog(false)}
                    className="text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={
                      isInviting || isParsing || !inviteName || !inviteEmail
                    }
                    className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white px-8 h-11 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Inviting...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Members */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Admin Count */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Admin</p>
                  <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Verified Count */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Verified</p>
                  <p className="text-2xl font-bold text-emerald-600">{verifiedCount}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Unverified Count */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Unverified</p>
                  <p className="text-2xl font-bold text-orange-700">{unverifiedCount}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar - Combined Component */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0 w-full">
              {/* Search Bar - Left Side (60-70% width) */}
              <div className="relative flex-[3] min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filters - Right Side */}
              <div className="flex items-center gap-3 flex-1 sm:justify-end">
                {/* Role Filter */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`appearance-none bg-white border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors w-full sm:min-w-[130px] ${
                      roleFilter !== "all" 
                        ? "border-blue-400" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`appearance-none bg-white border rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors w-full sm:min-w-[130px] ${
                      statusFilter !== "all" 
                        ? "border-blue-400" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading users...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                User Details
              </div>
              <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Access Level
              </div>
              <div className="col-span-2 text-xs font-bold text-slate-500 pl-4 uppercase tracking-wider">
                Status
              </div>
              <div className="col-span-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider pr-12">
                Actions
              </div>
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-100 last:border-b-0 items-center hover:bg-slate-50/80 transition-all group"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shrink-0">
                    {user.name?.charAt(0).toUpperCase() || (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${user.userType === "ADMIN"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}
                  >
                    {user.userType === "ADMIN" ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    {user.userType}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${user.isVerified
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                  >
                    {user.isVerified ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Verified
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" /> Unverified
                      </>
                    )}
                  </span>
                </div>
                <div className="col-span-3 flex justify-end gap-1 pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      user.id &&
                      handleRoleUpdate(user.id, user.userType || "USER")
                    }
                    className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Toggle Role"
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      user.id &&
                      handleVerifyUpdate(user.id, user.isVerified || false)
                    }
                    className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Toggle Verification"
                  >
                    <Check
                      className={`w-4 h-4 ${user.isVerified ? "text-emerald-600" : ""
                        }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => user.id && handleDeleteUser(user.id)}
                    className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
