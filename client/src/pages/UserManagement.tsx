import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Shield, User, MoreHorizontal, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "admin" | "user";

interface UserRow {
  id: number;
  name: string | null;
  openId: string;
  role: Role;
  createdAt: string | Date;
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [confirmUser, setConfirmUser] = useState<{ id: number; name: string | null; newRole: Role } | null>(null);

  const { data, isLoading, refetch } = trpc.admin.listUsers.useQuery();
  const changeRoleMutation = trpc.admin.changeUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role has been changed successfully.");
      refetch();
      setConfirmUser(null);
    },
    onError: (err) => {
      toast.error((err as { message?: string }).message ?? "Failed to update role");
      setConfirmUser(null);
    },
  });

  const users: UserRow[] = (data as UserRow[] | undefined) ?? [];

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.openId.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (user: UserRow, newRole: Role) => {
    if (user.role === newRole) return;
    setConfirmUser({ id: user.id, name: user.name, newRole });
  };

  const confirmChange = () => {
    if (!confirmUser) return;
    changeRoleMutation.mutate({ userId: confirmUser.id, role: confirmUser.newRole });
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {users.length} total users · {adminCount} admin{adminCount !== 1 ? "s" : ""} · {userCount} learner{userCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 text-gray-600">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-indigo-700 mt-1">{users.length}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Admins</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{adminCount}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Learners</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{userCount}</p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as "all" | Role)}>
            <SelectTrigger className="w-36 bg-gray-50 border-gray-200 text-gray-700">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Learner</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-400 ml-auto">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {/* Table */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>User</span>
              <span className="text-center">Role</span>
              <span className="text-center hidden sm:block">Joined</span>
              <span className="text-center">Actions</span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading users...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No users found</p>
                <p className="text-xs mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              filtered.map((user, idx) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors ${idx < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {(user.name ?? user.openId).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name ?? "Unnamed User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.openId}</p>
                    </div>
                  </div>

                  {/* Role badge */}
                  <div className="flex justify-center">
                    {user.role === "admin" ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 font-medium">
                        <Shield className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600 border-gray-300 gap-1 font-medium">
                        <User className="w-3 h-3" /> Learner
                      </Badge>
                    )}
                  </div>

                  {/* Joined date */}
                  <div className="hidden sm:flex justify-center">
                    <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {user.role !== "admin" && (
                          <DropdownMenuItem
                            className="gap-2 text-amber-700 focus:text-amber-700"
                            onClick={() => handleRoleChange(user, "admin")}
                          >
                            <Shield className="w-4 h-4" /> Promote to Admin
                          </DropdownMenuItem>
                        )}
                        {user.role !== "user" && (
                          <DropdownMenuItem
                            className="gap-2 text-gray-700"
                            onClick={() => handleRoleChange(user, "user")}
                          >
                            <User className="w-4 h-4" /> Demote to Learner
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirm role change dialog */}
      <AlertDialog open={!!confirmUser} onOpenChange={(o) => !o && setConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change user role?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change <strong>{confirmUser?.name ?? "this user"}</strong> to{" "}
              <strong>{confirmUser?.newRole === "admin" ? "Admin" : "Learner"}</strong>.
              {confirmUser?.newRole === "admin" && " Admins can manage scenarios, users, and all platform settings."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmChange}
              className={confirmUser?.newRole === "admin" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              {changeRoleMutation.isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
