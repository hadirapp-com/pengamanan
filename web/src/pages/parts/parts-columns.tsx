import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Printer } from "lucide-react";
import { useNavigate } from "react-router";
import { axiosInstance } from "@/lib/api";
import { partsEndpoint } from "@/config/endpoints";
import { toast } from "sonner";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { toLocalDateTime } from "@/lib/utils";

export type Parts = {
  id: string;
  name: string;
  no: string;
  colorCode: string;
  labelSize: string;
  labelDesignId: string;
  customerId: string;
  model: string;
  labelColor: string;
  qtyPerPack: number;
  indication: string;
  leftHand: boolean;
  rightHand: boolean;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    alias: string;
  };
};

interface UsePartsColumnsProps {
  onPrintClick?: (part: Parts) => void;
  onDelete?: (id: string) => void;
}

export const usePartsColumns = ({ onPrintClick, onDelete }: UsePartsColumnsProps = {}): ColumnDefWithTitle<Parts>[] => {
  const navigate = useNavigate();

  const handleDelete = async (id: string, name: string) => {
    const confirmMessage = `Are you sure you want to delete "${name}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await axiosInstance.delete(`${partsEndpoint.root}/${id}`);
      toast.success(GENERAL_SUCCESS_TEXT);
      onDelete?.(id);
    } catch (error) {
      console.error("Failed to delete part:", error);
      toast.error(GENERAL_ERROR_TEXT);
    }
  };

  return [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      id: "print",
      header: "Print",
      showFilter: false,
      cell: ({ row }) => {
        const parts = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrintClick?.(parts)}
            className="h-8 w-8 p-0"
          >
            <Printer className="h-4 w-4" />
            <span className="sr-only">Print</span>
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "no",
      title: "Part Number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Number" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("no")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "name",
      title: "Part Name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "colorCode",
      title: "Color Code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color Code" />
      ),
      cell: ({ row }) => <div>{row.getValue("colorCode")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    // {
    //   accessorKey: "labelSize",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Label Size" />
    //   ),
    //   cell: ({ row }) => <div>{row.getValue("labelSize")}</div>,
    //   enableSorting: true,
    //   enableHiding: true,
    //   enableColumnFilter: false,
    // },
    // {
    //   accessorKey: "labelDesignId",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Label Design ID" />
    //   ),
    //   cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("labelDesignId") || "-"}</div>,
    //   enableSorting: true,
    //   enableHiding: true,
    //   enableColumnFilter: true,
    // },
    {
      accessorKey: "customer.name",
      title: "Customer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => <div>{row.original.customer?.name || "-"}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "model",
      title: "Model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => <div>{row.getValue("model")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "qtyPerPack",
      title: "Qty Per Pack",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty Per Pack" />
      ),
      cell: ({ row }) => <div>{row.getValue("qtyPerPack")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "indication",
      title: "Indication",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Indication" />
      ),
      cell: ({ row }) => <div>{row.getValue("indication")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "leftHand",
      title: "Left Hand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Left Hand" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue("leftHand") ? "default" : "secondary"}>
          {row.getValue("leftHand") ? "Yes" : "No"}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "rightHand",
      title: "Right Hand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Right Hand" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue("rightHand") ? "default" : "secondary"}>
          {row.getValue("rightHand") ? "Yes" : "No"}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "labelColor",
      title: "Label Color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label Color" />
      ),
      cell: ({ row }) => <div>{row.getValue("labelColor")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "updatedAt",
      title: "Date Edit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Edit" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.updatedAt
            ? toLocalDateTime(row.original.updatedAt)
            : toLocalDateTime(row.original.createdAt)}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      showFilter: false,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      showFilter: false,
      cell: ({ row }) => {
        const parts = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/app/parts/${parts.id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(parts.id, parts.name)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
