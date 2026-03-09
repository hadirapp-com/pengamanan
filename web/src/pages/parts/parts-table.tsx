import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import { Download, Upload } from "lucide-react";

import { useQueryService } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api";

import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { useDataTableStore } from "@/store/data-table";

import { partsEndpoint } from "@/config/endpoints";
import { usePartsColumns } from "@/pages/parts/parts-columns";
import { PartsPrintModal } from "@/pages/parts/parts-print-modal";
import type { Parts } from "@/pages/parts/parts-columns";

export default function PartsTable() {
  const {
    globalFilter,
    columnFilters,
    resetDataTable,
    page,
    perPage,
    sortCol,
    sortDir,
    setDeleteConfirmationData,
  } = useDataTableStore();
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);

  // Create stable reference for columnFilters debouncing
  const columnFiltersString = useMemo(() => JSON.stringify(columnFilters), [columnFilters]);
  const [debouncedColumnFiltersString] = useDebounce(columnFiltersString, 500);
  const debouncedColumnFilters = useMemo(() => JSON.parse(debouncedColumnFiltersString || '[]') as Array<{column: string, value: string}>, [debouncedColumnFiltersString]);

  const navigate = useNavigate();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Import error state
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Parts | null>(null);

  // Handle print button click
  const handlePrintClick = (part: Parts) => {
    setSelectedPart(part);
    setIsPrintModalOpen(true);
  };

  // Close print modal
  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedPart(null);
  };

  // Handle print success
  const handlePrintSuccess = (printData: any) => {
    console.log("Print successful:", printData);
    // You can add additional logic here if needed
  };

  const columns = usePartsColumns({
    onPrintClick: handlePrintClick,
    onDelete: () => refetch(),
  });

  // Build query with all filters
  const query = {
    search: debouncedGlobalFilter,
    page,
    perPage,
    sortCol,
    sortDir,
    // Add column filters as individual query parameters
    ...debouncedColumnFilters.reduce((acc, filter) => {
      acc[`filter_${filter.column}`] = filter.value;
      return acc;
    }, {} as Record<string, string>),
  };
  
  const endpoint = partsEndpoint.root;
  const { data, isLoading, refetch } = useQueryService(endpoint, query);

  useEffect(() => {
    setDeleteConfirmationData({ endpoint, refetch });
    return () => {
      resetDataTable();
    };
  }, [endpoint, refetch, setDeleteConfirmationData, resetDataTable]);

  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: partsEndpoint.template,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "parts_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: partsEndpoint.export,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "parts_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Parts exported successfully");
    } catch (error) {
      toast.error("Failed to export parts");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axiosInstance({
        method: "POST",
        url: partsEndpoint.import,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Check if there are errors in the response
      if (response.data?.results?.errors?.length > 0) {
        setImportErrors(response.data.results.errors);
        setIsErrorDialogOpen(true);
        toast.warning(response.data.message || "Import completed with errors");
      } else {
        toast.success(response.data.message || "Import completed successfully");
        setIsImportDialogOpen(false);
        setSelectedFile(null);
        refetch();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to import label";
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <UiContainer>
      <DataTableHeader
        title="Master data label"
        subtitle="Label management"
        addAction={() => {
          navigate("create");
        }}
      />
      
      {/* Import/Export Actions */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
        
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import label
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import label</DialogTitle>
              <DialogDescription>
                Upload an Excel file to import label. Please use the provided template format.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Excel File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Parts
        </Button>
      </div>

      <DataTable
        data={data?.result || []}
        pageCount={data?.pagination?.totalPages || 0}
        totalItems={data?.pagination?.total}
        columns={columns}
        isLoading={isLoading}
        showToolbar={true}
        showHeaderFilters={true}
        storageKey="parts"
      />

      {/* Print Modal */}
      <PartsPrintModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        part={selectedPart}
        onPrintSuccess={handlePrintSuccess}
      />

      {/* Import Errors Dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Errors</DialogTitle>
            <DialogDescription>
              The following errors occurred during the import process. Please fix them and try again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {importErrors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20"
                >
                  {error}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsErrorDialogOpen(false);
                setImportErrors([]);
                setIsImportDialogOpen(false);
                setSelectedFile(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UiContainer>
  );
}
