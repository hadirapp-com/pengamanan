import { useRef, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import type { LabelElement, LabelSize } from '../types/label-types';
import { LabelElementRenderer } from './label-element-renderer';
import { ResizeHandle } from './resize-handle';

interface LabelCanvasProps {
  elements: LabelElement[];
  selectedElement: LabelElement | null;
  zoom: number;
  labelSize: LabelSize;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  onCanvasClick: (e: React.MouseEvent) => void;
  onElementSelect: (elementId: string) => void;
  onElementUpdate: (elementId: string, updates: Partial<LabelElement>) => void;
  onElementDelete: (elementId: string) => void;
}

export function LabelCanvas({
  elements,
  selectedElement,
  zoom,
  labelSize,
  showGrid,
  snapToGrid,
  gridSize,
  showRulers,
  onCanvasClick,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
}: LabelCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Convert mm to pixels (assuming 96 DPI)
  const mmToPixels = (mm: number) => (mm * 96) / 25.4;
  const pixelsToMm = (pixels: number) => (pixels * 25.4) / 96;

  const canvasWidth = mmToPixels(labelSize.width);
  const canvasHeight = mmToPixels(labelSize.height);

  // Handle drop from field palette
  const [{ isOver }, drop] = useDrop({
    accept: 'FIELD',
    drop: (item: { type: string; fieldType?: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = (offset.x - canvasRect.left) / (zoom / 100);
        const y = (offset.y - canvasRect.top) / (zoom / 100);
        
        // Snap to grid if enabled
        const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
        const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
        
        // Convert to mm
        const xMm = pixelsToMm(snappedX);
        const yMm = pixelsToMm(snappedY);
        
        // Create new element
        const newElement: LabelElement = {
          id: `element-${Date.now()}`,
          type: item.type as any,
          x: xMm,
          y: yMm,
          width: item.type === 'text' ? 25 : item.type === 'barcode' ? 30 : item.type === 'qrcode' ? 15 : 25,
          height: item.type === 'text' ? 5 : item.type === 'barcode' ? 10 : item.type === 'qrcode' ? 15 : 1,
          rotation: 0,
          properties: {
            text: item.type === 'text' ? 'Sample Text' : '',
            fontSize: 12,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#000000',
            backgroundColor: 'transparent',
            // @ts-ignore
            fieldType: item.fieldType || 'static',
            fieldName: item.fieldType === 'dynamic' ? 'partName' : '',
            barcodeType: item.type === 'barcode' ? 'code39' : undefined,
            qrCodeData: item.type === 'qrcode' ? 'Sample QR Data' : undefined,
            lineStyle: item.type === 'line' ? 'solid' : undefined,
            lineWidth: item.type === 'line' ? 1 : undefined,
            shapeType: item.type === 'shape' ? 'rectangle' : undefined,
          }
        };
        
        // Add element to canvas (this should be handled by the parent component)
        console.log('Dropped element:', newElement);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Handle element drag start
  const handleElementDragStart = useCallback((e: React.MouseEvent, element: LabelElement) => {
    if (e.target !== e.currentTarget) return;
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    onElementSelect(element.id);
  }, [onElementSelect]);

  // Handle element drag
  const handleElementDrag = useCallback((e: React.MouseEvent, element: LabelElement) => {
    if (!isDragging || !canvasRef.current) return;
    
    e.preventDefault();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left - dragOffset.x) / (zoom / 100);
    const y = (e.clientY - canvasRect.top - dragOffset.y) / (zoom / 100);
    
    // Snap to grid if enabled
    const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
    
    // Convert to mm and ensure element stays within canvas bounds
    const xMm = Math.max(0, Math.min(pixelsToMm(snappedX), labelSize.width - element.width));
    const yMm = Math.max(0, Math.min(pixelsToMm(snappedY), labelSize.height - element.height));
    
    onElementUpdate(element.id, { x: xMm, y: yMm });
  }, [isDragging, dragOffset, zoom, snapToGrid, gridSize, labelSize, onElementUpdate]);

  // Handle element drag end
  const handleElementDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedElement) return;
    
    const moveAmount = e.shiftKey ? 5 : 1; // Shift for larger movements
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onElementUpdate(selectedElement.id, { 
          x: Math.max(0, selectedElement.x - moveAmount) 
        });
        break;
      case 'ArrowRight':
        e.preventDefault();
        onElementUpdate(selectedElement.id, { 
          x: Math.min(labelSize.width - selectedElement.width, selectedElement.x + moveAmount) 
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        onElementUpdate(selectedElement.id, { 
          y: Math.max(0, selectedElement.y - moveAmount) 
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        onElementUpdate(selectedElement.id, { 
          y: Math.min(labelSize.height - selectedElement.height, selectedElement.y + moveAmount) 
        });
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onElementDelete(selectedElement.id);
        break;
    }
  }, [selectedElement, labelSize, onElementUpdate, onElementDelete]);

  // Add keyboard event listener
  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Generate grid lines
  const generateGridLines = () => {
    if (!showGrid) return null;
    
    const lines = [];
    const step = mmToPixels(gridSize);
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += step) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += step) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      );
    }
    
    return lines;
  };

  // Generate ruler marks
  const generateRulerMarks = () => {
    if (!showRulers) return null;
    
    const marks = [];
    const step = mmToPixels(5); // 5mm marks
    
    // Top ruler
    for (let x = 0; x <= canvasWidth; x += step) {
      const mm = Math.round(pixelsToMm(x));
      marks.push(
        <g key={`top-${x}`}>
          <line
            x1={x}
            y1={-15}
            x2={x}
            y2={-5}
            stroke="#6b7280"
            strokeWidth="1"
          />
          {mm % 10 === 0 && (
            <text
              x={x}
              y={-20}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {mm}
            </text>
          )}
        </g>
      );
    }
    
    // Left ruler
    for (let y = 0; y <= canvasHeight; y += step) {
      const mm = Math.round(pixelsToMm(y));
      marks.push(
        <g key={`left-${y}`}>
          <line
            x1={-15}
            y1={y}
            x2={-5}
            y2={y}
            stroke="#6b7280"
            strokeWidth="1"
          />
          {mm % 10 === 0 && (
            <text
              x={-20}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {mm}
            </text>
          )}
        </g>
      );
    }
    
    return marks;
  };

  return (
    <div className="relative">
      {/* Rulers */}
      {showRulers && (
        <svg
          className="absolute pointer-events-none"
          width={canvasWidth + 30}
          height={canvasHeight + 30}
          style={{ left: -30, top: -30 }}
        >
          <rect
            x={-30}
            y={-30}
            width={canvasWidth + 30}
            height={canvasHeight + 30}
            fill="white"
            stroke="#d1d5db"
            strokeWidth="1"
          />
          {generateRulerMarks()}
        </svg>
      )}
      
      {/* Canvas */}
      <div
        ref={(node) => {
          canvasRef.current = node;
          drop(node);
        }}
        className={`
          relative bg-white border-2 border-gray-300 shadow-lg cursor-crosshair
          ${isOver ? 'border-blue-500 bg-blue-50' : ''}
        `}
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left',
        }}
        onClick={onCanvasClick}
      >
        {/* Grid */}
        {showGrid && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
            {generateGridLines()}
          </svg>
        )}
        
        {/* Elements */}
        {elements.map((element) => (
          <div
            key={element.id}
            className={`
              absolute cursor-move select-none
              ${selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''}
            `}
            style={{
              left: mmToPixels(element.x),
              top: mmToPixels(element.y),
              width: mmToPixels(element.width),
              height: mmToPixels(element.height),
              transform: `rotate(${element.rotation}deg)`,
            }}
            onMouseDown={(e) => handleElementDragStart(e, element)}
            onMouseMove={(e) => handleElementDrag(e, element)}
            onMouseUp={handleElementDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(element.id);
            }}
          >
            <LabelElementRenderer element={element} />
            
            {/* Resize handles */}
            {selectedElement?.id === element.id && (
              <ResizeHandle
                element={element}
                onResize={(updates) => onElementUpdate(element.id, updates)}
                labelSize={labelSize}
              />
            )}
          </div>
        ))}
        
        {/* Canvas border indicator */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border border-dashed border-gray-400"></div>
        </div>
      </div>
      
      {/* Canvas info */}
      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow">
        {labelSize.width}mm × {labelSize.height}mm | {zoom}%
      </div>
    </div>
  );
}
