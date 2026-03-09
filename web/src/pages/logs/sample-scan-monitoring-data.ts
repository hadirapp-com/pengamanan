/**
 * Sample scan monitoring data grouped by lot number
 * This data is based on the actual API response structure
 */

// Sample delivery data matching the API response structure
export const sampleScanMonitoringData = {
  result: [
    {
      id: "12fb681e-8e7c-4115-9963-a2027d4b2cd9",
      customerId: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
      orderNo: "1ORD00320260113160314",
      file: "HPM.1.20260113160314.WG.IFORD003.3254.txt",
      partNumberRaw: "84261-3K6 -K011-M1",
      partNumber: "842613K6-K011M1",
      partName: "GARN ASSY L,RR SIDE",
      colorCode: "NH900L",
      seqProd: "202601290090",
      kdLotNo: "HPM 08202601001201",
      qty: "6",
      date: "28-01",
      time: "11:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260510012618",
      remarksBawah: "26051001261800005000006",
      barcodeHpm: "26051001261800005000006C",
      barcodeKasaiRaw: "84261-3K6 -K011-M1 NH900L",
      barcodeKasai: "842613K6-K011M1-NH900L",
      scanLt1By: "user-123",
      scanLt1ByName: "John Doe",
      scanLt1At: "2026-01-28T11:05:00Z",
      scanLt2By: null,
      scanLt2ByName: null,
      scanLt2At: null,
      createdAt: "2026-01-25T08:32:14.707Z",
      updatedAt: "2026-01-25T08:36:01.135Z",
      customer: {
        id: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
        name: "PT Honda Prospect Motor",
        alias: "HPM"
      }
    },
    {
      id: "7fb627b2-3a35-48ce-8be4-b2265f5a5746",
      customerId: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
      orderNo: "1ORD00320260113160314",
      file: "HPM.1.20260113160314.WG.IFORD003.3254.txt",
      partNumberRaw: "84261-3K6 -K011-M1",
      partNumber: "842613K6-K011M1",
      partName: "GARN ASSY L,RR SIDE",
      colorCode: "NH900L",
      seqProd: "202601290070",
      kdLotNo: "HPM 08202601001101",
      qty: "6",
      date: "28-01",
      time: "10:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260510012617",
      remarksBawah: "26051001261700005000006",
      barcodeHpm: "260510012617000050000067",
      barcodeKasaiRaw: "84261-3K6 -K011-M1 NH900L",
      barcodeKasai: "842613K6-K011M1-NH900L",
      scanLt1By: "user-123",
      scanLt1ByName: "John Doe",
      scanLt1At: "2026-01-28T10:05:00Z",
      scanLt2By: "user-456",
      scanLt2ByName: "Jane Smith",
      scanLt2At: "2026-01-28T10:15:00Z",
      createdAt: "2026-01-25T08:32:14.610Z",
      updatedAt: "2026-01-25T08:36:01.110Z",
      customer: {
        id: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
        name: "PT Honda Prospect Motor",
        alias: "HPM"
      }
    },
    {
      id: "4f297f85-5470-428c-81ef-5909dea11e14",
      customerId: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
      orderNo: "1ORD00320260113160314",
      file: "HPM.1.20260113160314.WG.IFORD003.3254.txt",
      partNumberRaw: "84261-3K6 -K011-M1",
      partNumber: "842613K6-K011M1",
      partName: "GARN ASSY L,RR SIDE",
      colorCode: "NH900L",
      seqProd: "202601290050",
      kdLotNo: "HPM 08202601001001",
      qty: "6",
      date: "28-01",
      time: "10:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260510012616",
      remarksBawah: "26051001261600005000006",
      barcodeKasaiRaw: "84261-3K6 -K011-M1 NH900L",
      barcodeKasai: "842613K6-K011M1-NH900L",
      scanLt1By: null,
      scanLt1ByName: null,
      scanLt1At: null,
      scanLt2By: null,
      scanLt2ByName: null,
      scanLt2At: null,
      createdAt: "2026-01-25T08:32:14.450Z",
      updatedAt: "2026-01-25T08:36:01.081Z",
      customer: {
        id: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
        name: "PT Honda Prospect Motor",
        alias: "HPM"
      }
    },
    {
      id: "ba2ef7dc-b0b0-4de0-bb05-cb936023faf8",
      customerId: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
      orderNo: "1ORD00320260113160314",
      file: "HPM.1.20260113160314.WG.IFORD003.3254.txt",
      partNumberRaw: "84261-3K6 -K011-M1",
      partNumber: "842613K6-K011M1",
      partName: "GARN ASSY L,RR SIDE",
      colorCode: "NH900L",
      seqProd: "202601280140",
      kdLotNo: "HPM 08202601000901",
      qty: "6",
      date: "27-01",
      time: "14:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260510012615",
      remarksBawah: "26051001261500005000006",
      barcodeHpm: "26051001261500005000006;",
      barcodeKasaiRaw: "84261-3K6 -K011-M1 NH900L",
      barcodeKasai: "842613K6-K011M1-NH900L",
      scanLt1By: "user-789",
      scanLt1ByName: "Bob Johnson",
      scanLt1At: "2026-01-27T14:10:00Z",
      scanLt2By: "user-123",
      scanLt2ByName: "John Doe",
      scanLt2At: "2026-01-27T14:20:00Z",
      createdAt: "2026-01-25T08:32:14.184Z",
      updatedAt: "2026-01-25T08:36:01.056Z",
      customer: {
        id: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
        name: "PT Honda Prospect Motor",
        alias: "HPM"
      }
    },
    {
      id: "fea77e5d-34d3-4426-9eba-92f5a831b8bd",
      customerId: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
      orderNo: "1ORD00320260113160314",
      file: "HPM.1.20260113160314.WG.IFORD003.3254.txt",
      partNumberRaw: "84261-3K6 -K011-M1",
      partNumber: "842613K6-K011M1",
      partName: "GARN ASSY L,RR SIDE",
      colorCode: "NH900L",
      seqProd: "202601280120",
      kdLotNo: "HPM 08202601000801",
      qty: "6",
      date: "27-01",
      time: "13:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260510012614",
      remarksBawah: "26051001261400005000006",
      barcodeHpm: "26051001261400005000006]",
      barcodeKasaiRaw: "84261-3K6 -K011-M1 NH900L",
      barcodeKasai: "842613K6-K011M1-NH900L",
      scanLt1By: "user-456",
      scanLt1ByName: "Jane Smith",
      scanLt1At: "2026-01-27T13:05:00Z",
      scanLt2By: null,
      scanLt2ByName: null,
      scanLt2At: null,
      createdAt: "2026-01-25T08:32:14.078Z",
      updatedAt: "2026-01-25T08:36:01.032Z",
      customer: {
        id: "bbb0eaf7-c695-42ae-81ce-a4ee993d68e1",
        name: "PT Honda Prospect Motor",
        alias: "HPM"
      }
    },
    // Additional sample data for different lots
    {
      id: "abc123-xyz-456-def-789",
      customerId: "ccc11111-aaaa-bbbb-cccc-ddddddd",
      orderNo: "2ORD00520260120100000",
      file: "TOYOTA.2.20260120100000.WG.IFORD005.5432.txt",
      partNumberRaw: "84261-4A7 -K012-M2",
      partNumber: "842614A7-K012M2",
      partName: "BUMPER FRONT",
      colorCode: "NH600L",
      seqProd: "202601300010",
      kdLotNo: "HPM 08202601001301",
      qty: "10",
      date: "29-01",
      time: "09:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260520013001",
      remarksBawah: "26052001300100005000010",
      barcodeHpm: "26052001300100005000010A",
      barcodeKasaiRaw: "84261-4A7 -K012-M2 NH600L",
      barcodeKasai: "842614A7-K012M2-NH600L",
      scanLt1By: "user-999",
      scanLt1ByName: "Mike Wilson",
      scanLt1At: "2026-01-29T09:10:00Z",
      scanLt2By: "user-123",
      scanLt2ByName: "John Doe",
      scanLt2At: "2026-01-29T09:25:00Z",
      createdAt: "2026-01-29T08:00:00.000Z",
      updatedAt: "2026-01-29T08:00:00.000Z",
      customer: {
        id: "ccc11111-aaaa-bbbb-cccc-ddddddd",
        name: "PT Misubishi Motors Krama Yudha Indonesia",
        alias: "MMKI"
      }
    },
    {
      id: "def456-abc-789-xyz-012",
      customerId: "ccc11111-aaaa-bbbb-cccc-ddddddd",
      orderNo: "2ORD00520260120100000",
      file: "TOYOTA.2.20260120100000.WG.IFORD005.5432.txt",
      partNumberRaw: "84261-4A7 -K012-M2",
      partNumber: "842614A7-K012M2",
      partName: "BUMPER FRONT",
      colorCode: "NH600L",
      seqProd: "202601300008",
      kdLotNo: "HPM 08202601001302",
      qty: "10",
      date: "29-01",
      time: "08:00",
      adjustDate: null,
      adjustTime: null,
      slipNumber: "260520013002",
      remarksBawah: "26052001300200005000010",
      barcodeHpm: "26052001300200005000010B",
      barcodeKasaiRaw: "84261-4A7 -K012-M2 NH600L",
      barcodeKasai: "842614A7-K012M2-NH600L",
      scanLt1By: "user-456",
      scanLt1ByName: "Jane Smith",
      scanLt1At: "2026-01-29T08:05:00Z",
      scanLt2By: null,
      scanLt2ByName: null,
      scanLt2At: null,
      createdAt: "2026-01-29T07:30:00.000Z",
      updatedAt: "2026-01-29T07:30:00.000Z",
      customer: {
        id: "ccc11111-aaaa-bbbb-cccc-ddddddd",
        name: "PT Misubishi Motors Krama Yudha Indonesia",
        alias: "MMKI"
      }
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 7,
    totalPages: 1
  }
};

/**
 * Group scan monitoring data by lot number (kdLotNo)
 * Returns an object where keys are lot numbers and values are arrays of delivery data
 */
export function groupByLotNumber(data: any[]) {
  const grouped: Record<string, any[]> = {};

  data.forEach((item) => {
    const lotNo = item.kdLotNo;
    if (!grouped[lotNo]) {
      grouped[lotNo] = [];
    }
    grouped[lotNo].push(item);
  });

  return grouped;
}

/**
 * Get scan status for a delivery based on scan records
 * Returns: 'not_scanned', 'partial_scan', 'complete_scan'
 */
export function getScanStatus(delivery: any): string {
  const hasScan1 = delivery.scanLt1By !== null;
  const hasScan2 = delivery.scanLt2By !== null;

  if (!hasScan1 && !hasScan2) return 'not_scanned';
  if (hasScan1 && !hasScan2) return 'partial_scan';
  if (hasScan1 && hasScan2) return 'complete_scan';
  return 'not_scanned';
}

/**
 * Format the grouped data for display in monitoring tables
 */
export function formatLotGroupsForMonitoring(groupedData: Record<string, any[]>) {
  return Object.entries(groupedData).map(([lotNo, deliveries]) => {
    const firstDelivery = deliveries[0];

    // Calculate scan statistics
    const totalDeliveries = deliveries.length;
    const scannedOnce = deliveries.filter(d => d.scanLt1By !== null).length;
    const scannedTwice = deliveries.filter(d => d.scanLt1By !== null && d.scanLt2By !== null).length;
    const notScanned = deliveries.filter(d => d.scanLt1By === null).length;

    return {
      lotNo,
      customerName: firstDelivery.customer.name,
      customerAlias: firstDelivery.customer.alias,
      partNumber: firstDelivery.partNumber,
      partName: firstDelivery.partName,
      colorCode: firstDelivery.colorCode,
      totalDeliveries,
      scannedOnce,
      scannedTwice,
      notScanned,
      orderNo: firstDelivery.orderNo,
      deliveries,
      scanProgress: {
        completed: scannedTwice,
        inProgress: scannedOnce - scannedTwice,
        pending: notScanned,
        percentage: Math.round((scannedTwice / (totalDeliveries * 2)) * 100)
      }
    };
  });
}

/**
 * Get lot summary statistics
 */
export function getLotSummary(lotNo: string, data: any[]) {
  const lotDeliveries = data.filter(d => d.kdLotNo === lotNo);

  return {
    lotNo,
    totalDeliveries: lotDeliveries.length,
    totalQty: lotDeliveries.reduce((sum, d) => sum + parseInt(d.qty || '0'), 0),
    scanLine1Completed: lotDeliveries.filter(d => d.scanLt1By !== null).length,
    scanLine2Completed: lotDeliveries.filter(d => d.scanLt2By !== null).length,
    firstScanDate: lotDeliveries.length > 0 ? lotDeliveries[0].date : null,
    lastScanDate: lotDeliveries.length > 0 ? lotDeliveries[lotDeliveries.length - 1].date : null,
    partNumber: lotDeliveries[0]?.partNumber,
    partName: lotDeliveries[0]?.partName,
    customerName: lotDeliveries[0]?.customer.name,
  };
}

// Export the grouped and formatted data for immediate use
export const groupedByLot = groupByLotNumber(sampleScanMonitoringData.result);
export const formattedLotGroups = formatLotGroupsForMonitoring(groupedByLot);
