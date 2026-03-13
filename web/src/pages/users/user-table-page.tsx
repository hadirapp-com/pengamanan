// ============================================================================
// PENGAMANAN LEBARAN 2026 - USERS TABLE PAGE
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Loader2 } from "lucide-react";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT, USER_ROLE_LABELS } from "@/config/constants";
import { usersEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";

interface User {
  id: string;
  username: string;
  role: "superadmin" | "admin";
  fullName: string | null;
  address: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserTablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQueryService(
    usersEndpoint.root,
    { page, limit, search: search }
  );

  const users = Array.isArray(usersData) ? usersData : [];

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "User berhasil dihapus",
      });
      refetch();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal menghapus user",
      });
    },
  });

  const handleDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-gray-600">Kelola user admin</p>
        </div>
        <Button onClick={() => navigate(appRoutes.usersCreate)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  {search ? "Tidak ada user yang cocok dengan pencarian" : "Belum ada user"}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "superadmin" ? "default" : "secondary"}>
                      {USER_ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.fullName || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{user.address || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(appRoutes.usersDetail.replace(":id", user.id))}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
                          className="gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Halaman {page} dari {Math.ceil((usersData?.total || 0) / limit)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={users.length < limit}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{selectedUser?.username}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </span>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
