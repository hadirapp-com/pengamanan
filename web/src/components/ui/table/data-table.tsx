'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTableStore } from '@/store/data-table';

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  isLoading: boolean;
  pageCount: number;
  totalItems?: number;
  showPagination?: boolean;
  showToolbar?: boolean;
  showDateRange?: boolean;
  showColumnFilter?: boolean;
  showHeaderFilters?: boolean;
  showSearchColumn?: boolean;
  defaultColumnVisibility?: VisibilityState;
  storageKey?: string;
  showRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  pageCount,
  totalItems,
  showPagination = true,
  showToolbar = true,
  showDateRange = false,
  showColumnFilter = false,
  showHeaderFilters = false,
  showSearchColumn = false,
  defaultColumnVisibility = {},
  storageKey,
  showRowSelection = false,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility);

  // Use external row selection if provided, otherwise use internal state
  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = externalOnRowSelectionChange ?? setInternalRowSelection;

  const {
    sortCol,
    sortDir,
    setSortCol,
    setSortDir,
    setPage,
    getColumnVisibility,
    setColumnVisibility: saveColumnVisibility,
    setColumnFilters,
    columnFilters: storedColumnFilters
  } = useDataTableStore();

  // Get column filters from store - convert to TanStack Table format
  const columnFilters = React.useMemo(() => {
    return storedColumnFilters.map(filter => ({
      id: filter.column,
      value: filter.value
    }));
  }, [storedColumnFilters]);
  
  // Initialize sorting from store
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: sortCol, desc: sortDir === "DESC" }
  ]);

  // Handle column filter changes - convert to store format and reset page
  const handleColumnFiltersChange = React.useCallback((updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    const newFilters = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue;
    const storeFilters = newFilters.map(filter => ({
      column: filter.id,
      value: filter.value as string
    }));
    setColumnFilters(storeFilters);
    setPage(1); // Reset to first page when filters change
  }, [columnFilters, setColumnFilters, setPage]);

  // Handle sorting changes
  const handleSortingChange = React.useCallback((updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    if (newSorting.length > 0) {
      const sort = newSorting[0];
      setSortCol(sort.id);
      setSortDir(sort.desc ? "DESC" : "ASC");
      setPage(1); // Reset to first page when sorting changes
    }
  }, [setSortCol, setSortDir, setPage, sorting]);

  // Initialize column visibility from store
  React.useEffect(() => {
    if (storageKey) {
      const savedVisibility = getColumnVisibility(storageKey);
      if (savedVisibility) {
        setColumnVisibility(savedVisibility);
      }
    }
  }, [storageKey, getColumnVisibility]);

  // Sync column visibility changes to store
  React.useEffect(() => {
    if (storageKey) {
      saveColumnVisibility(storageKey, columnVisibility);
    }
  }, [storageKey, columnVisibility, saveColumnVisibility]);

  // Extract column information for filtering
  const filterableColumns = columns
    .filter(col => 'accessorKey' in col && col.accessorKey && col.enableHiding !== false)
    .map(col => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const colWithMeta = col as any;
      return {
        id: colWithMeta.accessorKey as string,
        enableColumnFilter: col.enableColumnFilter,
        title: colWithMeta.title || colWithMeta.accessorKey
      };
    });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    pageCount,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          columns={filterableColumns}
          showDateRange={showDateRange}
          showColumnFilter={showColumnFilter}
          showSearchColumn={showSearchColumn}
          storageKey={storageKey}
        />
      )}
      <div className="rounded-md border">
        <Table className="overflow-scroll">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
            {showHeaderFilters && (
              <TableRow>
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  if (header.isPlaceholder) {
                    return <TableHead key={header.id}></TableHead>;
                  }
                  // Check if column should show filter
                  const columnDef = header.column.columnDef as { title?: string; showFilter?: boolean };
                  const showColumnFilter = columnDef.showFilter !== false; // Default to true

                  if (!showColumnFilter) {
                    return <TableHead key={header.id}></TableHead>;
                  }

                  const columnTitle = columnDef.title || header.id;
                  return (
                    <TableHead key={header.id} className="p-1">
                      <input
                        type="text"
                        placeholder={`${columnTitle}...`}
                        value={(header.column.getFilterValue() as string) ?? ''}
                        onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                        className="w-full px-2 py-1 text-xs border rounded min-w-[100px]"
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? 'Loading..' : 'No data.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination ? (
        <DataTablePagination table={table} pageCount={pageCount} totalItems={totalItems} showRowSelection={showRowSelection} />
      ) : null}
    </div>
  );
}
