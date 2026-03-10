// ============================================================================
// PENGAMANAN LEBARAN 2026 - QR CODES TABLE PAGE
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
  Download,
  FileDown,
  Upload,
  QrCode,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { qrEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";

interface QrCode {
  id: string;
  uuid: string;
  nama: string;
  penanggungJawab: string;
  validityStart: string;
  validityEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function QrTablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState<QrCode | null>(null);
  const [selectedQrs, setSelectedQrs] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<boolean | "all">("all");

  const { data: qrData, isLoading, refetch } = useQueryService(
    qrEndpoint.root,
    { page, limit, search: search }
  );

  let qrList = Array.isArray(qrData) ? qrData : [];

  // Filter by active status
  if (activeFilter !== "all") {
    qrList = qrList.filter((q: QrCode) => q.isActive === activeFilter);
  }

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return axiosInstance.put(`/api/qr/${id}`, { isActive });
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Status QR berhasil diperbarui" });
      refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal memperbarui status" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axiosInstance.delete(`/api/qr/${id}`),
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "QR berhasil dihapus" });
      refetch();
      setDeleteDialogOpen(false);
      setSelectedQr(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal menghapus QR" });
    },
  });

  // Download single QR image
  const downloadQrImage = async (qr: QrCode) => {
    try {
      const response = await axiosInstance.get(`/api/qr/${qr.id}/image`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${qr.nama}-${qr.uuid}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(GENERAL_SUCCESS_TEXT, { description: "QR image berhasil didownload" });
    } catch {
      toast.error(GENERAL_ERROR_TEXT, { description: "Gagal mendownload QR image" });
    }
  };

  // Download PDF for selected QRs
  const downloadPdf = async () => {
    if (selectedQrs.size === 0) {
      toast.error("Pilih QR terlebih dahulu");
      return;
    }
    try {
      const response = await axiosInstance.post(`/api/qr/pdf`, { ids: Array.from(selectedQrs) }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-codes-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(GENERAL_SUCCESS_TEXT, { description: "PDF berhasil didownload" });
    } catch {
      toast.error(GENERAL_ERROR_TEXT, { description: "Gagal mendownload PDF" });
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedQrs);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedQrs(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedQrs.size === qrList.length) setSelectedQrs(new Set());
    else setSelectedQrs(new Set(qrList.map((q: QrCode) => q.id)));
  };

  const openDeleteDialog = (qr: QrCode) => {
    setSelectedQr(qr);
    setDeleteDialogOpen(true);
  };

  const openPreviewDialog = (qr: QrCode) => {
    setSelectedQr(qr);
    setPreviewDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedQr) deleteMutation.mutate(selectedQr.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
          <p className="mt-2 text-gray-600">Kelola QR code untuk warga</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedQrs.size > 0 && (
            <Button onClick={downloadPdf} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" /> Download PDF ({selectedQrs.size})
            </Button>
          )}
          <Button onClick={() => navigate(appRoutes.qrCreate)} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah QR
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Cari QR..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={activeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>Semua</Button>
          <Button variant={activeFilter === true ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(true)}>Aktif</Button>
          <Button variant={activeFilter === false ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(false)}>Non-Aktif</Button>
        </div>
        <Button onClick={() => navigate(appRoutes.qrCreate + "?bulk=true")} variant="outline" className="gap-2">
          <Upload className="h-4 w-4" /> Bulk Upload
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectedQrs.size === qrList.length && qrList.length > 0} onCheckedChange={toggleSelectAll} />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>UUID</TableHead>
              <TableHead>Penanggung Jawab</TableHead>
              <TableHead>Validity Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader className="mx-auto h-6 w-6" /></TableCell></TableRow>
            ) : qrList.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-gray-500">{search ? "Tidak ada QR yang cocok dengan pencarian" : "Belum ada QR"}</TableCell></TableRow>
            ) : (
              qrList.map((qr: QrCode) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    <Checkbox checked={selectedQrs.has(qr.id)} onCheckedChange={() => toggleSelect(qr.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{qr.nama}</TableCell>
                  <TableCell className="font-mono text-xs">{qr.uuid}</TableCell>
                  <TableCell>{qr.penanggungJawab}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{format(new Date(qr.validityStart), "dd MMM yyyy")}</div>
                      <div className="text-gray-500">s/d {format(new Date(qr.validityEnd), "dd MMM yyyy")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.isActive ? "default" : "secondary"}>{qr.isActive ? "Aktif" : "Non-Aktif"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPreviewDialog(qr)} className="gap-2"><Eye className="h-4 w-4" /> Preview QR</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadQrImage(qr)} className="gap-2"><Download className="h-4 w-4" /> Download PNG</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(appRoutes.qrDetail.replace(":id", qr.id))} className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: qr.id, isActive: !qr.isActive })} className="gap-2">{qr.isActive ? "Non-Aktifkan" : "Aktifkan"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog(qr)} className="gap-2 text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Hapus</DropdownMenuItem>
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
      {qrList.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Halaman {page} dari {Math.ceil((qrData?.total || 0) / limit)}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={qrList.length < limit}>Next</Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus QR?</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus QR <strong>{selectedQr?.nama}</strong>?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <span className="flex items-center gap-2"><Loader className="h-4 w-4 animate-spin" /> Menghapus...</span> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview QR Code</DialogTitle>
            <DialogDescription>QR Code untuk {selectedQr?.nama}</DialogDescription>
          </DialogHeader>
          {selectedQr && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 border rounded-lg bg-white">
                {/* QR Code would be rendered here - using placeholder for now */}
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                  <QrCode className="h-24 w-24 text-gray-400" />
                  <p className="text-xs text-center text-gray-500 mt-2">{selectedQr.uuid}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="font-medium">Nama:</span><span>{selectedQr.nama}</span></div>
                <div className="flex justify-between"><span className="font-medium">Penanggung Jawab:</span><span>{selectedQr.penanggungJawab}</span></div>
                <div className="flex justify-between"><span className="font-medium">Validity:</span><span>{format(new Date(selectedQr.validityStart), "dd MMM yyyy")} - {format(new Date(selectedQr.validityEnd), "dd MMM yyyy")}</span></div>
              </div>
              <Button onClick={() => downloadQrImage(selectedQr)} className="w-full gap-2">
                <Download className="h-4 w-4" /> Download PNG
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
