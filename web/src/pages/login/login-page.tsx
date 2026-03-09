import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { authEndpoint } from "@/config/endpoints";
import { useMutation } from "@tanstack/react-query";
import {
  loginFormSchema,
  type UserLoginForm,
} from "@/pages/login/login-schema";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    role: string;
    email: string | null;
    fullName: string | null;
    nik: string | null;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const form = useForm<UserLoginForm>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginFormSchema),
  });
  const { handleSubmit, control, reset } = form;

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: UserLoginForm) =>
      axiosInstance<LoginResponse>({
        method: "POST",
        data: {
          ...data,
          source: "web",
        },
        url: authEndpoint.login,
      }),
    onSuccess: (response) => {
      toast.success(response.data.message || "Login successful!");
      if (
        response.data.user &&
        response.data.accessToken &&
        response.data.refreshToken
      ) {
        login({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
      }

      // Reset form
      reset();

      // Navigate to home page or dashboard
      navigate("/app");
    },
    onError: (error: AxiosError<{ message: string, userRole?: string }>) => {
      console.error("Login error:", error);

      if (error.response?.status === 403) {
        const role = error.response?.data?.userRole;
        return toast.error(
          `User dengan role ${role} tidak diizinkan mengakses aplikasi ini.\nRole yang diizinkan: Sales, Supervisor, Admin.`
        );
      }

      // Show error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);

      // Log detailed error for debugging
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    },
  });

  const onSubmit: SubmitHandler<UserLoginForm> = (data) => {
    mutate(data);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <div className="flex justify-center">
                <img
                  src="/company.png"
                  className="h-6 text-center"
                  alt="Company Logo"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        disabled={isPending || isSuccess}
                        className="w-full"
                      >
                        {isPending ? "Logging in..." : "Login"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
