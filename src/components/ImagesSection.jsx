import React, { useRef, useState, useEffect } from "react";
import { Upload, Search, PlusCircle, Sparkles } from "lucide-react";
import useStore from "../store/useStore";
import "./Sidebar.css";

const ImagesSection = () => {
    const { addObject } = useStore();
    const fileInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Using LoremFlickr for initial load too - much more stable than static Unsplash IDs
    const initialImages = [
        "https://loremflickr.com/320/320/design?lock=1",
        "https://loremflickr.com/320/320/food?lock=2",
        "https://loremflickr.com/320/320/nature?lock=3",
        "https://loremflickr.com/320/320/abstract?lock=4",
        "https://loremflickr.com/320/320/business?lock=5",
        "https://loremflickr.com/320/320/creative?lock=6",
    ];

    useEffect(() => {
        setImages(initialImages);
    }, []);

    const handleImageError = (e) => {
        // If image fails, replace with a colored placeholder or a generic pattern
        e.target.src = `https://via.placeholder.com/320x320/f1f5f9/94a3b8?text=Image+Unavailable`;
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) {
            setImages(initialImages);
            return;
        }

        setLoading(true);
        // Using LoremFlickr for better reliability than source.unsplash
        const newImages = Array.from({ length: 12 }, (_, i) => 
            `https://loremflickr.com/320/320/${searchQuery}?lock=${Math.floor(Math.random() * 1000) + i}`
        );
        
        setTimeout(() => {
            setImages(newImages);
            setLoading(false);
            setPage(1);
        }, 800);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setImages(initialImages);
        setPage(1);
    };

    const loadMore = () => {
        setLoading(true);
        const query = searchQuery || 'design';
        const moreImages = Array.from({ length: 8 }, (_, i) => 
            `https://loremflickr.com/320/320/${query}?lock=${Math.floor(Math.random() * 1000) + (page * 12) + i}`
        );
        
        setTimeout(() => {
            setImages(prev => [...prev, ...moreImages]);
            setPage(prev => prev + 1);
            setLoading(false);
        }, 600);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
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

    return (
        <div className="sidebar-section-container">
            <div className="sidebar-search-block">
                <form className="sidebar-search-container" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Try 'box', 'food', 'nature'..." 
                        className="sidebar-search-input"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value === "") setImages(initialImages);
                        }}
                    />
                    {searchQuery && (
                        <button type="button" className="clear-search-btn" onClick={handleClearSearch}>×</button>
                    )}
                    <button type="submit" className="search-submit-btn">
                        <Search size={18} />
                    </button>
                </form>
                
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
                <div className="section-header-flex">
                    <h3 className="section-label-premium">Curated Gallery</h3>
                    {loading && <div className="loader-dots"><span>.</span><span>.</span><span>.</span></div>}
                </div>
                
                <div className="sidebar-image-grid">
                    {images.map((src, i) => (
                        <div 
                            key={`${src}-${i}`} 
                            className="sidebar-image-item premium-shadow"
                            onClick={() => addObject({ type: "image", src, x: 100, y: 100, width: 250, height: 250 })}
                        >
                            <img
                                src={src}
                                className="sidebar-draggable-image"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("type", "image");
                                    e.dataTransfer.setData("payload", JSON.stringify({ src }));
                                }}
                                onError={handleImageError}
                                alt={`curated-${i}`}
                            />
                        </div>
                    ))}
                </div>

                <button 
                    className="load-more-btn" 
                    onClick={loadMore} 
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Show More Results"}
                    <PlusCircle size={14} style={{ marginLeft: '8px' }} />
                </button>
            </div>
            
            <div className="sidebar-footer-info">
                <Sparkles size={12} />
                <span>Powered by Intelligent Visual Search</span>
            </div>
        </div>
    );
};

export default ImagesSection;
