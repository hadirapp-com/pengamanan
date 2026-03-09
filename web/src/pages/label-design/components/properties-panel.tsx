import { useState } from 'react';
import { Trash2, Copy, RotateCw, Move, Type, Hash, QrCode, Minus, Square, Image } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LabelElement } from '../types/label-types';

interface PropertiesPanelProps {
  selectedElement: LabelElement | null;
  onUpdateElement: (elementId: string, updates: Partial<LabelElement>) => void;
  onDeleteElement: (elementId: string) => void;
}

export function PropertiesPanel({ 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement 
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('position');

  if (!selectedElement) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Properties</h3>
        <p className="text-sm text-gray-500">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    if (property.includes('.')) {
      const [, prop] = property.split('.');
      onUpdateElement(selectedElement.id, {
        properties: {
          ...selectedElement.properties,
          [prop]: value,
        },
      });
    } else {
      onUpdateElement(selectedElement.id, { [property]: value });
    }
  };

  const getElementIcon = () => {
    switch (selectedElement.type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'barcode':
        return <Hash className="h-4 w-4" />;
      case 'qrcode':
        return <QrCode className="h-4 w-4" />;
      case 'line':
        return <Minus className="h-4 w-4" />;
      case 'shape':
        return <Square className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <Move className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Element Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getElementIcon()}
          <div>
            <h3 className="font-semibold capitalize">{selectedElement.type}</h3>
            <p className="text-xs text-gray-500">ID: {selectedElement.id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle duplicate
              console.log('Duplicate element');
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Properties Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="position">Position</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Position Tab */}
        <TabsContent value="position" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x">X (mm)</Label>
              <Input
                id="x"
                type="number"
                value={Math.round(selectedElement.x * 10) / 10}
                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value))}
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="y">Y (mm)</Label>
              <Input
                id="y"
                type="number"
                value={Math.round(selectedElement.y * 10) / 10}
                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value))}
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width">Width (mm)</Label>
              <Input
                id="width"
                type="number"
                value={Math.round(selectedElement.width * 10) / 10}
                onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                step="0.1"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (mm)</Label>
              <Input
                id="height"
                type="number"
                value={Math.round(selectedElement.height * 10) / 10}
                onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value))}
                step="0.1"
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rotation">Rotation (°)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rotation"
                type="number"
                value={selectedElement.rotation}
                onChange={(e) => handlePropertyChange('rotation', parseFloat(e.target.value))}
                step="1"
                min="-360"
                max="360"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePropertyChange('rotation', 0)}
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          {selectedElement.type === 'text' && (
            <>
              <div>
                <Label htmlFor="text">Text</Label>
                <Input
                  id="text"
                  value={selectedElement.properties.text || ''}
                  onChange={(e) => handlePropertyChange('properties.text', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fontSize">Font Size (pt)</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={selectedElement.properties.fontSize || 12}
                    onChange={(e) => handlePropertyChange('properties.fontSize', parseInt(e.target.value))}
                    min="6"
                    max="72"
                  />
                </div>
                <div>
                  <Label htmlFor="fontFamily">Font</Label>
                  <Select
                    value={selectedElement.properties.fontFamily || 'Arial'}
                    onValueChange={(value) => handlePropertyChange('properties.fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select
                  value={selectedElement.properties.fontWeight || 'normal'}
                  onValueChange={(value) => handlePropertyChange('properties.fontWeight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="600">600</SelectItem>
                    <SelectItem value="700">700</SelectItem>
                    <SelectItem value="800">800</SelectItem>
                    <SelectItem value="900">900</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedElement.type === 'barcode' && (
            <>
              <div>
                <Label htmlFor="barcodeData">Barcode Data</Label>
                <Input
                  id="barcodeData"
                  value={selectedElement.properties.barcodeData || ''}
                  onChange={(e) => handlePropertyChange('properties.barcodeData', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="barcodeType">Barcode Type</Label>
                <Select
                  value={selectedElement.properties.barcodeType || 'code39'}
                  onValueChange={(value) => handlePropertyChange('properties.barcodeType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code39">Code 39</SelectItem>
                    <SelectItem value="code128">Code 128</SelectItem>
                    <SelectItem value="ean13">EAN-13</SelectItem>
                    <SelectItem value="ean8">EAN-8</SelectItem>
                    <SelectItem value="upc">UPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedElement.type === 'qrcode' && (
            <>
              <div>
                <Label htmlFor="qrCodeData">QR Code Data</Label>
                <Input
                  id="qrCodeData"
                  value={selectedElement.properties.qrCodeData || ''}
                  onChange={(e) => handlePropertyChange('properties.qrCodeData', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="qrCodeErrorCorrection">Error Correction</Label>
                <Select
                  value={selectedElement.properties.qrCodeErrorCorrection || 'M'}
                  onValueChange={(value) => handlePropertyChange('properties.qrCodeErrorCorrection', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedElement.type === 'line' && (
            <>
              <div>
                <Label htmlFor="lineStyle">Line Style</Label>
                <Select
                  value={selectedElement.properties.lineStyle || 'solid'}
                  onValueChange={(value) => handlePropertyChange('properties.lineStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lineWidth">Line Width (mm)</Label>
                <Input
                  id="lineWidth"
                  type="number"
                  value={selectedElement.properties.lineWidth || 1}
                  onChange={(e) => handlePropertyChange('properties.lineWidth', parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
            </>
          )}

          {selectedElement.type === 'shape' && (
            <>
              <div>
                <Label htmlFor="shapeType">Shape Type</Label>
                <Select
                  value={selectedElement.properties.shapeType || 'rectangle'}
                  onValueChange={(value) => handlePropertyChange('properties.shapeType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="ellipse">Ellipse</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="strokeWidth">Stroke Width (mm)</Label>
                <Input
                  id="strokeWidth"
                  type="number"
                  value={selectedElement.properties.strokeWidth || 1}
                  onChange={(e) => handlePropertyChange('properties.strokeWidth', parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                />
              </div>
            </>
          )}

          {/* Common color properties */}
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={selectedElement.properties.color || '#000000'}
              onChange={(e) => handlePropertyChange('properties.color', e.target.value)}
            />
          </div>

          {selectedElement.type === 'text' && (
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={selectedElement.properties.backgroundColor || '#ffffff'}
                onChange={(e) => handlePropertyChange('properties.backgroundColor', e.target.value)}
              />
            </div>
          )}
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <div>
            <Label htmlFor="fieldType">Field Type</Label>
            <Select
              value={selectedElement.properties.fieldType || 'static'}
              onValueChange={(value) => handlePropertyChange('properties.fieldType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedElement.properties.fieldType === 'dynamic' && (
            <div>
              <Label htmlFor="fieldName">Field Name</Label>
              <Select
                value={selectedElement.properties.fieldName || ''}
                onValueChange={(value) => handlePropertyChange('properties.fieldName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partName">Part Name</SelectItem>
                  <SelectItem value="partNo">Part Number</SelectItem>
                  <SelectItem value="colorCode">Color Code</SelectItem>
                  <SelectItem value="customerName">Customer Name</SelectItem>
                  <SelectItem value="prodDate">Production Date</SelectItem>
                  <SelectItem value="qty">Quantity</SelectItem>
                  <SelectItem value="serialNumber">Serial Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {selectedElement.properties.fieldType === 'dynamic' 
                ? `Dynamic: ${selectedElement.properties.fieldName || 'Not set'}`
                : 'Static field'
              }
            </Badge>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
