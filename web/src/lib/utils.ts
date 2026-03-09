import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import id from "dayjs/locale/id";
import type { Params } from "react-router";
import QRCode from "qrcode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toLocalDateTime = (date: string | Date) => {
  if (!date) return null;
  return dayjs(date).format("DD/MM/YYYY HH:mm");
};

export const toLocalDate = (date: string | Date) => {
  if (!date) return null;
  return dayjs(date).format("DD/MM/YYYY");
};

export const toLocalDateWithDay = (date: string | Date) => {
  if (!date) return null;
  return dayjs(date).locale(id).format("dddd, DD/MM/YYYY");
};

export const hasparamsId = (
  parameters: Params<string>
): { hasId: boolean; id?: string } => {
  const hasId = Boolean(
    parameters &&
      parameters["id"] &&
      parameters["id"]?.toLowerCase() != "create"
  );
  if (hasId) {
    return { hasId, id: parameters["id"] };
  }
  return { hasId, id: undefined };
};

/**
 * Generate QR code from text with adjustable size
 * @param text - The text to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 200)
 * @returns Promise that resolves to a data URL of the QR code image
 */
export const generateQRCode = async (
  text: string,
  size: number = 200
): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    console.log({dataUrl})
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as SVG string from text with adjustable size
 * @param text - The text to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 200)
 * @returns Promise that resolves to an SVG string of the QR code
 */
export const generateQRCodeSVG = async (
  text: string,
  size: number = 200
): Promise<string> => {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    return svgString;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
};
