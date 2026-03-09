/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import {
  CheckCircle2Icon,
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { axiosInstance } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { useDataTableStore } from "@/store/data-table";

import {
  ERROR_UPDATE_DELETE_REFERENCE,
  GENERAL_ERROR_TEXT,
  GENERAL_SUCCESS_TEXT,
} from "@/config/constants";
import { cn } from "@/lib/utils";

import type { FastifyGeneralError } from "@/types/error";

interface DataTableRowActionsProps<TData> {
  tableName?: string;
  row: Row<TData>;
  disableDelete?: boolean;
  disableEdit?: boolean;
  enableReject?: boolean;
  enableApprove?: boolean;
  enableView?: boolean;
  deleteDisabledReason?: string;
  editDisabledReason?: string;
}

export function DataTableRowActions<TData>({
  // tableName = "",
  row,
  disableDelete = false,
  disableEdit = false,
  enableReject = false,
  enableView = false,
  enableApprove = false,
  deleteDisabledReason,
  editDisabledReason,
}: DataTableRowActionsProps<TData>) {
  const navigate = useNavigate();
  const { deleteConfirmationData, setDetailData } = useDataTableStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("delete");
  const { mutate, isPending } = useMutation({
    mutationFn: (data: string) =>
      axiosInstance.delete<{ message: string }>(data),
    onSuccess: (response) => {
      setDialogOpen(false);
      deleteConfirmationData?.refetch();
      toast.success(response?.data.message ?? GENERAL_SUCCESS_TEXT);
    },
    onError: (error: AxiosError<FastifyGeneralError>) => {
      toast.error(error.response?.data.message ?? GENERAL_ERROR_TEXT);
      if (error.response?.data.code == ERROR_UPDATE_DELETE_REFERENCE) {
        setDialogOpen(false);
      }
    },
  });
  // @ts-ignore
  const rowId = row.original?.id;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {!disableEdit ? (
            <DropdownMenuItem
              className="flex justify-between items-center"
              onClick={() => {
                navigate(rowId);
              }}
            >
              Edit
              <PencilIcon className="h-3 w-3 stroke-primary" />
            </DropdownMenuItem>
          ) : editDisabledReason ? (
            <DropdownMenuItem 
              className="flex justify-between items-center text-muted-foreground cursor-not-allowed"
              disabled
              title={editDisabledReason}
            >
              Edit
              <PencilIcon className="h-3 w-3 stroke-muted-foreground" />
            </DropdownMenuItem>
          ) : null}

          {!disableDelete ? (
            <>
              {!disableEdit && <DropdownMenuSeparator />}
              <DialogTrigger
                onClick={() => {
                  setDialogOpen(true);
                  setDialogType("delete");
                }}
                asChild
              >
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Hapus</span>
                  <TrashIcon className="h-3 w-3 stroke-destructive" />
                </DropdownMenuItem>
              </DialogTrigger>
            </>
          ) : deleteDisabledReason ? (
            <>
              {!disableEdit && <DropdownMenuSeparator />}
              <DropdownMenuItem 
                className="flex justify-between items-center text-muted-foreground cursor-not-allowed"
                disabled
                title={deleteDisabledReason}
              >
                <span>Hapus</span>
                <TrashIcon className="h-3 w-3 stroke-muted-foreground" />
              </DropdownMenuItem>
            </>
          ) : null}

          {enableView && (
            <>
              {/* {!disableEdit && <DropdownMenuSeparator />} */}
              <DialogTrigger
                onClick={() => {
                  setDetailData(row.original);
                  setDialogType("");
                  navigate(rowId);
                }}
                asChild
              >
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Lihat</span>
                  <EyeIcon className="h-3 w-3 stroke-blue-500" />
                </DropdownMenuItem>
              </DialogTrigger>
            </>
          )}

          {enableApprove && (
            <>
              {/* {!disableEdit && <DropdownMenuSeparator />} */}
              <DialogTrigger
                onClick={() => {
                  setDialogOpen(true);
                  setDialogType("approve");
                }}
                asChild
              >
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Setujui</span>
                  <CheckCircle2Icon className="h-3 w-3 stroke-green-500" />
                </DropdownMenuItem>
              </DialogTrigger>
            </>
          )}

          {enableReject && (
            <>
              {/* {!disableEdit && <DropdownMenuSeparator />} */}
              <DialogTrigger
                onClick={() => {
                  setDialogOpen(true);
                  setDialogType("reject");
                }}
                asChild
              >
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Tolak</span>
                  <XCircleIcon className="h-3 w-3 stroke-destructive" />
                </DropdownMenuItem>
              </DialogTrigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogType === "delete" && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus data</DialogTitle>
            <DialogDescription>
              Apakah anda yakin akan menghapus data ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center items-center">
            <Button
              disabled={isPending}
              className="bg-destructive hover:bg-foreground"
              onClick={() => {
                mutate(`${deleteConfirmationData?.endpoint}/${rowId}`);
              }}
            >
              <p
                className={cn({
                  hidden: isPending,
                })}
              >
                Konfirmasi
              </p>
              <p
                className={cn("hidden", {
                  "flex items-center gap-1": isPending,
                })}
              >
                <Loader2Icon className="h-4 2-4 animate-spin" />
                Loading
              </p>
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {dialogType === "approve" && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui data</DialogTitle>
            <DialogDescription>
              Apakah anda yakin akan menyetujui data ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center items-center">
            <Button
              disabled={isPending}
              className="bg-primary hover:bg-foreground"
              onClick={() => {
                mutate(`${deleteConfirmationData?.endpoint}/${rowId}`);
              }}
            >
              <p
                className={cn({
                  hidden: isPending,
                })}
              >
                Konfirmasi
              </p>
              <p
                className={cn("hidden", {
                  "flex items-center gap-1": isPending,
                })}
              >
                <Loader2Icon className="h-4 2-4 animate-spin" />
                Loading
              </p>
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {dialogType === "reject" && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak data</DialogTitle>
            <DialogDescription>
              Apakah anda yakin akan menolak data ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center items-center">
            <Button
              disabled={isPending}
              className="bg-destructive hover:bg-foreground"
              onClick={() => {
                mutate(`${deleteConfirmationData?.endpoint}/${rowId}`);
              }}
            >
              <p
                className={cn({
                  hidden: isPending,
                })}
              >
                Konfirmasi
              </p>
              <p
                className={cn("hidden", {
                  "flex items-center gap-1": isPending,
                })}
              >
                <Loader2Icon className="h-4 2-4 animate-spin" />
                Loading
              </p>
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
