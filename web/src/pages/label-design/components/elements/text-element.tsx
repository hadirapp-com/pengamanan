import type { LabelElement } from '../../types/label-types';

interface TextElementProps {
  element: LabelElement;
}

export function TextElement({ element }: TextElementProps) {
  const {
    text = 'Sample Text',
    fontSize = 12,
    fontFamily = 'Arial',
    fontWeight = 'normal',
    color = '#000000',
    backgroundColor = 'transparent',
    fieldType = 'static',
    fieldName = '',
  } = element.properties;

  // Convert mm to pixels for font size
  const mmToPixels = (mm: number) => (mm * 96) / 25.4;
  const fontSizePx = mmToPixels(fontSize / 10); // Convert from mm to pixels

  const getDisplayText = () => {
    if (fieldType === 'dynamic') {
      // In a real implementation, this would get data from the current record
      switch (fieldName) {
        case 'partName':
          return 'Sample Part Name';
        case 'partNo':
          return 'SAMPLE-001';
        case 'colorCode':
          return 'BLACK';
        case 'customerName':
          return 'Sample Customer';
        case 'prodDate':
          return '2024-01-15';
        case 'qty':
          return '100';
        case 'serialNumber':
          return 'SN123456789';
        default:
          return text;
      }
    }
    return text;
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
        color,
        fontSize: `${fontSizePx}px`,
        fontFamily,
        fontWeight,
        textAlign: 'center' as const,
        lineHeight: '1.2',
        padding: '1px',
        border: '1px dashed #ccc',
        borderRadius: '2px',
      }}
    >
      <span className="truncate w-full">
        {getDisplayText()}
      </span>
    </div>
  );
}
