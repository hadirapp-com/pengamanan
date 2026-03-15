// ============================================================================
// PENGAMANAN LEBARAN 2026 - QR CODES TABLE PAGE
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { toDataURL } from "qrcode";
import jsPDF from "jspdf";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  FileDown,
  Upload,
  Eye,
  Printer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { qrEndpoint } from "@/config/endpoints";
import { appRoutes } from "@/config/routes";
import { useDataTableStore } from "@/store/data-table";

interface QrCode {
  id: string;
  qrCode: string;
  nama: string;
  penanggungJawab: string;
  urutan: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
}

export default function QrTablePage() {
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

  // Local active filter (specific to QR page)
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
    "qr",
    debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    debouncedActiveFilterString,
  ];

  const qrQuery = useQueryService(
    qrEndpoint.root,
    query,
    {
      queryKey,
    }
  );

  const { data: qrData, meta: qrMeta, isLoading, refetch } = qrQuery;
  const qrList = Array.isArray(qrData) ? qrData : [];

  // Local state for dialogs and selection
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [qrSize, setQrSize] = useState(50); // QR size in mm (default 50mm)
  const [selectedQr, setSelectedQr] = useState<QrCode | null>(null);
  const [selectedQrs, setSelectedQrs] = useState<Set<string>>(new Set());

  // Reset filters on unmount
  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

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

  // Download single QR image (client-side generation)
  const downloadQrImage = async (qr: QrCode) => {
    try {
      const pngDataUrl = await toDataURL(qr.qrCode, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = `qr-${qr.nama}-${qr.qrCode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(GENERAL_SUCCESS_TEXT, { description: "QR image berhasil didownload" });
    } catch {
      toast.error(GENERAL_ERROR_TEXT, { description: "Gagal mendownload QR image" });
    }
  };

  // Download PDF for selected QRs (client-side generation)
  const downloadPdf = async (customQrSize?: number) => {
    const actualQrSize = customQrSize || qrSize;

    if (selectedQrs.size === 0) {
      toast.error("Pilih QR terlebih dahulu");
      return;
    }
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const spacing = 15;
      const textHeight = 20; // Space for text below QR code
      const titleHeight = 30; // Space for title on first page
      const qrCellHeight = actualQrSize + textHeight; // Total height per row

      // Calculate grid layout
      const maxCols = Math.floor((pageWidth - 2 * margin) / (actualQrSize + spacing));
      // Calculate total grid width to center it
      const totalGridWidth = maxCols * actualQrSize + (maxCols - 1) * spacing;
      // Calculate starting X position to center the grid
      const startX = (pageWidth - totalGridWidth) / 2;

      let x = startX;
      let y = margin + titleHeight;
      let col = 0;

      // Title
      pdf.setFontSize(16);
      pdf.text(`QR Codes - Pengamanan Lebaran ${new Date().getFullYear()}`, pageWidth / 2, 15, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString("id-ID")}`, pageWidth / 2, 22, { align: "center" });

      // Get selected QR codes
      const selectedQrList = qrList.filter((qr: QrCode) => selectedQrs.has(qr.id));

      for (const qr of selectedQrList) {
        // Check if we need a new page
        if (y + qrCellHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          col = 0;
        }

        // Generate QR code as data URL with higher resolution for crisp rendering
        const qrDataUrl = await toDataURL(qr.qrCode, {
          width: actualQrSize * 8, // 8x resolution for crisp QR codes
          margin: 1,
          errorCorrectionLevel: "H", // High error correction for better scanning
        });

        // Add QR image
        pdf.addImage(qrDataUrl, "PNG", x, y, actualQrSize, actualQrSize);

        // Add nama and penanggung jawab below QR
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(qr.nama, x + actualQrSize / 2, y + actualQrSize + 7, { align: "center", maxWidth: actualQrSize });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(qr.penanggungJawab, x + actualQrSize / 2, y + actualQrSize + 14, { align: "center", maxWidth: actualQrSize });

        // Move to next position
        col++;
        if (col >= maxCols) {
          col = 0;
          x = startX; // Reset to centered starting position
          y += qrCellHeight;
        } else {
          x += actualQrSize + spacing;
        }
      }

      // Save PDF
      pdf.save(`qr-codes-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success(GENERAL_SUCCESS_TEXT, { description: "PDF berhasil didownload" });
      setPrintPreviewOpen(false); // Close preview after download
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
            <Button onClick={() => setPrintPreviewOpen(true)} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" /> Print Preview ({selectedQrs.size})
            </Button>
          )}
          <Button onClick={() => navigate(appRoutes.qrCreate)} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah QR
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Global search with debouncing */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari QR..."
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
              <TableHead>Penanggung Jawab</TableHead>
              <TableHead className="w-24 text-center">Urutan</TableHead>
              <TableHead>Validity Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
            ) : qrList.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-gray-500">{globalFilter ? "Tidak ada QR yang cocok dengan pencarian" : "Belum ada QR"}</TableCell></TableRow>
            ) : (
              qrList.map((qr: QrCode) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    <Checkbox checked={selectedQrs.has(qr.id)} onCheckedChange={() => toggleSelect(qr.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{qr.nama}</TableCell>
                  <TableCell>{qr.penanggungJawab}</TableCell>
                  <TableCell className="text-center">{qr.urutan || "-"}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{format(new Date(qr.validFrom), "dd MMM yyyy")}</div>
                      <div className="text-gray-500">s/d {format(new Date(qr.validUntil), "dd MMM yyyy")}</div>
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

      {/* Pagination controls using store */}
      {qrList.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Halaman {qrMeta?.page || page} dari {qrMeta?.totalPages || Math.ceil((qrMeta?.totalCount || 0) / (qrMeta?.limit || perPage))}
            {qrMeta?.totalCount !== undefined && ` (${qrMeta.totalCount} total)`}
          </div>
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
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || qrMeta?.hasPreviousPage === false}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={qrMeta?.hasNextPage === false}>Next</Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus QR code <strong>{selectedQr?.nama}</strong>?
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

      {/* Preview dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview QR Code</DialogTitle>
          </DialogHeader>
          {selectedQr && (
            <div className="space-y-4">
              <div className="flex items-center justify-center bg-white p-4 rounded-lg border">
                <QRCode
                  value={selectedQr.qrCode}
                  size={200}
                  level={"M"}
                />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="font-medium">Nama:</span><span>{selectedQr.nama}</span></div>
                <div className="flex justify-between"><span className="font-medium">UUID:</span><span className="font-mono text-xs">{selectedQr.qrCode}</span></div>
                <div className="flex justify-between"><span className="font-medium">Penanggung Jawab:</span><span>{selectedQr.penanggungJawab}</span></div>
                <div className="flex justify-between"><span className="font-medium">Validity:</span><span>{format(new Date(selectedQr.validFrom), "dd MMM yyyy")} - {format(new Date(selectedQr.validUntil), "dd MMM yyyy")}</span></div>
              </div>
              <Button onClick={() => downloadQrImage(selectedQr)} className="w-full gap-2">
                <Download className="h-4 w-4" /> Download PNG
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog open={printPreviewOpen} onOpenChange={setPrintPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 sm:max-w-[80vw] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Print Preview - QR Codes</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Size Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="qrSize">Ukuran QR Code: {qrSize}mm</Label>
                <span className="text-sm text-muted-foreground">
                  {selectedQrs.size} QR terpilih
                </span>
              </div>
              <Slider
                id="qrSize"
                min={20}
                max={100}
                step={5}
                value={[qrSize]}
                onValueChange={(value) => setQrSize(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20mm (Kecil)</span>
                <span>50mm (Standar)</span>
                <span>100mm (Besar)</span>
              </div>
            </div>

            {/* Preview Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Preview Layout</h3>
                <div className="text-xs text-muted-foreground">
                  A4 Page: 210mm x 297mm
                </div>
              </div>

              {/* Simulated A4 Page Previews with Page Breaks */}
              <div className="flex flex-col items-center gap-2">
                {(() => {
                  const selectedQrList = qrList.filter((qr: QrCode) => selectedQrs.has(qr.id));
                  const pageWidth = 210; // mm
                  const pageHeight = 297; // mm
                  const margin = 20; // mm
                  const spacing = 15; // mm
                  const textHeight = 20; // Space for text below QR code
                  const titleHeight = 30; // Space for title on first page
                  const qrCellHeight = qrSize + textHeight; // Total height per row

                  // Calculate grid layout
                  const maxCols = Math.floor((pageWidth - 2 * margin) / (qrSize + spacing));
                  const availableHeight = pageHeight - 2 * margin - titleHeight;
                  const maxRows = Math.floor(availableHeight / qrCellHeight);
                  const qrPerPage = maxCols * maxRows;

                  // Split into pages
                  const pages: QrCode[][] = [];
                  for (let i = 0; i < selectedQrList.length; i += qrPerPage) {
                    pages.push(selectedQrList.slice(i, i + qrPerPage));
                  }

                  return pages.map((pageQrs, pageIndex) => (
                    <div
                      key={pageIndex}
                      className="bg-white border-2 border-gray-300 shadow-lg relative"
                      style={{
                        width: '210mm',
                        height: '297mm',
                        padding: '20mm',
                        boxSizing: 'border-box',
                        transform: 'scale(0.8)',
                        transformOrigin: 'top center',
                        pageBreakAfter: 'always',
                        breakAfter: 'page',
                      }}
                    >
                      {/* Page Number Indicator */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                        Halaman {pageIndex + 1} dari {pages.length}
                      </div>

                      {/* Title */}
                      <div className="text-center mb-6">
                        <div className="text-lg font-bold">QR Codes - Pengamanan Lebaran {new Date().getFullYear()}</div>
                        <div className="text-xs">{new Date().toLocaleString("id-ID")}</div>
                      </div>

                      {/* QR Grid Preview */}
                      <div className="grid gap-3 justify-center" style={{
                        gridTemplateColumns: `repeat(${maxCols}, ${qrSize}mm)`,
                        justifyContent: 'center',
                      }}>
                        {pageQrs.map((qr: QrCode) => (
                          <div key={qr.id} className="flex flex-col items-center" style={{ width: `${qrSize}mm` }}>
                            <QRCode
                              value={qr.qrCode}
                              size={Math.round(qrSize * 3.78)} // Convert mm to pixels (1mm ≈ 3.78px at 96dpi)
                              level={"H"}
                              className="border border-gray-200"
                            />
                            <div className="text-[8px] text-center mt-1 font-semibold leading-tight w-full overflow-hidden text-ellipsis">
                              {qr.nama}
                            </div>
                            <div className="text-[6px] text-center leading-tight w-full overflow-hidden text-ellipsis text-gray-600">
                              {qr.penanggungJawab}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Page footer */}
                      {pageIndex < pages.length - 1 && (
                        <div className="absolute bottom-4 left-0 right-0 text-center text-[6px] text-gray-400">
                          Halaman {pageIndex + 1} dari {pages.length}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-background">
            <Button variant="outline" onClick={() => setPrintPreviewOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => downloadPdf()} className="gap-2">
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
