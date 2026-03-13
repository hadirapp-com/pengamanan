import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { axiosInstance } from "@/lib/api";

type TParams = {
  id?: string;
  page?: string | number;
  limit?: string | number;
  search?: string;
};

export const useQueryService = (
  endpoint: string,
  params?: TParams & { [key: string]: boolean | string | number },
  queryOptions?: UseQueryOptions,
  defaultData?: null | Array<unknown> | object
) => {
  if (!defaultData) {
    defaultData = [];
  }
  const query = useQuery({
    queryFn: () =>
      axiosInstance.get(endpoint, {
        params: { ...params },
      }),
    queryKey: [endpoint, params],
    ...queryOptions,
  });

  if (!query?.data && query?.isLoading) {
    return {
      ...query,
      data: defaultData,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      meta: undefined,
    };
  }

  if (query.isError) {
    return {
      ...query,
      data: defaultData,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      meta: undefined,
    };
  }

  return {
    ...query,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data: query.data?.data?.data,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    meta: query.data?.data?.meta,
  };
};

export const useQueryServiceExternal = (
  endpoint: string,
  params: TParams & { [key: string]: boolean | string | number },
  queryOptions?: UseQueryOptions,
  defaultData?: null | Array<unknown> | object
) => {
  if (!defaultData) {
    defaultData = [];
  }
  const query = useQuery({
    queryFn: () =>
      axios.get(endpoint, {
        params: { ...params },
      }),
    queryKey: [endpoint, params],
    ...queryOptions,
  });

  if (!query?.data && query?.isLoading) {
    return {
      ...query,
      data: defaultData,
    };
  }

  if (query.isError) {
    return {
      ...query,
      data: defaultData,
    };
  }

  return {
    ...query,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data: query.data?.data,
  };
};
