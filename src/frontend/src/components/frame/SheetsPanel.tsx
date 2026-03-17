import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFrameStore } from "../../stores/frameStore";
import type { FrameElement } from "../../types/frame";

const SHEET_TABS = [
  { id: "fp-l1", label: "Floor Plan — L1" },
  { id: "section-aa", label: "Section A-A" },
  { id: "elev-north", label: "Elevation — North" },
];

const TODAY = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

// Convert world coordinates to SVG coordinates
function worldToSvg(
  wx: number,
  wz: number,
  scale: number,
  ox: number,
  oz: number,
) {
  return {
    x: (wx - ox) * scale + 20,
    y: (wz - oz) * scale + 20,
  };
}

function FloorPlanSVG({ elements }: { elements: FrameElement[] }) {
  const walls = elements.filter((e) => e.type === "wall");
  const columns = elements.filter((e) => e.type === "column");
  const doors = elements.filter((e) => e.type === "door");
  const windows = elements.filter((e) => e.type === "window");
  const floors = elements.filter(
    (e) => e.type === "floor" || e.type === "slab",
  );

  const scale = 12;
  const ox = -12;
  const oz = -8;

  const toSvg = (wx: number, wz: number) => worldToSvg(wx, wz, scale, ox, oz);

  // Determine SVG size
  const svgW = 280;
  const svgH = 210;

  // If no elements, show a sample floor plan
  const hasElements = elements.length > 0;

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="border border-gray-300 bg-white"
      style={{ fontFamily: "monospace" }}
      aria-label="Floor plan drawing"
      role="img"
    >
      <title>Floor Plan Level 1</title>
      {/* Background */}
      <rect width={svgW} height={svgH} fill="white" />

      {hasElements ? (
        <>
          {/* Floors */}
          {floors.map((el) => {
            const p = toSvg(
              el.position.x - el.dimensions.width / 2,
              el.position.z - el.dimensions.depth / 2,
            );
            return (
              <rect
                key={el.id}
                x={p.x}
                y={p.y}
                width={el.dimensions.width * scale}
                height={el.dimensions.depth * scale}
                fill="#f5f5f0"
                stroke="none"
              />
            );
          })}
          {/* Walls */}
          {walls.map((el) => {
            const cx = el.position.x;
            const cz = el.position.z;
            const rot = el.rotation ?? 0;
            const p = toSvg(cx, cz);
            const wPx = el.dimensions.width * scale;
            const dPx = el.dimensions.depth * scale;
            return (
              <rect
                key={el.id}
                x={p.x - wPx / 2}
                y={p.y - dPx / 2}
                width={wPx}
                height={dPx}
                fill="#333"
                transform={`rotate(${(-rot * 180) / Math.PI}, ${p.x}, ${p.y})`}
              />
            );
          })}
          {/* Columns */}
          {columns.map((el) => {
            const p = toSvg(el.position.x, el.position.z);
            const sz = el.dimensions.width * scale;
            return (
              <rect
                key={el.id}
                x={p.x - sz / 2}
                y={p.y - sz / 2}
                width={sz}
                height={sz}
                fill="#555"
                stroke="#333"
                strokeWidth={0.5}
              />
            );
          })}
          {/* Windows */}
          {windows.map((el) => {
            const p = toSvg(el.position.x, el.position.z);
            const wPx = el.dimensions.width * scale;
            return (
              <line
                key={el.id}
                x1={p.x - wPx / 2}
                y1={p.y}
                x2={p.x + wPx / 2}
                y2={p.y}
                stroke="#93c5fd"
                strokeWidth={3}
              />
            );
          })}
          {/* Doors */}
          {doors.map((el) => {
            const p = toSvg(el.position.x, el.position.z);
            const r = el.dimensions.width * scale;
            return (
              <path
                key={el.id}
                d={`M${p.x},${p.y} L${p.x + r},${p.y} A${r},${r} 0 0,0 ${p.x},${p.y - r}`}
                fill="none"
                stroke="#c4a265"
                strokeWidth={1}
              />
            );
          })}
        </>
      ) : (
        // Sample floor plan when empty
        <>
          <rect x="30" y="25" width="220" height="145" fill="#f5f5f0" />
          {/* Outer walls */}
          <rect x="30" y="25" width="220" height="8" fill="#333" />
          <rect x="30" y="162" width="220" height="8" fill="#333" />
          <rect x="30" y="25" width="8" height="145" fill="#333" />
          <rect x="242" y="25" width="8" height="145" fill="#333" />
          {/* Interior walls */}
          <rect x="130" y="33" width="8" height="70" fill="#555" />
          <rect x="38" y="95" width="92" height="6" fill="#555" />
          {/* Columns */}
          <rect x="30" y="25" width="8" height="8" fill="#222" />
          <rect x="242" y="25" width="8" height="8" fill="#222" />
          <rect x="30" y="162" width="8" height="8" fill="#222" />
          <rect x="242" y="162" width="8" height="8" fill="#222" />
          <rect x="126" y="25" width="8" height="8" fill="#222" />
          <rect x="126" y="162" width="8" height="8" fill="#222" />
          {/* Door arcs */}
          <path
            d="M72,33 L72,53 A20,20 0 0,0 92,33"
            fill="none"
            stroke="#c4a265"
            strokeWidth={1}
          />
          <path
            d="M162,33 L162,53 A20,20 0 0,0 182,33"
            fill="none"
            stroke="#c4a265"
            strokeWidth={1}
          />
          {/* Windows */}
          <line
            x1="140"
            y1="25"
            x2="200"
            y2="25"
            stroke="#93c5fd"
            strokeWidth={4}
          />
          <line
            x1="38"
            y1="110"
            x2="38"
            y2="150"
            stroke="#93c5fd"
            strokeWidth={4}
          />
          {/* Room labels */}
          <text x="68" y="72" fontSize="7" fill="#555" textAnchor="middle">
            OFFICE A
          </text>
          <text x="68" y="80" fontSize="6" fill="#888" textAnchor="middle">
            42 m²
          </text>
          <text x="190" y="72" fontSize="7" fill="#555" textAnchor="middle">
            CONFERENCE
          </text>
          <text x="190" y="80" fontSize="6" fill="#888" textAnchor="middle">
            38 m²
          </text>
          <text x="95" y="135" fontSize="7" fill="#555" textAnchor="middle">
            OFFICE B
          </text>
          <text x="95" y="143" fontSize="6" fill="#888" textAnchor="middle">
            56 m²
          </text>
          <text x="195" y="135" fontSize="7" fill="#555" textAnchor="middle">
            RECEPTION
          </text>
          <text x="195" y="143" fontSize="6" fill="#888" textAnchor="middle">
            28 m²
          </text>
          {/* Grid lines */}
          <line
            x1="130"
            y1="10"
            x2="130"
            y2="180"
            stroke="#ef4444"
            strokeWidth={0.5}
            strokeDasharray="3,3"
            opacity="0.4"
          />
          <line
            x1="20"
            y1="95"
            x2="265"
            y2="95"
            stroke="#ef4444"
            strokeWidth={0.5}
            strokeDasharray="3,3"
            opacity="0.4"
          />
          <text x="130" y="8" fontSize="6" fill="#ef4444" textAnchor="middle">
            B
          </text>
          <text x="20" y="97" fontSize="6" fill="#ef4444">
            2
          </text>
        </>
      )}

      {/* Scale bar */}
      <line
        x1="30"
        y1={svgH - 20}
        x2="90"
        y2={svgH - 20}
        stroke="#333"
        strokeWidth={1}
      />
      <line
        x1="30"
        y1={svgH - 23}
        x2="30"
        y2={svgH - 17}
        stroke="#333"
        strokeWidth={1}
      />
      <line
        x1="90"
        y1={svgH - 23}
        x2="90"
        y2={svgH - 17}
        stroke="#333"
        strokeWidth={1}
      />
      <text x="60" y={svgH - 10} fontSize="6" fill="#333" textAnchor="middle">
        5 m
      </text>

      {/* North arrow */}
      <g transform={`translate(${svgW - 25}, ${svgH - 25})`}>
        <polygon points="0,-10 4,5 0,2 -4,5" fill="#333" />
        <text
          x="0"
          y="15"
          fontSize="7"
          fill="#333"
          textAnchor="middle"
          fontWeight="bold"
        >
          N
        </text>
      </g>
    </svg>
  );
}

