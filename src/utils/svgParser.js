export const parseSvgContent = (svgContent) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const paths = svgDoc.querySelectorAll("polygon, path");
  const parsedPaths = [];
  let width = 800;
  let height = 600;
  if (svgDoc.documentElement) {
    const viewBox = svgDoc.documentElement.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/);
      if (parts.length === 4) {
        width = parseFloat(parts[2]);
        height = parseFloat(parts[3]);
      }
    } else {
        width = parseFloat(svgDoc.documentElement.getAttribute("width")) || 800;
        height = parseFloat(svgDoc.documentElement.getAttribute("height")) || 600;
    }
  }

  paths.forEach((pathEl, index) => {
    let data = pathEl.getAttribute("points") || pathEl.getAttribute("d");
    if (data) {
      if (pathEl.tagName.toLowerCase() === "polygon") {
        const pts = data.trim().split(/[\s,]+/);
        const formattedPts = [];
        for (let i = 0; i < pts.length; i += 2) {
          if (pts[i] !== "" && pts[i+1] !== undefined) {
             formattedPts.push(pts[i] + " " + pts[i+1]);
          }
        }
        if (formattedPts.length > 0) {
          data = "M " + formattedPts[0] + " L " + formattedPts.slice(1).join(" L ") + " Z";
        }
      }
      
      const className = pathEl.getAttribute("class") || "";
      let fill = pathEl.getAttribute("fill") || pathEl.style.fill;
      if (!fill) {
        if (className.includes("fil0")) fill = "transparent";
        else fill = "#FEFEFE";
      }
      
      let stroke = pathEl.getAttribute("stroke") || pathEl.style.stroke;
      if (!stroke) stroke = "#2B2A29";
      
      let strokeWidth = parseFloat(pathEl.getAttribute("stroke-width") || pathEl.style.strokeWidth || "200");
      
      parsedPaths.push({
        id: `path-${index}`,
        type: "svg-path",
        data,
        isPolygon: pathEl.tagName.toLowerCase() === "polygon",
        fill,
        stroke,
        strokeWidth,
      });
    }
  });
  return { paths: parsedPaths, width, height };
};

export const parseFoodBoxSvg = parseSvgContent;

// Export base64 SVG for fallback
export const getFoodBoxSvgSrc = () => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 299941.4 299941.4" width="800" height="800">
 <!-- Full SVG content here -->
 <polygon points="197937.7,166891.7 171942.8,166891.7 169943.2,169891.1 130021.4,169891.1 128021.8,166891.7 102026.9,166891.7 100018.2,169904.8 74989.7,169904.8 74989.7,201949.4 82558.1,205260.8 74989.7,209856.3 74989.7,230914.6 82980.1,234410.2 74989.7,237906.1 74989.8,269951.2 224951.9,269951.2 224952,237906.1 216961.5,234410.2 224952,230914.6 224952,209856.3 217383.5,205260.8 224952,201949.4 224952,169904.8 199946.5,169904.8 " fill="#FEFEFE" stroke="#2B2A29" stroke-width="200"/>
 <!-- More paths... -->
</svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgContent)));
};

