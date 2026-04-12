import React from "react";
import { 
  LayoutGrid, 
  Type, 
  Image as ImageIcon, 
  Smile,
  Sparkles
} from "lucide-react";
import useStore from "../store/useStore";
import "./LeftSidebar.css";

const LeftSidebar = () => {
  const { activeTab, setActiveTab, selectObject } = useStore();

  const menuItems = [
    { id: "templates", icon: LayoutGrid, label: "Templates", dataTour: "tab-templates" },
    { id: "images", icon: ImageIcon, label: "Images", dataTour: "tab-images" },
    { id: "text", icon: Type, label: "Text", dataTour: "tab-text" },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    selectObject(null); // Ensure we exit edit mode when switching tabs
  };

  return (
    <div className="left-sidebar">
      {menuItems.map((item) => (
        <button
          key={item.id}
          data-tour={item.dataTour}
          className={`left-sidebar-item ${activeTab === item.id ? "active" : ""}`}
          onClick={() => handleTabClick(item.id)}
        >
          <item.icon size={45} />
          <span style={{fontSize:"14px"}}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LeftSidebar;
