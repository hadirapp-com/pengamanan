import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

interface SidebarStore {
  expandedMenus: string[];
  isCollapsed: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  setExpandedMenus: (menus: string[]) => void;
  toggleMenu: (menuName: string) => void;
  collapseMenu: (menuName: string) => void;
  expandMenu: (menuName: string) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  resetState: () => void;
}

// Custom storage object (same as auth store)
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      expandedMenus: [],
      isCollapsed: false,
      isMobile: false,
      isMobileOpen: false,
      
      setExpandedMenus: (menus) => set({ expandedMenus: menus }),
      
      toggleMenu: (menuName) => {
        const { expandedMenus } = get();
        const newExpandedMenus = expandedMenus.includes(menuName)
          ? expandedMenus.filter((name) => name !== menuName)
          : [...expandedMenus, menuName];
        set({ expandedMenus: newExpandedMenus });
      },
      
      collapseMenu: (menuName) => {
        const { expandedMenus } = get();
        set({ 
          expandedMenus: expandedMenus.filter((name) => name !== menuName) 
        });
      },
      
      expandMenu: (menuName) => {
        const { expandedMenus } = get();
        if (!expandedMenus.includes(menuName)) {
          set({ expandedMenus: [...expandedMenus, menuName] });
        }
      },
      
      setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      setIsMobile: (mobile) => set({ isMobile: mobile }),
      setIsMobileOpen: (open) => set({ isMobileOpen: open }),
      
      resetState: () => set({
        expandedMenus: [],
        isCollapsed: false,
        isMobile: false,
        isMobileOpen: false,
      }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        expandedMenus: state.expandedMenus,
        isCollapsed: state.isCollapsed,
        isMobile: state.isMobile,
      }),
      storage: createJSONStorage(() => storage),
    }
  )
);
