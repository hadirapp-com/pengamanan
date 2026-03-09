import type { Table } from "@tanstack/react-table";
import { CalendarIcon, XCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDataTableStore } from "@/store/data-table";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableColumnFilter } from "./data-table-column-filter";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import type { DateRange as StoreDateRange } from "@/store/data-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  columns?: Array<{ id: string; title: string, enableColumnFilter: boolean | undefined }>;
  showDateRange?: boolean;
  showColumnFilter?: boolean;
  showSearchColumn?: boolean;
  storageKey?: string;
}

export function DataTableToolbar<TData>({
  table,
  columns = [],
  showDateRange = false,
  showColumnFilter = false,
  showSearchColumn = false,
  storageKey,
}: DataTableToolbarProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [selectedColumn, setSelectedColumn] = React.useState(
    columns[0]?.id || ""
  );
  const [columnFilterValue, setColumnFilterValue] = React.useState("");

  // Subscribe directly to state values (not getter functions)
  const dateRange = useDataTableStore((state) => state.dateRange);
  const columnFilters = useDataTableStore((state) => state.columnFilters);
  const searchColumn = useDataTableStore((state) => state.searchColumn);
  const globalFilter = useDataTableStore((state) => state.globalFilter);

  // Get setters and other methods
  const {
    setGlobalFilter,
    setPage,
    setDateRange,
    setColumnFilters,
    setSearchColumn,
  } = useDataTableStore((state) => state);

  const isFiltered =
    globalFilter !== "" ||
    dateRange.from ||
    dateRange.to ||
    columnFilters.length > 0;

  const showSelectedDate = (date: StoreDateRange) => {
    if (date.from && date.to) {
      return `${format(date.from, "LLL dd, y")} - ${format(
        date.to,
        "LLL dd, y"
      )}`;
    } else if (date.from) {
      return format(date.from, "LLL dd, y");
    }
    return "";
  };

  const handleColumnFilterChange = (value: string) => {
    setColumnFilterValue(value);

    // Update column filters
    const newFilters = columnFilters.filter((f) => f.column !== selectedColumn);
    if (value.trim()) {
      newFilters.push({ column: selectedColumn, value: value.trim() });
    }
    setColumnFilters(newFilters);
    setPage(1);
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange) return;

    const { from, to } = newDateRange;

    // If only start date is selected, allow it
    if (from && !to) {
      setDateRange(newDateRange);
      setPage(1);
      return;
    }

    // If both dates are selected, ensure they're in the same year
    if (from && to) {
      const fromYear = from.getFullYear();
      const toYear = to.getFullYear();

      if (fromYear !== toYear) {
        // Dates are in different years, don't update
        return;
      }

      setDateRange(newDateRange);
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    setGlobalFilter("");
    setDateRange({ from: undefined, to: undefined });
    setColumnFilters([]);
    setColumnFilterValue("");
    setSearchColumn("all");
    setPage(1);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="flex items-center space-x-2">
          {showSearchColumn && columns.length > 0 && (
            <>
              <Input
                placeholder="Search"
                value={globalFilter}
                onChange={(event) => {
                  setGlobalFilter(event.target.value);
                  setPage(1);
                }}
                className="h-8 w-[150px] lg:w-[250px]"
              />
              <Select
                value={searchColumn}
                onValueChange={(value) => {
                  setSearchColumn(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Search in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Columns</SelectItem>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {showColumnFilter && columns.length > 0 && (
          <DataTableColumnFilter
            columns={columns}
            selectedColumn={selectedColumn}
            onColumnChange={setSelectedColumn}
            filterValue={columnFilterValue}
            onFilterChange={handleColumnFilterChange}
          />
        )}

        {showDateRange && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from || dateRange?.to
                  ? showSelectedDate(dateRange)
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange as DateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                captionLayout="dropdown"
                weekStartsOn={1}
                showWeekNumber={true}
                disabled={(date) => {
                  // Disable dates that would result in cross-year selection
                  if (dateRange?.from && !dateRange?.to) {
                    return date.getFullYear() !== dateRange.from.getFullYear();
                  }
                  return false;
                }}
                footer={
                  <div className="w-full pt-3 flex justify-center">
                    <Button onClick={() => setOpen(false)}>Close</Button>
                  </div>
                }
              />
            </PopoverContent>
          </Popover>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XCircleIcon className="text-red-500 ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} storageKey={storageKey} />
    </div>
  );
}
