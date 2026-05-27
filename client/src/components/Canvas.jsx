import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function Canvas({
  roomId,
  canDraw,
}) {

  const canvasRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("black");

  const prevPos = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {

    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;

    socket.on("draw", (data) => {

      drawLine(
        data.prevX,
        data.prevY,
        data.x,
        data.y,
        data.color,
        data.brushSize
      );

    });

     socket.on("canvas_cleared", () => {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

  });

  return () => {

    socket.off("draw");

    socket.off("canvas_cleared");

  };

}, []);

  const drawLine = (
    prevX,
    prevY,
    x,
    y,
    color,
    brushSize = 4
  ) => {

    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctx.beginPath();

    ctx.moveTo(prevX, prevY);

    ctx.lineTo(x, y);

    ctx.stroke();

  };

  const startDrawing = (e) => {

    // only drawer can draw
    if (!canDraw) return;

    setDrawing(true);

    prevPos.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };

  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const handleDraw = (e) => {

    // only drawer can draw
    if (!canDraw) return;

    if (!drawing) return;

    const x = e.nativeEvent.offsetX;

    const y = e.nativeEvent.offsetY;

    drawLine(
      prevPos.current.x,
      prevPos.current.y,
      x,
      y,
      color,
      color === "white" ? 20 : 4
    );

    socket.emit("draw", {
      roomId,
      x,
      y,
      prevX: prevPos.current.x,
      prevY: prevPos.current.y,
      color,
      brushSize:
        color === "white" ? 20 : 4,
    });

    prevPos.current = { x, y };

  };

  return (
    <div>
      {/* TOOLBAR */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
  }}
>

  {/* LEFT SIDE */}
  <div
    style={{
      display: "flex",
      gap: "10px",
    }}
  >

    <button
      onClick={() => setColor("black")}
      disabled={!canDraw}
      style={{
        padding: "8px 14px",
        background: "black",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: canDraw
          ? "pointer"
          : "not-allowed",
        opacity: canDraw ? 1 : 0.5,
      }}
    >
      Brush
    </button>

    <button
      onClick={() => setColor("white")}
      disabled={!canDraw}
      style={{
        padding: "8px 14px",
        background: "#ddd",
        color: "black",
        border: "1px solid #999",
        borderRadius: "8px",
        cursor: canDraw
          ? "pointer"
          : "not-allowed",
        opacity: canDraw ? 1 : 0.5,
      }}
    >
      Eraser
    </button>

  </div>

  {/* RIGHT SIDE */}
  <button
    onClick={() =>
      socket.emit("clear_canvas", {
        roomId,
      })
    }
    disabled={!canDraw}
    style={{
      padding: "8px 14px",
      background: "#ff4b4b",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: canDraw
        ? "pointer"
        : "not-allowed",
      opacity: canDraw ? 1 : 0.5,
    }}
  >
    Clear
  </button>

</div>

        
       


      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        style={{
          backgroundColor: "white",
          border: "2px solid black",
          cursor: canDraw
            ? "crosshair"
            : "not-allowed",
        }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={handleDraw}
      />

    </div>
  );
}