import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DataTableColumnFilterProps {
  columns: Array<{ id: string; title: string; enableColumnFilter: boolean | undefined }>;
  selectedColumn: string;
  onColumnChange: (column: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  placeholder?: string;
}

export function DataTableColumnFilter({
  columns,
  selectedColumn,
  onColumnChange,
  filterValue,
  onFilterChange,
  placeholder = "Select column...",
}: DataTableColumnFilterProps) {
  const [open, setOpen] = React.useState(false);

  const selectedColumnData = columns.find((col) => col.id === selectedColumn);

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedColumnData ? selectedColumnData.title : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search column..." />
            <CommandList>
              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup>
                {columns
                  .filter((column) => column.enableColumnFilter)
                  .map((column) => (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={(currentValue) => {
                        onColumnChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedColumn === column.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {column.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input
        type="text"
        placeholder={`Filter ${selectedColumnData?.title || "column"}...`}
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        className="flex h-8 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
