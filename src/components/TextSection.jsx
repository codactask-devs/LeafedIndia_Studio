import React, { useState, useEffect } from "react";
import useStore from "../store/useStore";
import ColorPickerGrid from "./ColorPickerGrid";
import "./Sidebar.css";

const TextSection = () => {
    const { 
        addObject, 
        selectedId, 
        objects, 
        updateObject,
        saveHistory
    } = useStore();

    const selectedObject = objects.find((o) => o.id === selectedId);
    const isText = selectedObject?.type === "text";

    const addText = (text, size, weight, font) => {
        addObject({
            type: "text",
            text,
            fontSize: size,
            fill: "#0f172a",
            fontWeight: weight,
            fontFamily: font,
            x: 150,
            y: 150,
        });
    };

    const addHeading = () => addText("Add Heading", 48, "800", "'Mazzard', sans-serif");
    const addSubHeading = () => addText("Add Sub Heading", 32, "600", "'Mazzard', sans-serif");
    const addBodyText = () => addText("Add Body Text", 18, "400", "'Mazzard', sans-serif");

    return (
        <div className="sidebar-section-container">
            <div className="sidebar-tool-section">
                <h3 className="section-label-premium">Text Presets</h3>
                <div className="sidebar-text-presets">
                    <button 
                        className="text-preset-btn-premium h1-preset" 
                        onClick={addHeading}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("type", "text");
                            e.dataTransfer.setData("payload", JSON.stringify({ 
                                text: "Add Heading", 
                                fontSize: 48, 
                                fontWeight: "800", 
                                fontFamily: "'Mazzard', sans-serif" 
                            }));
                        }}
                    >
                        <div className="preset-flex">
                            <span className="preset-label">Add a heading</span>
                            <span className="preset-preview h1-preview">Heading</span>
                        </div>
                    </button>
                    <button 
                        className="text-preset-btn-premium h2-preset" 
                        onClick={addSubHeading}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("type", "text");
                            e.dataTransfer.setData("payload", JSON.stringify({ 
                                text: "Add Sub Heading", 
                                fontSize: 32, 
                                fontWeight: "600", 
                                fontFamily: "'Mazzard', sans-serif" 
                            }));
                        }}
                    >
                        <div className="preset-flex">
                            <span className="preset-label">Add a subheading</span>
                            <span className="preset-preview h2-preview">Subheading</span>
                        </div>
                    </button>
                    <button 
                        className="text-preset-btn-premium body-preset" 
                        onClick={addBodyText}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("type", "text");
                            e.dataTransfer.setData("payload", JSON.stringify({ 
                                text: "Add Body Text", 
                                fontSize: 18, 
                                fontWeight: "400", 
                                fontFamily: "'Mazzard', sans-serif" 
                            }));
                        }}
                    >
                        <div className="preset-flex">
                            <span className="preset-label">Add body text</span>
                            <span className="preset-preview body-preview">Body text</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="sidebar-tool-section">
                <h3 className="section-label-premium">Curated Styles</h3>
                <div className="sidebar-text-presets mini-grid">
                    <button 
                        className="text-preset-mini serif-gold" 
                        onClick={() => addText("Classic Script", 54, "700", "'Playfair Display', serif")}
                    >
                        <span style={{ fontFamily: "'Mazzard', sans-serif" }}>Serif</span>
                    </button>
                    <button 
                        className="text-preset-mini hand-chic" 
                        onClick={() => addText("Handwritten", 48, "700", "'Mazzard', sans-serif")}
                    >
                        <span style={{ fontFamily: "'Mazzard', sans-serif" }}>Chic</span>
                    </button>
                </div>
            </div>

            {isText && (
                <div className="sidebar-tool-section premium-editor-box">
                    <h3 className="section-label-premium">Content Styling</h3>
                    
                    <div className="sidebar-property-column">
                        <label className="sidebar-label-sm">Text Material</label>
                        <textarea
                            className="sidebar-textarea-premium"
                            value={selectedObject.text}
                            onChange={(e) => updateObject(selectedId, { text: e.target.value })}
                            onBlur={() => saveHistory()}
                            placeholder="Type something amazing..."
                        />
                    </div>

                    <div className="sidebar-property-column">
                        <label className="sidebar-label-sm">Character Scaling</label>
                        <div className="sidebar-input-row">
                            <input
                                type="range"
                                min="8"
                                max="200"
                                value={selectedObject.fontSize}
                                onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) })}
                                onMouseUp={() => saveHistory()}
                                onTouchEnd={() => saveHistory()}
                                className="sidebar-range-premium"
                            />
                            <input
                                type="number"
                                className="sidebar-number-input"
                                value={selectedObject.fontSize}
                                onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) || 0 })}
                                onBlur={() => saveHistory()}
                            />
                        </div>
                    </div>

                    <div className="sidebar-property-column">
                        <label className="sidebar-label-sm">Color Signature</label>
                        <div style={{ marginTop: '12px' }}>
                            <ColorPickerGrid 
                                color={selectedObject.fill || "#000000"} 
                                onChange={(c) => updateObject(selectedId, { fill: c })} 
                                onChangeComplete={() => saveHistory()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default TextSection;
