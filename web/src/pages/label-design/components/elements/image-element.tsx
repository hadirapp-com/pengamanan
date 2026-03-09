import type { LabelElement } from '../../types/label-types';

interface ImageElementProps {
  element: LabelElement;
}

export function ImageElement({ element }: ImageElementProps) {
  const {
    imageUrl = '',
    imageScale = 1,
  } = element.properties;

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-xs mb-1">Image Placeholder</div>
          <div className="text-xs">Click to add image</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <img
        src={imageUrl}
        alt="Label image"
        className="max-w-full max-h-full object-contain"
        style={{
          transform: `scale(${imageScale})`,
        }}
        onError={(e) => {
          // Handle image load error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="text-center text-gray-500">
              <div class="text-xs mb-1">Image Error</div>
              <div class="text-xs">Failed to load image</div>
            </div>
          `;
        }}
      />
    </div>
  );
}
