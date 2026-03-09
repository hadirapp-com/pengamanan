import { z } from "zod";

export const deliverySchema = z.object({
  id: z.string().nullable(),
  customerId: z.string().nullable(),
  orderNo: z.string().nullable(),
  file: z.string().nullable(),
  partNumberRaw: z.string().nullable(),
  partNumber: z.string().nullable(),
  partName: z.string().nullable(),
  colorCode: z.string().nullable(),
  seqProd: z.string().nullable(),
  kdLotNo: z.string().nullable(),
  qty: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  adjustDate: z.string().nullable(),
  adjustTime: z.string().nullable(),
  slipNumber: z.string().nullable(),
  remarksBawah: z.string().nullable(),
  barcodeHpm: z.string().nullable(),
  barcodeKasaiRaw: z.string().nullable(),
  barcodeKasai: z.string().nullable(),
  scanLt1By: z.string().nullable(),
  scanLt1ByName: z.string().nullable(),
  scanLt1At: z.string().nullable(),
  scanLt2By: z.string().nullable(),
  scanLt2ByName: z.string().nullable(),
  scanLt2At: z.string().nullable(),
  customer: {
    id: z.string().nullable(),
    name: z.string().nullable(),
    alias: z.string().nullable(),
  },
  updatedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const deliveryFormSchema = deliverySchema.pick({
  id: true,
  name: true,
  schoolId: true,
  gender: true,
  description: true,
  nisn: true,
  dob: true,
  predefinedEmail: true,
  registeredEmail: true,
  academicYearJoined: true,
});

export type DeliveryForm = z.infer<typeof deliveryFormSchema>;
export type Delivery = z.infer<typeof deliverySchema>;
