import React, { useRef, useState, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import useStore from "../store/useStore";
import "./Sidebar.css";

// Dynamic discovery of pre-uploaded images
const preUploadedFiles = import.meta.glob("../assets/pre-uploaded/*.{png,jpg,jpeg,svg,webp}", { eager: true });

const ImagesSection = () => {
    const { addObject, uploadedImages, setUploadedImages, removeUploadedImage } = useStore();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState("preuploaded"); // "preuploaded" or "myimages"

    // Map discovered files to a usable list
    const preUploadedImages = Object.entries(preUploadedFiles).map(([path, module]) => {
        const fileName = path.split('/').pop();
        const name = fileName.split('.')[0].replace(/[-_]/g, ' ');
        return {
            id: `pre-${fileName}`,
            src: module.default,
            name: name.charAt(0).toUpperCase() + name.slice(1)
        };
    });

    useEffect(() => {
        // Load images from localStorage on component mount
        const savedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
        setUploadedImages(savedImages);
    }, [setUploadedImages]);

    const handleImageError = (e) => {
        // If image fails, replace with a colored placeholder or a generic pattern
        e.target.src = `https://via.placeholder.com/320x320/f1f5f9/94a3b8?text=Image+Unavailable`;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Save to localStorage
                    const imageData = {
                        id: Date.now(), // Simple ID generation
                        src: event.target.result,
                        name: file.name,
                        timestamp: new Date().toISOString()
                    };

                    // Update localStorage
                    const savedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
                    const newImages = [imageData, ...savedImages]; // New images first
                    localStorage.setItem('uploadedImages', JSON.stringify(newImages));
                    setUploadedImages(newImages);

                    // Add to canvas
                    addObject({
                        type: "image",
                        src: event.target.result,
                        width: 200,
                        height: 200 * (img.height / img.width),
                        x: 100,
                        y: 100,
                    });

                    // Switch to My Images tab after upload
                    setActiveTab("myimages");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (imageId) => {
        // Remove from localStorage
        const savedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
        const newImages = savedImages.filter(img => img.id !== imageId);
        localStorage.setItem('uploadedImages', JSON.stringify(newImages));
        setUploadedImages(newImages);
        removeUploadedImage(imageId);
    };

    return (
        <div className="sidebar-section-container">
            <div className="sidebar-search-block">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    accept="image/*"
                />
                <button
                    className="btn btn-primary sidebar-full-width"
                    style={{ marginTop: '16px' }}
                    onClick={() => fileInputRef.current.click()}
                >
                    <Upload size={18} />
                    <span>Upload Custom</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="image-tabs-container" style={{ marginTop: '24px', marginBottom: '16px' }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0'
                }}>
                    <button
                        onClick={() => setActiveTab("preuploaded")}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: activeTab === "preuploaded" ? '600' : '500',
                            color: activeTab === "preuploaded" ? '#5ddf4bff' : '#64748b',
                            cursor: 'pointer',
                            borderBottom: activeTab === "preuploaded" ? '2px solid #5ddf4bff' : '2px solid transparent',
                            transition: 'all 0.2s ease',
                            backgroundColor: activeTab === "preuploaded" ? '#eff6ff' : 'transparent',
                            borderRadius: '8px 8px 0 0'
                        }}
                    >
                        Pre-uploaded Images
                        {/* <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '11px', 
                            backgroundColor: activeTab === "preuploaded" ? '#dbeafe' : '#e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            color: activeTab === "preuploaded" ? '#5ddf4bff' : '#475569'
                        }}>
                            {preUploadedImages.length}
                        </span> */}
                    </button>
                    <button
                        onClick={() => setActiveTab("myimages")}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: activeTab === "myimages" ? '600' : '500',
                            color: activeTab === "myimages" ? '#5ddf4bff' : '#64748b',
                            cursor: 'pointer',
                            borderBottom: activeTab === "myimages" ? '2px solid #5ddf4bff' : '2px solid transparent',
                            transition: 'all 0.2s ease',
                            backgroundColor: activeTab === "myimages" ? '#eff6ff' : 'transparent',
                            borderRadius: '8px 8px 0 0'
                        }}
                    >
                        My Images
                        {/* <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '11px', 
                            backgroundColor: activeTab === "myimages" ? '#dbeafe' : '#e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            color: activeTab === "myimages" ? '#5ddf4bff' : '#475569'
                        }}>
                            {uploadedImages.length}
                        </span> */}
                    </button>
                </div>
            </div>

            {/* Pre-uploaded Images Tab Content */}
            {activeTab === "preuploaded" && (
                <div className="sidebar-tool-section" style={{ minHeight: 'auto' }}>
                    <div className="sidebar-image-grid">
                        {preUploadedImages.map((image) => (
                            <div
                                key={image.id}
                                className="sidebar-image-item premium-shadow"
                                title={image.name}
                            >
                                <img
                                    src={image.src}
                                    className="sidebar-draggable-image"
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("type", "image");
                                        e.dataTransfer.setData("payload", JSON.stringify({ src: image.src }));
                                    }}
                                    onError={handleImageError}
                                    alt={image.name}
                                    onClick={() => addObject({ type: "image", src: image.src, x: 100, y: 100, width: 250, height: 250 })}
                                />
                                <div style={{ 
                                    fontSize: '11px', 
                                    textAlign: 'center', 
                                    padding: '4px',
                                    color: '#64748b',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {image.name}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {preUploadedImages.length === 0 && (
                        <div className="no-uploaded-images">
                            <p>No pre-uploaded images found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* My Images Tab Content */}
            {activeTab === "myimages" && (
                <div className="sidebar-tool-section" style={{ minHeight: '300px' }}>
                    <div className="sidebar-image-grid">
                        {uploadedImages.map((image) => (
                            <div
                                key={image.id}
                                className="sidebar-image-item premium-shadow"
                                style={{ position: 'relative' }}
                            >
                                <button
                                    className="header-action-btn delete-btn"
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        zIndex: 10,
                                        width: '24px',
                                        height: '24px',
                                        padding: '0',
                                        minWidth: 'auto',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(image.id);
                                    }}
                                >
                                    ×
                                </button>
                                <img
                                    src={image.src}
                                    className="sidebar-draggable-image"
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("type", "image");
                                        e.dataTransfer.setData("payload", JSON.stringify({ src: image.src }));
                                    }}
                                    onError={handleImageError}
                                    alt={image.name}
                                    onClick={() => addObject({ type: "image", src: image.src, x: 100, y: 100, width: 250, height: 250 })}
                                />
                                <div style={{ 
                                    fontSize: '11px', 
                                    textAlign: 'center', 
                                    padding: '4px',
                                    color: '#64748b',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {image.name.length > 20 ? image.name.substring(0, 17) + '...' : image.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {uploadedImages.length === 0 && (
                        <div className="no-uploaded-images">
                            <p>No images uploaded yet. Upload your first image!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImagesSection;