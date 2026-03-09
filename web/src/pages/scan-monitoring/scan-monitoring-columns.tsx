import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, CheckCircle2, Clock } from "lucide-react";
import type { LotData } from "./scan-monitoring-page";

interface LotManagementColumnsOptions {
  onUnlock: (lot: LotData) => void;
}

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

export function useLotManagementColumns(options: LotManagementColumnsOptions) {
  const columns: ColumnDefWithTitle<LotData>[] = [
    {
      accessorKey: "lot",
      header: "Lot Number",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("lot")}</div>;
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        return <div>{row.getValue("customerName")}</div>;
      },
    },
    {
      accessorKey: "partNumber",
      header: "Part Number",
      cell: ({ row }) => {
        const partNumber = row.getValue("partNumber") as string | undefined;
        const partName = row.original.partName;
        return (
          <div>
            <div className="font-medium">{partNumber || "-"}</div>
            {partName && (
              <div className="text-xs text-muted-foreground">{partName}</div>
            )}
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
      accessorKey: "totalItems",
      header: "Total Items",
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("totalItems")}</div>;
      },
    },
    {
      accessorKey: "preparationScanned",
      header: "Preparation",
      cell: ({ row }) => {
        const status = row.original;
        const scanned = row.getValue("preparationScanned") as number;
        const total = row.getValue("totalItems") as number;
        const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;
        const scanBy = status.preparationScanBy;
        // const scanAt = status.preparationScanAt;

        return (
          <div className="text-center w-30">
            <div className="font-medium">{scanned} / {total}</div>
            <div
              className={`text-xs rounded-full text-white ${percentage == 0 ? "bg-gray-500" : percentage > 0 && percentage < 100 ? "bg-amber-500" : "bg-green-500"}`}
            >
              {percentage}%
            </div>
            {scanBy && (
              <div className="text-xs text-muted-foreground mt-1">
                by {scanBy}
              </div>
            )}
            {/* {scanAt && (
              <div className="text-xs text-muted-foreground">
                {new Date(scanAt).toLocaleString()}
              </div>
            )} */}
          </div>
        );
      },
    },
    {
      accessorKey: "deliveryScanned",
      header: "Delivery",
      cell: ({ row }) => {
        const status = row.original;
        const scanned = row.getValue("deliveryScanned") as number;
        const total = row.getValue("totalItems") as number;
        const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;
        const scanBy = status.deliveryScanBy;
        // const scanAt = status.deliveryScanAt;

        return (
          <div className="text-center w-30">
            <div className="font-medium">{scanned} / {total}</div>
            <div
              className={`text-xs rounded-full text-white ${percentage == 0 ? "bg-gray-500" : percentage > 0 && percentage < 100 ? "bg-amber-500" : "bg-green-500"}`}
            >
              {percentage}%
            </div>
            {scanBy && (
              <div className="text-xs text-muted-foreground mt-1">
                by {scanBy}
              </div>
            )}
            {/* {scanAt && (
              <div className="text-xs text-muted-foreground">
                {new Date(scanAt).toLocaleString()}
              </div>
            )} */}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original;
        const isLocked = status.isLocked;
        const total = status.totalItems;
        const prepScanned = status.preparationScanned;
        const delScanned = status.deliveryScanned;

        const isPrepComplete = prepScanned === total;
        const isDelComplete = delScanned === total;
        const isFullyComplete = isPrepComplete && isDelComplete;

        if (isFullyComplete) {
          return (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Closed
            </Badge>
          );
        }

        if (isLocked) {
          return (
            <Badge variant="secondary" className="bg-yellow-600 text-white">
              <Lock className="mr-1 h-3 w-3" />
              In Progress
            </Badge>
          );
        }

        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Open {isPrepComplete ? 'Delivery' : 'Preparation'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lockedBy",
      header: "Locked By",
      cell: ({ row }) => {
        const status = row.original;
        if (!status.isLocked) {
          return <div className="text-muted-foreground">-</div>;
        }

        return (
          <div>
            <div className="font-medium">{status.lockedBy || "-"}</div>
            {status.lockedAt && (
              <div className="text-xs text-muted-foreground">
                {new Date(status.lockedAt).toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.original;

        if (!status.isLocked) {
          return (
            <div className="text-muted-foreground text-sm">
              <Unlock className="inline h-4 w-4 mr-1" />
              Unlocked
            </div>
          );
        }

        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => options.onUnlock(status)}
          >
            <Unlock className="mr-2 h-4 w-4" />
            Unlock
          </Button>
        );
      },
    },
  ];

  return columns;
}
