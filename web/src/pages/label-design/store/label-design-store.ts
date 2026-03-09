import { create } from 'zustand';
import type { LabelElement, LabelSize } from '../types/label-types';

interface LabelDesignStore {
  // State
  elements: LabelElement[];
  selectedElement: LabelElement | null;
  labelSize: LabelSize;
  zoom: number;
  history: LabelElement[][];
  historyIndex: number;
  maxHistorySize: number;
  currentDesignId: string | null;

  // Actions
  addElement: (element: LabelElement) => void;
  updateElement: (elementId: string, updates: Partial<LabelElement>) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (elementId: string) => void;
  clearSelection: () => void;
  setLabelSize: (size: LabelSize) => void;
  setZoom: (zoom: number) => void;
  setCurrentDesignId: (designId: string | null) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveToHistory: () => void;
  
  // Design operations
  saveDesign: (designId?: string) => void;
  loadDesign: (design: any) => void;
  loadDesignById: (designId: string) => void;
  exportDesign: () => void;
  clearDesign: () => void;
  getAllDesigns: () => any[];
  deleteDesign: (designId: string) => void;
  
  // Utility actions
  duplicateElement: (elementId: string) => void;
  bringToFront: (elementId: string) => void;
  sendToBack: (elementId: string) => void;
  alignElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (distribution: 'horizontal' | 'vertical') => void;
}

