import { FileTextIcon, CalendarIcon, Plus, Loader2Icon, RefreshCwIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { useQueryService } from "@/lib/react-query";
import { customerEndpoint, deliveryEndpoint } from "@/config/endpoints";
import type { Customer } from "@/pages/customer/customer-schema";
import { useDataTableStore } from "@/store/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api";
import { GENERAL_ERROR_TEXT, GENERAL_SUCCESS_TEXT } from "@/config/constants";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useRolePermissions } from "@/lib/role-permissions";
import { RevisionPreviewModal } from "@/pages/delivery/revision-preview-modal";

type Props = {
  title: string;
  subtitle?: string;
  // showDaterange?: boolean;
  addAction?: () => void;
  addRecord?: boolean;
  importAction?: () => void;
  revisionAction?: () => void;
  exportRawAction?: () => void;
  showCustomerFilter?: boolean;
  showCalendarFilter?: boolean;
  onImportSuccess?: () => void;
  onRevisionSuccess?: () => void;
};

type ImportFile = {
  file: File | undefined;
  customerId?: string;
  deliveryYear?: string;
};

type RevisionFile = {
  file: File | undefined;
  customerId?: string;
};

type RevisionPreviewData = {
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
  errors: Array<{
    sheet: string;
    row: number;
    kdLotNo: string;
    partNumber: string;
    error: string;
  }>;
  details: Array<{
    deliveryId: string;
    kdLotNo: string;
    partNumber: string;
    sheet: string;
    row: number;
    currentValues: {
      date: string;
      time: string;
      qty: string;
      adjustDate: string | null;
      adjustTime: string | null;
    };
    newValues: {
      adjustDate: string;
      adjustTime: string;
    };
    hasChanges: boolean;
  }>;
};

