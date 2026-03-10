// ============================================================================
// PENGAMANAN LEBARAN 2026 - POS JAGA TABLE PAGE
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { posEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";

interface Pos {
  id: string;
  nama: string;
  lokasi: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PosTablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<Pos | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | "all">("all");

  const { data: posData, isLoading, refetch } = useQueryService(
    posEndpoint.root,
    { page, limit, search: search || undefined },
    { enabled: true }
  );

  let posList = Array.isArray(posData) ? posData : [];

  // Filter by active status
  if (activeFilter !== "all") {
    posList = posList.filter((p: Pos) => p.isActive === activeFilter);
  }

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return axiosInstance.put(`/api/pos/${id}`, { isActive });
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Status pos berhasil diperbarui" });
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal memperbarui status" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/api/pos/${id}`);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Pos berhasil dihapus" });
      refetch();
      setDeleteDialogOpen(false);
      setSelectedPos(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal menghapus pos" });
    },
  });

  const handleDelete = () => {
    if (selectedPos) deleteMutation.mutate(selectedPos.id);
  };

  const openDeleteDialog = (pos: Pos) => {
    setSelectedPos(pos);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pos Jaga</h1>
          <p className="mt-2 text-gray-600">Kelola pos keamanan</p>
        </div>
        <Button onClick={() => navigate(appRoutes.posCreate)} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Pos
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Cari pos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={activeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>Semua</Button>
          <Button variant={activeFilter === true ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(true)}>Aktif</Button>
          <Button variant={activeFilter === false ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(false)}>Non-Aktif</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pos</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader className="mx-auto h-6 w-6" /></TableCell></TableRow>
            ) : posList.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-gray-500">{search ? "Tidak ada pos yang cocok dengan pencarian" : "Belum ada pos"}</TableCell></TableRow>
            ) : (
              posList.map((pos: Pos) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">{pos.nama}</TableCell>
                  <TableCell>{pos.lokasi}</TableCell>
                  <TableCell>
                    <Badge variant={pos.isActive ? "success" : "secondary"}>{pos.isActive ? "Aktif" : "Non-Aktif"}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(pos.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(appRoutes.posDetail.replace(":id", pos.id))} className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: pos.id, isActive: !pos.isActive })} className="gap-2">{pos.isActive ? "Non-Aktifkan" : "Aktifkan"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog(pos)} className="gap-2 text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {posList.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Halaman {page} dari {Math.ceil((posData?.total || 0) / limit)}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={posList.length < limit}>Next</Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus Pos?</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus pos <strong>{selectedPos?.nama}</strong>?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <span className="flex items-center gap-2"><Loader className="h-4 w-4 animate-spin" /> Menghapus...</span> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
