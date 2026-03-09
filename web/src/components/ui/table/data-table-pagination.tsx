import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useDataTableStore } from '@/store/data-table';

import { DATA_TABLE_PAGE_SIZE_OPTIONS } from '@/config/constants';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageCount: number;
  totalItems?: number;
  showRowSelection?: boolean;
}

export function DataTablePagination<TData>({
  table,
  pageCount,
  totalItems,
  showRowSelection = false,
}: DataTablePaginationProps<TData>) {
  const {
    perPage,
    page,
    // alowedColumnFilter,
    // sortCol,
    // sortDir,
    // setSortCol,
    // setSortDir,
    setPage,
    setPerPage,
  } = useDataTableStore();
  return (
    <div className="flex items-center justify-between px-2 flex-col lg:flex-row">
      <div className="flex-1 text-sm text-muted-foreground mb-4 lg:mb-0">
        {showRowSelection && (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        )}
        {totalItems !== undefined && (
          <span className={showRowSelection ? "ml-2" : ""}>
            Total: {totalItems.toLocaleString()} item(s)
          </span>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium whitespace-nowrap lg:block hidden">
            Rows per page
          </p>
          <p className="text-sm font-medium whitespace-nowrap lg:hidden">
            Rows
          </p>
          <Select
            value={`${perPage}`}
            onValueChange={(value) => {
              setPage(1);
              setPerPage(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={perPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {DATA_TABLE_PAGE_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          <p className="lg:block hidden whitespace-nowrap">
            Page {page} of {pageCount}
          </p>
          <p className="lg:hidden">
            Pg {page} of {pageCount}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              setPage(1);
            }}
            disabled={page <= 1}
          >
            <span className="sr-only">First Page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setPage(page - 1);
            }}
            disabled={page <= 1}
          >
            <span className="sr-only">Prev</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setPage(page + 1);
            }}
            disabled={page >= pageCount}
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              setPage(pageCount);
            }}
            disabled={page >= pageCount}
          >
            <span className="sr-only">Last Page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
