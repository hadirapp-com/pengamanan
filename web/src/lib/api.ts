import axios from "axios";
import { useAuthStore } from "@/store/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Utility to ensure store is hydrated
export const ensureStoreHydrated = async (): Promise<void> => {
  const store = useAuthStore.getState();
  
  if (!store.isHydrated) {
    return new Promise<void>((resolve) => {
      const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.isHydrated) {
          unsubscribe();
          resolve();
        }
      });
    });
  }
};

const getToken = async () => {
  await ensureStoreHydrated();
  return useAuthStore.getState().accessToken;
};

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  console.log("request: ", config.url);
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await ensureStoreHydrated();
        const { refreshToken } = useAuthStore.getState();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          useAuthStore.getState().login({
            accessToken,
            refreshToken: newRefreshToken,
            user: useAuthStore.getState().user!,
          });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const axiosInstance = api;

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post("/api/auth/login", credentials),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
  register: (data: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
  }) => api.post("/api/auth/register", data),
};

export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/api/users", { params }),
  createUser: (data: unknown) => api.post("/api/users", data),
  updateUser: (id: string, data: unknown) => api.put(`/api/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/api/users/${id}`),
};

export const customerApi = {
  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/customers", { params }),
  getCustomer: (id: string) => api.get(`/customers/${id}`),
  createCustomer: (data: unknown) => api.post("/customers", data),
  updateCustomer: (id: string, data: unknown) =>
    api.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
};

export const deliveryApi = {
  getDeliveries: (params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    partCode?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get("/deliveries", { params }),
  getDelivery: (id: string) => api.get(`/deliveries/${id}`),
  createDelivery: (data: unknown) => api.post("/deliveries", data),
  updateDelivery: (id: string, data: unknown) =>
    api.put(`/deliveries/${id}`, data),
  deleteDelivery: (id: string) => api.delete(`/deliveries/${id}`),
  importDeliveries: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/deliveries/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const scanLogsApi = {
  getScanLogs: (params?: {
    page?: number;
    perPage?: number;
    customerId?: string;
    lot?: string;
    createdDateFrom?: string;
    createdDateTo?: string;
  }) => api.get("/scan-logs", { params }),
  getScanLog: (id: string) => api.get(`/scan-logs/${id}`),
  createScanLog: (data: unknown) => api.post("/scan-logs", data),
};
