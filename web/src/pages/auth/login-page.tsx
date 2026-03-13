// ============================================================================
// PENGAMANAN LEBARAN 2026 - LOGIN PAGE
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import type { LoginFormValues } from "@/lib/validations";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";
import { authRoutes } from "@/config/routes";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);

      // Store auth data
      login({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        user: response.data.data.user,
      });

      toast.success(GENERAL_SUCCESS_TEXT, {
        description: "Login berhasil. Mengalihkan...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate(authRoutes.login.replace("/login", "/app/dashboard"));
      }, 500);
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Handle error response
      const errorData = error as {
        response?: { data?: { message?: string } };
      };

      const errorMessage =
        errorData.response?.data?.message || "Login gagal. Periksa username dan password Anda.";

      toast.error(GENERAL_ERROR_TEXT, {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-xl">
        {/* Logo/Title */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengamanan Lebaran {new Date().getFullYear()}
          </h1>
          <p className="mt-2 text-sm text-gray-600">Login ke dashboard admin</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
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

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              disabled={isLoading}
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Sistem Pengamanan Lebaran {new Date().getFullYear()}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supported by{" "}
            <a
              href="http://www.hadirapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              hadirapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
