// ============================================================================
// PENGAMANAN LEBARAN 2026 - PENGUMUMAN TABLE PAGE
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Search, MoreVertical, Edit, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT, PENGUMUMAN_PRIORITY_LABELS, PENGUMUMAN_PRIORITY_COLORS } from "@/config/constants";
import { pengumumanEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";

interface Pengumuman {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PengumumanTablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState<Pengumuman | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | "all">("all");

  const { data: pengumumanData, isLoading, refetch } = useQueryService(pengumumanEndpoint.root, { page, limit, search: search || undefined }, { enabled: true });
  let pengumumanList = Array.isArray(pengumumanData) ? pengumumanData : [];

  if (activeFilter !== "all") pengumumanList = pengumumanList.filter((p: Pengumuman) => p.isActive === activeFilter);

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => axiosInstance.put(`/api/pengumuman/${id}`, { isActive }),
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "Status pengumuman diperbarui" }); refetch(); },
    onError: (e: unknown) => { const err = e as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axiosInstance.delete(`/api/pengumuman/${id}`),
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "Pengumuman dihapus" }); refetch(); setDeleteDialogOpen(false); setSelectedPengumuman(null); },
    onError: (e: unknown) => { const err = e as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1><p className="mt-2 text-gray-600">Kelola pengumuman untuk petugas</p></div>
        <Button onClick={() => navigate(appRoutes.pengumumanCreate)} className="gap-2"><Plus className="h-4 w-4" /> Tambah</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input placeholder="Cari pengumuman..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="flex items-center gap-2"><Button variant={activeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>Semua</Button><Button variant={activeFilter === true ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(true)}>Aktif</Button><Button variant={activeFilter === false ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(false)}>Non-Aktif</Button></div>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Isi (Preview)</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader className="mx-auto h-6 w-6" /></TableCell></TableRow> : pengumumanList.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-gray-500">{search ? "Tidak ada hasil" : "Belum ada pengumuman"}</TableCell></TableRow> : pengumumanList.map((p: Pengumuman) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium flex items-center gap-2">{p.priority === "urgent" && <AlertCircle className="h-4 w-4 text-red-600" />}{p.title}</TableCell>
                <TableCell className="max-w-md truncate text-sm text-gray-600">{p.content}</TableCell>
                <TableCell><Badge variant={PENGUMUMAN_PRIORITY_COLORS[p.priority] as any}>{PENGUMUMAN_PRIORITY_LABELS[p.priority]}</Badge></TableCell>
                <TableCell><Badge variant={p.isActive ? "success" : "secondary"}>{p.isActive ? "Aktif" : "Non-Aktif"}</Badge></TableCell>
                <TableCell>{format(new Date(p.createdAt), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(appRoutes.pengumumanDetail.replace(":id", p.id))} className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: p.id, isActive: !p.isActive })}>{p.isActive ? "Non-Aktifkan" : "Aktifkan"}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setSelectedPengumuman(p); setDeleteDialogOpen(true); }} className="gap-2 text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pengumumanList.length > 0 && <div className="flex items-center justify-between"><div className="text-sm text-gray-600">Halaman {page} dari {Math.ceil((pengumumanData?.total || 0) / limit)}</div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={pengumumanList.length < limit}>Next</Button></div></div>}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus pengumuman <strong>{selectedPengumuman?.judul}</strong>?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (selectedPengumuman) deleteMutation.mutate(selectedPengumuman.id); }} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <span className="flex items-center gap-2"><Loader className="h-4 w-4 animate-spin" /> Menghapus...</span> : "Hapus"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
