import React from "react";
import { Package, Image as ImageIcon } from "lucide-react";
import useStore from "../store/useStore";
import "./TemplatesSection.css";

// Dynamic template discovery using Vite's glob import
const templateFiles = import.meta.glob("../templates/*.svg", { eager: true });
const thumbnailFiles = import.meta.glob("../assets/template-thumbnails/*.{png,jpg,jpeg,webp}", { eager: true });

const TemplatesSection = () => {
    const { loadSvgTemplate, hasChanges, setShowConfirmModal, setPendingTemplate, objects } = useStore();

    // Map discovered files to the template list dynamically
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

    const handleTemplateClick = (template) => {
        if (hasChanges && objects.length > 0) {
            setPendingTemplate({ type: 'svg-template', x: 100, y: 100, url: template.url });
            setShowConfirmModal(true);
        } else {
            loadSvgTemplate(100, 100, template.url);
        }
    };

    const handleDragStart = (e, url) => {
        e.dataTransfer.setData("type", "svg-template");
        e.dataTransfer.setData("payload", JSON.stringify({ url }));
    };

    return (
        <div className="sidebar-section-container">
            <h3 className="section-label-premium">Select Template</h3>
            <div className="templates-grid">
                {templatesList.map((template) => (
                    <div
                        key={template.id}
                        className="templates-item premium-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, template.url)}
                        onClick={() => handleTemplateClick(template)}
                        title={template.name}
                    >
                        <div className="template-preview-box">
                            {template.thumbnail ? (
                                <img src={template.thumbnail} alt={template.name} className="template-thumbnail" />
                            ) : (
                                <Package size={32} />
                            )}
                        </div>
                        <span className="template-name">{template.name}</span>
                    </div>
                ))}
            </div>
            
            {/* <div className="sidebar-help-text" style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '11px' }}>
                <ImageIcon size={14} style={{ marginBottom: '4px', opacity: 0.5 }} />
                <p>More templates coming soon!</p>
            </div> */}
        </div>
    );
};

export default TemplatesSection;


