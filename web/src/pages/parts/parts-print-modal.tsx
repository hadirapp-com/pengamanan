import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/api";
import { partsEndpoint } from "@/config/endpoints";
import { toLocalDateTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Parts } from "./parts-columns";
import type {
  LabelDesign,
  LabelElement,
} from "@/pages/label-design/types/label-types";
import { useLabelDesignStore } from "@/pages/label-design/store/label-design-store";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";

interface PrintData {
  part: Parts | null;
  qtyLabel: number;
  qtyPart: number;
  serialFrom: string;
  serialEnd: string;
  printer: string;
  pageRange: string;
  paperSize: string;
  colorMode: string;
  orientation: string;
  productionDate: string;
}

interface PrintHistory {
  status: string;
  createdAt: string;
}

interface PartsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: Parts | null;
  onPrintSuccess?: (printData: PrintData) => void;
  isRePrint?: boolean;
  previousHistory?: PrintHistory;
  reprintSerialFrom?: string | null;
  reprintSerialEnd?: string | null;
}

// QRCodeImage component - renders QR code as PNG for better print quality
interface QRCodeImageProps {
  value: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  size?: number;
  generateQR: (value: string, size: number) => Promise<string>;
}

function QRCodeImage({
  value,
  x = 0,
  y = 0,
  width,
  height,
  size = 160,
  generateQR,
}: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    generateQR(value, size).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size, generateQR]);

  if (!dataUrl) return null;
  return (
    <image
      x={x}
      y={y}
      width={width || size}
      height={height || size}
      href={dataUrl}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

export function PartsPrintModal({
  isOpen,
  onClose,
  part,
  onPrintSuccess,
  isRePrint = false,
  previousHistory,
  reprintSerialFrom,
  reprintSerialEnd,
}: PartsPrintModalProps) {
  const authStore = useAuthStore();
  const user = authStore.getProfile();
  const [qtyLabel, setQtyLabel] = useState("0");
  const [qtyPart, setQtyPart] = useState("0");
  const [serialFrom, setSerialFrom] = useState("");
  const [serialEnd, setSerialEnd] = useState("");
  const [zoom, setZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(true);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [isLoadingSerial, setIsLoadingSerial] = useState(false);

  // Production date state (default today + 2 days)
  const [productionDate, setProductionDate] = useState("");
  const [showProductionDate, setShowProductionDate] = useState(true);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [estimatedPages, setEstimatedPages] = useState(0);

  // Get label design data
  const { getAllDesigns } = useLabelDesignStore();
  const [labelDesign, setLabelDesign] = useState<LabelDesign | null>(null);

  // Calculate dynamic grid columns based on zoom and label size
  const gridColumns = useMemo(() => {
    const labelWidth = labelDesign?.labelSize?.width || 135;
    const paperWidth = 297; // A4 landscape width in mm
    const margin = 20; // Total margin (10mm each side)
    const availableWidth = paperWidth - margin;

    // Effective label width at current zoom level
    const effectiveLabelWidth = labelWidth * (zoom / 100);

    // Calculate how many columns fit
    const columns = Math.floor(availableWidth / effectiveLabelWidth);

    // Clamp between 1 and 6 for practical purposes
    return Math.max(1, Math.min(columns, 6));
  }, [labelDesign, zoom]);

  // More settings state
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [pageRange, setPageRange] = useState("all");
  const [customPageRange, setCustomPageRange] = useState("");
  const [paperSize, setPaperSize] = useState("A4");
  const [colorMode, setColorMode] = useState("black");
  const [orientation, setOrientation] = useState("landscape");

  // Mock printer list - in real app, this would come from system
  const availablePrinters = [
    "HP LaserJet Pro M404n",
    "Canon PIXMA TS8320",
    "Epson EcoTank ET-4760",
    "Brother HL-L2350DW",
    "Default Printer",
  ];

  const paperSizes = ["A4", "A3", "A5", "Letter", "Legal", "B4", "B5"];

  // Cache for QR codes
  const qrCache = useRef<Map<string, string>>(new Map());

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Generate QR code as PNG base64
  const generateQRCodePNG = useCallback(
    async (value: string, size: number = 160): Promise<string> => {
      const cacheKey = `${value}-${size}`;
      if (qrCache.current.has(cacheKey)) return qrCache.current.get(cacheKey)!;

      const canvas = document.createElement("canvas");
      canvas.width = size * 2; // 2x for better quality
      canvas.height = size * 2;
      await QRCode.toCanvas(canvas, value, { width: size * 2, margin: 0 });
      const dataUrl = canvas.toDataURL("image/png");
      qrCache.current.set(cacheKey, dataUrl);
      return dataUrl;
    },
    [],
  );

  // Function to get current date in YYYYMMDD format
  const getCurrentDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Function to format production date to YYYYMMDD format for serial numbers
  const getProductionDateForSerial = () => {
    if (!productionDate) return getCurrentDateString();
    // productionDate is in YYYY-MM-DD format, convert to YYYYMMDD
    return productionDate.replace(/-/g, "");
  };

  // Function to get production date (today + 2 days) in YYYY-MM-DD format for input
  const getProductionDate = () => {
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Initialize production date
  useEffect(() => {
    setProductionDate(getProductionDate());
  }, []);

  // Regenerate serial numbers when production date changes
  useEffect(() => {
    const labelQty = parseInt(qtyLabel) || 0;
    if (labelQty > 0 && productionDate && isRePrint === false) {
      generateSerialNumbers(labelQty);
    }
  }, [productionDate]);

  // Function to get the last serial number for production date
  const getLastSerialForToday = async (allData: boolean = false) => {
    if (!part?.id) return 0;

    try {
      const prodDate = getProductionDateForSerial();
      const response = await axiosInstance.get(partsEndpoint.printHistory + `/${part.id}`, {
        params: {
          date: prodDate,
          limit: 1,
          sortBy: "serialEnd",
          sortDir: "DESC",
        },
      });

      const lastHistory = response.data?.result?.[0];
      if (lastHistory?.serialEnd) {
        if (allData) {
          return lastHistory;
        }
        // Extract the last 4 digits (serial part) from the last serial
        const lastSerial = parseInt(lastHistory.serialEnd.slice(-4));
        return lastSerial;
      }
      return 0;
    } catch (error) {
      console.error("Failed to get last serial:", error);
      return 0;
    }
  };

  // Function to generate serial numbers
  const generateSerialNumbers = async (qty: number) => {
    setIsLoadingSerial(true);
    try {
      const prodDate = getProductionDateForSerial();
      if (!isRePrint) {
        const lastSerial = await getLastSerialForToday();
        const startSerial = lastSerial + 1;

        const serialFrom = `${prodDate}${String(startSerial).padStart(4, "0")}`;
        const serialEnd = `${prodDate}${String(startSerial + qty - 1).padStart(
          4,
          "0",
        )}`;

        setSerialFrom(serialFrom);
        setSerialEnd(serialEnd);
      } else {
        const lastSerial = await getLastSerialForToday(true);
        setSerialFrom(lastSerial.serialFrom);
        setSerialEnd(lastSerial.serialEnd);
      }
    } catch (error) {
      console.error("Failed to generate serial numbers:", error);
    } finally {
      setIsLoadingSerial(false);
    }
  };

  // Calculate estimated pages based on label size and paper size
  const calculateEstimatedPages = () => {
    const labelQty = parseInt(qtyLabel) || 0;
    if (labelQty === 0) return 0;

    // For custom label design, use the configured size
    // For default design, use 135mm × 79mm (physical dimensions)
    const labelWidth = labelDesign?.labelSize?.width || 135;
    const labelHeight = labelDesign?.labelSize?.height || 79;

    // Paper dimensions in mm
    const paperDimensions: Record<string, { width: number; height: number }> = {
      A4:
        orientation === "landscape"
          ? { width: 297, height: 210 }
          : { width: 210, height: 297 },
      A3:
        orientation === "landscape"
          ? { width: 420, height: 297 }
          : { width: 297, height: 420 },
      A5:
        orientation === "landscape"
          ? { width: 210, height: 148 }
          : { width: 148, height: 210 },
      Letter:
        orientation === "landscape"
          ? { width: 279, height: 216 }
          : { width: 216, height: 279 },
      Legal:
        orientation === "landscape"
          ? { width: 356, height: 216 }
          : { width: 216, height: 356 },
      B4:
        orientation === "landscape"
          ? { width: 364, height: 257 }
          : { width: 257, height: 364 },
      B5:
        orientation === "landscape"
          ? { width: 257, height: 182 }
          : { width: 182, height: 257 },
    };

    const paper = paperDimensions[paperSize] || paperDimensions.A4;
    const margin = 10; // 10mm margin

    // Available printable area
    const availableWidth = paper.width - margin * 2;
    const availableHeight = paper.height - margin * 2;

    // Calculate how many labels fit per row and column
    const labelsPerRow = Math.floor(availableWidth / (labelWidth + 2)); // +2 for spacing
    const labelsPerCol = Math.floor(availableHeight / (labelHeight + 2)); // +2 for spacing

    const labelsPerPage = labelsPerRow * labelsPerCol;

    // Calculate total pages needed
    return Math.ceil(labelQty / labelsPerPage);
  };

  // Update estimated pages when relevant values change
  useEffect(() => {
    setEstimatedPages(calculateEstimatedPages());
  }, [qtyLabel, labelDesign, paperSize, orientation]);

  // Calculate Qty Part when Qty Label changes
  const handleQtyLabelChange = async (value: string) => {
    setQtyLabel(value);
    const labelQty = parseInt(value) || 0;
    const qtyPerPack =
      typeof part?.qtyPerPack === "string"
        ? parseInt(part?.qtyPerPack || "1") || 1
        : part?.qtyPerPack || 1;
    const calculatedPartQty = labelQty * qtyPerPack;
    setQtyPart(calculatedPartQty.toString());

    // Generate serial numbers when qty label is set
    if (labelQty > 0) {
      await generateSerialNumbers(labelQty);
    } else {
      setSerialFrom("");
      setSerialEnd("");
    }
  };

  // Calculate Qty Label when Qty Part changes
  const handleQtyPartChange = async (value: string) => {
    setQtyPart(value);
    const partQty = parseInt(value) || 0;
    const qtyPerPack =
      typeof part?.qtyPerPack === "string"
        ? parseInt(part?.qtyPerPack || "1") || 1
        : part?.qtyPerPack || 1;
    const calculatedLabelQty = Math.ceil(partQty / qtyPerPack);
    setQtyLabel(calculatedLabelQty.toString());

    // Generate serial numbers when qty part is set
    if (calculatedLabelQty > 0) {
      await generateSerialNumbers(calculatedLabelQty);
    } else {
      setSerialFrom("");
      setSerialEnd("");
    }
  };

  // const handlePrintButtonClick = () => {
  //   setShowPrintConfirm(true);
  // };

  const handlePrintButtonClick = async () => {
    const confirmMessage = isRePrint
      ? "Anda akan melakukan reprint. Sequence tidak akan bertambah. Apakah Anda yakin ingin melanjutkan?"
      : "Jika di print sequence akan bertambah. Apakah Anda yakin ingin melanjutkan?";

    if (confirm(confirmMessage)) {
      // Record print history before printing
      try {
        const printHistoryData = {
          partId: part?.id,
          qtyLabel: parseInt(qtyLabel),
          qtyPart: parseInt(qtyPart),
          serialFrom: serialFrom || undefined,
          serialEnd: serialEnd || undefined,
          status: isRePrint
            ? parseInt(previousHistory?.status || "1", 10) + 1
            : 1,
          productionDate,
        };

        await axiosInstance.post(partsEndpoint.printHistory, printHistoryData);
        console.log("Print history recorded successfully");

        // Call onPrintSuccess callback if provided
        if (onPrintSuccess) {
          onPrintSuccess({
            part,
            qtyLabel: parseInt(qtyLabel),
            qtyPart: parseInt(qtyPart),
            serialFrom,
            serialEnd,
            printer: selectedPrinter,
            pageRange: pageRange === "custom" ? customPageRange : pageRange,
            paperSize,
            colorMode,
            orientation,
            productionDate,
          });
        }
      } catch (error) {
        console.error("Failed to record print history:", error);
        // Still proceed with print even if API fails
      }

      // Execute print
      reactToPrintFn();
    }
  };

  const handleConfirmPrint = async () => {
    // Record print history after user confirms from preview
    try {
      const printHistoryData = {
        partId: part?.id,
        qtyLabel: parseInt(qtyLabel),
        qtyPart: parseInt(qtyPart),
        serialFrom: serialFrom || undefined,
        serialEnd: serialEnd || undefined,
        status: isRePrint ? parseInt(previousHistory?.status || "1") + 1 : 1,
        productionDate,
      };

      const response = await axiosInstance.post(
        partsEndpoint.printHistory,
        printHistoryData,
      );
      console.log("Print history recorded:", response.data);

      // Call onPrintSuccess callback if provided
      if (onPrintSuccess) {
        onPrintSuccess({
          part,
          qtyLabel: parseInt(qtyLabel),
          qtyPart: parseInt(qtyPart),
          serialFrom,
          serialEnd,
          printer: selectedPrinter,
          pageRange: pageRange === "custom" ? customPageRange : pageRange,
          paperSize,
          colorMode,
          orientation,
          productionDate,
        });
      }
    } catch (error) {
      console.error("Failed to record print history:", error);
    }

    // Close preview and modal
    setShowPreview(false);
    onClose();
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  // Reset serial numbers when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isRePrint && reprintSerialFrom && reprintSerialEnd) {
        // Use serial from print history for re-print
        setSerialFrom(reprintSerialFrom);
        setSerialEnd(reprintSerialEnd);
        // Set qty based on the difference between serial end and serial from
        const serialFromNum = parseInt(reprintSerialFrom.slice(-4));
        const serialEndNum = parseInt(reprintSerialEnd.slice(-4));
        const qty = serialEndNum - serialFromNum + 1;
        setQtyLabel(qty.toString());
        const qtyPerPack =
          typeof part?.qtyPerPack === "string"
            ? parseInt(part?.qtyPerPack || "1") || 1
            : part?.qtyPerPack || 1;
        setQtyPart((qty * qtyPerPack).toString());
      } else {
        setSerialFrom("");
        setSerialEnd("");
        setQtyLabel("0");
        setQtyPart("0");
      }
    }
  }, [
    isOpen,
    isRePrint,
    reprintSerialFrom,
    reprintSerialEnd,
    part?.qtyPerPack,
  ]);

  // Load label design when part changes
  useEffect(() => {
    if (part?.labelDesignId) {
      const savedDesigns = getAllDesigns();
      const design = savedDesigns.find(
        (d: LabelDesign) => d.id === part.labelDesignId,
      );
      setLabelDesign(design || null);
    } else {
      setLabelDesign(null);
    }
  }, [part?.labelDesignId, getAllDesigns]);

  if (!part) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full flex flex-col p-0 sm:max-w-[80vw]" showCloseButton={false}>
          <DialogHeader className="flex-shrink-0 p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {isRePrint ? "Re-Print Settings" : "Print Settings"}
                </DialogTitle>
                {isRePrint && previousHistory && (
                  <p className="text-sm text-muted-foreground">
                    Previous print:{" "}
                    {parseInt(previousHistory.status) === 1
                      ? "First Print"
                      : `${previousHistory.status}nd Print`}{" "}
                    on {toLocalDateTime(previousHistory.createdAt)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? "Hide Settings" : "Show Settings"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  CANCEL
                </Button>
                <Button onClick={handlePrintButtonClick}>Print</Button>
              </div>
            </div>
          </DialogHeader>

          <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            /* Hide dialog header when printing */
            dialog::backdrop {
              display: none !important;
            }
            /* Remove margins and ensure full width */
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Ensure the preview container fills the page */
            .bg-gray-50 {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            /* Remove fixed dimensions for print */
            [style*="297mm"] {
              width: 100% !important;
              height: auto !important;
            }
          }
        `}</style>

          <div className="flex-1 flex overflow-hidden">
            {/* Print Preview - Full Width */}
            <div className="w-full bg-gray-50 p-4 overflow-auto">
              <div
                className="bg-white border rounded-lg p-4 h-full w-full relative"
                style={{
                  width: "297mm",
                  height: "210mm",
                  margin: "0 auto",
                }}
              >
                {/* Label Size Info */}
                <div className="no-print absolute top-2 left-2 bg-blue-100 text-blue-800 px-3 py-2 rounded text-xs font-medium">
                  <div>
                    Label Size:{" "}
                    {labelDesign?.labelSize
                      ? `${labelDesign.labelSize.width}mm × ${labelDesign.labelSize.height}mm`
                      : part.labelSize || "135mm × 79mm"}{" "}
                    | Physical: 135mm × 79mm
                    {labelDesign && (
                      <span className="ml-2">
                        | Design ID: {labelDesign.id}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 pt-1 border-t border-blue-300">
                    Grid: {gridColumns} columns | Zoom: {zoom}%
                  </div>
                </div>
                {/* Label Preview Grid - Fit to Screen */}
                <div className="print-wrapper" ref={contentRef}>
                  <div className="hidden print:block print:w-full print:text-center print:border-b-2">
                    <p className="text-sm">Label Color: {part.labelColor} | Total Labels: {qtyLabel} | Printed: {toLocalDateTime(new Date())} | By: {user?.fullName} | Serial: {serialFrom} - {serialEnd}</p>
                  </div>
                  <div
                    className="grid gap-8 h-full w-full print:p-8 print:place-items-center"
                    style={{
                      gridTemplateColumns: `repeat(auto-fill, minmax(${labelDesign?.labelSize?.width || 135}mm, 1fr))`,

                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top left",
                    }}
                    // ref={contentRef}
                  >
                    {Array.from(
                      { length: parseInt(qtyLabel) || 0 },
                      (_, index) => {
                        // Calculate current serial number for this label
                        const currentSerial = serialFrom
                          ? `${serialFrom.slice(0, 8)}${String(
                              parseInt(serialFrom.slice(-4)) + index,
                            ).padStart(4, "0")}`
                          : "";

                        return (
                          <div
                            key={index}
                            className="bg-white border-2 border-black print:break-inside-avoid print:mt-8"
                            style={{
                              width: labelDesign?.labelSize
                                ? `${labelDesign.labelSize.width}mm`
                                : "135mm",
                              height: labelDesign?.labelSize
                                ? `${labelDesign.labelSize.height}mm`
                                : "79mm",
                            }}
                          >
                            {labelDesign ? (
                              // Render custom label design
                              <svg
                                width="100%"
                                height="100%"
                                viewBox={`0 0 ${labelDesign.labelSize.width} ${labelDesign.labelSize.height}`}
                                style={{ fontSize: "3.5px" }}
                              >
                                {/* Background */}
                                <rect
                                  width={labelDesign.labelSize.width}
                                  height={labelDesign.labelSize.height}
                                  fill="white"
                                  stroke="black"
                                  strokeWidth="0.5"
                                />

                                {/* Render label design elements */}
                                {labelDesign.elements?.map(
                                  (element: LabelElement) => {
                                    // Skip production date element if showProductionDate is false
                                    // if (element.properties.fieldName === "productionDate" && !showProductionDate) {
                                    //   return null;
                                    // }

                                    // Replace dynamic field values with actual part data
                                    let displayText =
                                      element.properties.text || "";
                                    if (
                                      element.properties.fieldType === "dynamic"
                                    ) {
                                      switch (element.properties.fieldName) {
                                        case "partName":
                                          displayText = part.name;
                                          break;
                                        case "partNo":
                                          displayText = part.no;
                                          break;
                                        case "serialNumber":
                                          displayText = currentSerial;
                                          break;
                                        case "colorCode":
                                          displayText = part.colorCode;
                                          break;
                                        case "customerName":
                                          displayText = part.customer?.name || "";
                                          break;
                                        case "productionDate": {
                                          const formatProdDate = (
                                            dateStr: string,
                                          ) => {
                                            if (!dateStr) return "";
                                            const date = new Date(dateStr);
                                            const year = date.getFullYear();
                                            const month = String(
                                              date.getMonth() + 1,
                                            ).padStart(2, "0");
                                            const day = String(
                                              date.getDate(),
                                            ).padStart(2, "0");
                                            return `${year}-${month}-${day}`;
                                          };
                                          displayText =
                                            formatProdDate(productionDate);
                                          break;
                                        }
                                        default:
                                          displayText =
                                            element.properties.text || "";
                                      }
                                    }

                                    // Render different element types
                                    switch (element.type) {
                                      case "text":
                                        return (
                                          <text
                                            key={element.id}
                                            x={element.x}
                                            y={
                                              element.y +
                                              (element.properties.fontSize || 12)
                                            }
                                            fontFamily={
                                              element.properties.fontFamily ||
                                              "Arial"
                                            }
                                            fontSize={
                                              element.properties.fontSize || 12
                                            }
                                            fontWeight={
                                              element.properties.fontWeight ||
                                              "normal"
                                            }
                                            fill={
                                              element.properties.color ||
                                              "#000000"
                                            }
                                            textAnchor="start"
                                          >
                                            {displayText}
                                          </text>
                                        );
                                      case "barcode":
                                        // Simplified barcode representation
                                        return (
                                          <g key={element.id}>
                                            <rect
                                              x={element.x}
                                              y={element.y}
                                              width={element.width}
                                              height={element.height}
                                              fill="none"
                                              stroke={
                                                element.properties.color ||
                                                "#000000"
                                              }
                                              strokeWidth="1"
                                            />
                                            <text
                                              x={element.x + element.width / 2}
                                              y={element.y + element.height + 10}
                                              textAnchor="middle"
                                              fontSize="8"
                                              fill={
                                                element.properties.color ||
                                                "#000000"
                                              }
                                            >
                                              {displayText}
                                            </text>
                                          </g>
                                        );
                                      case "qrcode":
                                        // Generate real QR code as PNG for better print quality
                                        return (
                                          <QRCodeImage
                                            key={element.id}
                                            value={displayText}
                                            x={element.x}
                                            y={element.y}
                                            width={element.width}
                                            height={element.height}
                                            size={Math.min(
                                              element.width,
                                              element.height,
                                            )}
                                            generateQR={generateQRCodePNG}
                                          />
                                        );
                                      case "line":
                                        return (
                                          <line
                                            key={element.id}
                                            x1={element.x}
                                            y1={element.y}
                                            x2={element.x + element.width}
                                            y2={element.y + element.height}
                                            stroke={
                                              element.properties.color ||
                                              "#000000"
                                            }
                                            strokeWidth={
                                              element.properties.lineWidth || 1
                                            }
                                            strokeDasharray={
                                              element.properties.lineStyle ===
                                              "dashed"
                                                ? "5,5"
                                                : element.properties.lineStyle ===
                                                    "dotted"
                                                  ? "2,2"
                                                  : "none"
                                            }
                                          />
                                        );
                                      case "shape":
                                        if (
                                          element.properties.shapeType ===
                                          "rectangle"
                                        ) {
                                          return (
                                            <rect
                                              key={element.id}
                                              x={element.x}
                                              y={element.y}
                                              width={element.width}
                                              height={element.height}
                                              fill={
                                                element.properties
                                                  .backgroundColor ||
                                                "transparent"
                                              }
                                              stroke={
                                                element.properties.color ||
                                                "#000000"
                                              }
                                              strokeWidth="1"
                                            />
                                          );
                                        } else if (
                                          element.properties.shapeType ===
                                          "circle"
                                        ) {
                                          return (
                                            <circle
                                              key={element.id}
                                              cx={element.x + element.width / 2}
                                              cy={element.y + element.height / 2}
                                              r={
                                                Math.min(
                                                  element.width,
                                                  element.height,
                                                ) / 2
                                              }
                                              fill={
                                                element.properties
                                                  .backgroundColor ||
                                                "transparent"
                                              }
                                              stroke={
                                                element.properties.color ||
                                                "#000000"
                                              }
                                              strokeWidth="1"
                                            />
                                          );
                                        }
                                        break;
                                      default:
                                        return null;
                                    }
                                  },
                                )}
                              </svg>
                            ) : (
                              <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                viewBox="0 0 1190 705"
                                xmlSpace="preserve"
                                style={{ width: "100%", height: "auto" }}
                              >
                                <style>{`
                                .st0{fill:#FFFFFF;stroke:#000000;stroke-width:4;}
                                .st1{fill:none;stroke:#000000;stroke-width:2;}
                                .st2{fill:#D9D9D9;stroke:#000000;stroke-width:2;}
                                .st3{font-family:Arial, Helvetica, sans-serif;font-weight:bold;}
                                .st4{font-size:26px;}
                                .st5{font-size:40px;}
                                .st6{font-size:90px;}
                                .st7{font-size:42px;}
                                .st8{fill:#FFFFFF;stroke:#000000;stroke-width:2;}
                                .st9{font-size:28px;}
                                .st10{font-family:Arial, Helvetica, sans-serif;}
                                .st11{font-size:36px;}
                                .st12{font-size:24px;}
                                .st13{font-size:100px;}
                                .st14{font-size:36px;}
                              `}</style>
                                <rect
                                  x="600"
                                  y="15"
                                  className="st2"
                                  width="560"
                                  height="50"
                                />
                                <image
                                  x="24"
                                  y="-20"
                                  width="280"
                                  height="130"
                                  href="/company.png"
                                  preserveAspectRatio="xMidYMid meet"
                                />
                                <text x="672.69" y="50" className="st3 st4">
                                  PT. KASAI TECK SEE INDONESIA
                                </text>

                                <rect
                                  x="-2"
                                  y="85"
                                  className="st1"
                                  width="950"
                                  height="80"
                                />
                                <text x="20" y="135" className="st3 st5">
                                  {part.name}
                                </text>

                                <rect
                                  x="948"
                                  y="85"
                                  className="st1"
                                  width="244"
                                  height="160"
                                />
                                <text x="1010" y="194" className="st3 st6">
                                  {part.leftHand
                                    ? "LH"
                                    : part.rightHand
                                      ? "RH"
                                      : "LH"}
                                </text>

                                <rect
                                  x="-2"
                                  y="165"
                                  className="st1"
                                  width="721"
                                  height="80"
                                />
                                <text x="20" y="215" className="st3 st7">
                                  {part.no}
                                </text>

                                <rect
                                  x="-2"
                                  y="245"
                                  className="st1"
                                  width="274"
                                  height="58"
                                />
                                <rect
                                  x="273"
                                  y="245"
                                  className="st8"
                                  width="446"
                                  height="58"
                                />
                                <text x="20" y="284" className="st3 st9">
                                  CUSTOMER
                                </text>
                                <text x="293" y="284" className="st10 st9">
                                  {part.customer?.alias || ""}
                                </text>

                                <rect
                                  x="-2"
                                  y="303"
                                  className="st1"
                                  width="274"
                                  height="57"
                                />
                                <rect
                                  x="273"
                                  y="303"
                                  className="st8"
                                  width="446"
                                  height="57"
                                />
                                <text x="20" y="341" className="st3 st9">
                                  COLOR
                                </text>
                                <text x="293" y="341" className="st10 st4">
                                  {part.colorCode}
                                </text>

                                <rect
                                  x="719"
                                  y="165"
                                  className="st8"
                                  width="229"
                                  height="195"
                                />
                                <rect
                                  x="948"
                                  y="245"
                                  className="st1"
                                  width="244"
                                  height="116"
                                />
                                <text x={part.model.length <= 7 ? "1010" : part.model.length < 9 ? "980" : "960"} y="316" className={`st3 ${part.model.length < 10 ? "st5" : "st14"}`}>
                                  {part.model}
                                </text>

                                <rect
                                  x="-2"
                                  y="361"
                                  className="st1"
                                  width="274"
                                  height="57"
                                />
                                <text x="20" y="401" className="st3 st9">
                                  PROD. DATE
                                </text>
                                <text x="295" y="405" className="st3 st11">
                                  {showProductionDate ? productionDate : ""}
                                </text>

                                <rect
                                  x="-2"
                                  y={"418"}
                                  className="st1"
                                  width="274"
                                  height="57"
                                />
                                <rect
                                  x="273"
                                  y={"418"}
                                  className="st8"
                                  width="446"
                                  height="57"
                                />
                                <text x="20" y={"458"} className="st3 st9">
                                  QTY / TROLLEY
                                </text>
                                <text x="480" y={"458"} className="st3 st11">
                                  {part.qtyPerPack}
                                </text>
                                <text x="734" y={"455"} className="st10 st9">
                                  Pcs
                                </text>

                                <rect
                                  x="-2"
                                  y={"475"}
                                  className="st1"
                                  width="274"
                                  height="220"
                                />
                                <rect
                                  x="273"
                                  y={"475"}
                                  className="st1"
                                  width="641"
                                  height="220"
                                />
                                <rect
                                  x="914"
                                  y={"475"}
                                  className="st1"
                                  width="281"
                                  height="220"
                                />

                                <text x="81" y={"502"} className="st10 st12">
                                  QR Serial
                                </text>
                                <QRCodeSVG
                                  x="52"
                                  y={"525"}
                                  width="160"
                                  height="160"
                                  value={part.no + currentSerial}
                                  bgColor="#FFFFFF"
                                  fgColor="#000000"
                                  level="M"
                                />
                                <text x="441" y={"502"} className="st10 st12">
                                  Indication
                                </text>
                                <text x="1026" y={"502"} className="st10 st12">
                                  Qty
                                </text>
                                {/* Qty QR */}
                                <QRCodeSVG
                                  x="970"
                                  y={"525"}
                                  width="160"
                                  height="160"
                                  value={part.qtyPerPack.toString()}
                                  bgColor="#FFFFFF"
                                  fgColor="#000000"
                                  level="M"
                                />
                                {/* Part Number */}
                                <QRCodeSVG
                                  x="755"
                                  y="183"
                                  width="160"
                                  height="160"
                                  value={part.no}
                                  bgColor="#FFFFFF"
                                  fgColor="#000000"
                                  level="M"
                                />

                                <text x="403" y={"628"} className="st3 st13">
                                  {part.indication}
                                </text>

                                <rect
                                  x="273"
                                  y={"361"}
                                  className="st1"
                                  width="922"
                                  height="57"
                                />
                                {/* Quality left */}
                                <rect
                                  x="719"
                                  y={"475"}
                                  className="st1"
                                  width="195"
                                  height="220"
                                />
                                {/* QR serial bottom */}
                                <rect
                                  x="-2"
                                  y={"514"}
                                  className="st1"
                                  width="1192"
                                  height="181"
                                />

                                <text x="782" y={"503"} className="st10 st12">
                                  Quality
                                </text>
                              </svg>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>


                {/* Zoom Controls */}
                <div className="no-print absolute bottom-4 right-4 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Panel - Right Side (Collapsible) */}
            {showSettings && (
              <div className="no-print w-80 flex-shrink-0 border-l bg-white p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="partNo">Part Number</Label>
                  <Input
                    id="partNo"
                    value={part.no}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partName">Part Name</Label>
                  <Input
                    id="partName"
                    value={part.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labelSize">Label Size</Label>
                  <Input
                    id="labelSize"
                    value={part.labelSize || "135mm x 79mm"}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labelColor">Label Color</Label>
                  <Input
                    id="labelColor"
                    value={part.labelColor || "White"}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qtyLabel">Qty Label</Label>
                  <Input
                    id="qtyLabel"
                    type="number"
                    min="1"
                    value={qtyLabel}
                    onChange={(e) => handleQtyLabelChange(e.target.value)}
                    placeholder="Enter quantity"
                    readOnly={isRePrint}
                    className={isRePrint ? "bg-gray-50" : ""}
                  />
                  {isRePrint && (
                    <p className="text-xs text-muted-foreground">
                      Quantity calculated from original print history
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qtyPart">Qty Part</Label>
                  <Input
                    id="qtyPart"
                    type="number"
                    min="1"
                    value={qtyPart}
                    onChange={(e) => handleQtyPartChange(e.target.value)}
                    placeholder="Enter quantity"
                    readOnly={isRePrint}
                    className={isRePrint ? "bg-gray-50" : ""}
                  />
                  {isRePrint && (
                    <p className="text-xs text-muted-foreground">
                      Quantity calculated from original print history
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialFrom">
                    Serial From{" "}
                    {isLoadingSerial && (
                      <span className="text-xs text-muted-foreground">
                        (Generating...)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="serialFrom"
                    type="text"
                    value={serialFrom}
                    onChange={(e) => setSerialFrom(e.target.value)}
                    placeholder="Auto-generated when qty is set"
                    readOnly={true}
                    className={isLoadingSerial || isRePrint ? "bg-gray-50" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: YYYYMMDD0001 (uses Production Date)
                    {isRePrint && " - Using original serial from print history"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialEnd">Serial End</Label>
                  <Input
                    id="serialEnd"
                    type="text"
                    value={serialEnd}
                    onChange={(e) => setSerialEnd(e.target.value)}
                    placeholder="Auto-generated when qty is set"
                    readOnly={true}
                    className={isLoadingSerial || isRePrint ? "bg-gray-50" : ""}
                  />
                  {isRePrint && (
                    <p className="text-xs text-muted-foreground">
                      Using original serial end from print history
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showProductionDate">
                      Show Production Date
                    </Label>
                    <input
                      id="showProductionDate"
                      type="checkbox"
                      readOnly={isRePrint}
                      disabled={isRePrint}
                      checked={showProductionDate}
                      onChange={(e) => setShowProductionDate(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                {showProductionDate && (
                  <div className="space-y-2">
                    <Label htmlFor="productionDate">Production Date</Label>
                    <Input
                      id="productionDate"
                      type="date"
                      readOnly={isRePrint}
                      value={productionDate}
                      onChange={(e) => setProductionDate(e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd")} // Prevent selecting dates before today + 2 days
                    />
                    <p className="text-xs text-muted-foreground">
                      Default: Today + 2 days
                    </p>
                  </div>
                )}

                {/* Print Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Estimated Pages:</span>{" "}
                    <span className="font-bold text-blue-700">
                      {estimatedPages}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Orientation:</span>{" "}
                    <span className="capitalize">{orientation}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Paper Size:</span> {paperSize}
                  </div>
                </div>

                {/* More Settings Section */}
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                    onClick={() => setShowMoreSettings(!showMoreSettings)}
                  >
                    <span className="font-medium">More Settings</span>
                    {showMoreSettings ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showMoreSettings && (
                    <div className="mt-4 space-y-4">
                      {/* Printer Selection */}
                      <div className="space-y-2">
                        <Label>Printer</Label>
                        <Select
                          value={selectedPrinter}
                          onValueChange={setSelectedPrinter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select printer" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePrinters.map((printer) => (
                              <SelectItem key={printer} value={printer}>
                                {printer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Page Range */}
                      <div className="space-y-2">
                        <Label>Pages</Label>
                        <Select value={pageRange} onValueChange={setPageRange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Pages</SelectItem>
                            <SelectItem value="current">
                              Current Page
                            </SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                        {pageRange === "custom" && (
                          <Input
                            placeholder="e.g., 1-3, 5, 7-9"
                            value={customPageRange}
                            onChange={(e) => setCustomPageRange(e.target.value)}
                          />
                        )}
                      </div>

                      {/* Paper Size */}
                      <div className="space-y-2">
                        <Label>Paper Size</Label>
                        <Select value={paperSize} onValueChange={setPaperSize}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paperSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color Mode */}
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Select value={colorMode} onValueChange={setColorMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="black">Black & White</SelectItem>
                            <SelectItem value="color">Color</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Orientation */}
                      <div className="space-y-2">
                        <Label>Orientation</Label>
                        <Select
                          value={orientation}
                          onValueChange={setOrientation}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full flex flex-col p-0 sm:max-w-[80vw]">
          {/* <DialogContent className="max-w-[00vw] max-h-[90vh] w-full h-full flex flex-col p-0"> */}
          <DialogHeader className="flex-shrink-0 p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold">
                  PDF Preview
                </DialogTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  <div>
                    <span className="font-medium">Total Pages:</span>{" "}
                    {estimatedPages}
                  </div>
                  <div>
                    <span className="font-medium">Orientation:</span>{" "}
                    <span className="capitalize">{orientation}</span>
                  </div>
                  <div>
                    <span className="font-medium">Paper Size:</span> {paperSize}
                  </div>
                  <div>
                    <span className="font-medium">Labels:</span> {qtyLabel}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClosePreview}>
                  BACK TO EDIT
                </Button>
                <Button onClick={() => window.open(previewUrl || "", "_blank")}>
                  <FileText className="mr-2 h-4 w-4" />
                  OPEN PDF
                </Button>
                <Button onClick={handleConfirmPrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  CONFIRM & PRINT
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 bg-gray-100 overflow-auto p-4">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
