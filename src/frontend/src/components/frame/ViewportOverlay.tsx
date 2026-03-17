import {
  Box,
  Eye,
  EyeOff,
  HelpCircle,
  Maximize2,
  MousePointerClick,
  PersonStanding,
  Ruler,
  Scissors,
  Slash,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";
import type { Discipline } from "../../types/frame";

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  architecture: "ARCH",
  structure: "STR",
  mep: "MEP",
  parts: "PARTS",
};

const DISCIPLINE_COLORS: Record<Discipline, string> = {
  architecture: "#3b82f6",
  structure: "#10b981",
  mep: "#f59e0b",
  parts: "#8b5cf6",
};

const TOOL_LABELS: Record<string, string> = {
  wall: "Wall",
  floor: "Floor",
  roof: "Roof",
  door: "Door",
  window: "Window",
  stair: "Stair",
  column: "Column",
  room: "Room",
  curtainwall: "Curtain Wall",
  measure: "Measure",
  section: "Section Cut",
  dimension: "Dimension",
  beam: "Beam",
  slab: "Slab",
  foundation: "Foundation",
  load: "Load",
  analyze: "Analyze",
  autosize: "Auto-Size",
  connection: "Connection",
  rebar: "Rebar",
  duct: "Duct",
  pipe: "Pipe",
  cabletray: "Cable Tray",
  equipment: "Equipment",
  diffuser: "Diffuser",
  fixture: "Fixture",
  autoroute: "Auto Route",
  size: "Size",
  clash: "Clash Check",
  sketch: "Sketch",
  extrude: "Extrude",
  revolve: "Revolve",
  fillet: "Fillet",
  assembly: "Assembly",
  constraint: "Constraint",
  orbit: "Orbit",
  pan: "Pan",
  walk: "Walk",
};

const TWO_CLICK_TOOLS = new Set([
  "wall",
  "beam",
  "slab",
  "duct",
  "pipe",
  "cabletray",
  "dimension",
]);
const SINGLE_CLICK_TOOLS = new Set([
  "column",
  "door",
  "window",
  "foundation",
  "equipment",
  "diffuser",
  "fixture",
  "floor",
  "room",
]);

