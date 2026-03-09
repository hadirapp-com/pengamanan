import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_ERROR_TEXT, GENERAL_SUCCESS_TEXT } from "@/config/constants";
import { useRolePermissions } from "@/lib/role-permissions";
import type { Config } from "./config-schema";
import { formatConfigValue } from "./config-schema";

interface ConfigColumnsProps {
  onEdit?: (config: Config) => void;
}

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

export const useConfigColumns = ({ onEdit }: ConfigColumnsProps = {}): ColumnDefWithTitle<Config>[] => {
  const { canEdit, canDelete } = useRolePermissions();
  const queryClient = useQueryClient();

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this config?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/configs/${key}`);
      toast.success(GENERAL_SUCCESS_TEXT);

      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["config"],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || GENERAL_ERROR_TEXT);
    }
  };

  const columns: ColumnDefWithTitle<Config>[] = [
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => {
        return (
          <div className="font-medium font-mono text-sm">
            {row.getValue("key")}
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value");

        // Display arrays as chips
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return <div className="text-sm text-muted-foreground">Empty array</div>;
          }

          return (
            <div className="flex flex-wrap gap-1.5 max-w-[400px]">
              {value.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="font-mono text-xs max-w-[200px] truncate"
                >
                  {typeof item === "object" ? JSON.stringify(item) : String(item)}
                </Badge>
              ))}
            </div>
          );
        }

        // Display other types as before
        const formatted = formatConfigValue(value);

        return (
          <div className="font-mono text-xs max-w-[400px] truncate">
            <pre className="whitespace-pre-wrap break-all text-xs">
              {formatted}
            </pre>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        return (
          <div className="text-sm text-muted-foreground max-w-[300px] truncate">
            {description || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      title: "Last Updated",
      showFilter: false,
      header: "Last Updated",
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as string;
        const date = new Date(updatedAt);
        return (
          <div className="text-sm">
            {date.toLocaleString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      showFilter: false,
      cell: ({ row }) => {
        const config = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(config)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDelete(config.key)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return columns;
};
