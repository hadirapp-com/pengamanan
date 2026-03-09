import { useDrag } from 'react-dnd';
import { 
  Type, 
  Hash, 
  QrCode, 
  Minus, 
  Square, 
  Circle, 
  Image, 
  FileText,
  Calendar,
  Hash as NumberIcon,
  CheckSquare,
  User,
  Package,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ElementType, FieldType } from '../types/label-types';

interface FieldPaletteProps {
  onAddElement: (type: ElementType, fieldType?: FieldType) => void;
}

interface DraggableFieldProps {
  type: ElementType;
  fieldType?: FieldType;
  icon: React.ReactNode;
  label: string;
  description: string;
  onAdd: () => void;
}

const DraggableField = ({ type, fieldType, icon, label, description, onAdd }: DraggableFieldProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: { type, fieldType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      // @ts-ignore
      ref={drag}
      className={`
        p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={onAdd}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-gray-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500 truncate">{description}</div>
        </div>
        {fieldType && (
          <Badge variant="outline" className="text-xs">
            {fieldType}
          </Badge>
        )}
      </div>
    </div>
  );
};

export function FieldPalette({ onAddElement }: FieldPaletteProps) {
  const staticFields = [
    {
      type: 'text' as ElementType,
      fieldType: 'static' as FieldType,
      icon: <Type className="h-5 w-5" />,
      label: 'Static Text',
      description: 'Fixed text that doesn\'t change',
    },
    {
      type: 'barcode' as ElementType,
      fieldType: 'static' as FieldType,
      icon: <Hash className="h-5 w-5" />,
      label: 'Static Barcode',
      description: 'Fixed barcode value',
    },
    {
      type: 'qrcode' as ElementType,
      fieldType: 'static' as FieldType,
      icon: <QrCode className="h-5 w-5" />,
      label: 'Static QR Code',
      description: 'Fixed QR code data',
    },
  ];

  const dynamicFields = [
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <FileText className="h-5 w-5" />,
      label: 'Part Name',
      description: 'Dynamic part name field',
      fieldName: 'partName',
    },
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <Package className="h-5 w-5" />,
      label: 'Part Number',
      description: 'Dynamic part number field',
      fieldName: 'partNo',
    },
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <Tag className="h-5 w-5" />,
      label: 'Color Code',
      description: 'Dynamic color code field',
      fieldName: 'colorCode',
    },
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <User className="h-5 w-5" />,
      label: 'Customer Name',
      description: 'Dynamic customer name field',
      fieldName: 'customerName',
    },
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <Calendar className="h-5 w-5" />,
      label: 'Production Date',
      description: 'Dynamic production date field',
      fieldName: 'prodDate',
    },
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <NumberIcon className="h-5 w-5" />,
      label: 'Quantity',
      description: 'Dynamic quantity field',
      fieldName: 'qty',
    },
    {
      type: 'text' as ElementType,
      fieldType: 'dynamic' as FieldType,
      icon: <CheckSquare className="h-5 w-5" />,
      label: 'Serial Number',
      description: 'Dynamic serial number field',
      fieldName: 'serialNumber',
    },
  ];

  const drawingTools = [
    {
      type: 'line' as ElementType,
      icon: <Minus className="h-5 w-5" />,
      label: 'Line',
      description: 'Draw straight lines',
    },
    {
      type: 'shape' as ElementType,
      icon: <Square className="h-5 w-5" />,
      label: 'Rectangle',
      description: 'Add rectangular shapes',
    },
    {
      type: 'shape' as ElementType,
      icon: <Circle className="h-5 w-5" />,
      label: 'Circle',
      description: 'Add circular shapes',
    },
  ];

  const mediaElements = [
    {
      type: 'image' as ElementType,
      icon: <Image className="h-5 w-5" />,
      label: 'Image',
      description: 'Add images or logos',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Label Designer</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop elements to create your label design
        </p>
      </div>

      {/* Static Fields */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Static Fields</h4>
        <div className="space-y-2">
          {staticFields.map((field) => (
            <DraggableField
              key={`${field.type}-${field.fieldType}`}
              type={field.type}
              fieldType={field.fieldType}
              icon={field.icon}
              label={field.label}
              description={field.description}
              onAdd={() => onAddElement(field.type, field.fieldType)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Dynamic Fields */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Dynamic Fields</h4>
        <div className="space-y-2">
          {dynamicFields.map((field) => (
            <DraggableField
              key={`${field.type}-${field.fieldType}-${field.fieldName}`}
              type={field.type}
              fieldType={field.fieldType}
              icon={field.icon}
              label={field.label}
              description={field.description}
              onAdd={() => onAddElement(field.type, field.fieldType)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Drawing Tools */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Drawing Tools</h4>
        <div className="space-y-2">
          {drawingTools.map((tool) => (
            <DraggableField
              key={tool.type}
              type={tool.type}
              icon={tool.icon}
              label={tool.label}
              description={tool.description}
              onAdd={() => onAddElement(tool.type)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Media Elements */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Media</h4>
        <div className="space-y-2">
          {mediaElements.map((media) => (
            <DraggableField
              key={media.type}
              type={media.type}
              icon={media.icon}
              label={media.label}
              description={media.description}
              onAdd={() => onAddElement(media.type)}
            />
          ))}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="pt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Quick Add</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('text', 'static')}
            className="text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('barcode', 'static')}
            className="text-xs"
          >
            <Hash className="h-3 w-3 mr-1" />
            Barcode
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('qrcode', 'static')}
            className="text-xs"
          >
            <QrCode className="h-3 w-3 mr-1" />
            QR Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('line')}
            className="text-xs"
          >
            <Minus className="h-3 w-3 mr-1" />
            Line
          </Button>
        </div>
      </div>
    </div>
  );
}
