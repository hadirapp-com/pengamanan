// ============================================================================
// PENGAMANAN LEBARAN 2026 - USER FORM PAGE
// ============================================================================

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { axiosInstance } from "@/lib/api";
import { userFormSchema, type UserFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { appRoutes } from "@/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";

interface User {
  id: string;
  username: string;
  role: "superadmin" | "admin";
  fullName: string | null;
  address: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "admin",
      fullName: "",
      address: "",
      phone: "",
    },
  });

  // Fetch user data for edit
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) throw new Error("User ID is required");
      const response = await axiosInstance.get(`/api/users/${id}`);
      return response.data.data;
    },
    enabled: isEdit,
  });

  // Populate form with existing data when user data is loaded
  useEffect(() => {
    if (userData) {
      setValue("username", userData.username);
      setValue("role", userData.role);
      setValue("fullName", userData.fullName || "");
      setValue("address", userData.address || "");
      setValue("phone", userData.phone || "");
    }
  }, [userData, setValue]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      return axiosInstance.post("/api/users", data);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "User berhasil dibuat",
      });
      navigate(appRoutes.users);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal membuat user",
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      if (!id) throw new Error("User ID is required");
      return axiosInstance.put(`/api/users/${id}`, data);
    },
    onSuccess: () => {
      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "User berhasil diperbarui",
      });
      navigate(appRoutes.users);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(GENERAL_ERROR_TEXT, {
        description: err.response?.data?.message || "Gagal memperbarui user",
      });
    },
  });

  const onSubmit = (data: UserFormValues) => {
    // Remove password if it's empty (edit mode)
    if (isEdit && (!data.password || data.password.trim() === '')) {
      delete data.password;
    }
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isLoadingUser || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(appRoutes.users)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit User" : "Tambah User"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? "Edit data user admin" : "Tambah user admin baru"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow">
        {isLoadingUser ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                disabled={isLoading}
                {...register("username")}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEdit && "(kosongkan jika tidak diubah)"}
                {!isEdit && "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                disabled={isLoading}
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={watch("role") || "admin"}
                onValueChange={(value) => setValue("role", value as "superadmin" | "admin")}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masukkan nama lengkap (opsional)"
                disabled={isLoading}
                {...register("fullName")}
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                type="text"
                placeholder="Masukkan alamat (opsional)"
                disabled={isLoading}
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                type="text"
                placeholder="Contoh: 628123456789"
                disabled={isLoading}
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
              {!errors.phone && (
                <p className="text-xs text-gray-500">Gunakan format 62 di depan (contoh: 628123456789)</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(appRoutes.users)}
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  (isEdit ? "Simpan" : "Buat")
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
