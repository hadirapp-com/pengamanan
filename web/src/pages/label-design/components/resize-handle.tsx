import { useCallback, useState } from 'react';
import type { LabelElement, LabelSize } from '../types/label-types';

interface ResizeHandleProps {
  element: LabelElement;
  onResize: (updates: Partial<LabelElement>) => void;
  labelSize: LabelSize;
}

export function ResizeHandle({ element, onResize, labelSize }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // @ts-ignore
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    });
  }, [element.width, element.height]);

  const handleResizeMove = useCallback((e: MouseEvent, handle: string) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // Convert pixels to mm
    const pixelsToMm = (pixels: number) => (pixels * 25.4) / 96;

    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    let newX = element.x;
    let newY = element.y;

    switch (handle) {
      case 'nw':
        newWidth = Math.max(5, resizeStart.width - pixelsToMm(deltaX));
        newHeight = Math.max(5, resizeStart.height - pixelsToMm(deltaY));
        newX = element.x + (resizeStart.width - newWidth);
        newY = element.y + (resizeStart.height - newHeight);
        break;
      case 'ne':
        newWidth = Math.max(5, resizeStart.width + pixelsToMm(deltaX));
        newHeight = Math.max(5, resizeStart.height - pixelsToMm(deltaY));
        newY = element.y + (resizeStart.height - newHeight);
        break;
      case 'sw':
        newWidth = Math.max(5, resizeStart.width - pixelsToMm(deltaX));
        newHeight = Math.max(5, resizeStart.height + pixelsToMm(deltaY));
        newX = element.x + (resizeStart.width - newWidth);
        break;
      case 'se':
        newWidth = Math.max(5, resizeStart.width + pixelsToMm(deltaX));
        newHeight = Math.max(5, resizeStart.height + pixelsToMm(deltaY));
        break;
      case 'n':
        newHeight = Math.max(5, resizeStart.height - pixelsToMm(deltaY));
        newY = element.y + (resizeStart.height - newHeight);
        break;
      case 's':
        newHeight = Math.max(5, resizeStart.height + pixelsToMm(deltaY));
        break;
      case 'w':
        newWidth = Math.max(5, resizeStart.width - pixelsToMm(deltaX));
        newX = element.x + (resizeStart.width - newWidth);
        break;
      case 'e':
        newWidth = Math.max(5, resizeStart.width + pixelsToMm(deltaX));
        break;
    }

    // Ensure element stays within canvas bounds
    newX = Math.max(0, Math.min(newX, labelSize.width - newWidth));
    newY = Math.max(0, Math.min(newY, labelSize.height - newHeight));

    onResize({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }, [isResizing, resizeStart, element.x, element.y, onResize, labelSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners
  useState(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        // Determine which handle is being dragged based on cursor position
        // This is a simplified implementation
        handleResizeMove(e, 'se');
      };

      const handleMouseUp = () => {
        handleResizeEnd();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  const handleSize = 6;
  const handleStyle = {
    width: handleSize,
    height: handleSize,
    backgroundColor: '#3b82f6',
    border: '1px solid white',
    position: 'absolute' as const,
    cursor: 'pointer',
  };

  return (
    <>
      {/* Corner handles */}
      <div
        style={{
          ...handleStyle,
          top: -handleSize / 2,
          left: -handleSize / 2,
          cursor: 'nw-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        style={{
          ...handleStyle,
          top: -handleSize / 2,
          right: -handleSize / 2,
          cursor: 'ne-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        style={{
          ...handleStyle,
          bottom: -handleSize / 2,
          left: -handleSize / 2,
          cursor: 'sw-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div
        style={{
          ...handleStyle,
          bottom: -handleSize / 2,
          right: -handleSize / 2,
          cursor: 'se-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />

      {/* Edge handles */}
      <div
        style={{
          ...handleStyle,
          top: -handleSize / 2,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'n-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />
      <div
        style={{
          ...handleStyle,
          bottom: -handleSize / 2,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 's-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />
      <div
        style={{
          ...handleStyle,
          left: -handleSize / 2,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'w-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />
      <div
        style={{
          ...handleStyle,
          right: -handleSize / 2,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'e-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />
    </>
  );
}
