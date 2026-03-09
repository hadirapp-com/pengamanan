# Label Designer

A comprehensive label design tool with drag & drop functionality, built for creating custom labels with various elements.

## Features

### 🎨 Design Elements
- **Text Elements**: Static and dynamic text with customizable fonts, sizes, and colors
- **Barcodes**: Code 39, Code 128, EAN-13, EAN-8, and UPC barcode support
- **QR Codes**: Customizable QR codes with error correction levels
- **Lines**: Solid, dashed, and dotted lines with adjustable width
- **Shapes**: Rectangles, circles, ellipses, and triangles
- **Images**: Support for image uploads and logos

### 🖱️ Interactive Features
- **Drag & Drop**: Intuitive drag and drop interface for adding elements
- **Resize Handles**: Visual resize handles for adjusting element dimensions
- **Grid System**: Optional grid with snap-to-grid functionality
- **Rulers**: Measurement rulers for precise positioning
- **Zoom Controls**: Zoom in/out with percentage display
- **Undo/Redo**: Full history support with undo and redo functionality

### 📐 Precision Tools
- **Snap to Grid**: Automatic alignment to grid lines
- **Keyboard Shortcuts**: Arrow keys for precise positioning
- **Measurement Units**: All measurements in millimeters (mm)
- **Rotation**: Element rotation with visual feedback

### 🎯 Dynamic Fields
- **Part Name**: Dynamic part name field
- **Part Number**: Dynamic part number field
- **Color Code**: Dynamic color code field
- **Customer Name**: Dynamic customer name field
- **Production Date**: Dynamic production date field
- **Quantity**: Dynamic quantity field
- **Serial Number**: Dynamic serial number field

### 💾 Save & Export
- **Save Designs**: Save designs to localStorage
- **Export Designs**: Export designs as JSON files
- **Load Designs**: Load previously saved designs

## Usage

### Adding Elements
1. Select an element from the left sidebar
2. Click to add it to the canvas, or drag and drop it
3. Elements will be placed at the cursor position

### Editing Elements
1. Click on an element to select it
2. Use the properties panel on the right to modify:
   - Position (X, Y coordinates)
   - Size (Width, Height)
   - Rotation
   - Text content and formatting
   - Colors and styles
   - Field type (static or dynamic)

### Moving Elements
- Click and drag elements to move them
- Use arrow keys for precise positioning
- Hold Shift for larger movements

### Resizing Elements
- Select an element to show resize handles
- Drag the corner or edge handles to resize
- Maintains aspect ratio when dragging corners

### Keyboard Shortcuts
- **Arrow Keys**: Move selected element
- **Shift + Arrow Keys**: Move in larger increments
- **Delete/Backspace**: Delete selected element
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo

## Technical Details

### Architecture
- **State Management**: Zustand for global state
- **Drag & Drop**: React DnD for drag and drop functionality
- **UI Components**: Custom components built with Radix UI primitives
- **Styling**: Tailwind CSS for styling

### File Structure
```
src/pages/label-design/
├── components/
│   ├── elements/           # Individual element renderers
│   │   ├── text-element.tsx
│   │   ├── barcode-element.tsx
│   │   ├── qrcode-element.tsx
│   │   ├── line-element.tsx
│   │   ├── shape-element.tsx
│   │   └── image-element.tsx
│   ├── field-palette.tsx   # Left sidebar with elements
│   ├── label-canvas.tsx    # Main canvas area
│   ├── label-element-renderer.tsx
│   ├── properties-panel.tsx # Right sidebar for editing
│   └── resize-handle.tsx   # Resize handles
├── store/
│   └── label-design-store.ts # Zustand store
├── types/
│   └── label-types.ts      # TypeScript type definitions
├── label-design-page.tsx   # Main page component
└── README.md
```

### Dependencies
- `react-dnd` and `react-dnd-html5-backend` for drag and drop
- `@radix-ui/react-tabs` for tabbed interface
- `zustand` for state management
- `qrcode` for QR code generation
- `jsbarcode` for barcode generation

## Future Enhancements

- [ ] Real QR code generation with proper libraries
- [ ] Advanced barcode generation with proper libraries
- [ ] Image upload functionality
- [ ] Template system for common label designs
- [ ] Print preview and printing functionality
- [ ] Collaboration features
- [ ] Version control for designs
- [ ] Integration with existing parts system
