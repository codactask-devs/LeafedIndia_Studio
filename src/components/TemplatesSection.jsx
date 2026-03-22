import React from "react";
import { Package } from "lucide-react";
import useStore from "../store/useStore";
import foodBoxUrl from "../templates/FOOD BOX.svg";
import "./TemplatesSection.css";

const TemplatesSection = () => {
    const { loadSvgTemplate } = useStore();

    // In a real app, this could come from an API or a manifest file
    const templatesList = [
        { id: "food-box", name: "Food Box", url: foodBoxUrl, thumbnail: foodBoxUrl },
    ];

    const handleDragStart = (e, url) => {
        e.dataTransfer.setData("type", "svg-template");
        e.dataTransfer.setData("payload", JSON.stringify({ url }));
    };

    return (
        <div className="sidebar-section-container">
            <div className="templates-grid">
                {templatesList.map((template) => (
                    <div
                        key={template.id}
                        className="templates-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, template.url)}
                        onClick={() => loadSvgTemplate(100, 100, template.url)}
                        title={template.name}
                    >
                        <div className="template-preview-box">
                            <Package size={32} />
                        </div>
                        <span className="template-name">{template.name}</span>
                    </div>
                ))}
            </div>
            
            <div className="sidebar-help-text" style={{ marginTop: '20px' }}>
                More templates coming soon!
            </div>
        </div>
    );
};


export default TemplatesSection;

