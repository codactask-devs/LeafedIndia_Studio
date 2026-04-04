import React, { useRef, useState, useEffect } from "react";
import { Upload } from "lucide-react";
import useStore from "../store/useStore";
import "./Sidebar.css";

const ImagesSection = () => {
    const { addObject, uploadedImages, setUploadedImages, removeUploadedImage } = useStore();
    const fileInputRef = useRef(null);

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

            <div className="sidebar-tool-section" style={{ minHeight: '300px' }}>
                <h3 className="section-label-premium">My Images</h3>

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
                                    minWidth: 'auto'
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
                        </div>
                    ))}
                </div>

                {uploadedImages.length === 0 && (
                    <div className="no-uploaded-images">
                        <p>No images uploaded yet. Upload your first image!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImagesSection;
