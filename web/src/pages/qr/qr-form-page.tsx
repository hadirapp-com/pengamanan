// ============================================================================
// PENGAMANAN LEBARAN 2026 - QR CODE FORM PAGE
// ============================================================================

import { useNavigate, useParams, useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

import { axiosInstance } from "@/lib/api";
import { qrFormSchema, type QrFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function QrFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isBulk = searchParams.get("bulk") === "true";
  const isEdit = !!id && !isBulk;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QrFormValues>({
    resolver: zodResolver(qrFormSchema) as any,
    defaultValues: { nama: "", penanggungJawab: "", urutan: undefined, validFrom: "", validUntil: "", isActive: true },
  });

  const { data: qrData, isLoading: isLoadingQr } = useQuery<QrCode>({
    queryKey: ["qr", id],
    queryFn: async () => {
      if (!id) throw new Error("QR ID is required");
      const response = await axiosInstance.get(`/api/qr/${id}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (qrData) {
      setValue("nama", qrData.nama);
      setValue("penanggungJawab", qrData.penanggungJawab);
      setValue("urutan", qrData.urutan || undefined);
      setValue("validFrom", qrData.validFrom?.split("T")[0]);
      setValue("validUntil", qrData.validUntil?.split("T")[0]);
      setValue("isActive", qrData.isActive);
    }
  }, [qrData, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: QrFormValues) => axiosInstance.post("/api/qr", data),
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "QR berhasil dibuat" }); navigate(appRoutes.qr); },
    onError: (error: unknown) => { const err = error as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal membuat QR" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QrFormValues) => { if (!id) throw new Error("QR ID is required"); return axiosInstance.put(`/api/qr/${id}`, data); },
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "QR berhasil diperbarui" }); navigate(appRoutes.qr); },
    onError: (error: unknown) => { const err = error as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal memperbarui QR" }); },
  });

  const onSubmit = (data: QrFormValues) => { if (isEdit) updateMutation.mutate(data); else createMutation.mutate(data); };
  const isLoading = isLoadingQr || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(appRoutes.qr)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit QR" : isBulk ? "Bulk Upload QR" : "Tambah QR"}</h1>
          <p className="mt-2 text-gray-600">{isEdit ? "Edit data QR" : isBulk ? "Upload QR dari CSV/Excel" : "Tambah QR baru"}</p>
        </div>
      </div>

      {isBulk ? (
        <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
          <div className="space-y-6">
            <div className="text-center py-8">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">Bulk Upload QR Codes</h3>
              <p className="mt-2 text-sm text-gray-500">Upload CSV/Excel file dengan kolom: nama, penanggung_jawab, validity_start, validity_end</p>
            </div>
            <Input type="file" accept=".csv,.xlsx,.xls" disabled={isLoading} />
            <Button disabled={isLoading} className="w-full">
              {isLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</span> : "Upload File"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
          {isLoadingQr ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama (Block/Rumah) *</Label>
                <Input id="nama" type="text" placeholder="Contoh: Blok A No. 12" disabled={isLoading} {...register("nama")} className={errors.nama ? "border-red-500" : ""} />
                {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="penanggungJawab">Penanggung Jawab *</Label>
                <Input id="penanggungJawab" type="text" placeholder="Nama penanggung jawab" disabled={isLoading} {...register("penanggungJawab")} className={errors.penanggungJawab ? "border-red-500" : ""} />
                {errors.penanggungJawab && <p className="text-sm text-red-500">{errors.penanggungJawab.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urutan">Urutan</Label>
                <Input
                  id="urutan"
                  type="number"
                  min="1"
                  placeholder="Urutan pengurutan blok (opsional)"
                  disabled={isLoading}
                  {...register("urutan", { valueAsNumber: true })}
                  className={errors.urutan ? "border-red-500" : ""}
                />
                {errors.urutan && <p className="text-sm text-red-500">{errors.urutan.message}</p>}
                <p className="text-xs text-gray-500">Nomor urutan untuk pengurutan nama blok</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validFrom">Tanggal Mulai Berlaku *</Label>
                <Input id="validFrom" type="date" disabled={isLoading} {...register("validFrom")} className={errors.validFrom ? "border-red-500" : ""} />
                {errors.validFrom && <p className="text-sm text-red-500">{errors.validFrom.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Tanggal Selesai Berlaku *</Label>
                <Input id="validUntil" type="date" disabled={isLoading} {...register("validUntil")} className={errors.validUntil ? "border-red-500" : ""} />
                {errors.validUntil && <p className="text-sm text-red-500">{errors.validUntil.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(appRoutes.qr)} disabled={isLoading}>Batal</Button>
                <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                  {isLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</span> : (isEdit ? "Simpan" : "Buat")}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
