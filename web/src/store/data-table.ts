import { create } from "zustand";
import { persist } from "zustand/middleware";

type Sorting = "DESC" | "ASC";
type DeleteConfirmationData = {
  endpoint: string;
  refetch: () => void;
};

export type DateRange = {
  from?: Date;
  to?: Date;
};

type ColumnFilter = {
  column: string;
  value: string;
};

type TStore = {
  selectedCustomer: string | undefined;
  setSelectedCustomer: (customerId: string) => void;
  getSelectedCustomer: () => string | undefined;
  alowedColumnFilter: Array<string>;
  perPage: number;
  page: number;
  sortCol: string;
  sortDir: Sorting;
  globalFilter: string;
  searchColumn: string;
  dateRange: DateRange;
  columnFilters: ColumnFilter[];
  detailData: unknown;
  deleteConfirmationData: DeleteConfirmationData | null;
  setDeleteConfirmationData: (data: DeleteConfirmationData) => void;
  approveConfirmationData: DeleteConfirmationData | null;
  setApproveConfirmationData: (data: DeleteConfirmationData) => void;
  setPerPage: (total: number) => void;
  setPage: (total: number) => void;
  setSortCol: (sortCol: string) => void;
  setSortDir: (sort: Sorting) => void;
  setAllowedFilter: (columFilters: Array<string>) => void;
  getAllowedColumnFilter: () => Array<string>;
  getGlobalFilter: () => string;
  setGlobalFilter: (filter: string) => void;
  getSearchColumn: () => string;
  setSearchColumn: (column: string) => void;
  setDateRange: (dateRange: DateRange) => void;
  getDateRange: () => DateRange;
  setColumnFilters: (filters: ColumnFilter[]) => void;
  getColumnFilters: () => ColumnFilter[];
  resetDataTable: () => void;
  setDetailData: (data: unknown) => void;
  // Column visibility by table key
  columnVisibility: Record<string, Record<string, boolean>>;
  setColumnVisibility: (key: string, visibility: Record<string, boolean>) => void;
  getColumnVisibility: (key: string) => Record<string, boolean> | undefined;
};

export const useDataTableStore = create<TStore>()(
  persist(
    (set, get) => ({
  selectedCustomer: undefined,
  perPage: 10,
  page: 1,
  alowedColumnFilter: [],
  sortCol: "created_at",
  sortDir: "DESC",
  globalFilter: "",
  searchColumn: "all",
  dateRange: { from: undefined, to: undefined },
  columnFilters: [],
  deleteConfirmationData: null,
  detailData: null,
  columnVisibility: {},
  setDeleteConfirmationData: (data) => {
    set({ deleteConfirmationData: data });
  },
  approveConfirmationData: null,
  setApproveConfirmationData: (data) => {
    set({ approveConfirmationData: data });
  },
  setDetailData: (data) => {
    set({ detailData: data });
  },
  setPerPage: (perPage) => {
    set({ perPage });
  },
  setPage: (page) => {
    set({ page });
  },
  setSortCol: (sortCol) => {
    set({ sortCol });
  },
  setSortDir: (sortDir) => {
    set({ sortDir });
  },
  setAllowedFilter: (columFilters) => {
    set({ alowedColumnFilter: columFilters });
  },
  getAllowedColumnFilter: () => get().alowedColumnFilter,
  setGlobalFilter: (filter) => {
    set({ globalFilter: filter });
  },
  getGlobalFilter: () => get().globalFilter,
  setSearchColumn: (column) => {
    set({ searchColumn: column });
  },
  getSearchColumn: () => get().searchColumn,
  setDateRange: (dateRange) => {
    set({ dateRange });
  },
  getDateRange: () => get().dateRange,
  setColumnFilters: (filters) => {
    set({ columnFilters: filters });
  },
  getColumnFilters: () => get().columnFilters,
  resetDataTable: () => {
    set({ 
      globalFilter: "", 
      page: 1, 
      deleteConfirmationData: null,
      dateRange: { from: undefined, to: undefined },
      columnFilters: [],
      searchColumn: "all"
    });
  },
  setSelectedCustomer: (customerId) => {
    set({ selectedCustomer: customerId });
  },
  getSelectedCustomer: () => get().selectedCustomer,
  setColumnVisibility: (key, visibility) => {
    set((state) => ({
      columnVisibility: {
        ...state.columnVisibility,
        [key]: visibility,
      },
    }));
  },
  getColumnVisibility: (key) => {
    return get().columnVisibility[key];
  },
}),
    {
      name: 'data-table-storage', // name of the item in localStorage
      partialize: (state) => ({ columnVisibility: state.columnVisibility }), // only persist columnVisibility
    }
  )
);
