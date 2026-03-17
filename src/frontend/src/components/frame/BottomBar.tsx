import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Grid3x3,
  Loader2,
  MousePointer2,
  Plus,
  X,
} from "lucide-react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

export function BottomBar() {
  const {
    levels,
    activeLevel,
    setActiveLevel,
    addLevel,
    deleteLevel,
    activeDiscipline,
    activeTool,
    analysis,
    zoom,
    darkMode,
    elements,
    drawingState,
    cursorPos,
    snapEnabled,
    toggleSnap,
    levelVisibility,
    toggleLevelVisibility,
    units,
    setUnits,
    selectedElementIds,
    selectedElementId,
  } = useFrameStore();

  const isTouchDevice = useIsTouchDevice();

  const disciplineColors: Record<string, string> = {
    architecture: "#3b82f6",
    structure: "#10b981",
    mep: "#f59e0b",
    parts: "#8b5cf6",
  };

  const selectedCount =
    selectedElementIds.length > 0
      ? selectedElementIds.length
      : selectedElementId
        ? 1
        : 0;

  // Touch-optimized sizing — all interactive elements >= 48px
  const barH = isTouchDevice ? "h-16" : "h-8";
  const btnH = isTouchDevice ? "h-12 px-4 text-sm" : "px-1.5 py-0.5";
  const iconBtnSz = isTouchDevice ? "w-12 h-12" : "w-4 h-4";
  const snapSz = isTouchDevice ? "w-12 h-12" : "w-5 h-5";
  const unitsBtnH = isTouchDevice
    ? "px-4 py-3 text-sm"
    : "px-1.5 py-0.5 text-[10px]";

  return (
    <div
      className={`${barH} flex items-center px-3 gap-3 border-t text-[10px] select-none flex-shrink-0 ${
        darkMode
          ? "bg-[#161b27] border-white/8 text-gray-500"
          : "bg-gray-50 border-gray-200 text-gray-500"
      }`}
    >
      {/* Level selector */}
      <div className="flex items-center gap-1.5">
        <Building2 size={isTouchDevice ? 18 : 11} className="opacity-50" />
        <span className={`opacity-50 mr-1 ${isTouchDevice ? "text-sm" : ""}`}>
          Level
        </span>
        {levels.map((l, idx) => {
          const visible = levelVisibility[l.id] !== false;
          const count = elements.filter((el) => el.level === l.id).length;
          return (
            <div key={l.id} className="relative group flex items-center gap-1">
              <button
                type="button"
                data-ocid={`bottombar.level.${idx + 1}.button`}
                onClick={() => setActiveLevel(l.id)}
                className={`flex items-center gap-1.5 ${btnH} rounded transition-colors touch-manipulation ${
                  activeLevel === l.id
                    ? darkMode
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-700"
                    : darkMode
                      ? "hover:bg-white/8 hover:text-gray-300"
                      : "hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                {l.name}
                {count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full ${
                      isTouchDevice ? "text-[10px] px-1.5" : "text-[8px] px-1"
                    } font-semibold leading-none ${
                      activeLevel === l.id
                        ? darkMode
                          ? "bg-blue-500/30 text-blue-300"
                          : "bg-blue-200 text-blue-700"
                        : darkMode
                          ? "bg-white/10 text-gray-500"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
              {/* Visibility toggle */}
              <button
                type="button"
                data-ocid={`bottombar.level.visibility.toggle.${idx + 1}`}
                onClick={() => toggleLevelVisibility(l.id)}
                title={visible ? `Hide ${l.name}` : `Show ${l.name}`}
                className={`flex items-center justify-center ${iconBtnSz} rounded transition-opacity touch-manipulation ${
                  visible
                    ? darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-500 hover:text-gray-800"
                    : darkMode
                      ? "text-gray-600 opacity-50 hover:opacity-80"
                      : "text-gray-400 opacity-50 hover:opacity-80"
                }`}
              >
                {visible ? (
                  <Eye size={isTouchDevice ? 16 : 9} />
                ) : (
                  <EyeOff size={isTouchDevice ? 16 : 9} />
                )}
              </button>
              {levels.length > 1 && idx > 0 && (
                <button
                  type="button"
                  data-ocid={`bottombar.level.delete.button.${idx + 1}`}
                  onClick={() => deleteLevel(l.id)}
                  className={`absolute ${isTouchDevice ? "-top-3 -right-3 w-8 h-8 flex" : "-top-1.5 -right-1.5 w-3.5 h-3.5 hidden group-hover:flex"} rounded-full items-center justify-center z-10 ${
                    darkMode
                      ? "bg-red-500/90 text-white"
                      : "bg-red-400 text-white"
                  }`}
                  title={`Delete ${l.name}`}
                >
                  <X size={8} />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          data-ocid="bottombar.level.add.button"
          onClick={() => addLevel(`L${levels.length + 1}`)}
          className={`flex items-center justify-center ${iconBtnSz} rounded transition-colors touch-manipulation ${
            darkMode
              ? "hover:bg-white/8 text-gray-600 hover:text-gray-400"
              : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          }`}
          title="Add level"
        >
          <Plus size={isTouchDevice ? 16 : 10} />
        </button>
      </div>

      <div className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`} />

      {/* Active discipline */}
      <div className="flex items-center gap-1.5">
        <div
          className={`${isTouchDevice ? "w-2.5 h-2.5" : "w-1.5 h-1.5"} rounded-full`}
          style={{ background: disciplineColors[activeDiscipline] }}
        />
        <span className={`capitalize ${isTouchDevice ? "text-sm" : ""}`}>
          {activeDiscipline}
        </span>
      </div>

      <div className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`} />

      {/* Active tool */}
      {!isTouchDevice && (
        <div className="flex items-center gap-1">
          <MousePointer2 size={10} className="opacity-50" />
          <span className="capitalize">
            {drawingState ? `${activeTool} — click to finish` : activeTool}
          </span>
        </div>
      )}

      {!isTouchDevice && (
        <div
          className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`}
        />
      )}

      {/* Element count */}
      <div
        data-ocid="bottom_bar.element_count.panel"
        className="flex items-center gap-1.5"
      >
        <span className={`opacity-70 ${isTouchDevice ? "text-sm" : ""}`}>
          {elements.length} el.
        </span>
        {selectedCount > 0 && (
          <span
            className={`px-1.5 py-0.5 rounded font-medium ${
              isTouchDevice ? "text-xs" : "text-[9px]"
            } ${
              darkMode
                ? "bg-blue-500/20 text-blue-400"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {selectedCount} sel.
          </span>
        )}
      </div>

      {/* Cursor coordinates — hide on touch to save space */}
      {!isTouchDevice && (
        <>
          <div
            className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`}
          />
          <span className="font-mono opacity-80">
            X: {cursorPos.x.toFixed(2)}&nbsp;&nbsp;Z: {cursorPos.z.toFixed(2)}
          </span>
        </>
      )}

      <div className="flex-1" />

      {/* Units toggle */}
      <div
        data-ocid="bottom_bar.units.toggle"
        className={`flex items-center rounded overflow-hidden border ${
          darkMode ? "border-white/10" : "border-gray-300"
        }`}
      >
        <button
          type="button"
          onClick={() => setUnits("m")}
          className={`${unitsBtnH} font-medium transition-colors touch-manipulation ${
            units === "m"
              ? darkMode
                ? "bg-blue-500/25 text-blue-400"
                : "bg-blue-100 text-blue-700"
              : darkMode
                ? "text-gray-600 hover:text-gray-400"
                : "text-gray-400 hover:text-gray-600"
          }`}
        >
          m
        </button>
        <button
          type="button"
          onClick={() => setUnits("ft")}
          className={`${unitsBtnH} font-medium transition-colors touch-manipulation ${
            units === "ft"
              ? darkMode
                ? "bg-blue-500/25 text-blue-400"
                : "bg-blue-100 text-blue-700"
              : darkMode
                ? "text-gray-600 hover:text-gray-400"
                : "text-gray-400 hover:text-gray-600"
          }`}
        >
          ft
        </button>
      </div>

      <div className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`} />

      {/* Snap toggle */}
      <button
        type="button"
        data-ocid="bottombar.snap.toggle"
        onClick={toggleSnap}
        title={
          snapEnabled
            ? "Snap enabled (click to disable)"
            : "Snap disabled (click to enable)"
        }
        className={`flex items-center justify-center ${snapSz} rounded transition-colors touch-manipulation ${
          snapEnabled
            ? "text-blue-400"
            : darkMode
              ? "text-gray-600 opacity-40"
              : "text-gray-400 opacity-40"
        }`}
      >
        <Grid3x3 size={isTouchDevice ? 18 : 11} />
      </button>

      <div className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`} />

      {/* Analysis status */}
      {analysis.running && (
        <div className="flex items-center gap-1 text-blue-400">
          <Loader2 size={11} className="animate-spin" />
          {!isTouchDevice && <span>Analyzing…</span>}
        </div>
      )}
      {analysis.complete && !analysis.running && (
        <div
          className={`flex items-center gap-1 ${
            analysis.failCount > 0
              ? "text-red-400"
              : analysis.warnCount > 0
                ? "text-amber-400"
                : "text-green-400"
          }`}
        >
          {analysis.failCount > 0 ? (
            <AlertTriangle size={11} />
          ) : (
            <CheckCircle size={11} />
          )}
          {!isTouchDevice && (
            <span>
              {analysis.failCount > 0
                ? `${analysis.failCount} failed`
                : analysis.warnCount > 0
                  ? `${analysis.warnCount} warnings`
                  : "All checks passed"}
            </span>
          )}
        </div>
      )}

      {/* Zoom — hidden on touch to save space */}
      {!isTouchDevice && (
        <>
          <div
            className={`w-px h-4 ${darkMode ? "bg-white/10" : "bg-gray-300"}`}
          />
          <span className="font-mono">{zoom}%</span>
        </>
      )}
    </div>
  );
}
