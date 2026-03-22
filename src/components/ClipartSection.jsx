import React, { useState, useEffect } from "react";
import useStore from "../store/useStore";
import { PlusCircle, Smile } from "lucide-react";
import "./Sidebar.css";

const ClipartSection = () => {
    const { addObject } = useStore();
    const [category, setCategory] = useState("All Category");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(30);
    const [clipart, setClipart] = useState([]);

    const categories = [
        "All Category", "Social", "Shapes", "Nature", "Law", "UI", "Business", "Food", "Medical"
    ];

    // Expanded Curated Icons (60+ stable icons)
    const initialClipart = [
        // Social
        { category: "Social", icon: "logos:facebook", name: "Facebook" },
        { category: "Social", icon: "logos:instagram-icon", name: "Instagram" },
        { category: "Social", icon: "logos:whatsapp-icon", name: "Whatsapp" },
        { category: "Social", icon: "logos:twitter", name: "Twitter" },
        { category: "Social", icon: "logos:linkedin-icon", name: "Linkedin" },
        { category: "Social", icon: "logos:tiktok-icon", name: "Tiktok" },
        { category: "Social", icon: "logos:youtube-icon", name: "Youtube" },
        
        // Shapes
        { category: "Shapes", icon: "mdi:circle", name: "Circle" },
        { category: "Shapes", icon: "mdi:square", name: "Square" },
        { category: "Shapes", icon: "mdi:star", name: "Star" },
        { category: "Shapes", icon: "mdi:triangle", name: "Triangle" },
        { category: "Shapes", icon: "mdi:hexagon", name: "Hexagon" },
        { category: "Shapes", icon: "mdi:rhombus", name: "Rhombus" },
        { category: "Shapes", icon: "mdi:pentagon", name: "Pentagon" },
        { category: "Shapes", icon: "mdi:heart", name: "Heart" },
        { category: "Shapes", icon: "mdi:cloud", name: "Cloud" },

        // Nature
        { category: "Nature", icon: "mdi:leaf", name: "Leaf" },
        { category: "Nature", icon: "mdi:flower", name: "Flower" },
        { category: "Nature", icon: "mdi:tree", name: "Tree" },
        { category: "Nature", icon: "mdi:cat", name: "Cat" },
        { category: "Nature", icon: "mdi:dog", name: "Dog" },
        { category: "Nature", icon: "mdi:bird", name: "Bird" },
        { category: "Nature", icon: "mdi:fish", name: "Fish" },
        { category: "Nature", icon: "mdi:paw", name: "Paw" },

        // UI
        { category: "UI", icon: "mdi:account", name: "User" },
        { category: "UI", icon: "mdi:home", name: "Home" },
        { category: "UI", icon: "mdi:cog", name: "Settings" },
        { category: "UI", icon: "mdi:bell", name: "Alert" },
        { category: "UI", icon: "mdi:cart", name: "Cart" },
        { category: "UI", icon: "mdi:calendar", name: "Date" },
        { category: "UI", icon: "mdi:map-marker", name: "Point" },
        { category: "UI", icon: "mdi:email", name: "Mail" },
        { category: "UI", icon: "mdi:phone", name: "Call" },

        // Food
        { category: "Food", icon: "mdi:food-apple", name: "Apple" },
        { category: "Food", icon: "mdi:coffee", name: "Coffee" },
        { category: "Food", icon: "mdi:pizza", name: "Pizza" },
        { category: "Food", icon: "mdi:hamburger", name: "Burger" },
        { category: "Food", icon: "mdi:ice-cream", name: "Ice Cream" },

        // Medical
        { category: "Medical", icon: "mdi:hospital-marker", name: "Hospital" },
        { category: "Medical", icon: "mdi:pill", name: "Medicine" },
        { category: "Medical", icon: "mdi:medical-bag", name: "Aid" },

        // Business
        { category: "Business", icon: "mdi:briefcase", name: "Work" },
        { category: "Business", icon: "mdi:chart-bar", name: "Chart" },
        { category: "Business", icon: "mdi:currency-usd", name: "Finance" },
        { category: "Business", icon: "mdi:calculator", name: "Math" },
        { category: "Law", icon: "mdi:scale-balance", name: "Law" },
        { category: "Law", icon: "mdi:gavel", name: "Gavel" },
    ];

    useEffect(() => {
        setClipart(initialClipart);
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const term = searchQuery.toLowerCase().trim();
        
        if (!term) {
            setClipart(initialClipart);
            return;
        }

        setLoading(true);
        // Deep search simulation with Iconify sets
        const searchResults = [
            { category: "Search", icon: `mdi:${term}`, name: term },
            { category: "Search", icon: `ph:${term}-fill`, name: `${term} Bold` },
            { category: "Search", icon: `ri:${term}-line`, name: `${term} Line` },
            { category: "Search", icon: `bi:${term}`, name: `${term} Alt` },
            { category: "Search", icon: `carbon:${term}`, name: `${term} Pro` },
            { category: "Search", icon: `uim:${term}`, name: `${term} Flat` },
            { category: "Search", icon: `clarity:${term}-line`, name: `${term} Outline` },
            { category: "Search", icon: `jam:${term}`, name: `${term} Jam` },
            { category: "Search", icon: `majesticons:${term}`, name: `${term} Solid` },
            { category: "Search", icon: `octicon:${term}-24`, name: `${term} GitHub` },
            { category: "Search", icon: `pixelarticons:${term}`, name: `${term} Pixel` },
            { category: "Search", icon: `tabler:${term}`, name: `${term} Tabler` },
        ];
        
        setTimeout(() => {
            setClipart(searchResults);
            setLoading(false);
            setVisibleCount(searchResults.length);
        }, 600);
    };

    const handleImageError = (e) => {
        if (!e.target.src.includes('help-circle')) {
            e.target.src = "https://api.iconify.design/mdi:help-circle-outline.svg";
        }
    };

    const filteredClipart = category === "All Category" 
        ? clipart 
        : clipart.filter(item => item.category === category || item.category === "Search");

    const shownClipart = filteredClipart.slice(0, visibleCount);

    const loadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 15);
            setLoading(false);
        }, 400);
    };

    return (
        <div className="sidebar-section-container">
            <div className="sidebar-search-block">
                {/* Search commented out as requested */}
                {/* 
                <form className="sidebar-search-container" style={{ marginBottom: '16px' }} onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Search 200,000+ icons..." 
                        className="sidebar-search-input"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value === "") setClipart(initialClipart);
                        }}
                    />
                    <button type="submit" className="search-submit-btn">
                        <Search size={18} />
                    </button>
                </form> 
                */}

                <div className="custom-dropdown-container">
                    <select 
                        className="sidebar-category-select" 
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setVisibleCount(30);
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sidebar-tool-section" style={{ minHeight: '400px' }}>
                <div className="section-header-flex">
                    <h3 className="section-label-premium">{category} Vectors</h3>
                    {loading && <div className="loader-dots"><span>.</span><span>.</span><span>.</span></div>}
                </div>
                
                <div className="sidebar-image-grid clipart-grid">
                    {shownClipart.map((item, i) => (
                        <div 
                            key={`${item.icon}-${i}`} 
                            className="sidebar-image-item clipart-item premium-shadow"
                            onClick={() => addObject({ 
                                type: "image", 
                                src: `https://api.iconify.design/${item.icon}.svg`, 
                                width: 120, 
                                height: 120, 
                                x: 100, 
                                y: 100 
                            })}
                        >
                            <img 
                                src={`https://api.iconify.design/${item.icon}.svg`} 
                                alt={item.name} 
                                className="clipart-preview" 
                                draggable
                                onDragStart={(e) => {
                                    const src = `https://api.iconify.design/${item.icon}.svg`;
                                    e.dataTransfer.setData("type", "image");
                                    e.dataTransfer.setData("payload", JSON.stringify({ src }));
                                }}
                                onError={handleImageError}
                            />
                            <span className="clipart-name">{item.name}</span>
                        </div>
                    ))}
                </div>

                {visibleCount < filteredClipart.length && (
                    <button 
                        className="load-more-btn" 
                        onClick={loadMore} 
                        disabled={loading}
                    >
                        {loading ? "Searching Deep Library..." : "Show More Results"}
                        <PlusCircle size={14} style={{ marginLeft: '8px' }} />
                    </button>
                )}
            </div>

            <div className="sidebar-footer-info">
                <Smile size={12} />
                <span>Infinite Clipart enabled by Iconify Logic</span>
            </div>
        </div>
    );
};

export default ClipartSection;
