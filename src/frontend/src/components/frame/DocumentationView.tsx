import { Download, FileText } from "lucide-react";
import { useCallback, useRef } from "react";
import { useFrameStore } from "../../stores/frameStore";
import type { FrameElement } from "../../types/frame";

const SCALE = 50; // px per meter
const PAD = 2; // meters padding

function getElementColor(type: string): string {
  switch (type) {
    case "wall":
      return "#6b7280";
    case "door":
      return "#92400e";
    case "window":
      return "#0ea5e9";
    case "column":
      return "#374151";
    case "beam":
      return "#1f2937";
    case "slab":
    case "floor":
      return "#e5e7eb";
    default:
      return "#9ca3af";
  }
}

interface ViewBox {
  minX: number;
  minZ: number;
  width: number;
  height: number;
}

function computeViewBox(elements: FrameElement[]): ViewBox {
  if (elements.length === 0) {
    return { minX: -5, minZ: -5, width: 10, height: 10 };
  }
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const el of elements) {
    minX = Math.min(minX, el.position.x - (el.dimensions.width ?? 1) / 2);
    maxX = Math.max(maxX, el.position.x + (el.dimensions.width ?? 1) / 2);
    minZ = Math.min(minZ, el.position.z - (el.dimensions.depth ?? 1) / 2);
    maxZ = Math.max(maxZ, el.position.z + (el.dimensions.depth ?? 1) / 2);
  }
  return {
    minX: minX - PAD,
    minZ: minZ - PAD,
    width: maxX - minX + PAD * 2,
    height: maxZ - minZ + PAD * 2,
  };
}

function toSvgX(worldX: number, vb: ViewBox): number {
  return (worldX - vb.minX) * SCALE;
}
function toSvgY(worldZ: number, vb: ViewBox): number {
  return (worldZ - vb.minZ) * SCALE;
}

