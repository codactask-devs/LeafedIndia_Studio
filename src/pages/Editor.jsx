import React, { useRef, useState, useCallback } from "react";
import jsPDF from "jspdf";
import LeftSidebar from "../components/LeftSidebar";
import Sidebar from "../components/Sidebar";
import CanvasArea from "../components/CanvasArea";
import Toolbar from "../components/Toolbar";
import QuickAction from "../components/QuickAction";
import useStore from "../store/useStore";
import "../App.css";

function Editor() {
  const { addObject, setTemplate } = useStore();
  const loadSvgTemplate = useStore((state) => state.loadSvgTemplate);

  const stageRef = useRef(null);

  // Share State
  const [isSending, setIsSending] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const payloadStr = e.dataTransfer.getData("payload");
    const payload = payloadStr ? JSON.parse(payloadStr) : {};

    const x = 100 + Math.random() * 50;
    const y = 100 + Math.random() * 50;

    if (type === "image") {
      addObject({
        type: "image",
        src: payload.src || "https://via.placeholder.com/150",
        x,
        y,
        width: 250,
        height: 250,
      });
    } else if (type === "text") {
      addObject({
        type: "text",
        text: payload.text || "Hello",
        fontSize: payload.fontSize || 32,
        fontWeight: payload.fontWeight || "400",
        fontFamily: payload.fontFamily || "'Outfit', sans-serif",
        fill: "#0f172a",
        x,
        y,
      });
    } else if (type === "svg-template") {
      loadSvgTemplate(x, y, payload.url);
    } else if (type === "template") {
      setTemplate(payload);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleExportPdfClick = async () => {
    if (!stageRef.current) return;
    setIsSending(true);

    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const pdf = new jsPDF("l", "pt", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], "design.pdf", { type: "application/pdf" });

      // Create FormData to send the file to our new backend
      const formData = new FormData();
      formData.append("pdf", pdfFile); // "pdf" matches the multer string in server/index.js

      try {
        const response = await fetch("http://localhost:5000/api/send-pdf", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          alert("Success! The PDF has been sent to maheshmarvel009@gmail.com.");
        } else {
          const errorData = await response.json();
          alert("Failed to send design: " + errorData.error);
        }
      } catch (networkError) {
         console.error("Network error sending PDF:", networkError);
         alert("Cannot connect to backend server. Make sure the Node server is running on port 5000.");
      }

    } catch (error) {
      console.error("Error creating/sending PDF: ", error);
      alert("Failed to create design.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app-main-container">


      <Toolbar onExport={handleExportPdfClick} />
      <div className="app-content-layout">
        <LeftSidebar />
        <Sidebar />
        <main
          className="canvas-workspace"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CanvasArea stageRef={stageRef} />
          <QuickAction />
        </main>
      </div>
    </div>
  );
}

export default Editor;
