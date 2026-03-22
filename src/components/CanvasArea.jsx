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
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

const SelectionControls = ({ selectedId, object, onDelete, onDuplicate }) => {
    return (
      <Group x={object.x} y={object.y} rotation={object.rotation}>
        <Group y={-60}>
          <Group onClick={onDelete} onTap={onDelete} x={-25} y={0}>
            <Rect
              width={24}
              height={24}
              fill="white"
              stroke="#ef4444"
              strokeWidth={1}
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={4}
              shadowOpacity={0.1}
            />
            <Text
              text="✕"
              fontSize={14}
              x={6}
              y={6}
              fill="#ef4444"
              fontStyle="bold"
              listening={false}
            />
          </Group>
          <Group onClick={onDuplicate} onTap={onDuplicate} x={5} y={0}>
            <Rect
              width={24}
              height={24}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={1}
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={4}
              shadowOpacity={0.1}
            />
            <Text
              text="+"
              fontSize={18}
              x={6}
              y={4}
              fill="#3b82f6"
              fontStyle="bold"
              listening={false}
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
  } = useStore();
  const transformerRef = useRef(null);
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

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
        color: obj.fill || "#000000"
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
    <div className="canvas-wrapper">
      <div className="canvas-container" style={{ position: "relative" }}>
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          style={{ background: "white" }}
        >
          <Layer>
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
                    onDragEnd: (e) => {
                      updateObject(obj.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                      saveHistory();
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
                        fontFamily="'Mazzard Soft', sans-serif"
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
                    stroke={obj.stroke || "#2B2A29"}
                    strokeWidth={1.5}
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
                  fontFamily: "'Mazzard Soft', sans-serif",
                }}
                autoFocus
            />
        )}
      </div>
    </div>
  );
};

export default CanvasArea;
