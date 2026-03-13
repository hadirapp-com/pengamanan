// ============================================================================
// PENGAMANAN LEBARAN 2026 - DASHBOARD PAGE
// ============================================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Shield,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/lib/api";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { SCAN_TYPE_LABELS } from "@/config/constants";

interface DashboardStats {
  today: {
    masuk: number;
    keluar: number;
  };
  last7Days: {
    date: string;
    masuk: number;
    keluar: number;
  }[];
  recentScans: RecentScan[];
}

interface RecentScan {
  id: string;
  qrNama: string;
  qrPenanggungJawab: string;
  petugasNama: string;
  posNama: string;
  tipeScan: "masuk" | "keluar";
  scannedAt: string;
}

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard statistics
  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", refreshKey],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: DashboardStats }>("/api/logs/stats");
      return response.data.data;
    },
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      setRefreshKey(prev => prev + 1);
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "Data berhasil diperbarui",
      });
    } catch {
      toast.error(GENERAL_ERROR_TEXT, {
        description: "Gagal memperbarui data",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Selamat datang di Sistem Pengamanan Lebaran {new Date().getFullYear()}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Masuk Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Masuk Hari Ini
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <div className="text-3xl font-bold text-green-600">
                {stats?.today.masuk ?? 0}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Tamu masuk hari ini</p>
          </CardContent>
        </Card>

        {/* Keluar Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Keluar Hari Ini
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <div className="text-3xl font-bold text-red-600">
                {stats?.today.keluar ?? 0}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Tamu keluar hari ini</p>
          </CardContent>
        </Card>

        {/* Active Petugas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Petugas Aktif
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">-</div>
            <p className="mt-1 text-xs text-gray-500">Petugas jaga aktif</p>
          </CardContent>
        </Card>

        {/* Active Pos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pos Aktif
            </CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">-</div>
            <p className="mt-1 text-xs text-gray-500">Pos jaga aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.last7Days && stats.last7Days.length > 0 ? (
                <>
                  {/* Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.last7Days.map((day) => ({
                          tanggal: format(new Date(day.date), "dd MMM"),
                          masuk: day.masuk,
                          keluar: day.keluar,
                        }))}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="tanggal"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          tickLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          tickLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Legend />
                        <Bar
                          dataKey="masuk"
                          name="Masuk"
                          fill={stats.last7Days.map((_, index) => [
                            '#ef4444', // red-500
                            '#f97316', // orange-500
                            '#eab308', // yellow-500
                            '#22c55e', // green-500
                            '#06b6d4', // cyan-500
                            '#3b82f6', // blue-500
                            '#8b5cf6', // violet-500
                          ][index % 7])}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="keluar"
                          name="Keluar"
                          fill={stats.last7Days.map((_, index) => [
                            '#ef4444', // red-500
                            '#f97316', // orange-500
                            '#eab308', // yellow-500
                            '#22c55e', // green-500
                            '#06b6d4', // cyan-500
                            '#3b82f6', // blue-500
                            '#8b5cf6', // violet-500
                          ][index % 7])}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Table */}
                  <div className="mt-6 space-y-2">
                    {stats.last7Days.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(day.date), "EEEE, dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              {day.masuk}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowUp className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                              {day.keluar}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  Belum ada data statistik
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentScans && Array.isArray(stats.recentScans) && stats.recentScans.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentScans.map((scan: RecentScan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {scan.qrNama || "Unknown"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>PJ: {scan.qrPenanggungJawab || "-"}</span>
                          <span>•</span>
                          <span>Petugas: {scan.petugasNama || "-"}</span>
                          <span>•</span>
                          <span>Pos: {scan.posNama || "-"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            scan.tipeScan === "masuk" ? "default" : "destructive"
                          }
                        >
                          {SCAN_TYPE_LABELS[scan.tipeScan]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(scan.scannedAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  Belum ada data scan
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
