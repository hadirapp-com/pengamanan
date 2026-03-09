import { useEffect, useMemo, useState } from "react";
import { useQueryService } from "@/lib/react-query";
import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";
import { useDataTableStore } from "@/store/data-table";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";
import { deliveryEndpoint, customerEndpoint } from "@/config/endpoints";
import { useLotManagementColumns } from "./scan-monitoring-columns";
import { Unlock, RefreshCw, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export interface LotData {
  lot: string;
  customerId: string;
  customerName: string;
  deliveryYear: string;
  partNumber?: string;
  partName?: string;
  totalItems: number;
  preparationScanned: number;
  deliveryScanned: number;
  preparationScanBy?: string;
  preparationScanAt?: string;
  deliveryScanBy?: string;
  deliveryScanAt?: string;
  preparationStatus?: string;
  deliveryStatus?: string;
  status: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export default function LotManagementPage() {
  const params = useParams();
  const customer = params?.customer || null;
  const { setSelectedCustomer, resetDataTable } = useDataTableStore();

  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotData | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>("in progress"); // "open", "in progress", "closed", "all"
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch lot report data with date and status parameters
  const { data: lotData, isLoading, refetch } = useQueryService(
    deliveryEndpoint.lotReport,
    {
      date: formatDateForApi(selectedDate),
      status: selectedStatus,
    },
    {
      queryKey: ["lot-report", formatDateForApi(selectedDate), selectedStatus],
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Fetch customers for filtering
  const { data: customerData } = useQueryService(
    customerEndpoint.root,
    {},
    {
      queryKey: ["customers"],
    }
  );

  // Transform lot data
  const transformedData: LotData[] = useMemo(() => {
    if (!lotData?.result) return [];

    return lotData.result.map((item: any) => {
      const prepStatus = item.preparation_status || 'open';
      const delStatus = item.delivery_status || 'open';
      const isInProgress = prepStatus === 'in progress' || delStatus === 'in progress';

      return {
        lot: item.kd_lot_no || item.lot,
        customerId: item.customer_id,
        customerName: item.customer_name || "-",
        deliveryYear: item.delivery_year?.toString() || new Date().getFullYear().toString(),
        partNumber: item.part_number,
        partName: item.part_name,
        totalItems: item.total_items || 0,
        preparationScanned: item.preparation_scanned || 0,
        deliveryScanned: item.delivery_scanned || 0,
        preparationScanBy: item.preparation_scan_by,
        preparationScanAt: item.preparation_scan_at,
        deliveryScanBy: item.delivery_scan_by,
        deliveryScanAt: item.delivery_scan_at,
        preparationStatus: prepStatus,
        deliveryStatus: delStatus,
        status: isInProgress ? 'in progress' : (prepStatus === 'closed' && delStatus === 'closed') ? 'completed' : 'not started',
        isLocked: isInProgress,
        lockedBy: item.scan_lot_by_name,
        lockedAt: item.scan_lot_start_at,
      };
    });
  }, [lotData]);

  // Filter by customer
  const filteredData = useMemo(() => {
    if (!transformedData) return [];

    if (customer && customerData?.result) {
      const customerInfo = customerData.result.find(
        (c: { alias?: string; id: string }) => c?.alias === customer
      );
      if (customerInfo) {
        return transformedData.filter((lot) => lot.customerId === customerInfo.id);
      }
    }

    return transformedData;
  }, [transformedData, customer, customerData]);

  const columns = useLotManagementColumns({
    onUnlock: (lot) => {
      setSelectedLot(lot);
      setUnlockDialogOpen(true);
    },
  });

  // Handle unlock
  const handleUnlock = async () => {
    if (!selectedLot) return;

    setIsUnlocking(true);
    try {
      await axiosInstance({
        method: "PATCH",
        url: deliveryEndpoint.lotUnlock,
        data: { lot: selectedLot.lot },
      });

      toast.success(`Lot ${selectedLot.lot} unlocked successfully`);
      setUnlockDialogOpen(false);
      setSelectedLot(null);
      refetch();
    } catch (error: any) {
      console.error("Unlock error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to unlock lot";
      toast.error(errorMessage);
    } finally {
      setIsUnlocking(false);
    }
  };

  // Set selected customer from URL
  useEffect(() => {
    if (customer && customerData?.result) {
      const customerInfo = customerData.result.find(
        (c: { alias?: string; id: string }) => c?.alias === customer
      );
      if (customerInfo) {
        setSelectedCustomer(customerInfo.id);
      }
    }
  }, [customer, customerData, setSelectedCustomer]);

  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

  return (
    <UiContainer>
      <DataTableHeader
        title="Scan Monitoring"
        subtitle={customer ? `Customer: ${customer}` : `Date: ${format(selectedDate, "MMM dd, yyyy")}`}
        showCustomerFilter={false}
        onImportSuccess={() => {}}
      />

      <div className="mb-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Date Picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(selectedDate, "MMM dd, yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <DataTable
        data={filteredData}
        pageCount={1}
        columns={columns}
        isLoading={isLoading}
        showToolbar={false}
        showDateRange={false}
        showHeaderFilters={true}
      />

      {/* Unlock Confirmation Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Lot</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlock lot <strong>{selectedLot?.lot}</strong>?
              <br />
              <br />
              This will allow users to change lots. Current progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnlock} disabled={isUnlocking}>
              {isUnlocking ? (
                <>
                  <Unlock className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock Lot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UiContainer>
  );
}
