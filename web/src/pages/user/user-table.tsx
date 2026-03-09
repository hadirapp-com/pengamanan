import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import { useQueryService } from "@/lib/react-query";
import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";
import { useDataTableStore } from "@/store/data-table";

import { userEndpoint } from "@/config/endpoints";
import { useUserColumns } from "@/pages/user/user-columns";

export default function StudentTable() {
  const {
    globalFilter,
    resetDataTable,
    page,
    perPage,
    setDeleteConfirmationData,
  } = useDataTableStore();
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);
  const navigate = useNavigate();
  const columns = useUserColumns();
  const query = {
    search: debouncedGlobalFilter,
    page,
    perPage,
    sortCol: "fullName",
    sortDir: "asc",
  };
  const endpoint = userEndpoint.root;
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
        title="User"
        subtitle="User data"
        addAction={() => {
          navigate("create");
        }}
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
