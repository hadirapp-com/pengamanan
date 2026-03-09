import type { LabelElement } from '../types/label-types';
import { TextElement } from './elements/text-element';
import { BarcodeElement } from './elements/barcode-element';
import { QRCodeElement } from './elements/qrcode-element';
import { LineElement } from './elements/line-element';
import { ShapeElement } from './elements/shape-element';
import { ImageElement } from './elements/image-element';

interface LabelElementRendererProps {
  element: LabelElement;
}

export function LabelElementRenderer({ element }: LabelElementRendererProps) {
  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return <TextElement element={element} />;
      case 'barcode':
        return <BarcodeElement element={element} />;
      case 'qrcode':
        return <QRCodeElement element={element} />;
      case 'line':
        return <LineElement element={element} />;
      case 'shape':
        return <ShapeElement element={element} />;
      case 'image':
        return <ImageElement element={element} />;
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <div className="w-full h-full">
      {renderElement()}
    </div>
  );
}
