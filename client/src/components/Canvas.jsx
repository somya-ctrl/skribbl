import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function Canvas({ roomId }) {

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

      drawLine(
        data.prevX,
        data.prevY,
        data.x,
        data.y,
        data.color,
        data.brushSize
      );

    });

    return () => {
      socket.off("draw");
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
      color: color,
      brushSize: color === "white" ? 20 : 4,
    });

    prevPos.current = { x, y };

  };

  return (
  <div>

    <div
      style={{
        marginBottom: "10px",
        display: "flex",
        gap: "10px",
      }}
    >

      <button onClick={() => setColor("black")}>
        Brush
      </button>

      <button onClick={() => setColor("white")}>
        Eraser
      </button>

    </div>

    <canvas
      ref={canvasRef}
      width={900}
      height={500}
      style={{
        backgroundColor: "white",
        border: "2px solid black",
      }}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onMouseMove={handleDraw}
    />

  </div>
);
}