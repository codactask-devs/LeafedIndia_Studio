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
    { id: "templates", icon: LayoutGrid, label: "Templates" },
    { id: "images", icon: ImageIcon, label: "Images" },
    { id: "clipart", icon: Smile, label: "Clipart" },
    { id: "text", icon: Type, label: "Text" },
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
          className={`left-sidebar-item ${activeTab === item.id ? "active" : ""}`}
          onClick={() => handleTabClick(item.id)}
        >
          <item.icon size={24} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LeftSidebar;
