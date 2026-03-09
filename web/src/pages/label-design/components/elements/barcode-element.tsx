import type { LabelElement } from '../../types/label-types';

interface BarcodeElementProps {
  element: LabelElement;
}

// Simple Code 39 barcode pattern generator
const code39Patterns: Record<string, string> = {
  '0': '101001101101',
  '1': '110100101011',
  '2': '101100101011',
  '3': '110110010101',
  '4': '101001101011',
  '5': '110100110101',
  '6': '101100110101',
  '7': '101001011011',
  '8': '110100101101',
  '9': '101100101101',
  'A': '110101001011',
  'B': '101101001011',
  'C': '110110100101',
  'D': '101011001011',
  'E': '110101100101',
  'F': '101101100101',
  'G': '101010011011',
  'H': '110101001101',
  'I': '101101001101',
  'J': '101011001101',
  'K': '110101010011',
  'L': '101101010011',
  'M': '110110101001',
  'N': '101011010011',
  'O': '110101101001',
  'P': '101101101001',
  'Q': '101010110011',
  'R': '110101011001',
  'S': '101101011001',
  'T': '101011011001',
  'U': '110010101011',
  'V': '100110101011',
  'W': '110011010101',
  'X': '100101101011',
  'Y': '110010110101',
  'Z': '100110110101',
  '-': '100101011011',
  '.': '110010101101',
  ' ': '100110101101',
  '$': '100100100101',
  '/': '100100101001',
  '+': '100101001001',
  '%': '101001001001',
  '*': '100101101101', // Start/Stop character
};

const generateCode39Barcode = (text: string): string => {
  const pattern = text.toUpperCase().split('').map(char => {
    return code39Patterns[char] || code39Patterns[' '];
  }).join('0');
  
  // Add start and stop characters
  return `1001011011010${pattern}0101101101`;
};

export function BarcodeElement({ element }: BarcodeElementProps) {
  const {
    barcodeType = 'code39',
    barcodeData = 'SAMPLE123',
    fieldType = 'static',
    fieldName = '',
    color = '#000000',
  } = element.properties;

  const getBarcodeData = () => {
    if (fieldType === 'dynamic') {
      switch (fieldName) {
        case 'partNo':
          return 'SAMPLE-001';
        case 'serialNumber':
          return 'SN123456789';
        default:
          return barcodeData;
      }
    }
    return barcodeData;
  };

  const renderCode39Barcode = () => {
    const data = getBarcodeData();
    const pattern = generateCode39Barcode(data);
    const barWidth = 1; // Width of each bar in pixels
    const barHeight = element.height * 3.779527559; // Convert mm to pixels
    
    const bars = [];
    let x = 0;
    
    for (let i = 0; i < pattern.length; i++) {
      const isBar = pattern[i] === '1';
      if (isBar) {
        bars.push(
          <rect
            key={i}
            x={x}
            y={0}
            width={barWidth}
            height={barHeight}
            fill={color}
          />
        );
      }
      x += barWidth;
    }
    
    return (
      <svg
        width={pattern.length * barWidth}
        height={barHeight}
        viewBox={`0 0 ${pattern.length * barWidth} ${barHeight}`}
        className="w-full h-full"
      >
        {bars}
        {/* Barcode text */}
        <text
          x={pattern.length * barWidth / 2}
          y={barHeight + 12}
          textAnchor="middle"
          fontSize="10"
          fill={color}
          fontFamily="monospace"
        >
          {data}
        </text>
      </svg>
    );
  };

  const renderCode128Barcode = () => {
    // Simplified Code 128 representation
    const data = getBarcodeData();
    const barHeight = element.height * 3.779527559;
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="flex items-center space-x-px">
          {data.split('').map((_, index) => (
            <div
              key={index}
              className="bg-black"
              style={{
                width: '2px',
                height: `${barHeight}px`,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
        <div
          className="text-xs mt-1 font-mono"
          style={{ color }}
        >
          {data}
        </div>
      </div>
    );
  };

  const renderEAN13Barcode = () => {
    // Simplified EAN-13 representation
    const data = getBarcodeData().padStart(13, '0');
    const barHeight = element.height * 3.779527559;
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="flex items-center space-x-px">
          {data.split('').map((_, index) => (
            <div
              key={index}
              className="bg-black"
              style={{
                width: '1px',
                height: `${barHeight}px`,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
        <div
          className="text-xs mt-1 font-mono"
          style={{ color }}
        >
          {data}
        </div>
      </div>
    );
  };

  const renderBarcode = () => {
    switch (barcodeType) {
      case 'code39':
        return renderCode39Barcode();
      case 'code128':
        return renderCode128Barcode();
      case 'ean13':
        return renderEAN13Barcode();
      case 'ean8':
        return renderEAN13Barcode(); // Simplified, same as EAN-13
      case 'upc':
        return renderEAN13Barcode(); // Simplified, same as EAN-13
      default:
        return renderCode39Barcode();
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        border: '1px dashed #ccc',
        borderRadius: '2px',
        padding: '2px',
      }}
    >
      {renderBarcode()}
    </div>
  );
}
