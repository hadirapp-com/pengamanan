// ============================================================================
// PENGAMANAN LEBARAN 2026 - PENGUMUMAN FORM PAGE
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { axiosInstance } from "@/lib/api";
import { pengumumanSchema, type PengumumanFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";

interface Pengumuman {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PengumumanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PengumumanFormValues>({
    resolver: zodResolver(pengumumanSchema) as any,
    defaultValues: { title: "", content: "", priority: "normal", isActive: true },
  });

  const { data: pengumumanData, isLoading } = useQuery<Pengumuman>({
    queryKey: ["pengumuman", id],
    queryFn: async () => {
      if (!id) throw new Error();
      const response = await axiosInstance.get(`/api/pengumuman/${id}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (pengumumanData) {
      setValue("title", pengumumanData.title);
      setValue("content", pengumumanData.content);
      setValue("priority", pengumumanData.priority);
      setValue("isActive", pengumumanData.isActive);
    }
  }, [pengumumanData, setValue]);

  const createMutation = useMutation({
    mutationFn: (d: PengumumanFormValues) =>
      axiosInstance.post("/api/pengumuman", d),
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, { description: "Pengumuman dibuat" });
      navigate(appRoutes.pengumuman);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal",
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: (d: PengumumanFormValues) => {
      if (!id) throw new Error();
      return axiosInstance.put(`/api/pengumuman/${id}`, d);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "Pengumuman diperbarui",
      });
      navigate(appRoutes.pengumuman);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(appRoutes.pengumuman)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? "Edit pengumuman" : "Tambah pengumuman baru"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((d) =>
              (isEdit ? updateMutation : createMutation).mutate(d),
            )}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Isi Pengumuman *</Label>
              <Textarea
                id="content"
                rows={5}
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                {...register("content")}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                key={watch("priority")}
                value={watch("priority")}
                onValueChange={(v) => setValue("priority", v as any)}
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                <SelectTrigger
                  className={errors.priority ? "border-red-500" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">
                  {errors.priority.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(appRoutes.pengumuman)}
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="min-w-[100px]"
              >
                {isLoading ||
                createMutation.isPending ||
                updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
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
