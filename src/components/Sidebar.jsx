import React, { useRef } from "react";
import {
  Square,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronLeft,
  Type,
} from "lucide-react";
import useStore from "../store/useStore";
import TemplatesSection from "./TemplatesSection";
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
    addObject,
  } = useStore();
  const fileInputRef = useRef(null);

  const selectedObject = objects.find((o) => o.id === selectedId);

  const handleDragStart = (e, type, payload) => {
    e.dataTransfer.setData("type", type);
    if (payload) {
      e.dataTransfer.setData("payload", JSON.stringify(payload));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          addObject({
            type: "image",
            src: event.target.result,
            width: 200,
            height: 200 * (img.height / img.width), // Maintain aspect ratio
            x: 100,
            y: 100,
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  if (selectedObject) {
    return (
      <div className="sidebar-container sidebar-properties">
        <div className="sidebar-header">
          <button
            className="toolbar-icon-btn"
            onClick={() => selectObject(null)}
            title="Back to Assets"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="sidebar-title">Edit {selectedObject.type === 'svg-path' ? 'Section' : selectedObject.type}</h2>
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

          {(selectedObject.type === "svg-path" || selectedObject.type === "text") && (
            <div className="sidebar-tool-section">
              <h3 className="sidebar-property-label">Appearance</h3>

              <div className="sidebar-property-row">
                <span className="sidebar-label-sm">{selectedObject.type === "text" ? "Text Color" : "Fill Color"}</span>
                <div className="sidebar-color-picker-wrapper">
                  <input
                    type="color"
                    value={selectedObject.fill || "#000000"}
                    onChange={(e) =>
                      updateObject(selectedId, { fill: e.target.value })
                    }
                    className="sidebar-color-input"
                  />
                  <span className="sidebar-color-value">
                    {selectedObject.fill || "#000000"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-help-text">Click on the canvas background to deselect.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Design Assets</h2>
      </div>

      <div className="sidebar-content">
        <TemplatesSection />

        {/* Images */}
        <div className="sidebar-tool-section">
          <h3>Decorative Images</h3>
          <div className="sidebar-image-grid">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://picsum.photos/100/100?random=${i}`}
                className="sidebar-draggable-image"
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, "image", {
                    src: `https://picsum.photos/200/200?random=${i}`,
                  })
                }
                title="Drag to canvas"
              />
            ))}
          </div>
        </div>

        {/* Text and Upload */}
        <div className="sidebar-tool-section app-spacer-top">
          <h3>Tools & Uploads</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
                className="btn btn-secondary sidebar-full-width"
                onClick={() => useStore.getState().addText()}
            >
                <Type size={18} />
                <span>Add Custom Text</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept="image/*"
            />
            <button
                className="btn btn-primary sidebar-full-width"
                onClick={() => fileInputRef.current.click()}
            >
                <Upload size={18} />
                <span>Upload Artwork</span>
            </button>
          </div>
        </div>
        
        <div className="sidebar-help-text">
            Drag items onto the canvas or click them to add.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