function ElementShape({
  el,
  vb,
}: {
  el: FrameElement;
  vb: ViewBox;
}) {
  const cx = toSvgX(el.position.x, vb);
  const cy = toSvgY(el.position.z, vb);
  const color = getElementColor(el.type);
  const rot = ((el.rotation ?? 0) * 180) / Math.PI;

  if (el.type === "wall") {
    const w = (el.dimensions.width ?? 4) * SCALE;
    const d = 0.2 * SCALE;
    return (
      <rect
        x={cx - w / 2}
        y={cy - d / 2}
        width={w}
        height={d}
        fill={color}
        stroke="#4b5563"
        strokeWidth={0.5}
        transform={`rotate(${-rot}, ${cx}, ${cy})`}
      />
    );
  }

  if (el.type === "door") {
    const w = 0.9 * SCALE;
    const d = 0.1 * SCALE;
    const r = 0.9 * SCALE;
    return (
      <g transform={`rotate(${-rot}, ${cx}, ${cy})`}>
        <rect
          x={cx - w / 2}
          y={cy - d / 2}
          width={w}
          height={d}
          fill={color}
          stroke="#92400e"
          strokeWidth={0.5}
        />
        <path
          d={`M ${cx - w / 2} ${cy} A ${r} ${r} 0 0 1 ${cx - w / 2} ${cy + r}`}
          fill="none"
          stroke={color}
          strokeWidth={0.8}
          strokeDasharray="2,2"
        />
      </g>
    );
  }

  if (el.type === "window") {
    const w = 1.2 * SCALE;
    const d = 0.1 * SCALE;
    return (
      <g transform={`rotate(${-rot}, ${cx}, ${cy})`}>
        <rect
          x={cx - w / 2}
          y={cy - d * 1.5}
          width={w}
          height={d * 3}
          fill={color}
          fillOpacity={0.3}
          stroke={color}
          strokeWidth={1}
        />
        <line
          x1={cx - w / 2}
          y1={cy}
          x2={cx + w / 2}
          y2={cy}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  }

  if (el.type === "column") {
    const s = 0.4 * SCALE;
    return (
      <rect
        x={cx - s / 2}
        y={cy - s / 2}
        width={s}
        height={s}
        fill={color}
        stroke="#111827"
        strokeWidth={0.5}
      />
    );
  }

  if (el.type === "beam") {
    const w = (el.dimensions.width ?? 4) * SCALE;
    return (
      <line
        x1={cx - w / 2}
        y1={cy}
        x2={cx + w / 2}
        y2={cy}
        stroke={color}
        strokeWidth={3}
        transform={`rotate(${-rot}, ${cx}, ${cy})`}
      />
    );
  }

  if (el.type === "slab" || el.type === "floor") {
    const w = (el.dimensions.width ?? 4) * SCALE;
    const d = (el.dimensions.depth ?? 4) * SCALE;
    return (
      <rect
        x={cx - w / 2}
        y={cy - d / 2}
        width={w}
        height={d}
        fill={color}
        fillOpacity={0.5}
        stroke="#9ca3af"
        strokeWidth={0.5}
      />
    );
  }

  // Default: small circle
  return <circle cx={cx} cy={cy} r={4} fill={color} opacity={0.7} />;
}

export function DocumentationView() {
  const darkMode = useFrameStore((s) => s.darkMode);
  const levels = useFrameStore((s) => s.levels);
  const elements = useFrameStore((s) => s.elements);
  const permanentDimensions = useFrameStore((s) => s.permanentDimensions);
  const docLevel = useFrameStore((s) => s.docLevel);
  const setDocLevel = useFrameStore((s) => s.setDocLevel);

  const svgRef = useRef<SVGSVGElement>(null);

  const activeLevelId = docLevel || (levels[0]?.id ?? "");
  const activeLevel = levels.find((l) => l.id === activeLevelId) ?? levels[0];

  const levelElements = elements.filter((el) => el.level === activeLevelId);
  const vb = computeViewBox(levelElements);
  const svgWidth = vb.width * SCALE;
  const svgHeight = vb.height * SCALE;

  const bg = darkMode ? "#1a2035" : "#f9fafb";
  const panelBg = darkMode ? "#161b27" : "#ffffff";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const textColor = darkMode ? "#e5e7eb" : "#111827";
  const mutedColor = darkMode ? "#6b7280" : "#9ca3af";
  const tabActiveBg = darkMode ? "rgba(59,130,246,0.2)" : "#dbeafe";
  const tabActiveText = darkMode ? "#60a5fa" : "#1d4ed8";

  const handleExport = useCallback(() => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floor-plan-${activeLevel?.name ?? "level"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeLevel]);
  const handleExportPDF = useCallback(() => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const levelName = activeLevel?.name ?? "Level";
    const projectName = "Frame Project";
    const date = new Date().toLocaleDateString();

    const html = `<!DOCTYPE html>
<html>
<head>
<title>${projectName} - ${levelName} Floor Plan</title>
<style>
  @page { size: A1 landscape; margin: 15mm; }
  body { margin: 0; font-family: Arial, sans-serif; background: white; }
  .page { width: 100%; }
  .title-block { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
  .title-block h1 { font-size: 18pt; margin: 0; font-weight: 700; }
  .title-block .meta { font-size: 9pt; color: #555; text-align: right; }
  .title-block .level-badge { font-size: 13pt; font-weight: 600; color: #1d4ed8; }
  .floor-plan-area { display: flex; gap: 24px; align-items: flex-start; }
  .svg-wrap { flex: 1; border: 1px solid #ccc; }
  .svg-wrap svg { width: 100%; height: auto; display: block; }
  .legend { width: 140px; flex-shrink: 0; font-size: 9pt; }
  .legend h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .legend-item { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
  .legend-swatch { width: 16px; height: 10px; border: 0.5px solid #999; flex-shrink: 0; }
  .scale-bar { margin-top: 16px; }
  .scale-bar h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px; }
  .bar-wrap { display: flex; flex-direction: column; gap: 1px; }
  .bar { height: 6px; width: 80px; }
  .bar-labels { display: flex; justify-content: space-between; font-size: 8pt; width: 80px; }
  .north { margin-top: 16px; text-align: center; font-size: 9pt; font-weight: 700; }
  .north svg { display: block; margin: 0 auto 4px; }
  .footer { margin-top: 12px; border-top: 1px solid #ccc; padding-top: 6px; font-size: 8pt; color: #666; display: flex; justify-content: space-between; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="title-block">
    <div>
      <h1>${projectName}</h1>
      <div class="level-badge">${levelName} — Floor Plan</div>
    </div>
    <div class="meta">
      <div>Date: ${date}</div>
      <div>Scale: 1:100</div>
      <div>Drawing No: FP-${levelName.replace(/\s+/g, "-")}-001</div>
    </div>
  </div>
  <div class="floor-plan-area">
    <div class="svg-wrap">${svgStr}</div>
    <div class="legend">
      <h3>Legend</h3>
      <div class="legend-item"><div class="legend-swatch" style="background:#6b7280"></div>Wall</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#374151"></div>Column</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#1f2937"></div>Beam</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#92400e"></div>Door</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#0ea5e9;opacity:0.5"></div>Window</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#e5e7eb"></div>Floor/Slab</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#9ca3af"></div>Other</div>
      <div class="scale-bar">
        <h3>Scale Bar</h3>
        <div class="bar-wrap">
          <div style="display:flex">
            <div class="bar" style="background:#111;width:40px"></div>
            <div class="bar" style="background:white;border:1px solid #111;width:40px"></div>
          </div>
          <div class="bar-labels"><span>0</span><span>2m</span></div>
        </div>
      </div>
      <div class="north">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <polygon points="20,2 28,38 20,32 12,38" fill="#111"/>
          <polygon points="20,2 12,38 20,32 28,38" fill="white" stroke="#111" stroke-width="1"/>
          <text x="20" y="48" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">N</text>
        </svg>
        North
      </div>
    </div>
  </div>
  <div class="footer">
    <span>Frame CAD/BIM — Generated ${date}</span>
    <span>${levelName} Floor Plan | Sheet 1 of 1</span>
  </div>
</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script>
</body>
</html>`;

    const popup = window.open("", "_blank", "width=1200,height=800");
    if (popup) {
      popup.document.write(html);
      popup.document.close();
    }
  }, [activeLevel]);

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: panelBg, color: textColor }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor, background: panelBg }}
      >
        <FileText size={14} style={{ color: mutedColor }} />
        <span className="text-xs font-semibold tracking-wide mr-2">
          Documentation
        </span>

        {/* Level tabs */}
        <div className="flex items-center gap-1">
          {levels.map((l, idx) => {
            const isActive = l.id === activeLevelId;
            return (
              <button
                key={l.id}
                type="button"
                data-ocid={`documentation.level.tab.${idx + 1}`}
                onClick={() => setDocLevel(l.id)}
                className="px-2.5 py-1 rounded text-xs transition-colors"
                style={{
                  background: isActive ? tabActiveBg : "transparent",
                  color: isActive ? tabActiveText : mutedColor,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {l.name}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          data-ocid="documentation.export.button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors"
          style={{
            background: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff",
            color: darkMode ? "#60a5fa" : "#2563eb",
            border: `1px solid ${darkMode ? "rgba(59,130,246,0.3)" : "#bfdbfe"}`,
          }}
        >
          <Download size={12} />
          Export SVG
        </button>

        <button
          type="button"
          data-ocid="documentation.export_pdf.button"
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors"
          style={{
            background: darkMode ? "rgba(16,185,129,0.15)" : "#ecfdf5",
            color: darkMode ? "#34d399" : "#065f46",
            border: `1px solid ${darkMode ? "rgba(16,185,129,0.3)" : "#a7f3d0"}`,
          }}
        >
          <Download size={12} />
          Export PDF
        </button>
      </div>

      {/* Canvas area */}
      <div
        className="flex-1 overflow-auto relative"
        style={{ background: bg }}
        data-ocid="documentation.canvas_target"
      >
        {levelElements.length === 0 ? (
          <div
            data-ocid="documentation.empty_state"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            <FileText size={40} style={{ color: mutedColor, opacity: 0.4 }} />
            <div className="text-sm font-medium" style={{ color: mutedColor }}>
              No elements on this level.
            </div>
            <div
              className="text-xs"
              style={{ color: mutedColor, opacity: 0.7 }}
            >
              Switch to 3D view and start drawing to populate this floor plan.
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Level label */}
            <div
              className="text-xs font-semibold mb-3 uppercase tracking-widest"
              style={{ color: mutedColor }}
            >
              {activeLevel?.name} — Floor Plan
            </div>

            <svg
              role="img"
              aria-label="Floor plan"
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              xmlns="http://www.w3.org/2000/svg"
              style={{
                background: darkMode ? "#0f172a" : "#ffffff",
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                display: "block",
              }}
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="doc-grid"
                  width={SCALE}
                  height={SCALE}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`}
                    fill="none"
                    stroke={darkMode ? "#1e293b" : "#f1f5f9"}
                    strokeWidth={0.5}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#doc-grid)" />

              {/* Elements */}
              {levelElements.map((el) => (
                <ElementShape key={el.id} el={el} vb={vb} />
              ))}

              {/* Permanent dimensions */}
              {permanentDimensions.map((dim) => {
                const x1 = toSvgX(dim.start[0], vb);
                const y1 = toSvgY(dim.start[2], vb);
                const x2 = toSvgX(dim.end[0], vb);
                const y2 = toSvgY(dim.end[2], vb);
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                return (
                  <g key={dim.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#f97316"
                      strokeWidth={1}
                      strokeDasharray="4,2"
                    />
                    <text
                      x={mx}
                      y={my - 4}
                      fontSize={9}
                      fill="#f97316"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {dim.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
