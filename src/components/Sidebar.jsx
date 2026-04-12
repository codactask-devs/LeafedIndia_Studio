import React from "react";
import {
  Square,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronLeft,
  Copy,
  Trash,
  Palette,
} from "lucide-react";
import useStore from "../store/useStore";
import TemplatesSection from "./TemplatesSection";
import ImagesSection from "./ImagesSection";
import TextSection from "./TextSection";
import { ChevronRight } from "lucide-react";
import ColorPickerGrid from "./ColorPickerGrid";
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
    isSidebarOpen,
    toggleSidebar,
    saveHistory,
  } = useStore();

  const selectedObject = objects.find((o) => o.id === selectedId);

  // If an object is selected, show its properties
  if (selectedObject) {
    return (
      <div
        className={`sidebar-container sidebar-properties ${isSidebarOpen ? "open" : "closed"}`}
      >
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? (
            <>
              <ChevronLeft size={30} style={{ color: "#ffffff" }} />
            </>
          ) : (
            <>
              <ChevronRight size={30} style={{ color: "#ffffff" }} />
            </>
          )}
        </button>
        <div className="sidebar-header-row">
          <button
            className="sidebar-back-btn"
            onClick={() => selectObject(null)}
            title="Back to Assets"
          >
            <ChevronLeft size={25} />
          </button>
          <h2 className="sidebar-title-inline">
            Edit{" "}
            {selectedObject.type === "svg-path" ? "Shape" : selectedObject.type}
          </h2>

          <div className="header-actions-right">
            {!["svg-path", "svg-container"].includes(selectedObject.type) && (
              <>
                <button
                  className="header-action-btn"
                  onClick={() => duplicateObject(selectedId)}
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  className="header-action-btn delete-btn"
                  onClick={() => deleteObject(selectedId)}
                  title="Delete"
                >
                  <Trash size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="sidebar-content">
          {/* Only show Order & Layout for non-template objects */}
          {!["svg-path", "svg-container"].includes(selectedObject.type) && (
            <div className="sidebar-tool-section">
              <h3 className="sidebar-property-label">Order & Layout</h3>
              <div
                className="app-button-grid"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => bringToFront(selectedId)}
                  title="Bring to Front"
                >
                  <ArrowUp size={16} /> <span>Move Front</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => sendToBack(selectedId)}
                  title="Send to Back"
                >
                  <ArrowDown size={16} /> <span>Move Back</span>
                </button>
              </div>
            </div>
          )}

          {/* Shape Properties */}
          {selectedObject.type === "svg-path" && (
            <div className="sidebar-tool-section premium-editor-box">
              <h3 className="section-label-premium">Shape Details</h3>

              <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Fill Color</label>
                <br />
                <div style={{ marginTop: "12px" }}>
                  <ColorPickerGrid
                    color={selectedObject.fill || "#4F46E5"}
                    onChange={(c) => updateObject(selectedId, { fill: c })}
                    onChangeComplete={() => saveHistory()}
                  />
                </div>
              </div>

              {/* <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Stroke Color</label>
                <div className="sidebar-color-row-premium">
                  <div className="sidebar-color-picker-wrapper-lux">
                    <input
                      type="color"
                      value={selectedObject.stroke || "#000000"}
                      onChange={(e) => updateObject(selectedId, { stroke: e.target.value })}
                    />
                  </div>
                  <input
                    type="text"
                    className="sidebar-text-input-premium"
                    value={selectedObject.stroke || "#000000"}
                    onChange={(e) => updateObject(selectedId, { stroke: e.target.value })}
                    maxLength={7}
                  />
                </div>
              </div> */}

              {/* <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Stroke Width (px)</label>
                <div className="sidebar-input-row">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={selectedObject.strokeWidth || 1}
                    onChange={(e) => updateObject(selectedId, { strokeWidth: parseFloat(e.target.value) })}
                    className="sidebar-range-premium"
                  />
                  <input
                    type="number"
                    className="sidebar-number-input"
                    value={selectedObject.strokeWidth || 1}
                    onChange={(e) => updateObject(selectedId, { strokeWidth: parseFloat(e.target.value) || 0 })}
                    step="0.5"
                  />
                </div>
              </div> */}
            </div>
          )}

          {/* Text-Specific Properties */}
          {selectedObject.type === "text" && (
            <div className="sidebar-tool-section premium-editor-box">
              <h3 className="section-label-premium">Text Details</h3>
              <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Content</label>
                <textarea
                  className="sidebar-textarea-premium"
                  value={selectedObject.text}
                  onChange={(e) =>
                    updateObject(selectedId, { text: e.target.value })
                  }
                  onBlur={() => saveHistory()}
                  placeholder="Type something amazing..."
                />
              </div>
              <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Font Style</label>
                <div className="custom-dropdown-container">
                  <select
                    className="sidebar-category-select"
                    style={{ padding: "10px 14px" }}
                    value={selectedObject.fontFamily || "'Mazzard', sans-serif"}
                    onChange={(e) => {
                      updateObject(selectedId, { fontFamily: e.target.value })
                      saveHistory();
                    }}
                  >
                    <optgroup label="Sans Serif">
                      <option value="'Mazzard', sans-serif">Mazzard</option>
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Outfit', sans-serif">Outfit</option>
                      <option value="'Montserrat', sans-serif">
                        Montserrat
                      </option>
                      <option value="'Poppins', sans-serif">Poppins</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Space Grotesk', sans-serif">
                        Space Grotesk
                      </option>
                    </optgroup>
                    <optgroup label="Serif">
                      <option value="'Playfair Display', serif">
                        Playfair Display
                      </option>
                      <option value="'Lora', serif">Lora</option>
                    </optgroup>
                    <optgroup label="Display & Script">
                      <option value="'Lobster', cursive">Lobster</option>
                      <option value="'Pacifico', cursive">Pacifico</option>
                      <option value="'Caveat', cursive">Caveat</option>
                      <option value="'Fredoka', sans-serif">Fredoka</option>
                      <option value="'Shadows Into Light', cursive">
                        Shadows Light
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Size (px)</label>
                <div className="sidebar-input-row">
                  <input
                    type="range"
                    min="8"
                    max="200"
                    value={selectedObject.fontSize}
                    onChange={(e) =>
                      updateObject(selectedId, {
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    onMouseUp={() => saveHistory()}
                    onTouchEnd={() => saveHistory()}
                    className="sidebar-range-premium"
                  />
                  <input
                    type="number"
                    className="sidebar-number-input"
                    value={selectedObject.fontSize}
                    onChange={(e) =>
                      updateObject(selectedId, {
                        fontSize: parseInt(e.target.value) || 0,
                      })
                    }
                    onBlur={() => saveHistory()}
                  />
                </div>
              </div>

              <div className="sidebar-property-column">
                <label className="sidebar-label-sm">Color Signature</label>
                <div style={{ marginTop: "12px" }}>
                  <ColorPickerGrid
                    color={selectedObject.fill || "#000000"}
                    onChange={(c) => updateObject(selectedId, { fill: c })}
                    onChangeComplete={() => saveHistory()}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-help-text" style={{ marginTop: "30px" }}>
            Click on the canvas background to deselect.
          </div>
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
      case "clipart":
        return null; // Clipart removed
      case "text":
        return <TextSection />;
      default:
        return <TemplatesSection />;
    }
  };

  return (
    <div className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}>
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
      </div>
      <div data-tour="sidebar-content" className="sidebar-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Sidebar;
