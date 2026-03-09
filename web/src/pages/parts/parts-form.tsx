import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { axiosInstance } from "@/lib/api";
import { useQueryService } from "@/lib/react-query";
import {
  extractValidationErrors,
  handleValidationErrors,
} from "@/lib/error-handler";

import Formheader from "@/components/ui/forms/form-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UiContainer from "@/components/ui/layout/ui-container";
import { toast } from "sonner";
import { GENERAL_ERROR_TEXT, GENERAL_SUCCESS_TEXT } from "@/config/constants";
import { partsEndpoint, customerEndpoint } from "@/config/endpoints";
import type { PartsForm } from "@/pages/parts/parts-schema";
import { partsFormSchema } from "@/pages/parts/parts-schema";
import { hasparamsId } from "@/lib/utils";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

type LabelColorsResponse = {
  result: string[];
  count: number;
};

const PartsFormInput = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { hasId, id } = hasparamsId(params);

  // State for label color combobox
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<PartsForm>({
    defaultValues: {
      name: "",
      no: "",
      colorCode: "",
      labelColor: "White",
      customerId: "",
      model: "",
      qtyPerPack: 1,
      indication: "",
      leftHand: false,
      rightHand: false,
    },
    resolver: zodResolver(partsFormSchema),
  });

  const { handleSubmit, control, reset, setValue, setError } = form;

  let url = `${partsEndpoint.root}`;
  let method = "POST";
  if (id) {
    url = `${url}/${id}`;
    method = "PUT";
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (
      data: Omit<PartsForm, "qtyPerPack"> & { qtyPerPack: number },
    ) => axiosInstance<{ message: string }>({ method, data, url }),
    onSuccess: (response) => {
      toast.success(response?.data.message ?? GENERAL_SUCCESS_TEXT);
      reset();
      navigate(-1);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // Check if it's a validation error
      const validationErrors = extractValidationErrors(error.response?.data);

      if (validationErrors) {
        // Handle validation errors by setting them on the form
        handleValidationErrors(validationErrors, setError);
        toast.error("Please fix the validation errors below");
      } else {
        // Handle general errors
        toast.error(error.response?.data.message ?? GENERAL_ERROR_TEXT);
      }
    },
  });

  const onSubmit: SubmitHandler<PartsForm> = (data) => {
    // Convert qtyPerPack to number for API
    const apiData = {
      ...data,
      qtyPerPack: data.qtyPerPack || 1,
    };
    mutate(apiData);
  };

  const { data } = useQueryService(
    url,
    {},
    { enabled: hasId, queryKey: ["parts", id] },
  );

  // Fetch customers for dropdown
  const { data: customersData } = useQueryService(
    customerEndpoint.root,
    { limit: 1000 },
    { queryKey: ["customers"] },
  );

  // Fetch label colors from API
  const { data: labelColorsData } = useQuery({
    queryKey: ["label-colors"],
    queryFn: async () => {
      const response = await axiosInstance.get<LabelColorsResponse>(
        partsEndpoint.labelColors,
      );
      return response.data;
    },
  });

  // Get unique label colors from API or use default options
  const labelColorOptions = labelColorsData?.result || [];

  // Filter colors based on search term
  const filteredColors = labelColorOptions.filter((color: string) =>
    color.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (data?.result?.id) {
      const {
        name,
        no,
        colorCode,
        labelColor,
        customerId,
        model,
        qtyPerPack,
        indication,
        leftHand,
        rightHand,
      } = data.result;
      setValue("name", name);
      setValue("no", no);
      setValue("colorCode", colorCode);
      setValue("labelColor", labelColor);
      setValue("model", model);
      setValue("qtyPerPack", qtyPerPack);
      setValue("indication", indication);
      setValue("leftHand", leftHand);
      setValue("rightHand", rightHand);

      // Set customerId only if the customer options are loaded
      // This ensures the Select component can find the matching option
      if (customersData?.result && customerId) {
        setValue("customerId", customerId);
      }
    }
  }, [data, setValue, customersData?.result]);

  return (
    <UiContainer>
      <Formheader
        title={hasId ? "Edit Label" : "Create Label"}
        subtitle={hasId ? "Edit label information" : "Add new label"}
        backAction={() => navigate("/app/parts")}
      />
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter part name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter part number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="colorCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter color code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="labelColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Color</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value || "Select label color"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <div className="max-h-60 overflow-auto p-1">
                        <Input
                          placeholder="Search color..."
                          className="mb-2"
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {searchTerm && filteredColors.length === 0 && (
                          <Button
                          variant="ghost"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            setValue("labelColor", searchTerm);
                          }}
                          disabled={!searchTerm.trim()}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add "{searchTerm}"
                        </Button>
                        )}
                        <div className="space-y-1">
                          {filteredColors.map((color: string) => (
                            <Button
                              key={color}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                setValue("labelColor", color);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  color === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {color}
                            </Button>
                          ))}
                          {filteredColors.length === 0 && searchTerm && (
                            <div className="pb-3 text-center text-sm text-muted-foreground">
                              Add {searchTerm} color.
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="customerId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customersData?.result?.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="qtyPerPack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Per Pack</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter quantity per pack"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="indication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indication</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter indication" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="leftHand"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Left Hand</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable if this part is for left hand
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // If left hand is enabled, disable right hand
                        if (checked) {
                          setValue("rightHand", false);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="rightHand"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Right Hand</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable if this part is for right hand
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // If right hand is enabled, disable left hand
                        if (checked) {
                          setValue("leftHand", false);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : hasId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </UiContainer>
  );
};

export default PartsFormInput;