export const useLabelDesignStore = create<LabelDesignStore>((set, get) => ({
  // Initial state
  elements: [],
  selectedElement: null,
  labelSize: { width: 135, height: 90 },
  zoom: 100,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  currentDesignId: null,

  // Computed properties
  get canUndo() {
    return get().historyIndex > 0;
  },

  get canRedo() {
    return get().historyIndex < get().history.length - 1;
  },

  // Actions
  addElement: (element: LabelElement) => {
    set((state) => {
      const newElements = [...state.elements, element];
      const newState = { ...state, elements: newElements };
      get().saveToHistory();
      return newState;
    });
  },

  updateElement: (elementId: string, updates: Partial<LabelElement>) => {
    set((state) => {
      const newElements = state.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element
      );
      const newSelectedElement = state.selectedElement?.id === elementId 
        ? { ...state.selectedElement, ...updates }
        : state.selectedElement;
      
      return {
        ...state,
        elements: newElements,
        selectedElement: newSelectedElement,
      };
    });
  },

  deleteElement: (elementId: string) => {
    set((state) => {
      const newElements = state.elements.filter((element) => element.id !== elementId);
      const newSelectedElement = state.selectedElement?.id === elementId 
        ? null 
        : state.selectedElement;
      
      const newState = {
        ...state,
        elements: newElements,
        selectedElement: newSelectedElement,
      };
      get().saveToHistory();
      return newState;
    });
  },

  selectElement: (elementId: string) => {
    set((state) => ({
      ...state,
      selectedElement: state.elements.find((element) => element.id === elementId) || null,
    }));
  },

  clearSelection: () => {
    set((state) => ({
      ...state,
      selectedElement: null,
    }));
  },

  setLabelSize: (size: LabelSize) => {
    set((state) => ({
      ...state,
      labelSize: size,
    }));
  },

  setZoom: (zoom: number) => {
    set((state) => ({
      ...state,
      zoom,
    }));
  },

  setCurrentDesignId: (designId: string | null) => {
    set((state) => ({
      ...state,
      currentDesignId: designId,
    }));
  },

  // History management
  saveToHistory: () => {
    set((state) => {
      const currentElements = [...state.elements];
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), currentElements];
      
      // Limit history size
      if (newHistory.length > state.maxHistorySize) {
        newHistory.shift();
      }
      
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const previousElements = state.history[newIndex];
        
        return {
          ...state,
          elements: [...previousElements],
          historyIndex: newIndex,
          selectedElement: null, // Clear selection on undo
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextElements = state.history[newIndex];
        
        return {
          ...state,
          elements: [...nextElements],
          historyIndex: newIndex,
          selectedElement: null, // Clear selection on redo
        };
      }
      return state;
    });
  },

  // Design operations
  saveDesign: (designId?: string) => {
    const state = get();
    const design = {
      id: designId || `design-${Date.now()}`,
      name: 'Untitled Design',
      labelSize: state.labelSize,
      elements: state.elements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to localStorage for now
    const savedDesigns = JSON.parse(localStorage.getItem('labelDesigns') || '[]');
    
    // Check if design with same ID exists, update it
    const existingIndex = savedDesigns.findIndex((d: any) => d.id === design.id);
    if (existingIndex !== -1) {
      savedDesigns[existingIndex] = design;
    } else {
      savedDesigns.push(design);
    }
    
    localStorage.setItem('labelDesigns', JSON.stringify(savedDesigns));
    
    // Update current design ID
    set((state) => ({
      ...state,
      currentDesignId: design.id,
    }));
    
    console.log('Design saved:', design);
  },

  loadDesign: (design: any) => {
    set((state) => ({
      ...state,
      elements: design.elements || [],
      labelSize: design.labelSize || { width: 135, height: 90 },
      currentDesignId: design.id || null,
      selectedElement: null,
    }));
    get().saveToHistory();
  },

  loadDesignById: (designId: string) => {
    const savedDesigns = JSON.parse(localStorage.getItem('labelDesigns') || '[]');
    const design = savedDesigns.find((d: any) => d.id === designId);
    if (design) {
      get().loadDesign(design);
    }
  },

  exportDesign: () => {
    const state = get();
    const designData = {
      labelSize: state.labelSize,
      elements: state.elements,
    };
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `label-design-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  clearDesign: () => {
    set((state) => ({
      ...state,
      elements: [],
      selectedElement: null,
      currentDesignId: null,
    }));
    get().saveToHistory();
  },

  getAllDesigns: () => {
    return JSON.parse(localStorage.getItem('labelDesigns') || '[]');
  },

  deleteDesign: (designId: string) => {
    const savedDesigns = JSON.parse(localStorage.getItem('labelDesigns') || '[]');
    const filteredDesigns = savedDesigns.filter((d: any) => d.id !== designId);
    localStorage.setItem('labelDesigns', JSON.stringify(filteredDesigns));
  },

  // Utility actions
  duplicateElement: (elementId: string) => {
    set((state) => {
      const elementToDuplicate = state.elements.find((element) => element.id === elementId);
      if (!elementToDuplicate) return state;

      const duplicatedElement: LabelElement = {
        ...elementToDuplicate,
        id: `element-${Date.now()}`,
        x: elementToDuplicate.x + 10,
        y: elementToDuplicate.y + 10,
      };

      const newElements = [...state.elements, duplicatedElement];
      const newState = { ...state, elements: newElements };
      get().saveToHistory();
      return newState;
    });
  },

  bringToFront: (elementId: string) => {
    set((state) => {
      const elementIndex = state.elements.findIndex((element) => element.id === elementId);
      if (elementIndex === -1) return state;

      const newElements = [...state.elements];
      const element = newElements.splice(elementIndex, 1)[0];
      newElements.push(element);

      return {
        ...state,
        elements: newElements,
      };
    });
  },

  sendToBack: (elementId: string) => {
    set((state) => {
      const elementIndex = state.elements.findIndex((element) => element.id === elementId);
      if (elementIndex === -1) return state;

      const newElements = [...state.elements];
      const element = newElements.splice(elementIndex, 1)[0];
      newElements.unshift(element);

      return {
        ...state,
        elements: newElements,
      };
    });
  },

  alignElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    set((state) => {
      if (!state.selectedElement) return state;

      const selectedElements = state.elements.filter((element) => 
        state.selectedElement?.id === element.id
      );

      if (selectedElements.length === 0) return state;

      let referenceValue: number;
      const newElements = [...state.elements];

      switch (alignment) {
        case 'left':
          referenceValue = Math.min(...selectedElements.map((el) => el.x));
          selectedElements.forEach((element) => {
            const index = newElements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
              newElements[index].x = referenceValue;
            }
          });
          break;
        case 'center':
          referenceValue = selectedElements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / selectedElements.length;
          selectedElements.forEach((element) => {
            const index = newElements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
              newElements[index].x = referenceValue - element.width / 2;
            }
          });
          break;
        case 'right':
          referenceValue = Math.max(...selectedElements.map((el) => el.x + el.width));
          selectedElements.forEach((element) => {
            const index = newElements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
              newElements[index].x = referenceValue - element.width;
            }
          });
          break;
        case 'top':
          referenceValue = Math.min(...selectedElements.map((el) => el.y));
          selectedElements.forEach((element) => {
            const index = newElements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
              newElements[index].y = referenceValue;
            }
          });
          break;
        case 'middle':
          referenceValue = selectedElements.reduce((sum, el) => sum + el.y + el.height / 2, 0) / selectedElements.length;
          selectedElements.forEach((element) => {
            const index = newElements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
              newElements[index].y = referenceValue - element.height / 2;
            }
          });
          break;
        case 'bottom':
          referenceValue = Math.max(...selectedElements.map((el) => el.y + el.height));
          selectedElements.forEach((element) => {
            const index = newElements.findIndex((el) => el.id === element.id);
            if (index !== -1) {
              newElements[index].y = referenceValue - element.height;
            }
          });
          break;
      }

      return {
        ...state,
        elements: newElements,
      };
    });
  },

  distributeElements: (distribution: 'horizontal' | 'vertical') => {
    set((state) => {
      if (!state.selectedElement) return state;

      const selectedElements = state.elements.filter((element) => 
        state.selectedElement?.id === element.id
      );

      if (selectedElements.length < 3) return state;

      const sortedElements = [...selectedElements].sort((a, b) => 
        distribution === 'horizontal' ? a.x - b.x : a.y - b.y
      );

      const first = sortedElements[0];
      const last = sortedElements[sortedElements.length - 1];
      const totalSpace = distribution === 'horizontal' 
        ? last.x - first.x 
        : last.y - first.y;
      const spacing = totalSpace / (sortedElements.length - 1);

      const newElements = [...state.elements];
      sortedElements.forEach((element, index) => {
        const elementIndex = newElements.findIndex((el) => el.id === element.id);
        if (elementIndex !== -1) {
          if (distribution === 'horizontal') {
            newElements[elementIndex].x = first.x + spacing * index;
          } else {
            newElements[elementIndex].y = first.y + spacing * index;
          }
        }
      });

      return {
        ...state,
        elements: newElements,
      };
    });
  },
}));
