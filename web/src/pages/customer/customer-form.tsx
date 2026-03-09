import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { axiosInstance } from "@/lib/api";
import { useQueryService } from "@/lib/react-query";
import { extractValidationErrors, handleValidationErrors } from "@/lib/error-handler";

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
import UiContainer from "@/components/ui/layout/ui-container";
import { toast } from "sonner";
import { GENERAL_ERROR_TEXT, GENERAL_SUCCESS_TEXT } from "@/config/constants";
import { customerEndpoint } from "@/config/endpoints";
import type { CustomerForm } from "@/pages/customer/customer-schema";
import { customerFormSchema } from "@/pages/customer/customer-schema";
import { hasparamsId } from "@/lib/utils";

const CustomerFormInput = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { hasId, id } = hasparamsId(params);

  const form = useForm<CustomerForm>({
    defaultValues: {
      name: "",
      alias: "",
      address: "",
    },
    resolver: zodResolver(customerFormSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = form;

  let url = `${customerEndpoint.root}`;
  let method = "POST";
  if (id) {
    url = `${url}/${id}`;
    method = "PUT";
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CustomerForm) =>
      axiosInstance<{ message: string }>({ method, data, url }),
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

  const onSubmit: SubmitHandler<CustomerForm> = (data) => {
    mutate(data);
  };

  const { data } = useQueryService(
    url,
    {},
    { enabled: hasId, queryKey: ["customer", id] }
  );

  useEffect(() => {
    if (data?.result?.id) {
      console.log(data.result,'xx');
      const { id, name, alias, address } = data.result;
      setValue("id", id);
      setValue("name", name);
      setValue("alias", alias);
      setValue("address", address ?? "");
    }
  }, [data]);

  return (
    <UiContainer type="form">
      <Formheader
        title="Customer"
        backAction={() => {
          navigate(-1);
        }}
      />
      <div className="flex w-full">
        <div className="grid w-full grid-cols-1 gap-9">
          <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm bg-white">
            <div className="flex flex-col gap-2.5">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Input Name" {...field} />
                        </FormControl>
                        <FormMessage>{errors.name?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alias</FormLabel>
                        <FormControl>
                          <Input placeholder="Input Alias" {...field} />
                        </FormControl>
                        <FormMessage>{errors.alias?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Address"
                            rows={3}
                            className="resize-none border border-gray-200 p-3 rounded-lg text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button disabled={isPending}>Save</Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </UiContainer>
  );
};

export default CustomerFormInput;
