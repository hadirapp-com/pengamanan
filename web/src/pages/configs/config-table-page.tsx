// ============================================================================
// PENGAMANAN LEBARAN 2026 - CONFIGS TABLE PAGE
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, MoreVertical, Edit, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { useDataTableStore } from "@/store/data-table";

interface Config {
  id: string;
  key: string;
  value: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConfigTablePage() {
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

  // Local active filter (specific to configs page)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Create stable reference for filters debouncing
  const activeFilterString = useMemo(() => JSON.stringify({ activeFilter }), [activeFilter]);
  const [debouncedActiveFilterString] = useDebounce(activeFilterString, 500);
  const debouncedActiveFilter = useMemo(() => JSON.parse(debouncedActiveFilterString || '{}'), [debouncedActiveFilterString]);

  // Build query with all filters (conditional)
  const query = {
    search: debouncedGlobalFilter || undefined,
    page,
    perPage,
    sortCol,
    sortDir,
    // Add active filter if not "all"
    ...(debouncedActiveFilter.activeFilter && debouncedActiveFilter.activeFilter !== "all" && {
      isActive: debouncedActiveFilter.activeFilter === "active"
    }),
  };

  // Create serializable query key for React Query caching
  const queryKey = [
    "configs",
    debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    debouncedActiveFilterString,
  ];

  const { data: configsData, isLoading, refetch } = useQueryService(
    "/api/configs",
    query,
    {
      queryKey,
    }
  );

  const configsList = Array.isArray(configsData) ? configsData : [];

  // Reset filters on unmount
  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => axiosInstance.put(`/api/configs/${id}`, { isActive }),
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "Status config diperbarui" }); refetch(); },
    onError: (e: unknown) => { const err = e as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Konfigurasi</h1><p className="mt-2 text-gray-600">Kelola konfigurasi sistem</p></div>
        <Button onClick={() => navigate(appRoutes.configsCreate)} className="gap-2"><Plus className="h-4 w-4" /> Tambah</Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Global search with debouncing */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari config..."
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
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader className="mx-auto h-6 w-6" /></TableCell></TableRow> : configsList.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-gray-500">{globalFilter ? "Tidak ada hasil" : "Belum ada config"}</TableCell></TableRow> : configsList.map((c: Config) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium font-mono text-sm">{c.key}</TableCell>
                <TableCell className="max-w-md truncate text-sm text-gray-600" title={c.value}>{c.value}</TableCell>
                <TableCell className="max-w-md truncate text-sm text-gray-600">{c.description}</TableCell>
                <TableCell><Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Aktif" : "Non-Aktif"}</Badge></TableCell>
                <TableCell>{format(new Date(c.createdAt), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(appRoutes.configsDetail.replace(":id", c.id))} className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: c.id, isActive: !c.isActive })} className="gap-2">
                        {c.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {c.isActive ? "Non-Aktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls using store */}
      {configsList.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Halaman {page} dari {Math.ceil((configsData?.total || 0) / perPage)}</div>
          <div className="flex items-center gap-2">
            <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
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
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={configsList.length < perPage}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