function SectionSVG() {
  return (
    <svg
      width={280}
      height={210}
      viewBox="0 0 280 210"
      className="border border-gray-300 bg-white"
      aria-label="Section A-A drawing"
      role="img"
    >
      <title>Section A-A</title>
      <rect width={280} height={210} fill="white" />
      {/* Ground line */}
      <line
        x1="20"
        y1="170"
        x2="260"
        y2="170"
        stroke="#333"
        strokeWidth={1.5}
      />
      {/* Foundation */}
      <rect
        x="35"
        y="165"
        width="25"
        height="15"
        fill="#aaa"
        stroke="#333"
        strokeWidth={0.5}
      />
      <rect
        x="115"
        y="165"
        width="25"
        height="15"
        fill="#aaa"
        stroke="#333"
        strokeWidth={0.5}
      />
      <rect
        x="195"
        y="165"
        width="25"
        height="15"
        fill="#aaa"
        stroke="#333"
        strokeWidth={0.5}
      />
      {/* Columns L1 */}
      <rect
        x="44"
        y="130"
        width="8"
        height="40"
        fill="#888"
        stroke="#555"
        strokeWidth={0.5}
      />
      <rect
        x="124"
        y="130"
        width="8"
        height="40"
        fill="#888"
        stroke="#555"
        strokeWidth={0.5}
      />
      <rect
        x="204"
        y="130"
        width="8"
        height="40"
        fill="#888"
        stroke="#555"
        strokeWidth={0.5}
      />
      {/* Beams L2 */}
      <rect
        x="44"
        y="126"
        width="88"
        height="5"
        fill="#666"
        stroke="#444"
        strokeWidth={0.5}
      />
      <rect
        x="124"
        y="126"
        width="88"
        height="5"
        fill="#666"
        stroke="#444"
        strokeWidth={0.5}
      />
      {/* Slab L2 */}
      <rect
        x="38"
        y="121"
        width="202"
        height="8"
        fill="#9ca3af"
        stroke="#555"
        strokeWidth={0.5}
      />
      {/* Walls L2 */}
      <rect x="38" y="90" width="6" height="35" fill="#9ca3af" />
      <rect x="234" y="90" width="6" height="35" fill="#9ca3af" />
      {/* Windows L2 */}
      <rect
        x="80"
        y="95"
        width="40"
        height="22"
        fill="#bfdbfe"
        opacity={0.6}
        stroke="#93c5fd"
        strokeWidth={0.5}
      />
      <rect
        x="150"
        y="95"
        width="40"
        height="22"
        fill="#bfdbfe"
        opacity={0.6}
        stroke="#93c5fd"
        strokeWidth={0.5}
      />
      {/* Roof */}
      <rect
        x="38"
        y="84"
        width="202"
        height="6"
        fill="#9ca3af"
        stroke="#555"
        strokeWidth={0.5}
      />
      {/* Level annotations */}
      <line
        x1="22"
        y1="170"
        x2="34"
        y2="170"
        stroke="#3b82f6"
        strokeWidth={0.8}
        strokeDasharray="2,2"
      />
      <text x="10" y="172" fontSize="6" fill="#3b82f6">
        L1
      </text>
      <line
        x1="22"
        y1="121"
        x2="34"
        y2="121"
        stroke="#3b82f6"
        strokeWidth={0.8}
        strokeDasharray="2,2"
      />
      <text x="10" y="123" fontSize="6" fill="#3b82f6">
        L2
      </text>
      <line
        x1="22"
        y1="84"
        x2="34"
        y2="84"
        stroke="#3b82f6"
        strokeWidth={0.8}
        strokeDasharray="2,2"
      />
      <text x="6" y="86" fontSize="6" fill="#3b82f6">
        Roof
      </text>
      {/* Section cut markers */}
      <text x="20" y="12" fontSize="8" fill="#333" fontWeight="bold">
        A
      </text>
      <circle cx="22" cy="15" r="5" fill="none" stroke="#333" strokeWidth={1} />
      <text x="248" y="12" fontSize="8" fill="#333" fontWeight="bold">
        A
      </text>
      <circle
        cx="250"
        cy="15"
        r="5"
        fill="none"
        stroke="#333"
        strokeWidth={1}
      />
      <line
        x1="22"
        y1="20"
        x2="250"
        y2="20"
        stroke="#333"
        strokeWidth={0.5}
        strokeDasharray="5,3"
      />
    </svg>
  );
}

