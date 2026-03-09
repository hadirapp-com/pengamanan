import { Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api";
import { deliveryEndpoint } from "@/config/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GENERAL_SUCCESS_TEXT, GENERAL_ERROR_TEXT } from "@/config/constants";

type CurrentValues = {
  date: string;
  time: string;
  qty: string;
  adjustDate: string | null;
  adjustTime: string | null;
};

type NewValues = {
  adjustDate: string;
  adjustTime: string;
};

type RevisionDetail = {
  deliveryId: string;
  kdLotNo: string;
  partNumber: string;
  sheet: string;
  row: number;
  currentValues: CurrentValues;
  newValues: NewValues;
  hasChanges: boolean;
};

type RevisionError = {
  sheet: string;
  row: number;
  kdLotNo: string;
  partNumber: string;
  error: string;
};

type RevisionPreviewResponse = {
  message: string;
  preview: boolean;
  customer: {
    id: string;
    name: string;
    alias: string;
  };
  summary: {
    updated: number;
    notFound: number;
    errors: number;
    total: number;
  };
  errors: RevisionError[];
  details: RevisionDetail[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  file: File;
  customerId: string;
  previewData: RevisionPreviewResponse;
}

export function RevisionPreviewModal({
  isOpen,
  onClose,
  onSuccess,
  file,
  customerId,
  previewData,
}: Props) {
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", customerId);
      formData.append("preview", "0"); // Set preview to 0 for actual update

      return axiosInstance<{ message: string }>({
        method: "POST",
        data: formData,
        url: deliveryEndpoint.revision,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message ?? GENERAL_SUCCESS_TEXT);
      onClose();

      // Remove all delivery-related queries from cache
      queryClient.removeQueries({
        queryKey: ["delivery"],
      });

      // Also remove by endpoint pattern
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            (queryKey[0] === deliveryEndpoint.root || queryKey[0] === "delivery")
          );
        },
      });

      // Refetch delivery data to get fresh data
      queryClient.invalidateQueries({
        queryKey: ["delivery"],
      });

      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? GENERAL_ERROR_TEXT);
    },
  });

  const handleConfirm = () => {
    confirmMutation.mutate();
  };

  // Render value cell with highlighting if changed
  const renderValueCell = (
    currentValue: string | null,
    newValue: string | null,
    // @ts-ignore
    fieldType: "date" | "time"
  ) => {
    const hasChanged = newValue !== null && newValue !== currentValue;
    const displayValue = currentValue || "-";

    if (hasChanged) {
      return (
        <div className="relative">
          <span className="line-through text-muted-foreground mr-2">
            {displayValue}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">
            {newValue}
          </span>
        </div>
      );
    }

    return <span>{displayValue}</span>;
  };

  if (!previewData || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[100vw] max-h-[100vh] w-full h-full flex flex-col p-0 sm:max-w-[80vw]"
        showCloseButton={false}
      >
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl">
            Revision Preview - {previewData.customer.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Review the changes before confirming
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 overflow-y-scroll">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-[100px]">Sheet</TableHead>
                  <TableHead className="w-[80px]">Row</TableHead>
                  <TableHead className="w-[150px]">Part Number</TableHead>
                  <TableHead className="w-[150px]">Kd Lot No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Adjust Date</TableHead>
                  <TableHead>Adjust Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.details.map((detail, index) => (
                  <TableRow key={`${detail.deliveryId}-${index}`}>
                    <TableCell className="font-medium">
                      {detail.sheet}
                    </TableCell>
                    <TableCell>{detail.row}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {detail.partNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {detail.kdLotNo}
                    </TableCell>
                    <TableCell>
                      {renderValueCell(
                        detail.currentValues.date,
                        null,
                        "date"
                      )}
                    </TableCell>
                    <TableCell>
                      {renderValueCell(
                        detail.currentValues.time,
                        null,
                        "time"
                      )}
                    </TableCell>
                    <TableCell>{detail.currentValues.qty}</TableCell>
                    <TableCell>
                      {renderValueCell(
                        detail.currentValues.adjustDate,
                        detail.newValues.adjustDate,
                        "date"
                      )}
                    </TableCell>
                    <TableCell>
                      {renderValueCell(
                        detail.currentValues.adjustTime,
                        detail.newValues.adjustTime,
                        "time"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
              {previewData.details.filter((d) => d.hasChanges).length} changes
            </span>
            <span>•</span>
            <span>Total {previewData.details.length} rows</span>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={confirmMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {confirmMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RevisionPreviewModal;
