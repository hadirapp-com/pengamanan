import { useEffect, useMemo } from "react";
import { useQueryService } from "@/lib/react-query";
import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";
import { useDataTableStore } from "@/store/data-table";
import { useParams } from "react-router";
import { format } from "date-fns";

import { customerEndpoint } from "@/config/endpoints";
import { scanLogsEndpoint } from "@/config/endpoints";
import { useLogsColumns } from "@/pages/logs/logs-columns";
import { transformScanLogFromApi, type ScanLog } from "@/pages/logs/logs-schema";

export default function LogsTable() {
  const params = useParams();
  const customer = params?.customer || null;
  const dataTableStore = useDataTableStore();
  const {
    dateRange,
    resetDataTable,
    page,
    perPage,
    setSelectedCustomer,
    setDateRange,
  } = useDataTableStore();

  const columns = useLogsColumns();

  // Extract date values as strings for consistent query key
  const dateFrom = dateRange.from ? format(dateRange.from as Date, 'yyyy-MM-dd') : undefined;
  const dateTo = dateRange.to ? format(dateRange.to as Date, 'yyyy-MM-dd') : undefined;

  // Build query parameters for API
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      perPage,
    };

    // Add customer filter if selected
    if (customer && dataTableStore.selectedCustomer) {
      params.customerId = dataTableStore.selectedCustomer;
    }

    // Add date range filters
    if (dateFrom) {
      params.createdDateFrom = dateFrom;
    }

    if (dateTo) {
      params.createdDateTo = dateTo;
    }

    return params;
  }, [page, perPage, customer, dataTableStore.selectedCustomer, dateFrom, dateTo]);

  // Fetch scan logs from API
  const { data, isLoading } = useQueryService(
    scanLogsEndpoint.root,
    queryParams,
    {
      queryKey: ["scan-logs", queryParams, dateFrom, dateTo],
      enabled: true, // Always enabled
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

  // Transform API data to frontend format
  const transformedData = useMemo(() => {
    if (!data?.result) return [];

    return data.result.map((apiLog: any) => transformScanLogFromApi(apiLog));
  }, [data]);

  // Filter by customer alias from URL (client-side filter for backward compatibility)
  const filteredData = useMemo(() => {
    if (!transformedData) return [];

    // If customer is specified in URL and customerData is available, filter by customer
    if (customer && customerData?.result) {
      const customerInfo = customerData.result.find(
        (c: { alias?: string; id: string }) => c?.alias === customer
      );
      if (customerInfo) {
        return transformedData.filter((log: ScanLog) => log.customerId === customerInfo.id);
      }
    }

    return transformedData;
  }, [transformedData, customer, customerData]);

  // Handle pagination response
  const paginationData = useMemo(() => {
    if (!data?.pagination) return { totalPages: 0, totalItems: 0 };

    return {
      totalPages: data.pagination.totalPages || 0,
      totalItems: data.pagination.total || 0,
    };
  }, [data]);

  // Set selected customer from URL - moved to useEffect to prevent setState during render
  useEffect(() => {
    if (customer && customerData?.result) {
      const customerInfo = customerData.result.find(
        (c: { alias?: string; id: string }) => c?.alias === customer
      );
      if (customerInfo && customerInfo.id !== dataTableStore.selectedCustomer) {
        setSelectedCustomer(customerInfo.id);
      }
    }
  }, [customer, customerData, dataTableStore.selectedCustomer, setSelectedCustomer]);

  useEffect(() => {
    return () => {
      resetDataTable();
    };
  }, [resetDataTable]);

  // Set default date range to today
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
      const today = new Date();
      setDateRange({ from: today, to: today });
    }
  }, [dateRange, setDateRange]);

  return (
    <UiContainer>
      <DataTableHeader
        title="Scanner Logs"
        subtitle={customer ? `Customer: ${customer}` : ""}
        showCustomerFilter={false}
        onImportSuccess={() => {}}
      />
      <DataTable
        data={filteredData || []}
        pageCount={paginationData.totalPages}
        totalItems={paginationData.totalItems}
        columns={columns}
        isLoading={isLoading}
        showToolbar={true}
        showDateRange={true}
        showHeaderFilters={true}
        defaultColumnVisibility={{
          customer: true,
          lot: true,
          orderNo: true,
          slipNumber: true,
          seqProd: true,
          partNumber: true,
          partName: true,
          colorCode: true,
          deliveryYear: true,
          expectedLabel: true,
          scannedLabel: true,
          isMatch: true,
          scanType: true,
          scannedByName: true,
          createdAt: true,
        }}
      />
    </UiContainer>
  );
}
