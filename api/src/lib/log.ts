import { eq } from "drizzle-orm";
import { db } from "./db";
import { scanLogs, customers } from "./schema";

type ScanLog = {
  customerId: string;
  partNumber: string | null;
  partName: string | null;
  deliveryYear: string | null;
  deliveryId: string | null;
  lot: string;
  scanBy: string;
  scanType: "preparation" | "delivery";
  kasaiBarcode: string | null;
  customerBarcode: string | null;
  scanStatus: "match" | "missmatch" | "double scan" | "not found" | null;
};

export async function createScanLog(data: ScanLog) {
  try {
    const customerResult = await db
      .select()
      .from(customers)
      .where(eq(customers.id, scanLogs.customerId))
      .limit(1);

    const customer = customerResult[0];

    if (!customer) {
      return false;
    }
    // Create scan log
    const [scanLog] = await db
      .insert(scanLogs)
      .values({ ...data, customer: customer.name })
      .returning();
    return true;
  } catch (error) {
    return false;
  }
}
