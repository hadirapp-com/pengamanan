import { z } from "zod";

// API Response Schema from backend
export const scanLogApiSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customer: z.string(),
  deliveryId: z.string().nullable(),
  partNumber: z.string(),
  partName: z.string(),
  colorCode: z.string(),
  lot: z.string(),
  deliveryYear: z.string(),
  scanBy: z.string(),
  scanType: z.enum(["preparation", "delivery"]),
  kasaiBarcode: z.string(),
  customerBarcode: z.string(),
  scanStatus: z.enum(["match", "missmatch"]),
  createdAt: z.string(),
  // Delivery fields (from join)
  orderNo: z.string().nullable(),
  slipNumber: z.string().nullable(),
  seqProd: z.string().nullable(),
  // User fields (from join)
  scannedByName: z.string().nullable(),
  scannedByUsername: z.string().nullable(),
});

// Frontend Display Schema - transforms API response to display format
export const scanLogSchema = z.object({
  id: z.string(),
  customerId: z.string().optional(),
  deliveryId: z.string().optional(),
  customer: z.object({
    id: z.string(),
    name: z.string().nullable(),
    alias: z.string().nullable(),
  }),
  orderNo: z.string().nullable(),
  slipNumber: z.string().nullable(),
  seqProd: z.string().nullable(),
  partNumber: z.string().nullable(),
  partName: z.string().nullable(),
  colorCode: z.string().nullable(),
  lot: z.string().nullable(),
  deliveryYear: z.string().nullable(),
  // Our label (expected label) - maps to kasaiBarcode from API
  expectedLabel: z.string().nullable(),
  // Customer label (scanned label) - maps to customerBarcode from API
  scannedLabel: z.string().nullable(),
  // Match status - maps to scanStatus from API
  isMatch: z.boolean(),
  // Scan info - scanType from API is different enum
  scanType: z.enum(["scan1", "scan2", "preparation", "delivery"]),
  scannedBy: z.string().nullable(),
  scannedByName: z.string().nullable(),
  scannedAt: z.string().nullable(),
  // Error message if not matched
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type ScanLog = z.infer<typeof scanLogSchema>;
export type ScanLogApi = z.infer<typeof scanLogApiSchema>;

// Transform function to convert API response to Frontend format
export function transformScanLogFromApi(apiLog: ScanLogApi): ScanLog {
  return {
    id: apiLog.id,
    customerId: apiLog.customerId,
    deliveryId: apiLog.deliveryId || undefined,
    customer: {
      id: apiLog.customerId,
      name: apiLog.customer,
      alias: apiLog.customer, // API only provides customer name
    },
    orderNo: apiLog.orderNo, // Now available from delivery join
    slipNumber: apiLog.slipNumber, // Now available from delivery join
    seqProd: apiLog.seqProd, // Now available from delivery join
    partNumber: apiLog.partNumber,
    partName: apiLog.partName,
    colorCode: apiLog.colorCode,
    lot: apiLog.lot,
    deliveryYear: apiLog.deliveryYear,
    expectedLabel: apiLog.kasaiBarcode,
    scannedLabel: apiLog.customerBarcode,
    isMatch: apiLog.scanStatus === "match",
    scanType: apiLog.scanType, // Keep original API value
    scannedBy: apiLog.scanBy,
    scannedByName: apiLog.scannedByName || apiLog.scannedByUsername || null, // Now available from user join
    scannedAt: apiLog.createdAt,
    errorMessage: apiLog.scanStatus === "missmatch" ? "Labels do not match" : null,
    createdAt: apiLog.createdAt,
    updatedAt: null,
  };
}
