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
  const { 
    addObject, 
    setTemplate, 
    objects,
    savedDesigns, 
    addSavedDesign, 
    removeSavedDesign,
    clearSavedDesigns, 
    hasChanges,
    setHasChanges,
    showConfirmModal,
    setShowConfirmModal,
    pendingTemplate,
    setPendingTemplate,
    resetCanvas,
    loadSvgTemplate: storeLoadSvgTemplate
  } = useStore();

  const stageRef = useRef(null);

  // States for modals and notifications
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSaveNameModal, setShowSaveNameModal] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type }
  
  // Design Name State
  const [tempDesignName, setTempDesignName] = useState("");

  // User Info Form State
  const [userInfo, setUserInfo] = useState({
    name: "",
    contact: "",
    email: ""
  });

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      if (hasChanges && objects.length > 0) {
        setPendingTemplate({ type: 'svg-template', x, y, url: payload.url });
        setShowConfirmModal(true);
      } else {
        storeLoadSvgTemplate(x, y, payload.url);
      }
    } else if (type === "template") {
      if (hasChanges && objects.length > 0) {
        setPendingTemplate({ type: 'template', payload });
        setShowConfirmModal(true);
      } else {
        setTemplate(payload);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getCanvasBlob = async () => {
    if (!stageRef.current) return null;
    // Use JPEG with 0.8 quality and 1.5 pixelRatio to significantly reduce size from 7.7MB to ~1MB
    const dataUrl = stageRef.current.toDataURL({ 
      mimeType: "image/jpeg", 
      quality: 0.8, 
      pixelRatio: 1.5 
    });
    const pdf = new jsPDF("l", "pt", "a4");
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Add image as JPEG with high compression
    pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    return pdf.output("blob");
  };

  const initiateSave = () => {
    setTempDesignName(`Design ${savedDesigns.length + 1}`);
    setShowSaveNameModal(true);
  };

  const handleSaveDesign = async (e) => {
    if (e) e.preventDefault();
    if (!tempDesignName) return;

    const pdfBlob = await getCanvasBlob();
    if (pdfBlob) {
      addSavedDesign({ name: tempDesignName, blob: pdfBlob });
      setShowSaveNameModal(false);
      notify("Design saved to attachments!");
      
      // If we were in a "Save & Switch" flow, handle the switch now
      if (pendingTemplate) {
        executeTemplateSwitch();
      }
    }
  };

  const executeTemplateSwitch = () => {
    if (pendingTemplate) {
      if (pendingTemplate.type === 'svg-template') {
        storeLoadSvgTemplate(pendingTemplate.x, pendingTemplate.y, pendingTemplate.url);
      } else if (pendingTemplate.type === 'template') {
        setTemplate(pendingTemplate.payload);
      }
    }
    setShowConfirmModal(false);
    setPendingTemplate(null);
  };

  const handleConfirmDiscard = () => {
    executeTemplateSwitch();
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    initiateSave();
    // executeTemplateSwitch is called inside handleSaveDesign after saving
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    setPendingTemplate(null);
  };

  const handleExportClick = () => {
    setShowUserModal(true);
  };

  const handleFinalExport = async (e) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.contact || !userInfo.email) {
      notify("Please fill in all details.", "error");
      return;
    }

    setShowUserModal(false);
    setIsSending(true);

    try {
      const formData = new FormData();
      
      formData.append("userName", userInfo.name);
      formData.append("userContact", userInfo.contact);
      formData.append("userEmail", userInfo.email);

      savedDesigns.forEach((design) => {
        formData.append("pdfs", new File([design.blob], `${design.name}.pdf`, { type: "application/pdf" }));
      });

      if (hasChanges && objects.length > 0) {
        const currentBlob = await getCanvasBlob();
        formData.append("pdfs", new File([currentBlob], "current-design.pdf", { type: "application/pdf" }));
      }

      const response = await fetch("http://localhost:5000/api/send-pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        notify(`Success! Designs sent to maheshmarvel009@gmail.com.`);
        clearSavedDesigns();
        resetCanvas();
      } else {
        const errorData = await response.json();
        notify("Failed to send: " + errorData.error, "error");
      }
    } catch (error) {
       console.error("Export error:", error);
       notify("Cannot connect to backend server.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app-main-container">
      <Toolbar 
        onExport={handleExportClick} 
        onSave={initiateSave} 
        onToggleSavedList={() => setShowAttachments(!showAttachments)} 
      />
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes. Save before switching templates?</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleConfirmCancel}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDiscard}>Discard</button>
              <button className="btn btn-success" onClick={handleConfirmSave}>Save & Switch</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Name Modal */}
      {showSaveNameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Save Design</h3>
            <p>Enter a name for this attachment.</p>
            <form onSubmit={handleSaveDesign}>
                <div className="user-modal">
                    <div className="form-group">
                        <input 
                        type="text" 
                        placeholder="Design Name" 
                        value={tempDesignName}
                        onChange={(e) => setTempDesignName(e.target.value)}
                        autoFocus
                        required
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => { setShowSaveNameModal(false); setPendingTemplate(null); }}>Cancel</button>
                    <button type="submit" className="btn btn-success">Save Design</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content user-modal">
            <h3>Your Details</h3>
            <p>Please enter your details to receive the export.</p>
            <form onSubmit={handleFinalExport}>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Contact Number" 
                  value={userInfo.contact}
                  onChange={(e) => setUserInfo({...userInfo, contact: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send & Export</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment List Popup */}
      {showAttachments && (
        <div className="attachments-popup shadow-lg">
          <div className="popup-header">
            <h4>Saved Attachments ({savedDesigns.length})</h4>
            <button className="close-btn" onClick={() => setShowAttachments(false)}>&times;</button>
          </div>
          <div className="popup-body">
            {savedDesigns.length === 0 ? (
              <p className="empty-text">No designs saved yet.</p>
            ) : (
              <ul className="attachment-list">
                {savedDesigns.map((design) => (
                  <li key={design.id} className="attachment-item">
                    <span>{design.name}</span>
                    <button className="remove-btn" onClick={() => removeSavedDesign(design.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <p>{notification.message}</p>
        </div>
      )}

      {isSending && (
        <div className="sending-overlay">
            <div className="loading-spinner"></div>
            <p>Preparing and sending your designs...</p>
        </div>
      )}
    </div>
  );
}

export default Editor;
