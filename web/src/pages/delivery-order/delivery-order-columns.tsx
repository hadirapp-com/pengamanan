import type { ColumnDef } from "@tanstack/react-table";
import type { LotData } from "./delivery-order-page";
import { Checkbox } from "@/components/ui/checkbox";

interface DeliveryOrderColumnsOptions {
  onUnlock: (lot: LotData) => void;
}

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

// @ts-expect-error
export function useDeliveryOrderColumns(options: DeliveryOrderColumnsOptions) {
  const columns: ColumnDefWithTitle<LotData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      showFilter: false,
    },
    {
      accessorKey: "lot",
      header: "Lot No",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("lot")}</div>;
      },
    },
    {
      accessorKey: "poNumber",
      header: "PO Number",
      cell: ({ row }) => {
        const poNumber = row.getValue("poNumber") as string | undefined;
        return <div>{poNumber || "-"}</div>;
      },
    },
    {
      accessorKey: "partNumber",
      header: "Part Number",
      cell: ({ row }) => {
        const partNumber = row.getValue("partNumber") as string | undefined;
        return (
          <div>
            <div className="font-medium">{partNumber || "-"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "partName",
      header: "Part Name",
      cell: ({ row }) => {
        const partName = row.original.partName;
        return (
          <div>
            <div className="font-medium">{partName || "-"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "deliveryYear",
      header: "Year",
      cell: ({ row }) => {
        return <div>{row.getValue("deliveryYear")}</div>;
      },
    },
    {
      accessorKey: "totalQty",
      header: "Total Qty",
      cell: ({ row }) => {
        console.log({ row });
        return <div className="text-center">{row.getValue("totalQty")}</div>;
      },
    },
    {
      accessorKey: "totalItems",
      header: "Total labels",
      cell: ({ row }) => {
        console.log({ row });
        return <div className="text-center">{row.getValue("totalItems")}</div>;
      },
    },
    {
      accessorKey: "preparationScanned",
      header: "Preparation",
      cell: ({ row }) => {
        console.log({ row });
        const scanned = row.getValue("preparationScanned") as number;
        const total = row.getValue("totalItems") as number;
        const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;

        return (
          <div className="text-center w-20">
            <div className="font-medium">
              {scanned} / {total}
            </div>
            <div
              className={`text-xs rounded-full text-white ${percentage == 0 ? "bg-gray-500" : percentage > 0 && percentage < 100 ? "bg-amber-500" : "bg-green-500"}`}
            >
              {percentage}%
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "deliveryScanned",
      header: "Delivery",
      cell: ({ row }) => {
        const scanned = row.getValue("deliveryScanned") as number;
        const total = row.getValue("totalItems") as number;
        const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;

        return (
          <div className="text-center w-20">
            <div className="font-medium">
              {scanned} / {total}
            </div>
            <div
              className={`text-xs rounded-full text-white ${percentage == 0 ? "bg-gray-500" : percentage > 0 && percentage < 100 ? "bg-amber-500" : "bg-green-500"}`}
            >
              {percentage}%
            </div>
          </div>
        );
      },
    }
  ];

  return columns;
}
