// ============================================================================
// PENGAMANAN LEBARAN 2026 - CONFIGS FORM PAGE
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/ui/loader";

import { axiosInstance } from "@/lib/api";
import { configFormSchema, type ConfigFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";

interface Config {
  id: string;
  key: string;
  value: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConfigFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema) as any,
    defaultValues: {
      key: "",
      value: "",
      description: "",
      isActive: true,
    },
  });

  const { data: configData, isLoading: isLoadingConfig } = useQuery<Config>({
    queryKey: ["config", id],
    queryFn: async () => {
      if (!id) throw new Error("Config ID is required");
      const response = await axiosInstance.get(`/api/configs/${id}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (configData) {
      setValue("key", configData.key);
      setValue("value", configData.value);
      setValue("description", configData.description || "");
      setValue("isActive", configData.isActive);
    }
  }, [configData, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: ConfigFormValues) =>
      axiosInstance.post("/api/configs", data),
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "Config berhasil dibuat",
      });
      navigate(appRoutes.configs);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ConfigFormValues) => {
      if (!id) throw new Error();
      return axiosInstance.put(`/api/configs/${id}`, data);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "Config berhasil diperbarui",
      });
      navigate(appRoutes.configs);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal",
      });
    },
  });

  const isLoading = isLoadingConfig || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(appRoutes.configs)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Config" : "Tambah Config"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? "Edit konfigurasi sistem" : "Tambah konfigurasi baru"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
        {isLoadingConfig ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((d) =>
              (isEdit ? updateMutation : createMutation).mutate(d),
            )}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                placeholder="Contoh: HOME_SCREEN_BANNER"
                disabled={isLoading || isEdit}
                {...register("key")}
                className={errors.key ? "border-red-500" : ""}
              />
              {errors.key && (
                <p className="text-sm text-red-500">{errors.key.message}</p>
              )}
              {!errors.key && (
                <p className="text-xs text-gray-500">
                  Hanya huruf, angka, dan underscore. Contoh: HOME_SCREEN_BANNER
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Textarea
                id="value"
                rows={3}
                placeholder="Nilai konfigurasi"
                disabled={isLoading}
                {...register("value")}
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Deskripsi konfigurasi (opsional)"
                disabled={isLoading}
                {...register("description")}
              />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(appRoutes.configs)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" /> Memproses...
                  </span>
                ) : isEdit ? (
                  "Simpan"
                ) : (
                  "Buat"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
