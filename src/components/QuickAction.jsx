import React, { useState } from "react";
import { Package, X } from "lucide-react";
import useStore from "../store/useStore";
import "./QuickAction.css";

// Dynamic template discovery using Vite's glob import
const templateFiles = import.meta.glob("../templates/*.svg", { eager: true });
const thumbnailFiles = import.meta.glob("../assets/template-thumbnails/*.{png,jpg,jpeg,webp}", { eager: true });

const QuickAction = () => {
    const { loadSvgTemplate } = useStore();
    const [isVisible, setIsVisible] = useState(true);

    const templatesList = Object.entries(templateFiles).map(([path, module]) => {
        const fileName = path.split('/').pop().replace('.svg', '');
        const url = module.default;

        // Find matching thumbnail if it exists
        const thumbnailPath = Object.keys(thumbnailFiles).find(t => 
            t.toLowerCase().includes(fileName.toLowerCase())
        );
        const thumbnail = thumbnailPath ? thumbnailFiles[thumbnailPath].default : null;

        return {
            id: fileName.toLowerCase().replace(/\s+/g, '-'),
            name: fileName,
            url: url,
            thumbnail: thumbnail
        };
    });

    const handleSelectTemplate = (url) => {
        loadSvgTemplate(100, 100, url);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="quick-action-overlay">
            <div className="quick-action-panel">
                <button 
                    className="quick-action-close"
                    onClick={() => setIsVisible(false)}
                >
                    <X size={20} />
                </button>
                <div className="quick-action-header">
                    <h3>Quick Start</h3>
                </div>
                <p className="quick-action-subtitle">Select a template to begin your design</p>
                <div className="quick-action-templates">
                    {templatesList.map((template) => (
                        <div
                            key={template.id}
                            className="quick-action-item"
                            onClick={() => handleSelectTemplate(template.url)}
                            title={template.name}
                        >
                            <div className="quick-action-thumbnail-box">
                                {template.thumbnail ? (
                                    <img src={template.thumbnail} alt={template.name} className="quick-action-thumbnail" />
                                ) : (
                                    <Package size={24} />
                                )}
                            </div>
                            <span className="template-name">{template.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickAction;

