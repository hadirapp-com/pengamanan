import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { DataTable } from "@/components/ui/table/data-table";
import DataTableHeader from "@/components/ui/table/data-table-header";
import UiContainer from "@/components/ui/layout/ui-container";
import { useDataTableStore } from "@/store/data-table";
import { useQueryService } from "@/lib/react-query";
import { useConfigColumns } from "./config-columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiTagInput } from "@/components/ui/multi-tag-input";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRolePermissions } from "@/lib/role-permissions";
import { parseConfigValue } from "./config-schema";
import type { Config } from "./config-schema";

export default function ConfigTable() {
  const {
    globalFilter,
    resetDataTable,
    page,
    perPage,
    setDeleteConfirmationData,
  } = useDataTableStore();

  const [debouncedGlobalFilter] = useDebounce(globalFilter, 500);
  const { canAdd } = useRolePermissions();
  const queryClient = useQueryClient();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [isValueArray, setIsValueArray] = useState(false);
  const [isObjectArray, setIsObjectArray] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    arrayValue: [] as string[],
    description: "",
  });

  // Handle edit click
  const handleEditClick = (config: Config) => {
    setEditingConfig(config);
    const isArray = Array.isArray(config.value);
    setIsValueArray(isArray);

    // Check if array contains objects or strings
    const isObjectArr = isArray && config.value.length > 0 && typeof config.value[0] === "object";
    setIsObjectArray(isObjectArr);

    setFormData({
      key: config.key,
      value: isArray
        ? isObjectArr
          ? JSON.stringify(config.value, null, 2) // Show formatted JSON for object arrays
          : "" // Don't populate textarea for string arrays
        : typeof config.value === "object"
          ? JSON.stringify(config.value, null, 2)
          : String(config.value),
      arrayValue: isArray && !isObjectArr ? config.value.map(String) : [],
      description: config.description || "",
    });
    setDialogOpen(true);
  };

  // Get columns with edit handler
  const columns = useConfigColumns({
    onEdit: handleEditClick,
  });

  const query = {
    search: debouncedGlobalFilter,
    page,
    perPage,
  };

  const queryKey = [
    "config",
    debouncedGlobalFilter,
    page,
    perPage,
  ];

  const { data, isLoading, refetch } = useQueryService(
    "/configs",
    query,
    {
      queryKey,
    }
  );

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // For object arrays, parse JSON from textarea
      // For string arrays, use arrayValue
      // For other values, parse the textarea value
      let valueToUse;
      if (isObjectArray) {
        valueToUse = parseConfigValue(data.value);
      } else if (isValueArray) {
        valueToUse = data.arrayValue;
      } else {
        valueToUse = parseConfigValue(data.value);
      }

      const payload = {
        key: data.key,
        value: valueToUse,
        description: data.description || null,
      };

      if (editingConfig) {
        return axiosInstance.put(`/configs/${editingConfig.key}`, payload);
      } else {
        return axiosInstance.post("/configs", payload);
      }
    },
    onSuccess: () => {
      toast.success(
        editingConfig
          ? "Config updated successfully"
          : "Config created successfully"
      );
      setDialogOpen(false);
      setEditingConfig(null);
      setIsValueArray(false);
      setIsObjectArray(false);
      setFormData({ key: "", value: "", arrayValue: [], description: "" });

      queryClient.invalidateQueries({
        queryKey: ["config"],
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : "An error occurred";
      toast.error(errorMessage);
    },
  });

  const handleAddClick = () => {
    setEditingConfig(null);
    setIsValueArray(false);
    setIsObjectArray(false);
    setFormData({ key: "", value: "", arrayValue: [], description: "" });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.key.trim()) {
      return toast.error("Key is required");
    }

    // Validate based on type
    if (isObjectArray) {
      // Object arrays use textarea (JSON)
      if (!formData.value.trim()) {
        return toast.error("Value is required");
      }
      // Validate JSON format
      try {
        const parsed = JSON.parse(formData.value);
        if (!Array.isArray(parsed)) {
          return toast.error("Value must be an array");
        }
      } catch {
        return toast.error("Invalid JSON format");
      }
    } else if (isValueArray) {
      // String arrays use tag input
      if (formData.arrayValue.length === 0) {
        return toast.error("At least one tag is required");
      }
    } else {
      // Single values use textarea
      if (!formData.value.trim()) {
        return toast.error("Value is required");
      }
    }

    mutation.mutate(formData);
  };

  useEffect(() => {
    setDeleteConfirmationData({ endpoint: "/configs", refetch });
    return () => {
      resetDataTable();
    };
  }, [refetch, setDeleteConfirmationData, resetDataTable]);

  return (
    <UiContainer>
      <DataTableHeader
        title="Configurations"
        subtitle="Manage application configurations"
        showCustomerFilter={false}
        importAction={undefined}
        onImportSuccess={() => {}}
        revisionAction={undefined}
        onRevisionSuccess={() => {}}
        addAction={canAdd ? handleAddClick : undefined}
      />

      <DataTable
        data={data?.result || []}
        pageCount={data?.pagination?.totalPages || 0}
        totalItems={data?.pagination?.total}
        columns={columns}
        isLoading={isLoading}
        showToolbar={true}
        showDateRange={false}
        showHeaderFilters={true}
        showSearchColumn={false}
        defaultColumnVisibility={{
          key: true,
          value: true,
          description: true,
          updatedAt: true,
        }}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edit Config" : "Create Config"}
            </DialogTitle>
            <DialogDescription>
              {editingConfig
                ? "Update configuration value and description"
                : "Add a new configuration key-value pair"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  disabled={!!editingConfig}
                  placeholder="e.g., max_scan_time"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this configuration
                </p>
              </div>

              {/* Value Type Toggle */}
              {editingConfig ? (
                <div className="grid gap-2">
                  <Label>Value Type</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isObjectArray ? (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium">
                          JSON
                        </span>
                        <span>- Editing as JSON</span>
                      </>
                    ) : isValueArray ? (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium">
                          Tags
                        </span>
                        <span>- Editing as tags</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                          Single Value
                        </span>
                        <span>- Editing as text/JSON</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>Value Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="valueType"
                        checked={!isValueArray}
                        onChange={() => {
                          setIsValueArray(false);
                          setIsObjectArray(false);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Single Value</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="valueType"
                        checked={isValueArray}
                        onChange={() => setIsValueArray(true)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Array (Tags)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Value Input - Conditional based on type */}
              {isValueArray && !isObjectArray ? (
                <div className="grid gap-2">
                  <Label>Array Values *</Label>
                  <MultiTagInput
                    value={formData.arrayValue}
                    onChange={(tags) =>
                      setFormData({ ...formData, arrayValue: tags })
                    }
                    placeholder="Type and press Enter to add a tag..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Press Enter to add each tag. Click X to remove.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="value">
                    {isObjectArray ? "Array Values (JSON) *" : "Value *"}
                  </Label>
                  <Textarea
                    id="value"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder={
                      isObjectArray
                        ? '[{"title": "...", "link": "...", "fileType": "..."}]'
                        : '{"max": 100} or simple text'
                    }
                    rows={isObjectArray ? 10 : 6}
                    className="font-mono text-xs"
                    required={!isObjectArray}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isObjectArray
                      ? "Enter array of objects in JSON format"
                      : "Enter value (JSON, number, string, or boolean)"}
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this configuration"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingConfig(null);
                  setIsValueArray(false);
                  setIsObjectArray(false);
                  setFormData({ key: "", value: "", arrayValue: [], description: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : editingConfig ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </UiContainer>
  );
}
