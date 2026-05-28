import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function Canvas({ roomId, canDraw }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const prevPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;

    socket.on("draw", (data) => {
      drawLine(data.prevX, data.prevY, data.x, data.y, data.color, data.brushSize);
    });

    socket.on("canvas_cleared", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("canvas_cleared");
    };
  }, []);

  const drawLine = (prevX, prevY, x, y, color, brushSize = 4) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Helper to get canvas-relative position for both mouse and touch
  const getPos = (e, isTouch = false) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // MOUSE
  const startDrawing = (e) => {
    if (!canDraw) return;
    setDrawing(true);
    prevPos.current = getPos(e);
  };

  const stopDrawing = () => setDrawing(false);

  const handleDraw = (e) => {
    if (!canDraw || !drawing) return;
    const { x, y } = getPos(e);
    const brushSize = color === "white" ? 20 : 4;
    drawLine(prevPos.current.x, prevPos.current.y, x, y, color, brushSize);
    socket.emit("draw", {
      roomId, x, y,
      prevX: prevPos.current.x,
      prevY: prevPos.current.y,
      color, brushSize,
    });
    prevPos.current = { x, y };
  };

  // TOUCH
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!canDraw) return;
    setDrawing(true);
    prevPos.current = getPos(e, true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!canDraw || !drawing) return;
    const { x, y } = getPos(e, true);
    const brushSize = color === "white" ? 20 : 4;
    drawLine(prevPos.current.x, prevPos.current.y, x, y, color, brushSize);
    socket.emit("draw", {
      roomId, x, y,
      prevX: prevPos.current.x,
      prevY: prevPos.current.y,
      color, brushSize,
    });
    prevPos.current = { x, y };
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setDrawing(false);
  };

  const colors = ["black", "red", "blue", "green", "yellow", "#ff6b9d", "#6c63ff", "orange"];

  return (
    <div className="flex flex-col gap-2 p-2 sm:p-0">

      {/* TOOLBAR */}
      <div className="flex items-center justify-between flex-wrap gap-2">

        {/* COLORS + ERASER */}
        <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap">
          {colors.map((clr) => (
            <button
              key={clr}
              onClick={() => setColor(clr)}
              disabled={!canDraw}
              style={{ background: clr }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all shrink-0 ${
                color === clr
                  ? "ring-2 ring-white ring-offset-1 ring-offset-[#1a1a27] scale-110"
                  : "border-2 border-[#444]"
              } ${canDraw ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-40"}`}
            />
          ))}

          <button
  onClick={() => setColor("white")}
  disabled={!canDraw}
  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
    color === "white"
      ? "bg-white text-black border-white"
      : "bg-[#2e2e3e] text-white border-white/25 hover:bg-[#3a3a4e] hover:border-white/40"
  } ${canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
>
  Eraser
</button>
        </div>

        {/* CLEAR */}
        <button
          onClick={() => socket.emit("clear_canvas", { roomId })}
          disabled={!canDraw}
          className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            canDraw
              ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              : "bg-red-500/30 text-white/40 cursor-not-allowed"
          }`}
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
          border: "2px solid #333",
          cursor: canDraw ? "crosshair" : "not-allowed",
          display: "block",
          // Scale down on mobile via CSS — actual canvas resolution stays 900x500
          maxWidth: "100%",
          touchAction: "none",
        }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={handleDraw}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}