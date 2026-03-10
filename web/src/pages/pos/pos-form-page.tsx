// ============================================================================
// PENGAMANAN LEBARAN 2026 - POS JAGA FORM PAGE
// ============================================================================

import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/ui/loader";

import { axiosInstance } from "@/lib/api";
import { posFormSchema, type PosFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";

interface Pos {
  id: string;
  nama: string;
  lokasi: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PosFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PosFormValues>({
    resolver: zodResolver(posFormSchema),
    defaultValues: { nama: "", lokasi: "", isActive: true },
  });

  const { data: posData, isLoading: isLoadingPos } = useQuery<Pos>({
    queryKey: ["pos", id],
    queryFn: async () => {
      if (!id) throw new Error("Pos ID is required");
      const response = await axiosInstance.get(`/api/pos/${id}`);
      return response.data;
    },
    enabled: isEdit,
    onSuccess: (data) => {
      setValue("nama", data.nama);
      setValue("lokasi", data.lokasi);
      setValue("isActive", data.isActive);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PosFormValues) => axiosInstance.post("/api/pos", data),
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "Pos berhasil dibuat" }); navigate(appRoutes.pos); },
    onError: (error: unknown) => { const err = error as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal membuat pos" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PosFormValues) => { if (!id) throw new Error("Pos ID is required"); return axiosInstance.put(`/api/pos/${id}`, data); },
    onSuccess: () => { toast.success(GENERAL_SUCCESS_TEXT, { description: "Pos berhasil diperbarui" }); navigate(appRoutes.pos); },
    onError: (error: unknown) => { const err = error as { response?: { data?: { message?: string } } }; toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal memperbarui pos" }); },
  });

  const onSubmit = (data: PosFormValues) => { if (isEdit) updateMutation.mutate(data); else createMutation.mutate(data); };
  const isLoading = isLoadingPos || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(appRoutes.pos)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Pos" : "Tambah Pos"}</h1>
          <p className="mt-2 text-gray-600">{isEdit ? "Edit data pos" : "Tambah pos baru"}</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
        {isLoadingPos ? (
          <div className="flex items-center justify-center py-12"><Loader className="h-8 w-8" /></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Pos *</Label>
              <Input id="nama" type="text" placeholder="Masukkan nama pos" disabled={isLoading} {...register("nama")} className={errors.nama ? "border-red-500" : ""} />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi *</Label>
              <Input id="lokasi" type="text" placeholder="Masukkan lokasi pos" disabled={isLoading} {...register("lokasi")} className={errors.lokasi ? "border-red-500" : ""} />
              {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" {...register("isActive")} disabled={isLoading} />
              <Label htmlFor="isActive">Aktif</Label>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(appRoutes.pos)} disabled={isLoading}>Batal</Button>
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading ? <span className="flex items-center gap-2"><Loader className="h-4 w-4 animate-spin" /> Memproses...</span> : (isEdit ? "Simpan" : "Buat")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
