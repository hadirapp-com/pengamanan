import { useEffect } from "react";
import { useDebounce } from "use-debounce";

import { useQueryService } from "@/lib/react-query";

import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";

// import { useAuthStore } from "@/store/auth";
import { useDataTableStore } from "@/store/data-table";

import { customerEndpoint } from "@/config/endpoints";
import { useCustomerColumns } from "@/pages/customer/customer-columns";

export default function StudentTable() {
  // const { getProfile } = useAuthStore();
  // const profile = getProfile();
  const {
    globalFilter,
    resetDataTable,
    page,
    perPage,
    setDeleteConfirmationData,
  } = useDataTableStore();
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);
  const columns = useCustomerColumns();
  const query = {
    search: debouncedGlobalFilter,
    page,
    perPage,
    sortCol: "name",
    sortDir: "asc",
  };
  const endpoint = customerEndpoint.root;
  const { data, isLoading, refetch } = useQueryService(endpoint, query);

  useEffect(() => {
    setDeleteConfirmationData({ endpoint, refetch });
    return () => {
      resetDataTable();
    };
  }, []);

  return (
    <UiContainer>
      <DataTableHeader
        title="Customer"
        // subtitle="Customer data"
      />
      <DataTable
        data={data?.result || []}
        pageCount={data?.pagination?.totalPages || 0}
        totalItems={data?.pagination?.total}
        columns={columns}
        isLoading={isLoading}
        showHeaderFilters={true}
      />
    </UiContainer>
  );
}
