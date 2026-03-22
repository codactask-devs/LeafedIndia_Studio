import React from "react";
import { Package } from "lucide-react";
import useStore from "../store/useStore";
import "./TemplatesSection.css";

// Dynamic template discovery using Vite's glob import
const templateFiles = import.meta.glob("../templates/*.svg", { eager: true });

const TemplatesSection = () => {
    const { loadSvgTemplate } = useStore();

    // Map discovered files to the template list dynamically
    const templatesList = Object.entries(templateFiles).map(([path, module]) => {
        const fileName = path.split('/').pop().replace('.svg', '');
        const url = module.default;
        return {
            id: fileName.toLowerCase().replace(/\s+/g, '-'),
            name: fileName,
            url: url,
            thumbnail: url
        };
    });

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

