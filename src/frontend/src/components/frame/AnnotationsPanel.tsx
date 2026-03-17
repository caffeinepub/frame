import { MapPin, MessageSquarePlus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

export function AnnotationsPanel() {
  const {
    annotations,
    deleteAnnotation,
    darkMode,
    setActiveTool,
    setPendingAnnotationText,
  } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  const rowH = isTouchDevice ? "min-h-[48px]" : "min-h-[32px]";
  const inputH = isTouchDevice ? "h-11 text-sm" : "h-7 text-xs";
  const btnH = isTouchDevice ? "h-11 text-sm" : "h-7 text-xs";
  const trashSz = isTouchDevice ? 16 : 12;

  const handleQuickAdd = () => {
    if (!newText.trim()) return;
    setPendingAnnotationText(newText.trim());
    setActiveTool("annotate-pin");
    setNewText("");
    setAdding(false);
  };

  return (
    <div className="flex flex-col">
      <div
        className={`${
          isTouchDevice ? "h-12 px-4" : "h-8 px-3"
        } flex items-center justify-between border-b flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <MapPin size={isTouchDevice ? 16 : 11} className="text-amber-400" />
          <span
            className={`${
              isTouchDevice ? "text-xs" : "text-[10px]"
            } uppercase tracking-widest font-semibold ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Annotations
          </span>
          {annotations.length > 0 && (
            <span
              className={`text-[9px] px-1 rounded font-mono ${
                darkMode
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {annotations.length}
            </span>
          )}
        </div>
        <button
          type="button"
          data-ocid="annotations.add.button"
          onClick={() => setAdding(!adding)}
          className={`flex items-center justify-center touch-manipulation rounded transition-colors ${
            isTouchDevice ? "w-12 h-12" : "w-7 h-7"
          } ${
            darkMode
              ? "hover:bg-white/8 text-gray-500 hover:text-amber-400"
              : "hover:bg-gray-100 text-gray-400 hover:text-amber-600"
          }`}
          title="Add annotation"
        >
          <MessageSquarePlus size={isTouchDevice ? 16 : 12} />
        </button>
      </div>

      {adding && (
        <div
          className={`px-3 py-2 border-b ${
            darkMode
              ? "border-white/8 bg-white/2"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="text-[10px] text-gray-600 mb-1.5">
            Type text, then click a point in the viewport to place
          </div>
          <div className="flex gap-1.5">
            <input
              data-ocid="annotations.text.input"
              className={`flex-1 ${
                inputH
              } bg-white/5 border border-white/10 rounded-sm px-2 font-mono text-gray-200 text-xs focus:outline-none focus:border-amber-500/60`}
              placeholder="Annotation text..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            />
            <button
              type="button"
              data-ocid="annotations.confirm.button"
              onClick={handleQuickAdd}
              className={`${
                btnH
              } px-2 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors touch-manipulation text-xs`}
            >
              Place
            </button>
            <button
              type="button"
              data-ocid="annotations.cancel.button"
              onClick={() => {
                setAdding(false);
                setNewText("");
              }}
              className={`${
                btnH
              } w-8 flex items-center justify-center rounded hover:bg-white/8 text-gray-500 transition-colors touch-manipulation`}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {annotations.length === 0 ? (
        <div
          data-ocid="annotations.empty_state"
          className={`px-3 py-4 text-center ${
            darkMode ? "text-gray-700" : "text-gray-400"
          }`}
        >
          <MapPin
            size={20}
            className={`mx-auto mb-2 ${
              darkMode ? "text-gray-700" : "text-gray-300"
            }`}
          />
          <div className="text-[10px]">
            No annotations yet. Use the Pin tool to place markers in the
            viewport.
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-48">
          {annotations.map((ann, i) => (
            <div
              key={ann.id}
              data-ocid={`annotations.item.${i + 1}`}
              className={`flex items-center gap-2 px-3 ${
                rowH
              } border-b last:border-b-0 ${
                darkMode
                  ? "border-white/5 hover:bg-white/3"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: ann.color }}
              />
              <span
                className={`flex-1 text-[11px] truncate ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {ann.text}
              </span>
              <span className="text-[9px] text-gray-600 flex-shrink-0 font-mono">
                ({ann.position.x.toFixed(1)}, {ann.position.z.toFixed(1)})
              </span>
              <button
                type="button"
                data-ocid={`annotations.delete_button.${i + 1}`}
                onClick={() => deleteAnnotation(ann.id)}
                className={`flex-shrink-0 flex items-center justify-center rounded transition-colors touch-manipulation ${
                  isTouchDevice ? "w-10 h-10" : "w-6 h-6"
                } ${
                  darkMode
                    ? "hover:bg-red-500/15 text-gray-600 hover:text-red-400"
                    : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                }`}
                title="Delete annotation"
              >
                <Trash2 size={trashSz} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
