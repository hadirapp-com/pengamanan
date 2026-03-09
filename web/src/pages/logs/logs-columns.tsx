import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';

import type { ScanLog } from '@/pages/logs/logs-schema';
import { toLocalDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

// Helper function to format scan type display
const formatScanType = (scanType: string): string => {
  switch (scanType) {
    case "preparation":
      return "Preparation";
    case "delivery":
      return "Delivery";
    case "scan1":
      return "Scan 1";
    case "scan2":
      return "Scan 2";
    default:
      return scanType;
  }
};

export const useLogsColumns = (): Array<ColumnDefWithTitle<ScanLog>> => {
  return [
    {
      id: 'customer',
      title: 'Customer',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const customer = row.original.customer as { alias?: string; name?: string } | undefined;
        return <div>{customer?.alias || customer?.name || '-'}</div>;
      },
      enableSorting: false, // Customer is nested object
      enableHiding: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'lot',
      title: 'Lot',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lot" />
      ),
      cell: ({ row }) => <div>{row.original.lot || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'orderNo',
      title: 'Order No',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order No" />
      ),
      cell: ({ row }) => <div>{row.original.orderNo || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'slipNumber',
      title: 'Slip Number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slip Number" />
      ),
      cell: ({ row }) => <div>{row.original.slipNumber || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'seqProd',
      title: 'Seq Prod',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Seq Prod" />
      ),
      cell: ({ row }) => <div>{row.original.seqProd || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'partNumber',
      title: 'Part Number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Number" />
      ),
      cell: ({ row }) => <div>{row.original.partNumber || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'partName',
      title: 'Part Name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Name" />
      ),
      cell: ({ row }) => <div>{row.original.partName || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'colorCode',
      title: 'Color Code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color Code" />
      ),
      cell: ({ row }) => <div>{row.original.colorCode || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'deliveryYear',
      title: 'Delivery Year',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Delivery Year" />
      ),
      cell: ({ row }) => <div>{row.original.deliveryYear || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'expectedLabel',
      title: 'Kasai Barcode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kasai Barcode" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.expectedLabel || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'scannedLabel',
      title: 'Customer Barcode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Barcode" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.scannedLabel || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'isMatch',
      title: 'Match Status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Match Status" />
      ),
      cell: ({ row }) => {
        const isMatch = row.original.isMatch;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={isMatch ? "default" : "destructive"} className="gap-1">
              {isMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {isMatch ? "Match" : "Mismatch"}
            </Badge>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'scanType',
      title: 'Scan Type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scan Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {formatScanType(row.original.scanType)}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'scannedByName',
      title: 'Scanned By',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scanned By" />
      ),
      cell: ({ row }) => <div>{row.original.scannedByName || '-'}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'createdAt',
      title: 'Created At',
      showFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => (
        <div className="">
          {row.original.createdAt ? toLocalDateTime(row.original.createdAt) : '-'}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
  ];
};
