import { z } from "zod";

export const partsFormSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  no: z.string().min(1, "Part number is required"),
  colorCode: z.string(),
  labelColor: z.string(),
  customerId: z.string().min(1, "Customer is required"),
  model: z.string(),
  qtyPerPack: z.number(),
  indication: z.string(),
  leftHand: z.boolean(),
  rightHand: z.boolean(),
});

export type PartsForm = z.infer<typeof partsFormSchema>;
