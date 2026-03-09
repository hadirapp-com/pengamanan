import type { LabelElement } from '../../types/label-types';

interface LineElementProps {
  element: LabelElement;
}

export function LineElement({ element }: LineElementProps) {
  const {
    lineStyle = 'solid',
    lineWidth = 1,
    lineColor = '#000000',
  } = element.properties;

  const getLineStyle = () => {
    switch (lineStyle) {
      case 'dashed':
        return '5,5';
      case 'dotted':
        return '2,2';
      case 'solid':
      default:
        return 'none';
    }
  };

  const getLineWidth = () => {
    // Convert mm to pixels
    return (lineWidth * 96) / 25.4;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${element.width} ${element.height}`}
        className="w-full h-full"
      >
        <line
          x1="0"
          y1={element.height / 2}
          x2={element.width}
          y2={element.height / 2}
          stroke={lineColor}
          strokeWidth={getLineWidth()}
          strokeDasharray={getLineStyle()}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
