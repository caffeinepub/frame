import { X } from "lucide-react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

const SHORTCUTS = [
  {
    category: "Tools",
    items: [
      ["V", "Select tool"],
      ["WA", "Draw Wall"],
      ["DR", "Place Door"],
      ["WN", "Place Window"],
      ["CO", "Place Column"],
      ["BM", "Draw Beam"],
      ["M", "Measure tool"],
      ["D", "Dimension tool"],
      ["X", "Section Cut"],
    ],
  },
  {
    category: "Edit",
    items: [
      ["Ctrl+Z", "Undo"],
      ["Ctrl+Shift+Z", "Redo"],
      ["Del", "Delete selected"],
      ["Esc", "Cancel / Deselect"],
      ["Shift+Click", "Multi-select"],
      ["Right-click", "Context menu"],
    ],
  },
  {
    category: "View",
    items: [
      ["Dark mode", "Toggle in top bar"],
      ["Ortho", "Orthographic toggle"],
      ["Wire/Shade", "Display mode toggles"],
    ],
  },
  {
    category: "Panels & Levels",
    items: [
      ["?", "Show shortcuts"],
      ["Collab", "Collaboration panel"],
      ["Version", "Version history panel"],
      ["Comments", "Comments panel"],
      ["+", "Add level (bottom bar)"],
      ["Eye", "Toggle level visibility"],
    ],
  },
];

export function ShortcutsModal() {
  const { showShortcuts, setShowShortcuts, darkMode } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();
  if (!showShortcuts) return null;

  const rowH = isTouchDevice ? "py-3" : "py-1";
  const closeSz = isTouchDevice ? "w-12 h-12" : "p-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        data-ocid="shortcuts.modal"
        className={`rounded-xl border shadow-2xl w-[580px] max-w-[95vw] max-h-[80vh] overflow-y-auto ${
          darkMode
            ? "bg-[#1a1f2e] border-white/10 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b sticky top-0 ${
            darkMode
              ? "bg-[#1a1f2e] border-white/10"
              : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          <button
            type="button"
            data-ocid="shortcuts.close.button"
            onClick={() => setShowShortcuts(false)}
            className={`flex items-center justify-center ${closeSz} rounded transition-colors touch-manipulation ${darkMode ? "hover:bg-white/8 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-6">
          {SHORTCUTS.map(({ category, items }) => (
            <div key={category}>
              <h3
                className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {category}
              </h3>
              <div className="space-y-0">
                {items.map(([key, label]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-4 ${rowH}`}
                  >
                    <span
                      className={`text-[11px] ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {label}
                    </span>
                    <kbd
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${
                        darkMode
                          ? "bg-white/8 text-gray-400 border border-white/10"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
