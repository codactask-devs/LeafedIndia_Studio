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

    // Initial stock images for first load
    const initialImages = [
        "https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=400&q=80",
        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
        "https://images.unsplash.com/photo-1503023345030-a7c39a75d0b4?w=400&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80",
    ];

    useEffect(() => {
        setImages(initialImages);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        // Using a keyword-based randomizer for demo purposes without requiring a key instantly
        // To build a production search, use Unsplash API: https://unsplash.com/documentation#search-photos
        const newImages = Array.from({ length: 12 }, (_, i) => 
            `https://source.unsplash.com/featured/300x300?${searchQuery || 'nature'}&sig=${Math.random() + i}`
        );
        
        setTimeout(() => {
            setImages(newImages);
            setLoading(false);
            setPage(1);
        }, 800);
    };

    const loadMore = () => {
        setLoading(true);
        const moreImages = Array.from({ length: 8 }, (_, i) => 
            `https://source.unsplash.com/featured/300x300?${searchQuery || 'design'}&sig=${Math.random() + i + (page * 10)}`
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
                    <Search size={16} className="search-icon" />
                    <input 
                        type="search" 
                        placeholder="Search assets (e.g. box, food, leaf)..." 
                        className="sidebar-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                            key={i} 
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
                    {loading ? "Discovering..." : "Discover More"}
                    <PlusCircle size={14} style={{ marginLeft: '8px' }} />
                </button>
            </div>
            
            <div className="sidebar-footer-info">
                <Sparkles size={12} />
                <span>Powered by Unsplash Visual Search</span>
            </div>
        </div>
    );
};

export default ImagesSection;
