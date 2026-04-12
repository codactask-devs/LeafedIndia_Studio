import React, { useRef, useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Transformer,
  Path,
  Text,
  Group,
  Rect,
} from "react-konva";
import useImage from "use-image";
import useStore from "../store/useStore";
import "./CanvasArea.css";

const URLImage = ({ src, ...props }) => {
  const [image] = useImage(src, "anonymous");
  return <KonvaImage image={image} {...props} />;
};

const SelectionControls = ({ object, onDelete, onDuplicate, stageRef }) => {
  const [hovered, setHovered] = useState(null); // 'duplicate' | 'delete' | null
  const isMobile = window.innerWidth <= 768;

  // Get actual width from the node if possible for better accuracy
  let actualWidth = 0;
  if (stageRef && stageRef.current) {
    const node = stageRef.current.findOne("#" + object.id);
    if (node) {
      // Use the width of the node multiplied by its scale
      actualWidth = node.width() * node.scaleX();
    }
  }

  // Fallback if node not found or stage not ready
  if (!actualWidth) {
    if (object.type === "text") {
      const charWidth = (object.fontSize || 24) * 0.5;
      const textLength = (object.text || "").length;
      actualWidth = (textLength * charWidth) * (object.scaleX || 1);
    } else {
      actualWidth = (object.width || 150) * (object.scaleX || 1);
    }
  }

  // Position the container so it stays at the right edge
  // To avoid hiding the rotate handle (which is at actualWidth/2, y ≈ -40),
  // we ensure the controls are either to the right of center or far enough up.
  const controlWidth = isMobile ? 120 : 90;
  const offsetX = Math.max(actualWidth - controlWidth, (actualWidth / 2) + 15);

  return (
    <Group x={object.x} y={object.y} rotation={object.rotation}>
      <Group
        x={offsetX}
        y={-75} // Moved higher up to clear the rotate handle completely
        rotation={-object.rotation} // Counter-rotate to keep buttons horizontal
      >
        {/* Main Container Bar */}
        <Rect
          width={isMobile ? 120 : 90}
          height={isMobile ? 50 : 40}
          fill="white"
          cornerRadius={12}
          shadowColor="black"
          shadowBlur={15}
          shadowOpacity={0.12}
          stroke="#e2e8f0"
          strokeWidth={1}
        />

        {/* Duplicate Button */}
        <Group
          onClick={onDuplicate}
          onTap={onDuplicate}
          x={isMobile ? 12 : 10} y={isMobile ? 8 : 6}
          cursor="pointer"
          onMouseEnter={() => setHovered('duplicate')}
          onMouseLeave={() => setHovered(null)}
          scaleX={hovered === 'duplicate' ? 1.1 : 1}
          scaleY={hovered === 'duplicate' ? 1.1 : 1}
          offsetX={hovered === 'duplicate' ? 1.5 : 0}
          offsetY={hovered === 'duplicate' ? 1.5 : 0}
        >
          {/* Hover Background */}
          <Rect
            width={isMobile ? 40 : 30} height={isMobile ? 34 : 30}
            fill={hovered === 'duplicate' ? "#eff6ff" : "transparent"}
            cornerRadius={8}
          />
          <Path
            data="M9 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v4M15 19H9a2 2 0 01-2-2v-8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2z"
            stroke={hovered === 'duplicate' ? "#2563eb" : "#475569"}
            strokeWidth={1.8}
            x={isMobile ? 8 : 6} y={isMobile ? 8 : 6}
            scaleX={isMobile ? 0.9 : 0.7}
            scaleY={isMobile ? 0.9 : 0.7}
          />
        </Group>

        {/* Divider */}
        <Rect x={isMobile ? 60 : 45} y={10} width={1} height={isMobile ? 30 : 20} fill="#f1f5f9" />

        {/* Delete Button */}
        <Group
          onClick={onDelete}
          onTap={onDelete}
          x={isMobile ? 68 : 50} y={isMobile ? 8 : 6}
          cursor="pointer"
          onMouseEnter={() => setHovered('delete')}
          onMouseLeave={() => setHovered(null)}
          scaleX={hovered === 'delete' ? 1.1 : 1}
          scaleY={hovered === 'delete' ? 1.1 : 1}
          offsetX={hovered === 'delete' ? 1.5 : 0}
          offsetY={hovered === 'delete' ? 1.5 : 0}
        >
          {/* Hover Background */}
          <Rect
            width={isMobile ? 40 : 30} height={isMobile ? 34 : 30}
            fill={hovered === 'delete' ? "#fef2f2" : "transparent"}
            cornerRadius={8}
          />
          <Path
            data="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
            stroke={hovered === 'delete' ? "#dc2626" : "#475569"}
            strokeWidth={1.8}
            x={isMobile ? 8 : 6} y={isMobile ? 8 : 6}
            scaleX={isMobile ? 0.9 : 0.7}
            scaleY={isMobile ? 0.9 : 0.7}
          />
        </Group>
      </Group>
    </Group>
  );
};


