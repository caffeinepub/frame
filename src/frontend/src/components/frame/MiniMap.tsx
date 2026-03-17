import { Map as MapIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFrameStore } from "../../stores/frameStore";

const MINIMAP_W = 160;
const MINIMAP_H = 120;
const WORLD_MIN = -15;
const WORLD_MAX = 15;
const WORLD_RANGE = WORLD_MAX - WORLD_MIN;

function worldToMiniCanvas(wx: number, wz: number): [number, number] {
  const cx = ((wx - WORLD_MIN) / WORLD_RANGE) * MINIMAP_W;
  const cy = ((wz - WORLD_MIN) / WORLD_RANGE) * MINIMAP_H;
  return [cx, cy];
}

export function MiniMap() {
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkMode = useFrameStore((s) => s.darkMode);
  const elements = useFrameStore((s) => s.elements);
  const levelVisibility = useFrameStore((s) => s.levelVisibility);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = darkMode ? "#111827" : "#e5e7eb";
    const gridColor = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
    const borderColor = darkMode
      ? "rgba(255,255,255,0.12)"
      : "rgba(0,0,0,0.15)";

    ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);

    // Grid lines (every 5 world units)
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let wx = WORLD_MIN; wx <= WORLD_MAX; wx += 5) {
      const [cx] = worldToMiniCanvas(wx, 0);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, MINIMAP_H);
      ctx.stroke();
    }
    for (let wz = WORLD_MIN; wz <= WORLD_MAX; wz += 5) {
      const [, cy] = worldToMiniCanvas(0, wz);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(MINIMAP_W, cy);
      ctx.stroke();
    }

    // Draw elements
    for (const el of elements) {
      if (levelVisibility[el.level] === false) continue;

      let color = "#888";
      switch (el.type) {
        case "wall":
          color = darkMode ? "#c8b8a2" : "#a09080";
          break;
        case "column":
          color = darkMode ? "#8090a0" : "#6070a0";
          break;
        case "beam":
          color = darkMode ? "#7a8a9a" : "#5a6a8a";
          break;
        case "floor":
        case "slab":
          color = darkMode ? "#b0a898" : "#908878";
          break;
        case "door":
          color = "#8b6914";
          break;
        case "window":
          color = "#4da6b3";
          break;
        case "pipe":
          color = "#b87333";
          break;
        case "duct":
          color = "#7a9a80";
          break;
        default:
          color = darkMode ? "#6070a0" : "#8090c0";
      }

      const [cx, cy] = worldToMiniCanvas(el.position.x, el.position.z);

      if (el.type === "wall" || el.type === "beam") {
        const len = ((el.dimensions.width || 1) / WORLD_RANGE) * MINIMAP_W;
        const rot = el.rotation ?? 0;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = color;
        ctx.fillRect(-len / 2, -1.5, len, 3);
        ctx.restore();
      } else if (el.type === "floor" || el.type === "slab") {
        const w = ((el.dimensions.width || 4) / WORLD_RANGE) * MINIMAP_W;
        const d = ((el.dimensions.depth || 4) / WORLD_RANGE) * MINIMAP_H;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(cx - w / 2, cy - d / 2, w, d);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, MINIMAP_W, MINIMAP_H);
  }, [elements, levelVisibility, darkMode]);

  return (
    <div
      className="absolute bottom-2 right-2 z-10 flex flex-col items-end gap-1"
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        data-ocid="minimap.toggle"
        onClick={() => setVisible((v) => !v)}
        title={visible ? "Hide mini-map" : "Show mini-map"}
        className={`flex items-center justify-center w-7 h-7 rounded shadow transition-colors ${
          darkMode
            ? "bg-[#1a1f2e] border border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#252d42]"
            : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
        }`}
      >
        <MapIcon size={13} />
      </button>

      {visible && (
        <div
          data-ocid="minimap.panel"
          className={`rounded overflow-hidden shadow-xl border ${
            darkMode ? "border-white/10" : "border-gray-300"
          }`}
          style={{ width: MINIMAP_W, height: MINIMAP_H }}
        >
          <canvas
            ref={canvasRef}
            width={MINIMAP_W}
            height={MINIMAP_H}
            style={{ display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