function ElevationSVG() {
  return (
    <svg
      width={280}
      height={210}
      viewBox="0 0 280 210"
      className="border border-gray-300 bg-white"
      aria-label="North elevation drawing"
      role="img"
    >
      <title>Elevation — North</title>
      <rect width={280} height={210} fill="white" />
      {/* Ground */}
      <line
        x1="20"
        y1="170"
        x2="260"
        y2="170"
        stroke="#333"
        strokeWidth={1.5}
      />
      <rect x="20" y="170" width="240" height="8" fill="#ccc" />
      {/* Building body */}
      <rect
        x="30"
        y="90"
        width="220"
        height="80"
        fill="#d1d5db"
        stroke="#555"
        strokeWidth={0.5}
      />
      {/* Windows row 1 */}
      {[50, 110, 170, 210].map((x) => (
        <rect
          key={x}
          x={x}
          y="120"
          width="30"
          height="22"
          fill="#bfdbfe"
          opacity={0.8}
          stroke="#93c5fd"
          strokeWidth={0.8}
        />
      ))}
      {/* Windows row 2 */}
      {[50, 110, 170, 210].map((x) => (
        <rect
          key={`r2-${x}`}
          x={x}
          y="95"
          width="30"
          height="18"
          fill="#bfdbfe"
          opacity={0.6}
          stroke="#93c5fd"
          strokeWidth={0.5}
        />
      ))}
      {/* Door */}
      <rect
        x="125"
        y="145"
        width="30"
        height="25"
        fill="#c4a265"
        stroke="#8b6c45"
        strokeWidth={0.8}
      />
      {/* Roof overhang */}
      <polygon
        points="22,90 140,60 258,90"
        fill="#9ca3af"
        stroke="#555"
        strokeWidth={0.8}
      />
      {/* Annotations */}
      <line
        x1="262"
        y1="170"
        x2="262"
        y2="90"
        stroke="#555"
        strokeWidth={0.5}
      />
      <line
        x1="259"
        y1="170"
        x2="265"
        y2="170"
        stroke="#555"
        strokeWidth={0.5}
      />
      <line x1="259" y1="90" x2="265" y2="90" stroke="#555" strokeWidth={0.5} />
      <text x="268" y="132" fontSize="6" fill="#555">
        7.2 m
      </text>
      {/* Elevation marker */}
      <text x="20" y="187" fontSize="6" fill="#333">
        ±0.00
      </text>
      <text
        x="130"
        y="10"
        fontSize="8"
        fill="#333"
        fontWeight="bold"
        textAnchor="middle"
      >
        NORTH ELEVATION
      </text>
    </svg>
  );
}

