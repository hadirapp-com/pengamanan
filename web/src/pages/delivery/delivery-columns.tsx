import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';

import type { Delivery } from '@/pages/delivery/delivery-schema';
import { toLocalDateTime } from '@/lib/utils';

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

export const useDeliveryColumns = (): Array<ColumnDefWithTitle<Delivery>> => {
  
  return [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => {
  //         table.toggleAllPageRowsSelected(!!value);
  //       }}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => {
  //         row.toggleSelected(!!value);
  //       }}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: 'customer.alias',
  //   title: 'Customer',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Customer" />
  //   ),
  //   cell: ({ row }) => {
  //     const customer = row.original.customer as { alias?: string; name?: string } | undefined;
  //     return <div>{customer?.alias || customer?.name || '-'}</div>;
  //   },
  //   enableSorting: true,
  //   enableHiding: true,
  //   enableColumnFilter: false,
  // },
  {
    accessorKey: 'kdLotNo',
    title: 'Lot Number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lot" />
    ),
    cell: ({ row }) => <div>{row.original.kdLotNo}</div>,
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
    cell: ({ row }) => <div>{row.original.slipNumber}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'seqProd',
    title: 'Seq Prod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seq Prod" />
    ),
    cell: ({ row }) => <div>{row.original.seqProd}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'orderNo',
    title: 'Order No',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order No" />
    ),
    cell: ({ row }) => <div>{row.original.orderNo}</div>,
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
    cell: ({ row }) => <div>{row.original.partNumber}</div>,
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
    cell: ({ row }) => <div>{row.original.partName}</div>,
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
    cell: ({ row }) => <div>{row.original.colorCode}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'qty',
    title: 'Qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qty" />
    ),
    cell: ({ row }) => <div>{row.original.qty}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'date',
    title: 'Date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => <div>{row.original.date}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'time',
    title: 'Time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => <div>{row.original.time}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'adjustDate',
    title: 'Adjust Date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Adjust Date" />
    ),
    cell: ({ row }) => <div>{row.original.adjustDate}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'adjustTime',
    title: 'Adjust Time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Adjust Time" />
    ),
    cell: ({ row }) => <div>{row.original.adjustTime}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'remarksBawah',
    title: 'Remarks Bawah',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remarks" />
    ),
    cell: ({ row }) => <div>{row.original.remarksBawah}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'barcodeHpm',
    title: 'Barcode HPM',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Barcode HPM" />
    ),
    cell: ({ row }) => <div>{row.original.barcodeHpm}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'barcodeKasai',
    title: 'Barcode Kasai',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Barcode Kasai" />
    ),
    cell: ({ row }) => <div>{row.original.barcodeKasai}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'scanLt1ByName',
    title: 'Scan Prepare',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scan Prepare" />
    ),
    cell: ({ row }) => <div>{row.original.scanLt1ByName}</div>,
    enableSorting: true,
    enableHiding: true, 
    enableColumnFilter: true,
  },
  {
    accessorKey: 'scanLt1At',
    title: 'Scan Prepare At',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scan Prepare At" />
    ),
    cell: ({ row }) => <div>{row.original.scanLt1At ? toLocalDateTime(row.original.scanLt1At) : '-'}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'scanLt2ByName',
    title: 'Scan Delivery',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scan Delivery" />
    ),
    cell: ({ row }) => <div>{row.original.scanLt2ByName}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'scanLt2At',
    title: 'Scan Delivery At',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scan Delivery At" />
    ),
    cell: ({ row }) => <div>{row.original.scanLt2At ? toLocalDateTime(row.original.scanLt2At) : '-'}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'updatedBy',
    title: 'Updated By',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated By" />
    ),
    cell: ({ row }) => <div>{row.original.updatedBy}</div>,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: false,
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
        {row.original.updatedAt
          ? toLocalDateTime(row.original.updatedAt)
          : toLocalDateTime(row.original.createdAt)}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: false,
  },
  // {
  //   id: 'actions',
  //   showFilter: false,
  //   cell: ({ row }) => (
  //     <DataTableRowActions 
  //       row={row} 
  //       disableEdit={disableEdit}
  //       disableDelete={disableDelete}
  //       editDisabledReason={editDisabledReason}
  //       deleteDisabledReason={deleteDisabledReason}
  //     />
  //   ),
  // },
  ];
};