export default function DataTableHeader({
  title,
  subtitle,
  showCustomerFilter = false,
  showCalendarFilter = false,
  addAction,
  // addRecord = true,
  importAction,
  revisionAction,
  exportRawAction,
  onImportSuccess,
  onRevisionSuccess,
}: Props) {
  const { canAdd, canImport } = useRolePermissions();
  const queryClient = useQueryClient();
  const dataTableStore = useDataTableStore();
  const selectedCustomer = dataTableStore.getSelectedCustomer();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [txtFile, setTxtFile] = useState<ImportFile["file"]>(undefined);
  const [revisionFile, setRevisionFile] = useState<RevisionFile["file"]>(undefined);
  const [deliveryYear, setDeliveryYear] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // Revision preview states
  const [showRevisionPreview, setShowRevisionPreview] = useState(false);
  const [revisionPreviewData, setRevisionPreviewData] = useState<RevisionPreviewData | null>(null);
  const [currentRevisionFile, setCurrentRevisionFile] = useState<File | null>(null);

  const endpoint = customerEndpoint.root;
  const { data: customerData, isLoading: customerDataLoading } =
    useQueryService(
      endpoint,
      {},
      { enabled: Boolean(showCustomerFilter), queryKey: ["customer"] }
    );

  const showSelectedDate = (date: DateRange): string => {
    let startDate = "-";
    let endDate = "-";
    if (date?.from) {
      startDate = dayjs(date.from).format("DD-MM-YYYY");
    }
    if (date?.to) {
      endDate = dayjs(date.to).format("DD-MM-YYYY");
    }
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} to ${endDate}`;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ImportFile) => {
      const formData = new FormData();
      formData.append("file", data.file as File);
      formData.append("customerId", data.customerId as string);
      formData.append("deliveryYear", data.deliveryYear as string);
      return axiosInstance<{ message: string }>({
        method: "POST",
        data: formData,
        url: deliveryEndpoint.import,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message ?? GENERAL_SUCCESS_TEXT);
      setDialogOpen(false);
      setTxtFile(undefined);
      setDeliveryYear("");

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
            (queryKey[0] === deliveryEndpoint.root ||
              queryKey[0] === "delivery")
          );
        },
      });

      // Refetch delivery data to get fresh data
      queryClient.invalidateQueries({
        queryKey: ["delivery"],
      });

      // Call the onImportSuccess callback if provided
      onImportSuccess?.();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? GENERAL_ERROR_TEXT);
    },
  });

  const { mutate: mutateRevision, isPending: isRevisionPending } = useMutation({
    mutationFn: (data: RevisionFile) => {
      const formData = new FormData();
      formData.append("file", data.file as File);
      formData.append("customerId", data.customerId as string);
      formData.append("preview", "1");
      return axiosInstance<RevisionPreviewData>({
        method: "POST",
        data: formData,
        url: deliveryEndpoint.revision,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      const data = response.data;

      // Check if response has errors (delivery not found)
      if (data.details && data.details.length === 0) {
        // Show error alert for deliveries not found
        toast.error(
          `Tidak ada adjustmen delivery yang ditemukan pada file yang diupload`,
          {
            duration: 5000,
            description: `Silahkan cek file terlebih dahulu`,
          }
        );
        return;
      }

      // Check if response has preview details
      if (data.preview && data.details && data.details.length > 0) {
        // Show preview modal
        setRevisionPreviewData(data);
        setCurrentRevisionFile(revisionFile || null);
        setShowRevisionPreview(true);
        setRevisionDialogOpen(false);
        setRevisionFile(undefined);
        return;
      }

      // No preview, just success message
      toast.success(data?.message ?? GENERAL_SUCCESS_TEXT);
      setRevisionDialogOpen(false);
      setRevisionFile(undefined);

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
            (queryKey[0] === deliveryEndpoint.root ||
              queryKey[0] === "delivery")
          );
        },
      });

      // Refetch delivery data to get fresh data
      queryClient.invalidateQueries({
        queryKey: ["delivery"],
      });

      // Call the onRevisionSuccess callback if provided
      onRevisionSuccess?.();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? GENERAL_ERROR_TEXT);
    },
  });

  if (!title) return null;
  return (
    <>
      <div className="flex items-center justify-between space-y-">
        <div className="flex flex-col items-start gap-2">
          <h2 className="lg:text-xl text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle ? <p>{subtitle}</p> : null}
          {showCustomerFilter && (
            <Select
              value={selectedCustomer}
              onValueChange={(item) => {
                dataTableStore.setSelectedCustomer(item);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={
                    customerDataLoading ? "Loading..." : "Choose customer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Customer</SelectLabel>
                  {customerData?.result?.map((item: Customer) => {
                    const customerId = item.id as string;
                    return (
                      <SelectItem key={item.id} value={customerId}>
                        {item.alias}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* <Button
            variant="outline"
            onClick={addAction}
            className="ml-auto flex bg-primary text-white hover:bg-foreground hover:text-white"
          >
            <CalendarIcon className="h-4 w-4" />
            {dayjs().format("DD MMM YYYY")}
          </Button> */}
          {showCalendarFilter && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4" />
                  {date?.from || date?.to
                    ? showSelectedDate(date)
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="range"
                  selected={date}
                  numberOfMonths={2}
                  // locale={dayPickerLocale}
                  captionLayout="dropdown"
                  weekStartsOn={1}
                  showWeekNumber={true}
                  onSelect={(date) => {
                    setDate(date);
                  }}
                  footer={
                    <div className="w-full pt-3 flex justify-center">
                      <Button onClick={() => setOpen(false)}>Close</Button>
                    </div>
                  }
                />
              </PopoverContent>
            </Popover>
          )}
          {importAction && canImport && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={addAction}
                  disabled={!selectedCustomer}
                  className="ml-auto flex bg-primary text-white hover:bg-foreground hover:text-white"
                >
                  <FileTextIcon className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import file</DialogTitle>
                  <DialogDescription>Silahkan pilih file txt dan tahun delivery</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col justify-center items-center gap-4">
                  <div className="grid w-full max-w-sm items-center gap-3">
                    <Input
                      type="text"
                      placeholder="Delivery Year (e.g., 2025)"
                      value={deliveryYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setDeliveryYear(value);
                      }}
                    />
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Input
                        type="file"
                        onChange={(e) => {
                          console.log("file", e.target.files);
                          const file = e.target.files?.[0];
                          if (file) {
                            setTxtFile(file);
                          }
                        }}
                      />
                    </div>
                    <Button
                      disabled={isPending || !txtFile || !deliveryYear}
                      className="bg-primary hover:bg-foreground"
                      onClick={() => {
                        if (!txtFile) {
                          return toast.error("Please select a file to import");
                        }
                        if (!deliveryYear) {
                          return toast.error("Please enter delivery year");
                        }
                        if (deliveryYear.length !== 4) {
                          return toast.error("Please enter a valid 4-digit year");
                        }
                        mutate({ file: txtFile, customerId: selectedCustomer, deliveryYear });
                      }}
                    >
                      {isPending ? (
                        <>
                          <Loader2Icon className="h-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileTextIcon className="h-4" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {revisionAction && canImport && (
            <Dialog
              open={revisionDialogOpen}
              onOpenChange={setRevisionDialogOpen}
            >
              <DialogTrigger
                asChild
              >
                <Button
                  variant="outline"
                  onClick={revisionAction}
                  disabled={!selectedCustomer}
                  className="ml-auto flex bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  Revision
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Revision Delivery</DialogTitle>
                  <DialogDescription>
                    Silahkan pilih file Excel untuk revisi data delivery
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col justify-center items-center gap-4">
                  <div className="flex justify-center items-center gap-2">
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          console.log("file", e.target.files);
                          const file = e.target.files?.[0];
                          if (file) {
                            setRevisionFile(file);
                          }
                        }}
                      />
                    </div>
                    <Button
                      disabled={isRevisionPending || !revisionFile}
                      className="bg-primary hover:bg-foreground"
                      onClick={() => {
                        if (!revisionFile) {
                          return toast.error("Please select a file to import");
                        }
                        mutateRevision({
                          file: revisionFile,
                          customerId: selectedCustomer,
                        });
                      }}
                    >
                      {isRevisionPending ? (
                        <>
                          <Loader2Icon className="h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <RefreshCwIcon className="h-4" />
                          Upload Revision
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {exportRawAction && canImport && (
            <Button
              variant="outline"
              onClick={exportRawAction}
              className="ml-auto flex bg-green-600 text-white hover:bg-green-700 hover:text-white"
            >
              <Download className="h-4 w-4" />
              Export Raw
            </Button>
          )}
          {addAction && canAdd && (
            <Button
              variant="outline"
              onClick={addAction}
              className="ml-auto flex bg-primary text-white hover:bg-foreground hover:text-white"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </div>

      <Separator className="mt-0" />

      {/* Revision Preview Modal */}
      {showRevisionPreview && revisionPreviewData && currentRevisionFile && selectedCustomer && (
        <RevisionPreviewModal
          isOpen={showRevisionPreview}
          onClose={() => {
            setShowRevisionPreview(false);
            setRevisionPreviewData(null);
            setCurrentRevisionFile(null);
          }}
          onSuccess={() => {
            setShowRevisionPreview(false);
            setRevisionPreviewData(null);
            setCurrentRevisionFile(null);
            onRevisionSuccess?.();
          }}
          file={currentRevisionFile}
          customerId={selectedCustomer}
          previewData={revisionPreviewData}
        />
      )}
    </>
  );
}
