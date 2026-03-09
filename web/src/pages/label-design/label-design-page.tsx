import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Save,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UiContainer from "@/components/ui/layout/ui-container";

import { LabelCanvas } from "./components/label-canvas";
import { FieldPalette } from "./components/field-palette";
import { PropertiesPanel } from "./components/properties-panel";
import { useLabelDesignStore } from "./store/label-design-store";
import type { LabelElement, ElementType, FieldType } from "./types/label-types";

export function LabelDesignPage() {
  const {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    labelSize,
    setLabelSize,
    saveDesign,
    exportDesign,
  } = useLabelDesignStore();

  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize,] = useState(5);
  const [showRulers, setShowRulers] = useState(true);

  const handleAddElement = useCallback(
    (type: ElementType, fieldType?: FieldType) => {
      const newElement: LabelElement = {
        id: `element-${Date.now()}`,
        type,
        x: 10,
        y: 10,
        width:
          type === "text"
            ? 100
            : type === "barcode"
            ? 120
            : type === "qrcode"
            ? 50
            : 100,
        height:
          type === "text"
            ? 20
            : type === "barcode"
            ? 40
            : type === "qrcode"
            ? 50
            : 2,
        rotation: 0,
        properties: {
          text: type === "text" ? "Sample Text" : "",
          fontSize: 12,
          fontFamily: "Arial",
          fontWeight: "normal",
          color: "#000000",
          backgroundColor: "transparent",
          fieldType: fieldType || "static",
          fieldName: fieldType === "dynamic" ? "partName" : "",
          barcodeType: type === "barcode" ? "code39" : undefined,
          qrCodeData: type === "qrcode" ? "Sample QR Data" : "",
          lineStyle: type === "line" ? "solid" : undefined,
          lineWidth: type === "line" ? 1 : undefined,
          shapeType: type === "shape" ? "rectangle" : undefined,
          imageUrl: type === "image" ? "" : undefined,
        },
      };
      addElement(newElement);
      selectElement(newElement.id);
    },
    [addElement, selectElement]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleElementSelect = useCallback(
    (elementId: string) => {
      selectElement(elementId);
    },
    [selectElement]
  );

  const handleElementUpdate = useCallback(
    (elementId: string, updates: Partial<LabelElement>) => {
      updateElement(elementId, updates);
    },
    [updateElement]
  );

  const handleElementDelete = useCallback(
    (elementId: string) => {
      deleteElement(elementId);
    },
    [deleteElement]
  );

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const labelSizes = [
    { name: "Small (90x60mm)", width: 90, height: 60 },
    { name: "Medium (135x90mm)", width: 135, height: 90 },
    { name: "Large (180x120mm)", width: 180, height: 120 },
    { name: "Custom", width: 135, height: 90 },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <UiContainer>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div>
              <h1 className="text-2xl font-bold">Label Designer</h1>
              <p className="text-muted-foreground">
                Create and customize label designs with drag & drop
                functionality
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={undo} disabled={!canUndo}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={redo} disabled={!canRedo}>
                <Redo className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Badge variant="outline">{zoom}%</Badge>
              <Button variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleResetZoom}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" onClick={() => saveDesign()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={exportDesign}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Field Palette */}
            <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
              <FieldPalette onAddElement={handleAddElement} />
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Canvas Toolbar */}
              <div className="flex items-center justify-between p-2 border-b bg-white">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="label-size" className="text-sm font-medium">
                      Label Size:
                    </Label>
                    <Select
                      value={`${labelSize.width}x${labelSize.height}`}
                      onValueChange={(value) => {
                        const size = labelSizes.find(
                          (s) => `${s.width}x${s.height}` === value
                        );
                        if (size) {
                          setLabelSize({
                            width: size.width,
                            height: size.height,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {labelSizes.map((size) => (
                          <SelectItem
                            key={`${size.width}x${size.height}`}
                            value={`${size.width}x${size.height}`}
                          >
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2">
                    <Button
                      variant={showGrid ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={snapToGrid ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSnapToGrid(!snapToGrid)}
                    >
                      Snap
                    </Button>
                    <Button
                      variant={showRulers ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowRulers(!showRulers)}
                    >
                      Rulers
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {elements.length} elements
                  </span>
                  {selectedElement && (
                    <Badge variant="secondary">
                      Selected: {selectedElement.type}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-gray-100 p-4 overflow-auto">
                <div className="flex justify-center items-start min-h-full">
                  <LabelCanvas
                    elements={elements}
                    selectedElement={selectedElement}
                    zoom={zoom}
                    labelSize={labelSize}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                    gridSize={gridSize}
                    showRulers={showRulers}
                    onCanvasClick={handleCanvasClick}
                    onElementSelect={handleElementSelect}
                    onElementUpdate={handleElementUpdate}
                    onElementDelete={handleElementDelete}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar - Properties Panel */}
            <div className="w-80 border-l bg-white p-4 overflow-y-auto">
              <PropertiesPanel
                selectedElement={selectedElement}
                onUpdateElement={handleElementUpdate}
                onDeleteElement={handleElementDelete}
              />
            </div>
          </div>
        </div>
      </UiContainer>
    </DndProvider>
  );
}
