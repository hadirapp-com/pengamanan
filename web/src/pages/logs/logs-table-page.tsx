// ============================================================================
// PENGAMANAN LEBARAN 2026 - LOGS TABLE PAGE
// ============================================================================

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

import { useQueryService } from "@/lib/react-query";
import { SCAN_TYPE_LABELS, SCAN_TYPE_COLORS } from "@/config/constants";
import { logsEndpoint } from "@/config/endpoints";
import { useDataTableStore } from "@/store/data-table";

interface Log {
  id: string;
  petugasNama: string;
  qrNama: string;
  posNama: string;
  qrPenanggungJawab: string;
  tipeScan: "masuk" | "keluar";
  scannedAt: string;
}

export default function LogsTablePage() {
  // Use data table store for state management
  const {
    globalFilter,
    dateRange,
    page,
    perPage,
    sortCol,
    sortDir,
    setGlobalFilter,
    setDateRange,
    setPage,
    setPerPage,
    resetDataTable,
  } = useDataTableStore();

  // Debounce search input (500ms delay)
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);

  // Extract date values as strings for consistent query key
  const dateFrom = dateRange.from ? format(new Date(dateRange.from), 'yyyy-MM-dd') : undefined;
  const dateTo = dateRange.to ? format(new Date(dateRange.to), 'yyyy-MM-dd') : undefined;

  // Local filters specific to logs page
  const [tipeScanFilter, setTipeScanFilter] = useState<"masuk" | "keluar" | "all">("all");

  // Create stable reference for filters debouncing
  const filtersString = useMemo(() => JSON.stringify({ tipeScanFilter }), [tipeScanFilter]);
  const [debouncedFiltersString] = useDebounce(filtersString, 500);
  const debouncedFilters = useMemo(() => JSON.parse(debouncedFiltersString || '{}'), [debouncedFiltersString]);

  // Build query with all filters (conditional)
  const query = {
    search: debouncedGlobalFilter || undefined,
    page,
    limit: perPage,
    sortCol,
    sortDir,
    // Add date range filters if available
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    // Add specific filters if available (exclude "all")
    ...(debouncedFilters.posFilter && debouncedFilters.posFilter !== "all" && { posId: debouncedFilters.posFilter }),
    ...(debouncedFilters.tipeScanFilter && debouncedFilters.tipeScanFilter !== "all" && { tipeScan: debouncedFilters.tipeScanFilter }),
  };

  // Create serializable query key for React Query caching
  const queryKey = [
    "logs",
    debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    dateFrom,
    dateTo,
    debouncedFiltersString,
  ];

  const { data: logsData, meta: logsMeta, isLoading } = useQueryService(
    logsEndpoint.root,
    query,
    {
      queryKey,
      refetchInterval: 15000
    }
  );

  const logs = Array.isArray(logsData) ? logsData : [];

  // Reset filters on unmount
  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

  const exportToCsv = () => {
    const headers = ["Waktu", "Nama", "Penanggung Jawab", "Petugas", "Pos", "Tipe Scan"];
    const rows = logs.map((l: Log) => [
      format(new Date(l.scannedAt), "dd-MM-yyyy HH:mm"),
      l.qrNama,
      l.qrPenanggungJawab,
      l.petugasNama,
      l.posNama,
      SCAN_TYPE_LABELS[l.tipeScan]
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs Scan</h1>
          <p className="mt-2 text-gray-600">Lihat riwayat scan masuk/keluar</p>
        </div>
        <Button onClick={exportToCsv} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        {/* Global search with debouncing - full width on top */}
        <Input
          placeholder="Cari..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        {/* Filters in 2 columns on mobile, 4 columns on larger screens */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {/* Date range filters */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tanggal Mulai</label>
            <Input
              type="date"
              value={dateRange.from ? format(new Date(dateRange.from), 'yyyy-MM-dd') : ''}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tanggal Selesai</label>
            <Input
              type="date"
              value={dateRange.to ? format(new Date(dateRange.to), 'yyyy-MM-dd') : ''}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
            />
          </div>

          {/* Tipe scan filter with debouncing */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipe Scan</label>
            <Select value={tipeScanFilter} onValueChange={(v) => setTipeScanFilter(v as "masuk" | "keluar" | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="masuk">Masuk</SelectItem>
                <SelectItem value="keluar">Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {/* TODO: Add sorting handler */}}
              >
                Waktu {sortCol === 'scannedAt' && (sortDir === 'ASC' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Nama (Block/Rumah)</TableHead>
              <TableHead>Penanggung Jawab</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Tipe Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Belum ada data scan
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l: Log) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(l.scannedAt), "dd-MM-yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{l.qrNama}</TableCell>
                  <TableCell>{l.qrPenanggungJawab}</TableCell>
                  <TableCell>{l.petugasNama}</TableCell>
                  <TableCell>{l.posNama}</TableCell>
                  <TableCell>
                    <Badge variant={SCAN_TYPE_COLORS[l.tipeScan] as any} className="gap-1">
                      {l.tipeScan === "masuk" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                      {SCAN_TYPE_LABELS[l.tipeScan]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls using store */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Halaman {logsMeta?.page || page} dari {logsMeta?.totalPages || Math.ceil((logsMeta?.totalCount || 0) / (logsMeta?.limit || perPage))}
            {logsMeta?.totalCount !== undefined && ` (${logsMeta.totalCount} total)`}
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
              disabled={page === 1 || logsMeta?.hasPreviousPage === false}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={logsMeta?.hasNextPage === false}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
