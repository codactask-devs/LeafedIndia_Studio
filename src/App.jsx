import React, { useRef, useState, useCallback } from "react";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";
import Sidebar from "./components/Sidebar";
import CanvasArea from "./components/CanvasArea";
import Toolbar from "./components/Toolbar";
import useStore from "./store/useStore";
import "./App.css";

function App() {
  const { addObject, setTemplate } = useStore();
  const loadSvgTemplate = useStore((state) => state.loadSvgTemplate);

  const stageRef = useRef(null);

  // Auto-load food box template on mount
  React.useEffect(() => {
    import("./templates/FOOD BOX.svg").then(module => {
       loadSvgTemplate(100, 100, module.default);
    });
  }, [loadSvgTemplate]);
  
  // Email Modal State
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
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
        width: 200,
        height: 200,
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

  const handleExportPdfClick = () => {
    setShowModal(true);
  };

  const submitPdfStr = async (e) => {
    e.preventDefault();
    if (!stageRef.current) return;
    setIsSending(true);

    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const pdf = new jsPDF("l", "pt", "a4"); 
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const pdfBase64 = pdf.output("datauristring"); 

      // Send via EmailJS
      const templateParams = {
        user_name: userInfo.name,
        user_email: userInfo.email,
        to_email: "maheshmarvel009@gmail.com",
        pdf_base64: pdfBase64 
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID", 
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID", 
        templateParams, 
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
      );

      alert("PDF Sent Successfully!");
      setShowModal(false);
      setUserInfo({ name: "", email: "" });
    } catch (error) {
      console.error("Error sending PDF: ", error);
      alert("Failed to send email. Check console or EmailJS limits.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app-main-container">
      {showModal && (
        <div className="app-modal-overlay">
          <div className="app-modal-content">
            <h2>Complete Your Design</h2>
            <p className="app-modal-subtitle">Enter your details below to receive the high-quality PDF of your custom design.</p>
            <form onSubmit={submitPdfStr}>
              <div className="app-form-group">
                <label htmlFor="user_name">Full Name</label>
                <input 
                  id="user_name"
                  type="text" 
                  value={userInfo.name} 
                  onChange={e => setUserInfo({...userInfo, name: e.target.value})} 
                  className="app-input"
                  placeholder="e.g. Mahesh Pandi"
                  required 
                />
              </div>
              <div className="app-form-group">
                <label htmlFor="user_email">Your Email Address</label>
                <input 
                  id="user_email"
                  type="email" 
                  value={userInfo.email} 
                  onChange={e => setUserInfo({...userInfo, email: e.target.value})} 
                  className="app-input"
                  placeholder="e.g. mahesh@example.com"
                  required 
                />
              </div>
              <div className="app-button-grid">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={isSending}>Discard</button>
                <button type="submit" className="btn btn-primary" disabled={isSending}>{isSending ? "Processing..." : "Finish & Send Email"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toolbar onExport={handleExportPdfClick} />
      <div className="app-content-layout">
        <Sidebar />
        <main
          className="canvas-workspace"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CanvasArea stageRef={stageRef} />
        </main>
      </div>
    </div>
  );
}

export default App;

