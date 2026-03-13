// ============================================================================
// PENGAMANAN LEBARAN 2026 - PETUGAS JAGA TABLE PAGE
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { petugasEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";
import { useDataTableStore } from "@/store/data-table";

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

  // Use data table store for state management
  const {
    globalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    setGlobalFilter,
    setPage,
    setPerPage,
    resetDataTable,
  } = useDataTableStore();

  // Debounce search input (500ms delay)
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);

  // Local active filter (specific to petugas page)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Create stable reference for filters debouncing
  const activeFilterString = useMemo(() => JSON.stringify({ activeFilter }), [activeFilter]);
  const [debouncedActiveFilterString] = useDebounce(activeFilterString, 500);
  const debouncedActiveFilter = useMemo(() => JSON.parse(debouncedActiveFilterString || '{}'), [debouncedActiveFilterString]);

  // Build query with all filters (conditional)
  const query = {
    search: debouncedGlobalFilter || undefined,
    page,
    limit: perPage,
    sortCol,
    sortDir,
    // Add active filter if not "all"
    ...(debouncedActiveFilter.activeFilter && debouncedActiveFilter.activeFilter !== "all" && {
      isActive: debouncedActiveFilter.activeFilter === "active"
    }),
  };

  // Create serializable query key for React Query caching
  const queryKey = [
    "petugas",
    debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    debouncedActiveFilterString,
  ];

  const petugasQuery = useQueryService(
    petugasEndpoint.root,
    query,
    {
      queryKey,
    }
  );

  const { data: petugasData, meta: petugasMeta, isLoading, refetch } = petugasQuery;

  let petugasList = Array.isArray(petugasData) ? petugasData : [];

  // Reset filters on unmount
  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPetugas, setSelectedPetugas] = useState<Petugas | null>(null);

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
        {/* Global search with debouncing */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari petugas..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* Active status filter with debouncing */}
        <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as "all" | "active" | "inactive")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Non-Aktif</SelectItem>
          </SelectContent>
        </Select>
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
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : petugasList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  {globalFilter ? "Tidak ada petugas yang cocok dengan pencarian" : "Belum ada petugas"}
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

      {/* Pagination controls using store */}
      {petugasList.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Halaman {petugasMeta?.page || page} dari {petugasMeta?.totalPages || Math.ceil((petugasMeta?.totalCount || 0) / (petugasMeta?.limit || perPage))}
            {petugasMeta?.totalCount !== undefined && ` (${petugasMeta.totalCount} total)`}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(perPage)}
              onValueChange={(v) => setPerPage(Number(v))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || petugasMeta?.hasPreviousPage === false}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={petugasMeta?.hasNextPage === false}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Petugas?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus petugas <strong>{selectedPetugas?.nama}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Menghapus...</span> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
