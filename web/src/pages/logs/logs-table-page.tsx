// ============================================================================
// PENGAMANAN LEBARAN 2026 - LOGS TABLE PAGE
// ============================================================================

import { useState } from "react";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, FileDown, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "@/components/ui/loader";

import { useQueryService } from "@/lib/react-query";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT, SCAN_TYPE_LABELS, SCAN_TYPE_COLORS } from "@/config/constants";
import { logsEndpoint } from "@/config/endpoints";

interface Log { id: string; qrCode: { nama: string; penanggungJawab: string }; petugas: { nama: string }; pos: { nama: string }; tipeScan: "masuk" | "keluar"; scannedAt: string; }

export default function LogsTablePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [tipeScanFilter, setTipeScanFilter] = useState<"masuk" | "keluar" | "">("");

  const { data: logsData, isLoading, refetch } = useQueryService(logsEndpoint.root, { page, limit, search: search || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, posId: posFilter || undefined, tipeScan: tipeScanFilter || undefined }, { enabled: true });
  let logs = Array.isArray(logsData) ? logsData : [];

  const exportToCsv = () => {
    const headers = ["Waktu", "Nama", "Penanggung Jawab", "Petugas", "Pos", "Tipe Scan"];
    const rows = logs.map((l: Log) => [format(new Date(l.scannedAt), "dd-MM-yyyy HH:mm"), l.qrCode.nama, l.qrCode.penanggungJawab, l.petugas.nama, l.pos.nama, SCAN_TYPE_LABELS[l.tipeScan]]);
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
        <div><h1 className="text-3xl font-bold text-gray-900">Logs Scan</h1><p className="mt-2 text-gray-600">Lihat riwayat scan masuk/keluar</p></div>
        <Button onClick={exportToCsv} variant="outline" className="gap-2"><FileDown className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <Select value={posFilter} onValueChange={setPosFilter}><SelectTrigger><SelectValue placeholder="Filter Pos" /></SelectTrigger><SelectContent><SelectItem value="">Semua Pos</SelectItem>{/* Pos options would be fetched */}</SelectContent></Select>
        <Select value={tipeScanFilter} onValueChange={(v) => setTipeScanFilter(v as any)}><SelectTrigger><SelectValue placeholder="Tipe Scan" /></SelectTrigger><SelectContent><SelectItem value="">Semua</SelectItem><SelectItem value="masuk">Masuk</SelectItem><SelectItem value="keluar">Keluar</SelectItem></SelectContent></Select>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Nama (Block/Rumah)</TableHead>
              <TableHead>Penanggung Jawab</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Tipe Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader className="mx-auto h-6 w-6" /></TableCell></TableRow> : logs.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-gray-500">Belum ada data scan</TableCell></TableRow> : logs.map((l: Log) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-sm">{format(new Date(l.scannedAt), "dd-MM-yyyy HH:mm")}</TableCell>
                <TableCell className="font-medium">{l.qrCode.nama}</TableCell>
                <TableCell>{l.qrCode.penanggungJawab}</TableCell>
                <TableCell>{l.petugas.nama}</TableCell>
                <TableCell>{l.pos.nama}</TableCell>
                <TableCell><Badge variant={SCAN_TYPE_COLORS[l.tipeScan] as any} className="gap-1">{l.tipeScan === "masuk" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}{SCAN_TYPE_LABELS[l.tipeScan]}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {logs.length > 0 && <div className="flex items-center justify-between"><div className="text-sm text-gray-600">Halaman {page} dari {Math.ceil((logsData?.total || 0) / limit)}</div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={logs.length < limit}>Next</Button></div></div>}
    </div>
  );
}
