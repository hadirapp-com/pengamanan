import type { LabelElement } from '../../types/label-types';

interface QRCodeElementProps {
  element: LabelElement;
}

// Simple QR Code pattern generator (simplified representation)
const generateSimpleQRCode = (data: string, size: number = 21): boolean[][] => {
  // This is a simplified QR code generator for demonstration
  // In a real implementation, you would use a proper QR code library
  
  const qrCode: boolean[][] = [];
  const dataLength = data.length;
  
  // Create a simple pattern based on the data
  for (let i = 0; i < size; i++) {
    qrCode[i] = [];
    for (let j = 0; j < size; j++) {
      // Create a pattern based on data characters
      const charIndex = (i * size + j) % dataLength;
      const charCode = data.charCodeAt(charIndex) || 0;
      qrCode[i][j] = (charCode + i + j) % 2 === 0;
    }
  }
  
  // Add finder patterns (simplified)
  // Top-left
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i === 0 || i === 6 || j === 0 || j === 6) || 
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
        qrCode[i][j] = true;
      }
    }
  }
  
  // Top-right
  for (let i = 0; i < 7; i++) {
    for (let j = size - 7; j < size; j++) {
      if ((i === 0 || i === 6 || j === size - 7 || j === size - 1) || 
          (i >= 2 && i <= 4 && j >= size - 5 && j <= size - 3)) {
        qrCode[i][j] = true;
      }
    }
  }
  
  // Bottom-left
  for (let i = size - 7; i < size; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i === size - 7 || i === size - 1 || j === 0 || j === 6) || 
          (i >= size - 5 && i <= size - 3 && j >= 2 && j <= 4)) {
        qrCode[i][j] = true;
      }
    }
  }
  
  return qrCode;
};

export function QRCodeElement({ element }: QRCodeElementProps) {
  const {
    qrCodeData = 'Sample QR Data',
    fieldType = 'static',
    fieldName = '',
    color = '#000000',
  } = element.properties;

  const getQRCodeData = () => {
    if (fieldType === 'dynamic') {
      switch (fieldName) {
        case 'partNo':
          return 'SAMPLE-001';
        case 'serialNumber':
          return 'SN123456789';
        case 'partName':
          return 'Sample Part Name';
        default:
          return qrCodeData;
      }
    }
    return qrCodeData;
  };

  const renderQRCode = () => {
    const data = getQRCodeData();
    const qrCode = generateSimpleQRCode(data);
    const cellSize = Math.min(element.width, element.height) / qrCode.length;
    
    return (
      <svg
        width={qrCode.length * cellSize}
        height={qrCode.length * cellSize}
        viewBox={`0 0 ${qrCode.length} ${qrCode.length}`}
        className="w-full h-full"
      >
        {qrCode.map((row, i) =>
          row.map((cell, j) => (
            <rect
              key={`${i}-${j}`}
              x={j}
              y={i}
              width={1}
              height={1}
              fill={cell ? color : 'white'}
            />
          ))
        )}
      </svg>
    );
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
      {renderQRCode()}
    </div>
  );
}
