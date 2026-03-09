import type { LabelElement } from '../../types/label-types';

interface ShapeElementProps {
  element: LabelElement;
}

export function ShapeElement({ element }: ShapeElementProps) {
  const {
    shapeType = 'rectangle',
    fillColor = 'transparent',
    strokeColor = '#000000',
    strokeWidth = 1,
  } = element.properties;

  const renderRectangle = () => (
    <rect
      x={strokeWidth / 2}
      y={strokeWidth / 2}
      width={element.width - strokeWidth}
      height={element.height - strokeWidth}
      fill={fillColor === 'transparent' ? 'none' : fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );

  const renderCircle = () => {
    const radius = Math.min(element.width, element.height) / 2 - strokeWidth / 2;
    const cx = element.width / 2;
    const cy = element.height / 2;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor === 'transparent' ? 'none' : fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  };

  const renderEllipse = () => {
    const rx = (element.width - strokeWidth) / 2;
    const ry = (element.height - strokeWidth) / 2;
    const cx = element.width / 2;
    const cy = element.height / 2;
    
    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fillColor === 'transparent' ? 'none' : fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  };

  const renderTriangle = () => {
    const points = [
      `${element.width / 2},${strokeWidth}`,
      `${strokeWidth},${element.height - strokeWidth}`,
      `${element.width - strokeWidth},${element.height - strokeWidth}`,
    ].join(' ');
    
    return (
      <polygon
        points={points}
        fill={fillColor === 'transparent' ? 'none' : fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  };

  const renderShape = () => {
    switch (shapeType) {
      case 'circle':
        return renderCircle();
      case 'ellipse':
        return renderEllipse();
      case 'triangle':
        return renderTriangle();
      case 'rectangle':
      default:
        return renderRectangle();
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${element.width} ${element.height}`}
        className="w-full h-full"
      >
        {renderShape()}
      </svg>
    </div>
  );
}