export function SheetsPanel() {
  const { showSheets, setShowSheets, darkMode, elements } = useFrameStore();
  const [activeSheet, setActiveSheet] = useState("fp-l1");

  if (!showSheets) return null;

  const handleExportPdf = () => {
    toast.success("Exporting to PDF...", {
      description: "Sheet package will be ready in a moment",
    });
  };

  return (
    <div
      data-ocid="sheets.panel"
      className={`w-80 flex-shrink-0 flex flex-col border-l overflow-hidden ${
        darkMode
          ? "bg-[#161b27] border-white/8 text-gray-200"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {/* Header */}
      <div
        className={`h-9 flex items-center justify-between px-3 border-b flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Sheets
        </span>
        <button
          type="button"
          data-ocid="sheets.close.button"
          onClick={() => setShowSheets(false)}
          className={`p-0.5 rounded transition-colors ${
            darkMode
              ? "hover:bg-white/8 text-gray-500"
              : "hover:bg-gray-100 text-gray-400"
          }`}
        >
          <X size={12} />
        </button>
      </div>

      {/* Sheet tabs */}
      <div
        className={`flex border-b overflow-x-auto flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        {SHEET_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-ocid={`sheets.${tab.id}.tab`}
            onClick={() => setActiveSheet(tab.id)}
            className={`px-2 py-1.5 text-[9px] whitespace-nowrap font-medium transition-colors flex-shrink-0 ${
              activeSheet === tab.id
                ? darkMode
                  ? "border-b-2 border-blue-400 text-blue-400"
                  : "border-b-2 border-blue-500 text-blue-600"
                : darkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawing area */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        <div className="flex justify-center">
          {activeSheet === "fp-l1" && <FloorPlanSVG elements={elements} />}
          {activeSheet === "section-aa" && <SectionSVG />}
          {activeSheet === "elev-north" && <ElevationSVG />}
        </div>

        {/* Title block */}
        <div
          className={`border text-[9px] font-mono ${
            darkMode
              ? "border-white/20 bg-white/5"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <div
            className={`grid grid-cols-2 divide-x ${
              darkMode ? "divide-white/10" : "divide-gray-300"
            }`}
          >
            <div
              className={`p-2 space-y-1 border-b ${
                darkMode ? "border-white/10" : "border-gray-300"
              }`}
            >
              <div className="font-bold text-[10px] uppercase">
                Riverside Office Building
              </div>
              <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                {activeSheet === "fp-l1"
                  ? "Floor Plan — Level 1"
                  : activeSheet === "section-aa"
                    ? "Section A-A"
                    : "Elevation — North"}
              </div>
            </div>
            <div
              className={`p-2 space-y-0.5 border-b ${
                darkMode ? "border-white/10" : "border-gray-300"
              }`}
            >
              <div>Scale: 1:100</div>
              <div>Date: {TODAY}</div>
            </div>
          </div>
          <div
            className={`grid grid-cols-3 divide-x ${
              darkMode ? "divide-white/10" : "divide-gray-300"
            }`}
          >
            <div className="p-2">
              <div className={darkMode ? "text-gray-500" : "text-gray-400"}>
                Drawn by
              </div>
              <div>You</div>
            </div>
            <div className="p-2">
              <div className={darkMode ? "text-gray-500" : "text-gray-400"}>
                Checked by
              </div>
              <div>A.K.</div>
            </div>
            <div className="p-2">
              <div className={darkMode ? "text-gray-500" : "text-gray-400"}>
                Sheet no.
              </div>
              <div>
                {activeSheet === "fp-l1"
                  ? "A-101"
                  : activeSheet === "section-aa"
                    ? "A-201"
                    : "A-301"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`p-2 border-t flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <button
          type="button"
          data-ocid="sheets.export_pdf.button"
          onClick={handleExportPdf}
          className="w-full py-1.5 rounded text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
