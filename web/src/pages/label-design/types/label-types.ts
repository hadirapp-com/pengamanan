export type ElementType = 'text' | 'barcode' | 'qrcode' | 'line' | 'shape' | 'image';
export type FieldType = 'static' | 'dynamic';
export type BarcodeType = 'code39' | 'code128' | 'ean13' | 'ean8' | 'upc';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type ShapeType = 'rectangle' | 'circle' | 'ellipse' | 'triangle';
export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface LabelSize {
  width: number;
  height: number;
}

export interface ElementProperties {
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  color?: string;
  backgroundColor?: string;
  fieldType?: FieldType;
  fieldName?: string;
  
  // Barcode properties
  barcodeType?: BarcodeType;
  barcodeData?: string;
  
  // QR Code properties
  qrCodeData?: string;
  qrCodeErrorCorrection?: 'L' | 'M' | 'Q' | 'H';
  
  // Line properties
  lineStyle?: LineStyle;
  lineWidth?: number;
  lineColor?: string;
  
  // Shape properties
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Image properties
  imageUrl?: string;
  imageScale?: number;
  
  // Common properties
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
}

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties: ElementProperties;
}

export interface LabelDesign {
  id: string;
  name: string;
  description?: string;
  labelSize: LabelSize;
  elements: LabelElement[];
  createdAt: string;
  updatedAt: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  labelSize: LabelSize;
  elements: LabelElement[];
  thumbnail?: string;
}

export interface FieldMapping {
  fieldName: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  required?: boolean;
}

export interface PrintData {
  partId: string;
  qtyLabel: number;
  qtyPart: number;
  serialFrom?: string;
  serialEnd?: string;
  customFields?: Record<string, any>;
}

export interface LabelDesignState {
  elements: LabelElement[];
  selectedElement: LabelElement | null;
  labelSize: LabelSize;
  zoom: number;
  history: LabelElement[][];
  historyIndex: number;
  maxHistorySize: number;
}

export interface CanvasSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;
  backgroundColor: string;
}

export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg';
  resolution: number;
  includeBackground: boolean;
  margin: number;
}