export function ViewportOverlay() {
  const [dismissed, setDismissed] = useState(false);
  const isTouchDevice = useIsTouchDevice();
  const vpBottom = isTouchDevice ? "bottom-[9.5rem]" : "bottom-10";

  const {
    viewMode,
    toggleViewMode,
    disciplineVisibility,
    toggleDisciplineVisibility,
    darkMode,
    activeTool,
    activeDiscipline,
    setActiveTool,
    cursorPos,
    selectedElementId,
    elements,
    drawingState,
    displayMode,
    setDisplayMode,
    dimensions,
    clearDimensions,
    permanentDimensions,
    clearPermanentDimensions,
    sectionCutActive,
    sectionCutHeight,
    setSectionCutHeight,
    snapType,
    setCameraPreset,
  } = useFrameStore();
  const disciplines: Discipline[] = [
    "architecture",
    "structure",
    "mep",
    "parts",
  ];

  const selectedEl = elements.find((e) => e.id === selectedElementId);

  const btnBase = `px-2 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[10px] font-medium transition-colors ${
    darkMode
      ? "bg-black/40 hover:bg-black/60 text-gray-300 backdrop-blur-sm"
      : "bg-white/80 hover:bg-white text-gray-700 backdrop-blur-sm"
  }`;

  // Drawing status message
  let drawingStatus: string | null = null;
  if (activeTool !== "select") {
    if (TWO_CLICK_TOOLS.has(activeTool)) {
      drawingStatus = drawingState
        ? "Click to place end point — ESC to cancel"
        : "Click to place start point";
    } else if (SINGLE_CLICK_TOOLS.has(activeTool)) {
      drawingStatus = "Click in viewport to place element";
    } else if (activeTool === "measure") {
      // handled separately below
    }
  }

  // Show welcome hint when no elements exist and not dismissed
  const showWelcomeHint =
    !dismissed && elements.length === 0 && activeTool === "select";

  const measureStatus = activeTool === "measure" ? null : null;
  void measureStatus;

  const disciplineColor = DISCIPLINE_COLORS[activeDiscipline];
  const toolLabel = TOOL_LABELS[activeTool] ?? activeTool;

  return (
    <>
      {/* Active Tool Indicator — shown when tool != select */}
      {activeTool !== "select" && (
        <div
          className="absolute top-3 left-3 z-20 flex items-center gap-2"
          data-ocid="viewport.active_tool.indicator"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="flex items-center gap-2 rounded-full px-3 backdrop-blur-sm shadow-lg"
            style={{
              minHeight: "36px",
              background: darkMode
                ? "rgba(0,0,0,0.72)"
                : "rgba(255,255,255,0.92)",
              border: `1.5px solid ${disciplineColor}55`,
              boxShadow: `0 2px 16px ${disciplineColor}22`,
            }}
          >
            {/* Discipline color dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: disciplineColor }}
            />
            {/* Discipline label */}
            <span
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: disciplineColor }}
            >
              {DISCIPLINE_LABELS[activeDiscipline]}
            </span>
            {/* Separator */}
            <span
              className="text-[10px]"
              style={{
                color: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              }}
            >
              /
            </span>
            {/* Tool name */}
            <span
              className="text-[12px] font-semibold"
              style={{ color: darkMode ? "#e2e8f0" : "#0f172a" }}
            >
              {toolLabel}
            </span>
            {/* X to return to select */}
            <button
              type="button"
              data-ocid="viewport.active_tool.close.button"
              onClick={() => setActiveTool("select")}
              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              style={{
                background: darkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.07)",
                color: darkMode ? "#94a3b8" : "#6b7280",
              }}
              title="Return to Select (ESC)"
              aria-label="Cancel tool, return to select"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Drawing status badge */}
      {drawingStatus && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          data-ocid="viewport.drawing_status"
        >
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm border ${
              drawingState
                ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                : darkMode
                  ? "bg-black/60 border-white/10 text-gray-300"
                  : "bg-white/90 border-gray-200 text-gray-700"
            }`}
          >
            {drawingStatus}
          </div>
        </div>
      )}

      {/* Measure tool status badge */}
      {activeTool === "measure" && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          data-ocid="viewport.measure_status"
        >
          <div className="px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm border bg-amber-500/20 border-amber-500/40 text-amber-300">
            <Ruler size={10} className="inline mr-1" />
            Click start point — then click end point to measure
          </div>
        </div>
      )}

      {/* Top-center mini toolbar (shown only when not drawing) */}
      {!drawingStatus && activeTool === "select" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {[
            { icon: Box, label: "Orbit", key: "orbit" },
            { icon: Maximize2, label: "Pan", key: "pan" },
            { icon: Scissors, label: "Section", key: "section" },
            { icon: Ruler, label: "Measure", key: "measure" },
            { icon: PersonStanding, label: "Walk", key: "walk" },
          ].map(({ icon: Icon, label, key }) => (
            <button
              key={key}
              type="button"
              data-ocid={`viewport.${key}.button`}
              title={label}
              onClick={() => setActiveTool(key)}
              className={`flex items-center gap-1 ${btnBase} ${
                activeTool === key ? "ring-1 ring-blue-500" : ""
              }`}
            >
              <Icon size={11} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Top-right: discipline visibility + view mode + display mode */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
        {/* View mode toggle */}
        <button
          type="button"
          data-ocid="viewport.view_mode.toggle"
          onClick={toggleViewMode}
          className={btnBase}
        >
          {viewMode === "perspective" ? "Perspective" : "Orthographic"}
        </button>

        {/* Display mode: Wire | Shaded | Rendered */}
        <div className="flex gap-0.5">
          {(["wireframe", "shaded", "rendered"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              data-ocid={`viewport.display_mode.${mode}.button`}
              onClick={() => setDisplayMode(mode)}
              title={`Display mode: ${mode}`}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors backdrop-blur-sm ${
                displayMode === mode
                  ? "bg-blue-500/30 text-blue-300 ring-1 ring-blue-500/50"
                  : darkMode
                    ? "bg-black/40 hover:bg-black/60 text-gray-400"
                    : "bg-white/80 hover:bg-white text-gray-500"
              }`}
            >
              {mode === "wireframe"
                ? "Wire"
                : mode === "shaded"
                  ? "Shaded"
                  : "Rendered"}
            </button>
          ))}
        </div>

        {/* Discipline visibility */}
        <div className="flex gap-1">
          {disciplines.map((d) => (
            <button
              key={d}
              type="button"
              data-ocid={`viewport.discipline.${d}.toggle`}
              onClick={() => toggleDisciplineVisibility(d)}
              title={`Toggle ${d}`}
              className={`flex items-center gap-1 ${btnBase} ${
                !disciplineVisibility[d] ? "opacity-40" : ""
              }`}
              style={
                disciplineVisibility[d]
                  ? { boxShadow: `0 0 0 1px ${DISCIPLINE_COLORS[d]}44` }
                  : {}
              }
            >
              {disciplineVisibility[d] ? (
                <Eye size={10} />
              ) : (
                <EyeOff size={10} />
              )}
              <span style={{ color: DISCIPLINE_COLORS[d] }}>
                {DISCIPLINE_LABELS[d]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-left: camera preset buttons */}
      <div className={`absolute ${vpBottom} left-3 flex gap-1`}>
        {(
          [
            { label: "Top", key: "top" },
            { label: "Front", key: "front" },
            { label: "Right", key: "right" },
            { label: "3D", key: "3d" },
          ] as const
        ).map((v) => (
          <button
            key={v.key}
            type="button"
            data-ocid={`viewport.camera_${v.key === "3d" ? "3d" : v.key}.button`}
            onClick={() => setCameraPreset(v.key)}
            className={btnBase}
            title={`${v.label} view`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Cursor coordinate HUD */}
      {activeTool !== "select" && (
        <div
          className={`absolute ${isTouchDevice ? "bottom-[9.5rem]" : "bottom-12"} left-4 flex flex-col gap-1`}
        >
          <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-300">
              X: {cursorPos.x.toFixed(1)} m&nbsp;&nbsp;Z:{" "}
              {cursorPos.z.toFixed(1)} m
            </span>
            {snapType === "endpoint" && (
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(249,115,22,0.2)",
                  color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.3)",
                }}
              >
                ⬝ Endpoint
              </span>
            )}
            {snapType === "midpoint" && (
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(6,182,212,0.2)",
                  color: "#06b6d4",
                  border: "1px solid rgba(6,182,212,0.3)",
                }}
              >
                ◆ Midpoint
              </span>
            )}
            {snapType === "grid" && (
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(250,204,21,0.15)",
                  color: "#facc15",
                  border: "1px solid rgba(250,204,21,0.25)",
                }}
              >
                ⊞ Grid
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dimension annotation for selected element */}
      {selectedEl && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-gray-950/80 backdrop-blur-sm border border-blue-500/30">
            <span className="text-[10px] font-mono text-blue-400">
              {(selectedEl.dimensions.width * 1000).toFixed(0)} &times;{" "}
              {(selectedEl.dimensions.height * 1000).toFixed(0)} &times;{" "}
              {(selectedEl.dimensions.depth * 1000).toFixed(0)} mm
            </span>
          </div>
        </div>
      )}

      {/* Measurements panel */}
      {(dimensions.length > 0 || activeTool === "measure") && (
        <div
          className={`absolute ${vpBottom} left-1/2 -translate-x-1/2 min-w-[220px] rounded-lg overflow-hidden shadow-xl border backdrop-blur-sm ${
            darkMode
              ? "bg-black/70 border-white/10 text-gray-200"
              : "bg-white/90 border-gray-200 text-gray-800"
          }`}
          data-ocid="viewport.measure.panel"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Ruler size={10} /> Measurements
            </span>
            {dimensions.length > 0 && (
              <button
                type="button"
                data-ocid="viewport.measure.clear.button"
                onClick={clearDimensions}
                title="Clear all measurements"
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
          {dimensions.length === 0 ? (
            <div className="px-3 py-2 text-[10px] text-gray-500 italic">
              Click two points in the viewport to measure
            </div>
          ) : (
            <div className="px-3 py-1.5 flex flex-col gap-1">
              {dimensions.map((dim, i) => {
                const dx = dim.end[0] - dim.start[0];
                const dy = dim.end[1] - dim.start[1];
                const dz = dim.end[2] - dim.start[2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                return (
                  <div
                    key={dim.id}
                    className="flex justify-between items-center text-[10px] font-mono"
                    data-ocid={`viewport.measure.item.${i + 1}`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      Dim {i + 1}
                    </span>
                    <span className="text-amber-300 font-semibold">
                      {dist.toFixed(2)} m
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section cut slider */}
      {sectionCutActive && (
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 p-3 rounded-lg shadow-xl border backdrop-blur-sm ${
            darkMode
              ? "bg-black/70 border-white/10 text-gray-200"
              : "bg-white/90 border-gray-200 text-gray-800"
          }`}
          data-ocid="viewport.section_cut.panel"
        >
          <div className="flex items-center gap-1.5">
            <Slash size={11} className="text-blue-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              Section
            </span>
          </div>
          <div className="text-[11px] font-mono text-center">
            {sectionCutHeight.toFixed(1)} m
          </div>
          <input
            type="range"
            data-ocid="viewport.section_cut.input"
            min={0}
            max={10}
            step={0.1}
            value={sectionCutHeight}
            onChange={(e) => setSectionCutHeight(Number(e.target.value))}
            className="w-32 h-1 accent-blue-500"
            style={{ writingMode: "horizontal-tb" }}
            aria-label="Section cut height"
          />
          <div className="flex justify-between w-full text-[9px] text-gray-500">
            <span>0 m</span>
            <span>10 m</span>
          </div>
          <button
            type="button"
            data-ocid="viewport.section_cut.close.button"
            onClick={() => setActiveTool("select")}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              darkMode
                ? "bg-white/10 hover:bg-white/20 text-gray-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            Done
          </button>
        </div>
      )}

      {/* XYZ Gizmo */}
      <div className={`absolute ${vpBottom} right-3`}>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            darkMode
              ? "bg-black/40 backdrop-blur-sm"
              : "bg-white/80 backdrop-blur-sm"
          }`}
        >
          <svg
            viewBox="0 0 40 40"
            width="36"
            height="36"
            aria-label="XYZ orientation gizmo"
            role="img"
          >
            <title>XYZ orientation gizmo</title>
            <line
              x1="20"
              y1="20"
              x2="32"
              y2="26"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <text x="34" y="29" fontSize="7" fill="#ef4444" fontWeight="600">
              X
            </text>
            <line
              x1="20"
              y1="20"
              x2="8"
              y2="26"
              stroke="#22c55e"
              strokeWidth="1.5"
            />
            <text x="2" y="29" fontSize="7" fill="#22c55e" fontWeight="600">
              Y
            </text>
            <line
              x1="20"
              y1="20"
              x2="20"
              y2="7"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
            <text x="17" y="5" fontSize="7" fill="#3b82f6" fontWeight="600">
              Z
            </text>
            <circle cx="20" cy="20" r="2" fill="#9ca3af" />
          </svg>
        </div>
      </div>

      {/* Permanent dimension annotations SVG */}
      {permanentDimensions.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
          aria-hidden="true"
        >
          {permanentDimensions.map((dim) => {
            // Top-view 2D projection: 4% of width per meter, centered at 50%
            const toSx = (wx: number) => `${50 + wx * 4}%`;
            const toSy = (wz: number) => `${50 + wz * 4}%`;
            const mx = `${50 + ((dim.start[0] + dim.end[0]) / 2) * 4}%`;
            const my = `${50 + ((dim.start[2] + dim.end[2]) / 2) * 4 - 2}%`;
            return (
              <g key={dim.id}>
                <line
                  x1={toSx(dim.start[0])}
                  y1={toSy(dim.start[2])}
                  x2={toSx(dim.end[0])}
                  y2={toSy(dim.end[2])}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="5 2"
                />
                <circle
                  cx={toSx(dim.start[0])}
                  cy={toSy(dim.start[2])}
                  r="3"
                  fill="#f59e0b"
                />
                <circle
                  cx={toSx(dim.end[0])}
                  cy={toSy(dim.end[2])}
                  r="3"
                  fill="#f59e0b"
                />
                <text
                  x={mx}
                  y={my}
                  fill="#f59e0b"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {dim.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Clear permanent dimensions button */}
      {permanentDimensions.length > 0 && (
        <div className="absolute top-14 right-3">
          <button
            type="button"
            data-ocid="viewport.perm_dims.clear.button"
            onClick={clearPermanentDimensions}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] backdrop-blur-sm transition-colors ${
              darkMode
                ? "bg-black/50 hover:bg-red-500/20 text-amber-400 hover:text-red-400 border border-white/10"
                : "bg-white/80 hover:bg-red-50 text-amber-600 hover:text-red-500 border border-gray-200"
            }`}
            title="Clear all dimension annotations"
          >
            <Trash2 size={10} />
            <span>
              {permanentDimensions.length} dim
              {permanentDimensions.length !== 1 ? "s" : ""}
            </span>
          </button>
        </div>
      )}

      {/* Welcome / Start Building hint */}
      {showWelcomeHint && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 20 }}
          data-ocid="viewport.welcome.panel"
        >
          <div
            className="pointer-events-auto max-w-sm w-full mx-6 rounded-xl shadow-2xl border backdrop-blur-md"
            style={{
              background: darkMode
                ? "rgba(10,12,20,0.88)"
                : "rgba(255,255,255,0.92)",
              borderColor: darkMode
                ? "rgba(59,130,246,0.25)"
                : "rgba(59,130,246,0.2)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)" }}
                >
                  <MousePointerClick size={16} className="text-blue-400" />
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: darkMode ? "#f1f5f9" : "#0f172a",
                    }}
                  >
                    Start Building
                  </h3>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
                  >
                    Frame is ready — select a tool to begin
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="viewport.welcome.close.button"
                onClick={() => setDismissed(true)}
                className="p-1 rounded-md transition-colors hover:bg-white/10"
                aria-label="Dismiss welcome hint"
              >
                <X
                  size={14}
                  style={{ color: darkMode ? "#64748b" : "#94a3b8" }}
                />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pb-4 flex flex-col gap-3">
              <div
                className="rounded-lg p-3 text-[11px] leading-relaxed"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  color: darkMode ? "#cbd5e1" : "#475569",
                }}
              >
                Pick a tool from the{" "}
                <span
                  className="font-semibold"
                  style={{ color: darkMode ? "#93c5fd" : "#3b82f6" }}
                >
                  left sidebar
                </span>{" "}
                to draw elements. Try{" "}
                <span className="font-semibold" style={{ color: "#f59e0b" }}>
                  Wall
                </span>{" "}
                for a two-click line, or{" "}
                <span className="font-semibold" style={{ color: "#10b981" }}>
                  Column
                </span>{" "}
                to place a structural point.
              </div>

              {/* Quick hints row */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "W", label: "Wall tool" },
                  { key: "D", label: "Dimension" },
                  { key: "M", label: "Measure" },
                  { key: "?", label: "All shortcuts" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-[10px]"
                    style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
                  >
                    <kbd
                      className="px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold"
                      style={{
                        background: darkMode
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.07)",
                        color: darkMode ? "#e2e8f0" : "#1e293b",
                        border: darkMode
                          ? "1px solid rgba(255,255,255,0.12)"
                          : "1px solid rgba(0,0,0,0.12)",
                      }}
                    >
                      {key}
                    </kbd>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Shortcut hint */}
              <div
                className="flex items-center gap-1.5 text-[10px]"
                style={{ color: darkMode ? "#475569" : "#94a3b8" }}
              >
                <HelpCircle size={11} />
                <span>Press ? to open the full keyboard shortcuts panel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
