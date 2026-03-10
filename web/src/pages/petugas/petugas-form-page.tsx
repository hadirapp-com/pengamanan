// ============================================================================
// PENGAMANAN LEBARAN 2026 - PETUGAS JAGA FORM PAGE
// ============================================================================

import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/ui/loader";

import { axiosInstance } from "@/lib/api";
import { petugasFormSchema, type PetugasFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";

interface Petugas {
  id: string;
  nama: string;
  nik: string;
  noHp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PetugasFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PetugasFormValues>({
    resolver: zodResolver(petugasFormSchema) as any,
    defaultValues: {
      nama: "",
      nik: "",
      noHp: "",
      isActive: true,
    },
  });

  const { data: petugasData, isLoading: isLoadingPetugas } = useQuery<Petugas>({
    queryKey: ["petugas", id],
    queryFn: async () => {
      if (!id) throw new Error("Petugas ID is required");
      const response = await axiosInstance.get(`/api/petugas/${id}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (petugasData) {
      setValue("nama", petugasData.nama);
      setValue("nik", petugasData.nik);
      setValue("noHp", petugasData.noHp);
      setValue("isActive", petugasData.isActive);
    }
  }, [petugasData, setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: PetugasFormValues) => {
      return axiosInstance.post("/api/petugas", data);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Petugas berhasil dibuat" });
      navigate(appRoutes.petugas);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal membuat petugas" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PetugasFormValues) => {
      if (!id) throw new Error("Petugas ID is required");
      return axiosInstance.put(`/api/petugas/${id}`, data);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Petugas berhasil diperbarui" });
      navigate(appRoutes.petugas);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, { description: err.response?.data?.message || "Gagal memperbarui petugas" });
    },
  });

  const onSubmit = (data: PetugasFormValues) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isLoading = isLoadingPetugas || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(appRoutes.petugas)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Petugas" : "Tambah Petugas"}</h1>
          <p className="mt-2 text-gray-600">{isEdit ? "Edit data petugas" : "Tambah petugas baru"}</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
        {isLoadingPetugas ? (
          <div className="flex items-center justify-center py-12"><Loader className="h-8 w-8" /></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama *</Label>
              <Input id="nama" type="text" placeholder="Masukkan nama petugas" disabled={isLoading} {...register("nama")} className={errors.nama ? "border-red-500" : ""} />
              {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">NIK *</Label>
              <Input id="nik" type="text" placeholder="Masukkan NIK" disabled={isLoading} {...register("nik")} className={errors.nik ? "border-red-500" : ""} />
              {errors.nik && <p className="text-sm text-red-500">{errors.nik.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="noHp">No. HP *</Label>
              <Input
                id="noHp"
                type="text"
                placeholder="Contoh: 628123456789"
                disabled={isLoading}
                {...register("noHp")}
                className={errors.noHp ? "border-red-500" : ""}
              />
              {errors.noHp && <p className="text-sm text-red-500">{errors.noHp.message}</p>}
              {!errors.noHp && <p className="text-xs text-gray-500">Gunakan format 62 di depan (contoh: 628123456789)</p>}
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
              <Button type="button" variant="outline" onClick={() => navigate(appRoutes.petugas)} disabled={isLoading}>Batal</Button>
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
