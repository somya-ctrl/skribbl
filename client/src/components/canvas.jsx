import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function Canvas() {

  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    socket.on("draw_data", (data) => {

      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "black";

      ctx.beginPath();

      ctx.moveTo(data.prevX, data.prevY);
      ctx.lineTo(data.x, data.y);

      ctx.stroke();
    });

    return () => {
      socket.off("draw_data");
    };

  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {

    if (!isDrawing) return;

    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const prevX = x;
    const prevY = y;

    socket.emit("draw_move", {
      x,
      y,
      prevX,
      prevY,
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      style={{
        border: "2px solid black",
        background: "white",
      }}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseMove={draw}
    />
  );
}

export default Canvas;