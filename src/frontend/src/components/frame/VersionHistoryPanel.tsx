import { Clock, GitBranch, RotateCcw, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

export function VersionHistoryPanel() {
  const {
    snapshots,
    showVersionHistory,
    setShowVersionHistory,
    darkMode,
    saveSnapshot,
    restoreSnapshot,
  } = useFrameStore();

  const isTouchDevice = useIsTouchDevice();
  const [saveName, setSaveName] = useState("");
  const [restoredId, setRestoredId] = useState<string | null>(null);

  if (!showVersionHistory) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSave = () => {
    const name = saveName.trim() || `Version ${snapshots.length + 1}`;
    saveSnapshot(name);
    setSaveName("");
    toast.success(`Version "${name}" saved`);
  };

  const handleRestore = (snapId: string, snapName: string) => {
    restoreSnapshot(snapId);
    setRestoredId(snapId);
    toast.success(`Restored "${snapName}"`);
    setTimeout(() => setRestoredId(null), 2000);
  };

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
  const borderCls = darkMode ? "border-white/8" : "border-gray-200";
  const inputH = isTouchDevice ? "h-12 text-sm" : "h-6 text-[11px]";
  const btnH = isTouchDevice ? "h-12 px-4 text-sm" : "h-6 px-2 text-[10px]";
  const smallBtnH = isTouchDevice
    ? "py-2 px-3 text-sm"
    : "text-[9px] px-2 py-1";

  return (
    <div
      className={`absolute right-[272px] top-0 bottom-0 w-64 border-l z-20 flex flex-col ${
        darkMode
          ? "bg-[#161b27] border-white/8 text-gray-200"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {/* Header */}
      <div
        className={`h-9 flex items-center justify-between px-3 border-b flex-shrink-0 ${borderCls}`}
      >
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-gray-500" />
          <span
            className={`text-[10px] uppercase tracking-widest font-semibold ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Version History
          </span>
        </div>
        <button
          type="button"
          data-ocid="version_history.close.button"
          onClick={() => setShowVersionHistory(false)}
          className={`flex items-center justify-center ${isTouchDevice ? "w-10 h-10" : "p-0.5"} rounded transition-colors touch-manipulation ${darkMode ? "hover:bg-white/8 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
        >
          <X size={12} />
        </button>
      </div>

      {/* Save Version form */}
      <div className={`px-2 py-2 border-b flex-shrink-0 ${borderCls}`}>
        <div className="flex gap-1.5">
          <input
            type="text"
            data-ocid="version_history.save_name.input"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Version name…"
            className={`flex-1 min-w-0 ${inputH} rounded px-2 border outline-none transition-colors touch-manipulation ${
              darkMode
                ? "bg-white/5 border-white/10 text-gray-200 placeholder-gray-600 focus:border-blue-500/50"
                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400"
            }`}
          />
          <button
            type="button"
            data-ocid="version_history.save.button"
            onClick={handleSave}
            className={`flex items-center gap-1 ${btnH} rounded font-medium transition-colors touch-manipulation ${
              darkMode
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
            }`}
          >
            <Save size={9} />
            Save
          </button>
        </div>
      </div>

      {/* Snapshot list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {snapshots.length === 0 && (
          <div
            data-ocid="version_history.empty_state"
            className={`text-center py-6 text-[11px] ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            No versions saved yet
          </div>
        )}
        {snapshots.map((snap, i) => (
          <div
            key={snap.id}
            data-ocid={`version_history.snapshot.${i + 1}.item`}
            className={`p-3 rounded-lg border transition-colors ${
              darkMode
                ? "border-white/8 hover:bg-white/5"
                : "border-gray-100 hover:bg-gray-50"
            }`}
          >
            {/* Color swatch thumbnail */}
            <div
              className="w-full h-10 rounded mb-2 opacity-30"
              style={{
                background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`,
              }}
            />
            <div className="font-medium text-[11px]">{snap.name}</div>
            <div
              className={`text-[10px] mt-0.5 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {formatDate(snap.createdAt)} · {snap.author}
              {snap.elementCount !== undefined && (
                <span className="ml-1 opacity-70">
                  · {snap.elementCount} el.
                </span>
              )}
            </div>
            {snap.description && (
              <p
                className={`text-[10px] mt-1 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {snap.description}
              </p>
            )}
            <div className="flex gap-1 mt-2">
              <button
                type="button"
                data-ocid="version_history.restore.button"
                onClick={() => handleRestore(snap.id, snap.name)}
                className={`flex items-center gap-1 ${smallBtnH} rounded border transition-colors touch-manipulation ${
                  restoredId === snap.id
                    ? darkMode
                      ? "border-green-500/30 bg-green-500/15 text-green-400"
                      : "border-green-400/40 bg-green-50 text-green-600"
                    : darkMode
                      ? "border-white/10 hover:bg-white/8 text-gray-500"
                      : "border-gray-200 hover:bg-gray-100 text-gray-500"
                }`}
              >
                <RotateCcw size={9} />
                {restoredId === snap.id ? "Restored!" : "Restore"}
              </button>
              <button
                type="button"
                data-ocid="version_history.branch.button"
                className={`flex items-center gap-1 ${smallBtnH} rounded border transition-colors touch-manipulation ${
                  darkMode
                    ? "border-white/10 hover:bg-white/8 text-gray-500"
                    : "border-gray-200 hover:bg-gray-100 text-gray-500"
                }`}
              >
                <GitBranch size={9} />
                Branch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
