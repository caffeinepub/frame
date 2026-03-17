import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  Loader2,
  Plus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

const SAMPLE_LOADS = [
  { id: "l1", label: "Column C-1", magnitude: 50, unit: "kN" },
  { id: "l2", label: "Beam B-3", magnitude: 30, unit: "kN" },
  { id: "l3", label: "Slab S-2", magnitude: 15, unit: "kN/m\u00b2" },
];

const DEFLECTION_MEMBERS = [
  { id: "B-14", label: "Beam B-14", ratio: 0.94 },
  { id: "B-07", label: "Beam B-07", ratio: 0.72 },
  { id: "C-03", label: "Col C-03", ratio: 0.45 },
  { id: "C-11", label: "Col C-11", ratio: 0.31 },
];

const STRUCTURAL_TYPES = new Set([
  "wall",
  "column",
  "beam",
  "slab",
  "foundation",
]);

function ratioColor(r: number) {
  if (r > 0.9) return "#ef4444";
  if (r > 0.7) return "#f59e0b";
  return "#22c55e";
}

export function AnalysisPanel() {
  const {
    analysis,
    runAnalysis,
    darkMode,
    elements,
    setStressOverlay,
    stressOverlay,
  } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();
  const [loads, setLoads] =
    useState<{ id: string; label: string; magnitude: number; unit: string }[]>(
      SAMPLE_LOADS,
    );
  const [showAddLoad, setShowAddLoad] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMag, setNewMag] = useState("10");

  const addLoad = () => {
    if (!newLabel.trim()) return;
    setLoads((prev) => [
      ...prev,
      {
        id: `l-${Date.now()}`,
        label: newLabel,
        magnitude: Number(newMag) || 10,
        unit: "kN",
      },
    ]);
    setNewLabel("");
    setNewMag("10");
    setShowAddLoad(false);
  };

  const handleRunAnalysis = () => {
    // Generate random utilizations for structural elements
    const utilizations: Record<string, number> = {};
    for (const el of elements) {
      if (STRUCTURAL_TYPES.has(el.type)) {
        utilizations[el.id] = Math.random();
      }
    }
    setStressOverlay({ enabled: true, utilizations });
    runAnalysis();
  };

  const handleClearOverlay = () => {
    setStressOverlay({ enabled: false, utilizations: {} });
  };

  const inputH = isTouchDevice ? "h-12 text-sm" : "h-6 text-[11px]";
  const btnH = isTouchDevice ? "h-12 px-4 text-sm" : "h-6 px-2 text-[10px]";

  const inputCls = `${inputH} rounded-sm px-1.5 font-mono focus:outline-none focus:border-blue-500/60 transition-colors border touch-manipulation ${
    darkMode
      ? "bg-white/5 border-white/10 text-gray-200"
      : "bg-gray-50 border-gray-300 text-gray-800"
  }`;

  return (
    <div
      className={`border-t ${darkMode ? "border-white/8" : "border-gray-200"}`}
    >
      {/* Header */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Structural Analysis
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
          {loads.length} loads
        </span>
      </div>

      {/* Stress Overlay Controls */}
      {stressOverlay.enabled && (
        <div
          className={`px-3 py-2 border-b flex items-center justify-between ${
            darkMode
              ? "border-white/8 bg-green-500/5"
              : "border-gray-200 bg-green-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span
              className={`text-[10px] ${
                darkMode ? "text-green-400" : "text-green-700"
              }`}
            >
              Stress overlay active
            </span>
          </div>
          <button
            type="button"
            data-ocid="analysis.clear_overlay.button"
            onClick={handleClearOverlay}
            className={`text-[10px] px-2 py-1 rounded border transition-colors touch-manipulation ${
              darkMode
                ? "border-white/10 hover:bg-white/8 text-gray-500"
                : "border-gray-200 hover:bg-gray-100 text-gray-500"
            }`}
          >
            Clear Overlay
          </button>
        </div>
      )}

      {/* Loads section */}
      <div className="px-3 pt-2 pb-1 space-y-1">
        <div
          className={`text-[9px] uppercase tracking-widest font-semibold mb-1 ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Applied Loads
        </div>
        <div className="space-y-1">
          {loads.map((load) => (
            <div
              key={load.id}
              className={`flex items-center justify-between py-1 px-2 rounded text-[10px] ${
                darkMode ? "bg-white/4" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap size={9} className="text-amber-400 shrink-0" />
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  {load.label}
                </span>
              </div>
              <span className="font-mono text-amber-400">
                {load.magnitude} {load.unit}
              </span>
            </div>
          ))}
        </div>

        {showAddLoad ? (
          <div
            className={`rounded p-2 space-y-1.5 border ${
              darkMode
                ? "bg-white/4 border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <input
              data-ocid="analysis.load_label.input"
              className={`${inputCls} w-full`}
              placeholder="Member (e.g. Beam B-5)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <div className="flex gap-1">
              <input
                data-ocid="analysis.load_magnitude.input"
                className={`${inputCls} w-16`}
                type="number"
                min={0}
                value={newMag}
                onChange={(e) => setNewMag(e.target.value)}
              />
              <span
                className={`text-[10px] self-center ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                kN
              </span>
              <button
                type="button"
                data-ocid="analysis.add_load.button"
                onClick={addLoad}
                className={`ml-auto ${btnH} rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-colors touch-manipulation`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddLoad(false)}
                className={`${btnH} rounded border transition-colors touch-manipulation ${
                  darkMode
                    ? "border-white/10 hover:bg-white/8 text-gray-500"
                    : "border-gray-200 hover:bg-gray-100 text-gray-400"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            data-ocid="analysis.show_add_load.button"
            onClick={() => setShowAddLoad(true)}
            className={`w-full flex items-center justify-center gap-1 text-[10px] py-${isTouchDevice ? "3" : "1"} rounded border border-dashed transition-colors touch-manipulation ${
              darkMode
                ? "border-white/15 hover:border-white/25 text-gray-600 hover:text-gray-400"
                : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-600"
            }`}
          >
            <Plus size={10} />
            Add Load
          </button>
        )}
      </div>

      {/* Run / Running / Results */}
      {!analysis.running && !analysis.complete && (
        <div className="px-3 pb-3">
          <button
            type="button"
            data-ocid="analysis.run.button"
            onClick={handleRunAnalysis}
            className={`w-full flex items-center justify-center gap-2 py-${isTouchDevice ? "3" : "2"} rounded text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-colors touch-manipulation`}
          >
            <Cpu size={13} />
            Run Analysis
          </button>
        </div>
      )}

      {analysis.running && (
        <div className="px-3 pb-3 flex flex-col items-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-400" />
          <span className="text-[11px] text-gray-500">
            Analyzing {loads.length} loads on 500+ members\u2026
          </span>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      )}

      {analysis.complete && !analysis.running && (
        <div className="px-3 pb-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {analysis.failCount > 0 ? (
              <AlertTriangle size={13} className="text-red-400" />
            ) : (
              <CheckCircle size={13} className="text-green-400" />
            )}
            <span
              className={
                analysis.failCount > 0 ? "text-red-400" : "text-green-400"
              }
            >
              {analysis.failCount > 0
                ? `${analysis.failCount} failed`
                : "All checks pass"}
            </span>
          </div>

          <div className="space-y-1">
            {[
              {
                label: "Max Deflection",
                value: analysis.maxDeflection,
                ok: true,
              },
              {
                label: "Critical Member",
                value: `${analysis.criticalMember} (${analysis.criticalRatio.toFixed(2)})`,
                ok: analysis.criticalRatio < 1.0,
              },
              {
                label: "Warnings",
                value: String(analysis.warnCount),
                ok: analysis.warnCount === 0,
              },
            ].map(({ label, value, ok }) => (
              <div
                key={label}
                className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
              >
                <span className="text-[10px] text-gray-500">{label}</span>
                <span
                  className={`text-[10px] font-mono ${
                    ok
                      ? darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                      : "text-amber-400"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Deflection Profile */}
          <div>
            <div
              className={`text-[9px] uppercase tracking-widest font-semibold mb-1.5 ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Utilization Profile
            </div>
            <div className="space-y-1.5">
              {DEFLECTION_MEMBERS.map((m) => (
                <div key={m.id}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-gray-500">{m.label}</span>
                    <span
                      className="text-[9px] font-mono"
                      style={{ color: ratioColor(m.ratio) }}
                    >
                      {m.ratio.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`h-1.5 rounded-full ${
                      darkMode ? "bg-white/10" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(m.ratio * 100, 100)}%`,
                        background: ratioColor(m.ratio),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            data-ocid="analysis.rerun.button"
            onClick={handleRunAnalysis}
            className={`w-full text-[10px] py-${isTouchDevice ? "3" : "1"} rounded border transition-colors touch-manipulation ${
              darkMode
                ? "border-white/10 hover:bg-white/8 text-gray-500"
                : "border-gray-200 hover:bg-gray-100 text-gray-500"
            }`}
          >
            Re-run Analysis
          </button>
        </div>
      )}
    </div>
  );
}
