import React from "react";
import { Package } from "lucide-react";
import useStore from "../store/useStore";
import foodBoxUrl from "../templates/FOOD BOX.svg";
import "./TemplatesSection.css";

const TemplatesSection = () => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("type", "svg-template");
    e.dataTransfer.setData("payload", JSON.stringify({ url: foodBoxUrl }));
  };

  return (
    <div className="templates-tool-section">
      <h3>Box Templates</h3>
      <div className="templates-grid">
        <div
          className="templates-item"
          draggable
          onDragStart={handleDragStart}
          onClick={() => {
            const { loadSvgTemplate } = useStore.getState();
            loadSvgTemplate(100, 100, foodBoxUrl);
          }}
          title="Food Box Template"
        >
          <Package size={40} />
          <span>FOOD BOX</span>
        </div>
      </div>
    </div>
  );
};

export default TemplatesSection;

