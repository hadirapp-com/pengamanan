import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  role: string;
  email: string | null;
  fullName: string | null;
  nik: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => void;
  logout: () => void;
  setUser: (user: User) => void;
  getProfile: () => User | null;
  setHydrated: (hydrated: boolean) => void;
  clearStorage: () => void;
}

// Custom storage object
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log(name, "has been retrieved");
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log(name, "with value", value, "has been saved");
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log(name, "has been deleted");
    await del(name);
  },
};

// Migration function to fix nested user structure
const migrateUserData = (state: AuthStore): AuthStore => {
  if (state && state.user && typeof state.user === 'object' && 'user' in state.user) {
    // If user is nested like {user: {...}}, extract the actual user data
    console.log("Migrating nested user structure");
    return {
      ...state,
      user: (state.user as { user: User }).user
    };
  }
  return state;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      login: ({ accessToken, refreshToken, user }) => {
        return set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        return set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setUser: (user) => set({ user }),
      getProfile: () => {
        const currentUser = get().user;
        // Handle nested user structure
        if (currentUser && typeof currentUser === 'object' && 'user' in currentUser) {
          return (currentUser as { user: User }).user;
        }
        
        return currentUser;
      },
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      clearStorage: () => {
        // Clear the persisted data
        storage.removeItem("app-storage");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isHydrated: false,
        });
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => state,
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply migration to fix nested user structure
          const migratedState = migrateUserData(state);
          if (migratedState !== state) {
            // If migration was applied, update the state
            state.user = migratedState.user;
            state.accessToken = migratedState.accessToken;
            state.refreshToken = migratedState.refreshToken;
            state.isAuthenticated = migratedState.isAuthenticated;
          }
        }
        state?.setHydrated(true);
      },
    }
  )
);
