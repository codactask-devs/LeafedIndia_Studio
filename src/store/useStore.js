import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { parseSvgContent } from "../utils/svgParser";
import doodleBg from "../assets/food-packaging_V3.jpg";

const useStore = create((set, get) => ({
  objects: [],
  selectedId: null,
  history: [[]],
  historyStep: 0,
  currentTemplate: null,
  activeTab: "templates", // "templates", "images", "text"
  isSidebarOpen: false,
  savedDesigns: [], // Array of objects { id, name, blob }
  hasChanges: false,
  pendingTemplate: null,
  showConfirmModal: false,
  uploadedImages: [],
  canvasBackground: doodleBg, // Default background

  setCanvasBackground: (bg) => set({ canvasBackground: bg }),
  setTemplate: (template) => set({ currentTemplate: template }),
  setActiveTab: (tab) => set({ activeTab: tab, isSidebarOpen: true }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setHasChanges: (val) => set({ hasChanges: val }),
  addSavedDesign: (design) => set((state) => ({
    savedDesigns: [...state.savedDesigns, { ...design, id: uuidv4() }],
    hasChanges: false
  })),
  removeSavedDesign: (id) => set((state) => ({
    savedDesigns: state.savedDesigns.filter(d => d.id !== id)
  })),
  clearSavedDesigns: () => set({ savedDesigns: [] }),
  resetCanvas: () => set({
    objects: [],
    history: [[]],
    historyStep: 0,
    hasChanges: false,
    selectedId: null,
    pendingTemplate: null,
    showConfirmModal: false
  }),
  setPendingTemplate: (template) => set({ pendingTemplate: template }),
  setShowConfirmModal: (val) => set({ showConfirmModal: val }),

  loadSvgTemplate: async (x, y, url) => {
    try {
      // Fetch SVG dynamically
      const response = await fetch(url);
      const svgText = await response.text();
      const { paths, width, height } = parseSvgContent(svgText);
      const CANVAS_W = 800;
      const CANVAS_H = 600;

      // We want to fit it in say, 80% of the canvas.
      const targetW = CANVAS_W * 0.8;
      const targetH = CANVAS_H * 0.8;
      const scaleX = targetW / width;
      const scaleY = targetH / height;
      const finalScale = Math.min(scaleX, scaleY);

      // Centering offset
      const offsetX = (CANVAS_W - width * finalScale) / 2;
      const offsetY = (CANVAS_H - height * finalScale) / 2;

      const pathObjects = paths.map((path) => ({
        ...path,
        x: offsetX,
        y: offsetY,
        scaleX: finalScale,
        scaleY: finalScale,
        rotation: 0,
      }));

      const { saveHistory } = get();
      const newObjects = [...pathObjects];
      set({ objects: newObjects, selectedId: null, hasChanges: false });
      saveHistory();
    } catch (error) {
      console.error("Failed to load SVG template", error);
    }
  },

  addObject: (object) => {
    const newObject = {
      id: uuidv4(),
      x: 100,
      y: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      ...object,
    };

    const { objects, saveHistory } = get();
    set({ objects: [...objects, newObject], selectedId: newObject.id, hasChanges: true });
    saveHistory();
  },

  addText: (text = "Double click to edit") => {
    const { addObject } = get();
    addObject({
      type: "text",
      text,
      fontSize: 24,
      fill: "#000000",
      fontFamily: "Mazzard",
      fontWeight: "normal",
      align: "left",
    });
  },

  updateObject: (id, updates) => {
    const { objects } = get();
    const newObjects = objects.map((obj) =>
      obj.id === id ? { ...obj, ...updates } : obj,
    );
    set({ objects: newObjects, hasChanges: true });
  },

  saveHistory: () => {
    const { history, historyStep, objects } = get();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(JSON.parse(JSON.stringify(objects)));
    set({ history: newHistory, historyStep: newHistory.length - 1 });
  },

  selectObject: (id) => set((state) => ({
    selectedId: id,
    // Auto-open the sidebar whenever an object is selected
    isSidebarOpen: id !== null ? true : state.isSidebarOpen,
  })),

  deleteObject: (id) => {
    const { objects, saveHistory } = get();
    set({ objects: objects.filter((o) => o.id !== id), selectedId: null, hasChanges: true });
    saveHistory();
  },

  undo: () => {
    const { history, historyStep } = get();
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      set({
        objects: history[prevStep],
        historyStep: prevStep,
        selectedId: null,
        hasChanges: true,
      });
    }
  },

  redo: () => {
    const { history, historyStep } = get();
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      set({
        objects: history[nextStep],
        historyStep: nextStep,
        selectedId: null,
        hasChanges: true,
      });
    }
  },

  duplicateObject: (id) => {
    const { objects, saveHistory } = get();
    const objectToClone = objects.find((o) => o.id === id);
    if (!objectToClone) return;

    const newObject = {
      ...objectToClone,
      id: uuidv4(),
      x: objectToClone.x + 20,
      y: objectToClone.y + 20,
    };

    set({ objects: [...objects, newObject], selectedId: newObject.id, hasChanges: true });
    saveHistory();
  },

  bringToFront: (id) => {
    const { objects, saveHistory } = get();
    const index = objects.findIndex((o) => o.id === id);
    if (index === -1 || index === objects.length - 1) return;

    const newObjects = [...objects];
    const [item] = newObjects.splice(index, 1);
    newObjects.push(item);

    set({ objects: newObjects, hasChanges: true });
    saveHistory();
  },

  sendToBack: (id) => {
    const { objects, saveHistory } = get();
    const index = objects.findIndex((o) => o.id === id);
    if (index === -1 || index === 0) return;

    const newObjects = [...objects];
    const [item] = newObjects.splice(index, 1);
    newObjects.unshift(item);

    set({ objects: newObjects, hasChanges: true });
    saveHistory();
  },

  // Uploaded images management
  setUploadedImages: (images) => set({ uploadedImages: images }),
  addUploadedImage: (image) => set((state) => ({
    uploadedImages: [image, ...state.uploadedImages]
  })),
  removeUploadedImage: (id) => set((state) => ({
    uploadedImages: state.uploadedImages.filter(img => img.id !== id)
  })),
}));

export default useStore;
