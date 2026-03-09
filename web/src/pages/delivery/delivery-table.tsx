import { useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useQueryService } from "@/lib/react-query";
import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";
import { useDataTableStore } from "@/store/data-table";
import { useParams } from "react-router";
import { format } from "date-fns";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api";

import { customerEndpoint, deliveryEndpoint } from "@/config/endpoints";
import { useDeliveryColumns } from "@/pages/delivery/delivery-columns";

export default function DeliveryTable() {
  const params = useParams();
  const customer = params?.customer || null;
  const dataTableStore = useDataTableStore();
  const selectedCustomer = dataTableStore.getSelectedCustomer();
  const {
    globalFilter,
    dateRange,
    columnFilters,
    searchColumn,
    resetDataTable,
    page,
    perPage,
    sortCol,
    sortDir,
    setDateRange,
    setDeleteConfirmationData,
  } = useDataTableStore();

  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);

  // Create stable reference for columnFilters debouncing
  const columnFiltersString = useMemo(() => JSON.stringify(columnFilters), [columnFilters]);
  const [debouncedColumnFiltersString] = useDebounce(columnFiltersString, 500);
  const debouncedColumnFilters = useMemo(() => JSON.parse(debouncedColumnFiltersString || '[]') as Array<{column: string, value: string}>, [debouncedColumnFiltersString]);

  const columns = useDeliveryColumns();

  // Extract date values as strings for consistent query key
  const dateFrom = dateRange.from ? format(dateRange.from as Date, 'yyyy-MM-dd') : undefined;
  const dateTo = dateRange.to ? format(dateRange.to as Date, 'yyyy-MM-dd') : undefined;

  // Build query with all filters
  const query = {
    search: debouncedGlobalFilter,
    page,
    perPage,
    sortCol, // Send column name for sorting
    sortDir,
    // Add search column when search is active
    ...(debouncedGlobalFilter && { searchCol: searchColumn }),
    // Add date range filters if available
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    // Add column filters as individual query parameters
    ...debouncedColumnFilters.reduce((acc, filter) => {
      acc[`filter_${filter.column}`] = filter.value;
      return acc;
    }, {} as Record<string, string>),
    ...(selectedCustomer && { customerId: selectedCustomer })
  };

  // Create serializable query key to ensure React Query properly detects changes
  const queryKey = [
    "delivery",
    selectedCustomer,
    debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    searchColumn,
    dateFrom,
    dateTo,
    JSON.stringify(debouncedColumnFilters),
  ];

  const endpoint = deliveryEndpoint.root;
  const { data, isLoading, refetch } = useQueryService(endpoint, query, {
    enabled: Boolean(selectedCustomer),
    queryKey,
  });
  const { data: customerData, isLoading: isLoadingCustomer } = useQueryService(
    customerEndpoint.root,
    query,
    {
      queryKey: ["customers"],
    }
  );

  useEffect(() => {
    if (!customerData || isLoadingCustomer) return;
    const customerInfo = customerData.result.find(
      (c: { alias?: string; id: string }) => c?.alias === customer
    );
    if (customerInfo) {
      dataTableStore.setSelectedCustomer(customerInfo.id);
    }
  }, [customerData, isLoadingCustomer]);

  useEffect(() => {
    setDeleteConfirmationData({ endpoint, refetch });
    return () => {
      resetDataTable();
    };
  }, [endpoint, refetch, setDeleteConfirmationData, resetDataTable]);

  useEffect(() => {
    setDateRange({ from: new Date(), to: new Date() });
  }, []);

  const handleExportRaw = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first");
      return;
    }

    try {
      // Build query string from existing query parameters
      const queryParams = new URLSearchParams();

      if (debouncedGlobalFilter) {
        queryParams.append('search', debouncedGlobalFilter);
        queryParams.append('searchCol', searchColumn);
      }

      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      queryParams.append('sortCol', sortCol);
      queryParams.append('sortDir', sortDir);

      // Add column filters
      debouncedColumnFilters.forEach(filter => {
        queryParams.append(`filter_${filter.column}`, filter.value);
      });

      queryParams.append('customerId', selectedCustomer);

      const response = await axiosInstance.get(`/deliveries/export-raw?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      link.setAttribute('download', `delivery-export-raw-${timestamp}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export successful!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <UiContainer>
      <DataTableHeader
        title="Master data pokayoke"
        subtitle={customer ? `Customer: ${customer}` : ""}
        showCustomerFilter={false}
        importAction={() => {}}
        onImportSuccess={() => refetch()}
        revisionAction={() => {}}
        onRevisionSuccess={() => refetch()}
        exportRawAction={handleExportRaw}
        // showCalendarFilter={true}
      />
      <DataTable
        data={data?.result || []}
        pageCount={data?.pagination?.totalPages || 0}
        totalItems={data?.pagination?.total}
        columns={columns}
        isLoading={isLoading}
        showToolbar={true}
        showDateRange={true}
        showHeaderFilters={true}
        // showSearchColumn={true}
        defaultColumnVisibility={{
          orderNo: false,
          slipNumber: false,
          seqProd: false,
          adjustDate: true,
          adjustTime: true,
          remarksBawah: true,
          barcodeHpm: true,
          barcodeKasai: true,
          scan1ByName: true,
          scan1At: true,
          scan2ByName: true,
          scan2At: true,
          updatedBy: false,
          date: true,
          time: true,
          createdAt: false,
        }}
      />
    </UiContainer>
  );
}
