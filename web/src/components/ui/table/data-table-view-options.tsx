'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  storageKey?: string;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  // Function to get a user-friendly column name
  const getColumnDisplayName = (columnId: string, column: any) => {
    // First, check if column has a title property in its definition
    if (column.columnDef?.title) {
      return column.columnDef.title;
    }

    // Fallback to hardcoded mapping for columns without title property
    const columnNameMap: Record<string, string> = {
      slipNumber: 'Seq Prod',
      orderNo: 'Order No',
      partNumber: 'Part Number',
      partName: 'Part Name',
      colorCode: 'Color Code',
      seqProd: 'Seq Prod',
      kdLotNo: 'Lot',
      qty: 'Qty',
      date: 'Date',
      time: 'Time',
      adjustDate: 'Adjust Date',
      adjustTime: 'Adjust Time',
      // remarksBawah: 'Remarks',
      barcodeHpm: 'Barcode HPM',
      barcodeKasai: 'Barcode Kasai',
      'customer.alias': 'Customer',
      scanLt1ByName: 'Scan LT1 By',
      scanLt1At: 'Scan LT1 At',
      scanLt2ByName: 'Scan LT2 By',
      scanLt2At: 'Scan LT2 At',
      updatedBy: 'Updated By',
      createdAt: 'Created At',
      // Add more mappings as needed
    };

    return columnNameMap[columnId] || columnId;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 lg:flex"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) => column.accessorFn !== undefined && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value);
                }}
              >
                {getColumnDisplayName(column.id, column)}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
