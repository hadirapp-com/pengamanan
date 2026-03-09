import type { ColumnDef } from '@tanstack/react-table';

// import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/table/data-table-row-actions';

import type { Customer } from '@/pages/customer/customer-schema';
import { toLocalDateTime } from '@/lib/utils';
import { useRowActionRestrictions } from '@/lib/role-permissions';

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

export const useCustomerColumns = (): Array<ColumnDefWithTitle<Customer>> => {
  const { disableEdit, editDisabledReason, deleteDisabledReason } = useRowActionRestrictions();
  
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
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.original.name}</div>,
    enableSorting: true,
    enableHiding: false,
  },
   {
    accessorKey: 'alias',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alias" />
    ),
    cell: ({ row }) => <div>{row.original.alias}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => <div>{row.original.address?.slice(0, 20)}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'updatedAt',
    title: 'Updated',
    showFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => (
      <div className="">
        {row.original.updatedAt
          ? toLocalDateTime(row.original.updatedAt)
          : toLocalDateTime(row.original.createdAt)}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: 'actions',
    showFilter: false,
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        disableEdit={disableEdit}
        disableDelete={true}
        editDisabledReason={editDisabledReason}
        deleteDisabledReason={deleteDisabledReason}
        
      />
    ),
  },
  ];
};
