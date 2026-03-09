import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/table/data-table-row-actions';

import type { User } from '@/pages/user/user-schema';
import { toLocalDateTime } from '@/lib/utils';
import { useRowActionRestrictions } from '@/lib/role-permissions';

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

export const useUserColumns = (): Array<ColumnDefWithTitle<User>> => {
  const { disableEdit, disableDelete, editDisabledReason, deleteDisabledReason } = useRowActionRestrictions();
  
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
    cell: ({ row }) => <div>{row.original.fullName}</div>,
    enableSorting: true,
    enableHiding: false,
  },
   {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => <div>{row.original.username}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nik',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NIK" />
    ),
    cell: ({ row }) => <div>{row.original.nik}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => <div>{row.original.role}</div>,
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
    cell: ({ row }) => {
      const isRowUserAdmin = row.original.role === 'admin';
      
      // Combine role-based restrictions with user-specific rules
      // Admin users should be able to edit all users
      const finalDisableEdit = disableEdit;
      // Admin users can delete regular users, but not admin users
      const finalDisableDelete = disableDelete || isRowUserAdmin;
      
      // Custom reasons for user management
      const finalEditDisabledReason = editDisabledReason;
      const finalDeleteDisabledReason = isRowUserAdmin 
        ? "Cannot delete admin users" 
        : deleteDisabledReason;
      
      return (
        <DataTableRowActions 
          row={row} 
          disableEdit={finalDisableEdit}
          disableDelete={finalDisableDelete}
          editDisabledReason={finalEditDisabledReason}
          deleteDisabledReason={finalDeleteDisabledReason}
        />
      );
    },
  },
  ];
};