const CanvasArea = ({ stageRef }) => {
  const {
    objects,
    selectedId,
    selectObject,
    updateObject,
    saveHistory,
    deleteObject,
    duplicateObject,
    isSidebarOpen,
    canvasBackground,
  } = useStore();

  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  const DESIGN_WIDTH = 800;
  const DESIGN_HEIGHT = 600;

  const [scale, setScale] = useState(1);
  const [stageDimensions, setStageDimensions] = useState({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT
  });
  const [mobileOffset, setMobileOffset] = useState(0);

  // Handle Resizing and Scaling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const isMobile = window.innerWidth <= 768;

      // On mobile, we have:
      // - Toolbar: 56px
      // - BottomNav: 60px
      // - Bottom Sheet (if open): approx 45vh
      // We want the canvas to fit in the remaining space.

      const toolbarHeight = isMobile ? 56 : 80;
      const bottomNavHeight = isMobile ? 60 : 0;
      const mobileSidebarHeight = (isMobile && isSidebarOpen) ? (window.innerHeight * 0.45) : 0;

      // Store the offset to use in render
      setMobileOffset(mobileSidebarHeight);

      const availableWidth = window.innerWidth - (isMobile ? 20 : 100);
      const availableHeight = window.innerHeight - toolbarHeight - bottomNavHeight - mobileSidebarHeight - (isMobile ? 40 : 100);

      // Fit to container dimensions while maintaining aspect ratio
      const scaleX = availableWidth / DESIGN_WIDTH;
      const scaleY = availableHeight / DESIGN_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1.2);

      setScale(newScale);
      setStageDimensions({
        width: DESIGN_WIDTH * newScale,
        height: DESIGN_HEIGHT * newScale
      });
    };

    handleResize();
    const timer = setTimeout(handleResize, 100); // Small delay to ensure layout is settled

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isSidebarOpen]); // Respond to sidebar state changes

  // Text Editing State
  const [editingId, setEditingId] = useState(null);
  const [textEditValue, setTextEditValue] = useState("");
  const [textEditPos, setTextEditPos] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    fontSize: 20,
    rotation: 0,
    color: "#000000"
  });

  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      if (editingId === selectedId) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
        return;
      }

      const node = stageRef.current.findOne("#" + selectedId);
      if (node) {
        const obj = objects.find(o => o.id === selectedId);
        if (obj && (obj.type === "svg-path" || obj.type === "svg-container")) {
          transformerRef.current.nodes([]);
        } else {
          transformerRef.current.nodes([node]);
        }
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, objects, editingId, stageRef]);

  // Safety: If the object being edited is removed from store (e.g. template switch), reset editing state
  useEffect(() => {
    if (editingId && !objects.find(o => o.id === editingId)) {
      setEditingId(null);
    }
  }, [objects, editingId]);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      if (editingId) {
        handleTextEditComplete();
      }
      selectObject(null);
      transformerRef.current?.nodes([]);
    }
  };

  const handleTextDblClick = (e, obj) => {
    const textNode = e.target;
    const absPos = textNode.getAbsolutePosition();
    const scaleX = textNode.scaleX();
    const scaleY = textNode.scaleY();

    setEditingId(obj.id);
    setTextEditValue(obj.text);
    setTextEditPos({
      x: absPos.x,
      y: absPos.y,
      width: textNode.width() * scaleX,
      height: textNode.height() * scaleY,
      fontSize: (obj.fontSize || 24) * scaleY,
      rotation: textNode.rotation(),
      color: obj.fill || "#000000",
      fontFamily: obj.fontFamily || "'Mazzard', sans-serif",
      fontWeight: obj.fontWeight || "400"
    });

    textNode.hide();
    textNode.getLayer().batchDraw();
  };

  const handleTextEditComplete = () => {
    if (editingId) {
      updateObject(editingId, { text: textEditValue });
      saveHistory();

      const node = stageRef.current.findOne("#" + editingId);
      if (node) {
        node.show();
      }
      setEditingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleTextEditComplete();
    }
  }

  return (
    <div
      className="canvas-workspace-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingBottom: mobileOffset, // Shift the "center" upwards by the sidebar height
        transition: 'padding-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="canvas-wrapper" style={{ boxShadow: '0 10px 40px -10px rgba(180, 50, 50, 0.15)', border: '1px solid #fee2e2', borderRadius: '8px', background: '#FFF8F6', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>        <div className="canvas-container" style={{ position: "relative" }}>
        <Stage
          width={stageDimensions.width}
          height={stageDimensions.height}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          style={{ background: "#F3F1EC" }}
        >

          <Layer>
            {/* 0. Solid White Background for Exports */}
            <Rect 
              width={DESIGN_WIDTH} 
              height={DESIGN_HEIGHT} 
              fill="white" 
              listening={false} 
            />
          </Layer>

          <Layer>

            {/* Background Image */}
            {/* <URLImage 
              src={canvasBackground} 
              width={DESIGN_WIDTH} 
              height={DESIGN_HEIGHT} 
              opacity={1}
              listening={false} // So it doesn't interfere with interaction
            /> */}

            {/* 1. Background Fills - These define the "clippable" area */}
            <Group name="background-fills">
              {objects
                .filter((obj) => obj.type === "svg-path")
                .map((obj) => (
                  <Path
                    key={`fill-${obj.id}`}
                    id={obj.id} // Important for selection
                    x={obj.x}
                    y={obj.y}
                    data={obj.data}
                    fill={obj.fill}
                    scaleX={obj.scaleX}
                    scaleY={obj.scaleY}
                    rotation={obj.rotation}
                    onClick={() => selectObject(obj.id)}
                    onTap={() => selectObject(obj.id)}
                    opacity={selectedId === obj.id ? 0.8 : 1}
                  />
                ))}
            </Group>

            {/* 2. Clipped Content - Images and Text that should only appear inside the box */}
            <Group
              name="clipped-content"
              globalCompositeOperation="source-atop"
              listening={true}
            >
              {objects
                .filter((obj) => obj.type === "image" || obj.type === "text")
                .map((obj) => {
                  const commonProps = {
                    id: obj.id,
                    x: obj.x,
                    y: obj.y,
                    rotation: obj.rotation || 0,
                    scaleX: obj.scaleX || 1,
                    scaleY: obj.scaleY || 1,
                    draggable: editingId !== obj.id,
                    onClick: () => {
                      if (editingId !== obj.id) selectObject(obj.id);
                    },
                    onTap: () => {
                      if (editingId !== obj.id) selectObject(obj.id);
                    },
                    onDragMove: (e) => {
                      updateObject(obj.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    },
                    onDragEnd: (e) => {
                      updateObject(obj.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                      saveHistory();
                    },
                    onTransform: (e) => {
                      const node = e.target;
                      updateObject(obj.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                      });
                    },
                    onTransformEnd: (e) => {
                      const node = e.target;
                      updateObject(obj.id, {
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                      });
                      saveHistory();
                    },
                  };

                  if (obj.type === "image") {
                    return (
                      <URLImage
                        key={obj.id}
                        {...commonProps}
                        src={obj.src}
                        width={obj.width}
                        height={obj.height}
                      />
                    );
                  }

                  if (obj.type === "text") {
                    return (
                      <Text
                        key={obj.id}
                        {...commonProps}
                        text={obj.text}
                        fontSize={obj.fontSize}
                        fill={obj.fill}
                        fontFamily={obj.fontFamily || "'Mazzard', sans-serif"}
                        fontStyle={obj.fontWeight || "400"}
                        onDblClick={(e) => handleTextDblClick(e, obj)}
                        onDblTap={(e) => handleTextDblClick(e, obj)}
                      />
                    );
                  }
                  return null;
                })}
            </Group>

            {/* 3. Foreground Outlines - Keep the borders visible */}
            <Group name="foreground-outlines" listening={false}>
              {objects
                .filter((obj) => obj.type === "svg-path")
                .map((obj) => (
                  <Path
                    key={`outline-${obj.id}`}
                    x={obj.x}
                    y={obj.y}
                    data={obj.data}
                    fill="transparent"
                    stroke={selectedId === obj.id ? "#3b82f6" : (obj.stroke || "#2B2A29")}
                    strokeWidth={selectedId === obj.id ? 3 : 1.5}
                    scaleX={obj.scaleX}
                    scaleY={obj.scaleY}
                    rotation={obj.rotation}
                    strokeScaleEnabled={false}
                  />
                ))}
            </Group>

            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />

            {selectedId && !editingId && objects.find(o => o.id === selectedId && !["svg-path", "svg-container"].includes(o.type)) && (
              <SelectionControls
                object={objects.find(o => o.id === selectedId)}
                onDelete={() => deleteObject(selectedId)}
                onDuplicate={() => duplicateObject(selectedId)}
                stageRef={stageRef}
              />
            )}
          </Layer>
        </Stage>

        {editingId && (
          <textarea
            value={textEditValue}
            onChange={(e) => setTextEditValue(e.target.value)}
            onBlur={handleTextEditComplete}
            onKeyDown={handleKeyDown}
            style={{
              display: "block",
              position: "absolute",
              top: textEditPos.y + "px",
              left: textEditPos.x + "px",
              fontSize: textEditPos.fontSize + "px",
              color: textEditPos.color,
              border: "none",
              padding: "0px",
              margin: "0px",
              background: "transparent",
              resize: "none",
              outline: "none",
              overflow: "hidden",
              lineHeight: 1.2,
              zIndex: 100,
              width: textEditPos.width + 20 + "px",
              height: "auto",
              minHeight: textEditPos.fontSize + "px",
              transform: `rotate(${textEditPos.rotation}deg)`,
              transformOrigin: "top left",
              fontFamily: textEditPos.fontFamily,
              fontWeight: textEditPos.fontWeight,
            }}
            autoFocus
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default CanvasArea;
