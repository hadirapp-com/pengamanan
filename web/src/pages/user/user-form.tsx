import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect } from "react";
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
import UiContainer from "@/components/ui/layout/ui-container";
import { toast } from "sonner";
import { GENERAL_ERROR_TEXT, GENERAL_SUCCESS_TEXT } from "@/config/constants";
import { userEndpoint } from "@/config/endpoints";
import type { UserForm } from "@/pages/user/user-schema";
import { userFormSchema } from "@/pages/user/user-schema";
import { hasparamsId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserFormInput = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { hasId, id } = hasparamsId(params);

  const form = useForm<UserForm>({
    defaultValues: {
      fullName: "",
      nik: "",
      role: "preparation",
      username: "",
      password: "",
    },
    resolver: zodResolver(userFormSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = form;

  let url = `${userEndpoint.root}`;
  let method = "POST";
  if (id) {
    url = `${url}/${id}`;
    method = "PUT";
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserForm) =>
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

  const onSubmit: SubmitHandler<UserForm> = (data) => {
    // For PUT requests (editing), if password is empty, don't send it
    if (method === "PUT" && !data.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...dataWithoutPassword } = data;
      mutate(dataWithoutPassword as UserForm);
    } else {
      mutate(data);
    }
  };

  const { data } = useQueryService(
    url,
    {},
    { enabled: hasId, queryKey: ["user", id] }
  );

  useEffect(() => {
    if (data?.result?.id) {
      const { id, fullName, username, nik, role } = data.result;
      setValue("id", id);
      setValue("fullName", fullName);
      setValue("username", username);
      setValue("nik", nik);
      setValue("role", role);
    }
  }, [data]);

  return (
    <UiContainer type="form">
      <Formheader
        title="User"
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
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Input Name" {...field} />
                        </FormControl>
                        <FormMessage>{errors.fullName?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK</FormLabel>
                        <FormControl>
                          <Input placeholder="Input NIK" {...field} />
                        </FormControl>
                        <FormMessage>{errors.nik?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Input username" {...field} />
                        </FormControl>
                        <FormMessage>{errors.username?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Input Password" {...field} />
                        </FormControl>
                        <FormMessage>{errors.password?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preparation">Preparation</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="supervisor">
                              Supervisor
                            </SelectItem>
                            <SelectItem value="sales">
                              Sales
                            </SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage>{errors.role?.message}</FormMessage>
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

export default UserFormInput;
