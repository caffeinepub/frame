import { Grid3x3, Trash2, Undo2 } from "lucide-react";
import { useFrameStore } from "../../stores/frameStore";

export function FloatingActionBar() {
  const darkMode = useFrameStore((s) => s.darkMode);
  const undo = useFrameStore((s) => s.undo);
  const deleteSelectedElement = useFrameStore((s) => s.deleteSelectedElement);
  const selectedElementId = useFrameStore((s) => s.selectedElementId);
  const selectedElementIds = useFrameStore((s) => s.selectedElementIds);
  const snapEnabled = useFrameStore((s) => s.snapEnabled);
  const toggleSnap = useFrameStore((s) => s.toggleSnap);
  const elementHistory = useFrameStore((s) => s.elementHistory);

  const hasSelection = !!selectedElementId || selectedElementIds.length > 0;
  const canUndo = elementHistory.length > 0;

  const fabBase = `w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95 touch-manipulation border ${
    darkMode
      ? "bg-[#1e2435] border-white/10 text-gray-200"
      : "bg-white border-gray-200 text-gray-700"
  }`;

  const fabDisabled = "opacity-30 cursor-not-allowed";

  return (
    <div className="fixed bottom-[8.5rem] right-4 z-40 flex flex-col gap-2 items-center">
      {/* Snap toggle */}
      <button
        type="button"
        data-ocid="fab.snap.toggle"
        onClick={toggleSnap}
        className={`${fabBase} ${
          snapEnabled
            ? darkMode
              ? "border-blue-500/40 text-blue-400"
              : "border-blue-400 text-blue-600"
            : ""
        }`}
        title={snapEnabled ? "Snap On" : "Snap Off"}
      >
        <Grid3x3 size={20} className={snapEnabled ? "text-blue-400" : ""} />
        <span className="text-[9px] font-semibold leading-none">
          {snapEnabled ? "SNAP" : "SNAP"}
        </span>
      </button>

      {/* Delete selected */}
      <button
        type="button"
        data-ocid="fab.delete_button"
        onClick={() => deleteSelectedElement()}
        disabled={!hasSelection}
        className={`${fabBase} ${
          hasSelection ? "text-red-400 border-red-500/20" : fabDisabled
        }`}
        title="Delete selected"
      >
        <Trash2 size={20} />
        <span className="text-[9px] font-semibold leading-none">DEL</span>
      </button>

      {/* Undo */}
      <button
        type="button"
        data-ocid="fab.undo.button"
        onClick={undo}
        disabled={!canUndo}
        className={`${fabBase} ${!canUndo ? fabDisabled : ""}`}
        title="Undo"
      >
        <Undo2 size={20} />
        <span className="text-[9px] font-semibold leading-none">UNDO</span>
      </button>
    </div>
  );
}
