import React from "react";
import {
  Square,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import useStore from "../store/useStore";
import TemplatesSection from "./TemplatesSection";
import ImagesSection from "./ImagesSection";
import TextSection from "./TextSection";
import "./Sidebar.css";

const Sidebar = () => {
  const {
    objects,
    selectedId,
    updateObject,
    bringToFront,
    sendToBack,
    deleteObject,
    duplicateObject,
    selectObject,
    activeTab,
  } = useStore();

  const selectedObject = objects.find((o) => o.id === selectedId);

  // If an object is selected, show its properties
  if (selectedObject) {
    return (
      <div className="sidebar-container sidebar-properties">
        <div className="sidebar-header-row">
          <button
            className="sidebar-back-btn"
            onClick={() => selectObject(null)}
            title="Back to Assets"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="sidebar-title-inline">Edit {selectedObject.type === 'svg-path' ? 'Shape' : selectedObject.type}</h2>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-tool-section">
            <h3 className="sidebar-property-label">Order & Actions</h3>
            <div className="app-button-grid">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => bringToFront(selectedId)}
                title="Bring to Front"
              >
                <ArrowUp size={16} /> <span>Front</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => sendToBack(selectedId)}
                title="Send to Back"
              >
                <ArrowDown size={16} /> <span>Back</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => duplicateObject(selectedId)}
                title="Duplicate"
              >
                <Square size={14} /> <span>Clone</span>
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteObject(selectedId)}
                title="Delete"
              >
                <Trash2 size={16} /> <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Type-specific controls could go here, but TextSection already has them if activeTab is text. 
              However, we want them to show whenever text is selected regardless of tab. */}
          {selectedObject.type === "text" && (
            <div className="sidebar-tool-section premium-editor-box">
               <h3 className="section-label-premium">Text Details</h3>
               <div className="sidebar-property-column">
                    <label className="sidebar-label-sm">Content</label>
                    <textarea
                        className="sidebar-textarea-premium"
                        value={selectedObject.text}
                        onChange={(e) => updateObject(selectedId, { text: e.target.value })}
                    />
               </div>
               <div className="sidebar-property-column">
                    <label className="sidebar-label-sm">Size (px)</label>
                    <div className="sidebar-input-row">
                        <input
                            type="range"
                            min="8"
                            max="200"
                            value={selectedObject.fontSize}
                            onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) })}
                            className="sidebar-range-premium"
                        />
                        <input
                            type="number"
                            className="sidebar-number-input"
                            value={selectedObject.fontSize}
                            onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) || 0 })}
                        />
                    </div>
               </div>
            </div>
          )}

          {(selectedObject.type === "svg-path" || selectedObject.type === "text") && (
            <div className="sidebar-tool-section premium-editor-box">
              <h3 className="section-label-premium">Appearance</h3>
              <div className="sidebar-property-column">
                <label className="sidebar-label-sm">{selectedObject.type === "text" ? "Text Color Signature" : "Fill Color"}</label>
                <div className="sidebar-color-row-premium">
                    <div className="sidebar-color-picker-wrapper-lux">
                        <input
                            type="color"
                            value={selectedObject.fill || "#000000"}
                            onChange={(e) => updateObject(selectedId, { fill: e.target.value })}
                        />
                    </div>
                    <input
                        type="text"
                        className="sidebar-text-input-premium"
                        value={selectedObject.fill || "#000000"}
                        onChange={(e) => updateObject(selectedId, { fill: e.target.value })}
                        maxLength={7}
                    />
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-help-text">Click on the canvas background to deselect.</div>
        </div>
      </div>
    );
  }

  // Otherwise show the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "templates":
        return <TemplatesSection />;
      case "images":
        return <ImagesSection />;
      case "text":
        return <TextSection />;
      case "graphics":
        return (
          <div className="sidebar-content">
            <p>Graphics coming soon...</p>
          </div>
        );
      default:
        return <TemplatesSection />;
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {activeTab.charAt(0) + activeTab.slice(1)}
        </h2>
      </div>
      <div className="sidebar-content">
        {renderTabContent()}
      </div>
    </div>
  );
};


export default Sidebar;

