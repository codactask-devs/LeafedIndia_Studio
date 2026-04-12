import React, { useState } from 'react';
import './ColorPickerGrid.css';

const DEFAULT_COLORS = [
    // Grayscale / Neutral
    "#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6",
    // Reds
    "#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336", "#e53935", "#d32f2f", "#c62828", "#b71c1c",
    // Pinks/Purples
    "#fce4ec", "#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60", "#c2185b", "#9c27b0", "#6a1b9a",
    // Indigo / Deep Blues
    "#e8eaf6", "#c5cae9", "#9fa8da", "#7986cb", "#5c6bc0", "#3f51b5", "#3949ab", "#303f9f", "#283593", "#1a237e",
    // Blues
    "#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1565c0", "#0d47a1", "#021730",
    // Cyan/Teal
    "#e0f7fa", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4", "#00acc1", "#0097a7", "#00838f", "#006064",
    // Greens
    "#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047", "#388e3c", "#2e7d32", "#1b5e20",
    // Lime / Yellow / Amber
    "#fdf3e2", "#f9e79f", "#f4d03f", "#f1c40f", "#d4ac0d", "#ffc107", "#ffb300", "#ffa000", "#ff8f00", "#ff6f00",
    // Oranges / Browns
    "#fbeee6", "#edbb99", "#e59866", "#dc7633", "#d35400", "#ba4a00", "#a04000", "#873600", "#6e2c00", "#512e0f"
];

const ColorPickerGrid = ({ color, onChange, onChangeComplete }) => {
    const [showNative, setShowNative] = useState(false);
    // Normalize color value to avoid mismatch (e.g., #FFFFFF vs #ffffff)
    const normalizedColor = color ? color.toLowerCase() : "";

    const handleColorChange = (c) => {
        onChange(c);
        if (onChangeComplete) onChangeComplete(c);
    };

    return (
        <div className="color-picker-grid-container">
            <div className="color-picker-grid">
                {DEFAULT_COLORS.map(c => {
                    const isSelected = normalizedColor === c.toLowerCase();
                    return (
                        <button
                            key={c}
                            className={`color-picker-swatch ${isSelected ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            title={c}
                            onClick={() => handleColorChange(c)}
                        >
                            {isSelected && (
                                <svg 
                                    className="color-picker-check-icon"
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    );
                })}
            </div>
            
            <button 
                className="more-colors-btn" 
                onClick={() => setShowNative(!showNative)}
            >
                {showNative ? "Less Colors" : "More Colors..."}
            </button>

            {showNative && (
                <div className="sidebar-color-row-premium" style={{ marginTop: '12px' }}>
                    <div className="sidebar-color-picker-wrapper-lux">
                        <input
                            type="color"
                            value={normalizedColor || "#000000"}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={(e) => onChangeComplete && onChangeComplete(e.target.value)}
                        />
                    </div>
                    <input
                        type="text"
                        className="sidebar-text-input-premium"
                        value={normalizedColor || "#000000"}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={(e) => onChangeComplete && onChangeComplete(e.target.value)}
                        maxLength={7}
                    />
                </div>
            )}
        </div>
    );
};

export default ColorPickerGrid;
