// ============================================================================
// PENGAMANAN LEBARAN 2026 - PETUGAS JAGA TABLE PAGE
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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { petugasEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";

interface Petugas {
  id: string;
  nama: string;
  nik: string;
  noHp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PetugasTablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPetugas, setSelectedPetugas] = useState<Petugas | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | "all">("all");

  const { data: petugasData, isLoading, refetch } = useQueryService(
    petugasEndpoint.root,
    { page, limit, search: search || undefined },
    { enabled: true }
  );
  console.log({petugasData})

  let petugasList = Array.isArray(petugasData) ? petugasData : [];

  // Filter by active status
  if (activeFilter !== "all") {
    petugasList = petugasList.filter((p: Petugas) => p.isActive === activeFilter);
  }

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return axiosInstance.put(`/api/petugas/${id}`, { isActive });
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "Status petugas berhasil diperbarui",
      });
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal memperbarui status",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/api/petugas/${id}`);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Petugas berhasil dihapus" });
      refetch();
      setDeleteDialogOpen(false);
      setSelectedPetugas(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal menghapus petugas" });
    },
  });

  const handleDelete = () => {
    if (selectedPetugas) deleteMutation.mutate(selectedPetugas.id);
  };

  const openDeleteDialog = (petugas: Petugas) => {
    setSelectedPetugas(petugas);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Petugas Jaga</h1>
          <p className="mt-2 text-gray-600">Kelola petugas keamanan</p>
        </div>
        <Button onClick={() => navigate(appRoutes.petugasCreate)} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Petugas
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Cari petugas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            Semua
          </Button>
          <Button
            variant={activeFilter === true ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(true)}
          >
            Aktif
          </Button>
          <Button
            variant={activeFilter === false ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(false)}
          >
            Non-Aktif
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader className="mx-auto h-6 w-6" />
                </TableCell>
              </TableRow>
            ) : petugasList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  {search ? "Tidak ada petugas yang cocok dengan pencarian" : "Belum ada petugas"}
                </TableCell>
              </TableRow>
            ) : (
              petugasList.map((petugas: Petugas) => (
                <TableRow key={petugas.id}>
                  <TableCell className="font-medium">{petugas.nama}</TableCell>
                  <TableCell>{petugas.nik}</TableCell>
                  <TableCell>{petugas.noHp}</TableCell>
                  <TableCell>
                    <Badge variant={petugas.isActive ? "default" : "secondary"}>
                      {petugas.isActive ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(petugas.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(appRoutes.petugasDetail.replace(":id", petugas.id))} className="gap-2">
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: petugas.id, isActive: !petugas.isActive })} className="gap-2">
                          {petugas.isActive ? "Non-Aktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog(petugas)} className="gap-2 text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4" /> Hapus
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

      {petugasList.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Halaman {page} dari {Math.ceil((petugasData?.total || 0) / limit)}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={petugasList.length < limit}>Next</Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Petugas?</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus petugas <strong>{selectedPetugas?.nama}</strong>?</AlertDialogDescription>
          </AlertDialogHeader>
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
