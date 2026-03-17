import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { useFrameStore } from "../../stores/frameStore";
import type { ClashRecord } from "../../types/frame";

const SEVERITY_CONFIG: Record<
  string,
  { color: string; icon: typeof AlertOctagon; label: string }
> = {
  critical: { color: "#ef4444", icon: AlertOctagon, label: "Critical" },
  high: { color: "#f97316", icon: AlertTriangle, label: "High" },
  medium: { color: "#eab308", icon: AlertTriangle, label: "Medium" },
  low: { color: "#3b82f6", icon: Info, label: "Low" },
};

const TYPE_LABELS: Record<string, string> = {
  hard: "Hard",
  soft: "Soft",
  workflow: "Workflow",
};

function ClashItem({ clash }: { clash: ClashRecord }) {
  const { resolveClash, darkMode } = useFrameStore();
  const sev = SEVERITY_CONFIG[clash.severity];
  const Icon = sev.icon;

  return (
    <div
      className={`px-3 py-2 border-b transition-colors ${
        clash.resolved
          ? darkMode
            ? "border-white/5 opacity-40"
            : "border-gray-100 opacity-40"
          : darkMode
            ? "border-white/8 hover:bg-white/4"
            : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon
          size={12}
          className="mt-0.5 flex-shrink-0"
          style={{ color: sev.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className={`text-[10px] font-medium truncate max-w-[140px] ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {clash.element1Name}
            </span>
            <span className="text-[9px] text-gray-500">vs</span>
            <span
              className={`text-[10px] font-medium truncate max-w-[140px] ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {clash.element2Name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[9px] px-1 rounded"
              style={{ background: `${sev.color}22`, color: sev.color }}
            >
              {TYPE_LABELS[clash.clashType]}
            </span>
            <span
              className={`text-[9px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              {clash.location}
            </span>
          </div>
        </div>
        {!clash.resolved && (
          <button
            type="button"
            data-ocid={"clash.resolve.button"}
            onClick={() => resolveClash(clash.id)}
            className="flex-shrink-0 p-0.5 rounded hover:bg-green-500/20 text-gray-500 hover:text-green-400 transition-colors"
            title="Resolve"
          >
            <CheckCircle size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ClashPanel() {
  const { clashes, darkMode } = useFrameStore();
  const active = clashes.filter((c) => !c.resolved);
  const resolved = clashes.filter((c) => c.resolved);

  return (
    <div
      className={`border-t ${darkMode ? "border-white/8" : "border-gray-200"}`}
    >
      <div
        className={`px-3 py-2 flex items-center justify-between border-b ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-widest font-semibold ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Clash Detection
          </span>
          {active.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
              {active.length}
            </span>
          )}
        </div>
        <button
          type="button"
          data-ocid="clash.export.button"
          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
            darkMode
              ? "border-white/10 hover:bg-white/8 text-gray-500"
              : "border-gray-200 hover:bg-gray-100 text-gray-500"
          }`}
        >
          Export
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {active.length === 0 && (
          <div className="p-4 text-center">
            <CheckCircle size={20} className="mx-auto mb-1 text-green-400" />
            <span
              className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              No active clashes
            </span>
          </div>
        )}
        {active.map((clash) => (
          <ClashItem key={clash.id} clash={clash} />
        ))}
        {resolved.length > 0 && (
          <div
            className={`px-3 py-1.5 ${
              darkMode ? "text-gray-600" : "text-gray-400"
            } text-[9px] uppercase tracking-widest`}
          >
            Resolved ({resolved.length})
          </div>
        )}
        {resolved.map((clash) => (
          <ClashItem key={clash.id} clash={clash} />
        ))}
      </div>
    </div>
  );
}
