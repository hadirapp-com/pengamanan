import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Printer, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { PartsPrintModal } from "./parts-print-modal";
import { axiosInstance } from "@/lib/api";
import { partsEndpoint } from "@/config/endpoints";
import { toLocalDateTime } from "@/lib/utils";
import UiContainer from "@/components/ui/layout/ui-container";
import { useDataTableStore } from "@/store/data-table";
import { Separator } from "@/components/ui/separator";
import type { ColumnDef } from "@tanstack/react-table";
import type { Parts } from "./parts-columns";

type ColumnDefWithTitle<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string;
  showFilter?: boolean;
};

export type PrintHistory = {
  id: string;
  partId: string;
  qtyLabel: number;
  qtyPart: number;
  serialFrom: string | null;
  serialEnd: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  productionDate: string;
  part: Parts
};

export function PartsPrintHistory() {
  const {
    globalFilter,
    columnFilters,
    resetDataTable,
    page,
    perPage,
    sortCol,
    sortDir,
  } = useDataTableStore();
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);

  // Create stable reference for columnFilters debouncing
  const columnFiltersString = useMemo(
    () => JSON.stringify(columnFilters),
    [columnFilters],
  );
  const [debouncedColumnFiltersString] = useDebounce(columnFiltersString, 500);
  const debouncedColumnFilters = useMemo(
    () =>
      JSON.parse(debouncedColumnFiltersString || "[]") as Array<{
        column: string;
        value: string;
      }>,
    [debouncedColumnFiltersString],
  );

  const [selectedHistory, setSelectedHistory] = useState<PrintHistory | null>(
    null,
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PrintHistory[]>([]);

  // Build query with all filters
  const query = {
    search: debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    // Add column filters as individual query parameters
    ...debouncedColumnFilters.reduce(
      (acc, filter) => {
        acc[`filter_${filter.column}`] = filter.value;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };

  // Fetch print history data
  const {
    data: historyData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["print-history", query],
    queryFn: async () => {
      const response = await axiosInstance.get(partsEndpoint.printHistory, {
        params: query,
      });
      return response.data;
    },
  });

  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

  // Reset selected rows when data changes
  useEffect(() => {
    setSelectedRows([]);
  }, [historyData?.result]);

  const handleRePrint = (history: PrintHistory) => {
    setSelectedHistory(history);
    setIsPrintModalOpen(true);
  };

  const handlePrintSuccess = () => {
    refetch();
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedHistory(null);
  };

  const handleRePrintSelected = () => {
    if (selectedRows.length > 0) {
      // For now, we'll re-print the first selected row
      // In a real implementation, you might want to handle multiple prints
      setSelectedHistory(selectedRows[0]);
      setIsPrintModalOpen(true);
    }
  };

  const printHistoryColumns: ColumnDefWithTitle<PrintHistory>[] = [
    {
      id: "reprint",
      header: "Re-Print",
      cell: ({ row }) => {
        const history = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRePrint(history)}
            className="h-8 w-8 p-0"
          >
            <Printer className="h-4 w-4" />
            <span className="sr-only">Re-Print</span>
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "part.no",
      title: "Part Number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Number" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.part?.no}</div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "part.name",
      title: "Part Name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Name" />
      ),
      cell: ({ row }) => <div>{row.original.part?.name}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "part.colorCode",
      title: "Color Code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color Code" />
      ),
      cell: ({ row }) => <div>{row.original.part?.colorCode}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "productionDate",
      title: "Production Date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Production Date" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.productionDate || "-"}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "part.model",
      title: "Model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => <div>{row.original.part?.model}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "part.labelColor",
      title: "Label Color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label Color" />
      ),
      cell: ({ row }) => <div>{row.original.part?.labelColor}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "part.customer.name",
      title: "Customer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => <div>{row.original.part?.customer?.name || "-"}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "serialFrom",
      title: "Serial From",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Serial From" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.serialFrom || "-"}</div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "serialEnd",
      title: "Serial End",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Serial End" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.serialEnd || "-"}</div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "qtyLabel",
      title: "Qty Label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty Label" />
      ),
      cell: ({ row }) => <div>{row.getValue("qtyLabel")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "qtyPart",
      title: "Qty Part",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty Part" />
      ),
      cell: ({ row }) => <div>{row.getValue("qtyPart")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "printByName",
      title: "Printed By",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Printed By" />
      ),
      cell: ({ row }) => <div>{row.getValue("printByName")}</div>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    
    {
      accessorKey: "createdAt",
      title: "Print Date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Print Date" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {toLocalDateTime(row.getValue("createdAt"))}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "status",
      title: "Status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = parseInt(row.getValue("status"));
        return (
          <Badge variant={status === 1 ? "default" : "secondary"}>
            {status === 1 ? "First Print" : `${status}nd Print`}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const history = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRePrint(history)}
              className="h-8 px-2"
            >
              <Printer className="h-4 w-4 mr-1" />
              Re-Print
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    },
  ];

  return (
    <UiContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Print History</h1>
          <p className="text-muted-foreground">
            Track all label printing activities and re-print labels
          </p>
        </div>
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="default"
              onClick={handleRePrintSelected}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Re-Print Selected ({selectedRows.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      <Separator />

      <div className="bg-white rounded-lg">
        <DataTable
          columns={printHistoryColumns}
          data={historyData?.result || []}
          pageCount={historyData?.pagination?.totalPages || 0}
          totalItems={historyData?.pagination?.total}
          isLoading={isLoading}
          showToolbar={true}
          showHeaderFilters={true}
        />
      </div>

      {/* Print Modal */}
      {selectedHistory && (
        <PartsPrintModal
          isOpen={isPrintModalOpen}
          onClose={handleClosePrintModal}
          part={selectedHistory.part as PrintHistory["part"]}
          onPrintSuccess={handlePrintSuccess}
          isRePrint={true}
          previousHistory={selectedHistory}
          reprintSerialFrom={selectedHistory.serialFrom}
          reprintSerialEnd={selectedHistory.serialEnd}
        />
      )}
    </UiContainer>
  );
}
