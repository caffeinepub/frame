import {
  Box,
  CircleDot,
  Eye,
  EyeOff,
  Grid3x3,
  PenLine,
  Scissors,
} from "lucide-react";
import { useState } from "react";
import { FEATURE_TREE } from "../../data/sampleData";
import { useFrameStore } from "../../stores/frameStore";

export function FeatureTree() {
  const { darkMode } = useFrameStore();
  const [features, setFeatures] = useState(FEATURE_TREE);
  const [selected, setSelected] = useState<string | null>(null);

  const icons: Record<string, typeof Box> = {
    sketch: PenLine,
    extrude: Box,
    fillet: CircleDot,
    cut: Scissors,
    pattern: Grid3x3,
    shell: Box,
  };

  const toggleVisibility = (id: string) => {
    setFeatures((f) =>
      f.map((ft) => (ft.id === id ? { ...ft, visible: !ft.visible } : ft)),
    );
  };

  return (
    <div
      className={`border-t ${darkMode ? "border-white/8" : "border-gray-200"}`}
    >
      <div
        className={`px-3 py-2 border-b ${darkMode ? "border-white/8" : "border-gray-200"}`}
      >
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${darkMode ? "text-gray-500" : "text-gray-400"}`}
        >
          Feature Tree
        </span>
      </div>
      <div
        className={`px-2 py-1 border-b text-[10px] font-medium ${darkMode ? "border-white/8 text-gray-400" : "border-gray-100 text-gray-600"}`}
      >
        <div className="flex items-center gap-1">
          <Box size={11} className="text-purple-400" />
          Mounting Bracket
        </div>
      </div>
      <div>
        {features.map((ft) => {
          const Icon = icons[ft.icon] ?? Box;
          const isSelected = selected === ft.id;
          return (
            <button
              key={ft.id}
              type="button"
              data-ocid={`feature_tree.${ft.id}.item`}
              onClick={() => setSelected(ft.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors text-left ${
                isSelected
                  ? darkMode
                    ? "bg-purple-500/15"
                    : "bg-purple-50"
                  : darkMode
                    ? "hover:bg-white/5"
                    : "hover:bg-gray-50"
              } ${!ft.visible ? "opacity-40" : ""}`}
            >
              <Icon
                size={11}
                className={isSelected ? "text-purple-400" : "text-gray-500"}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[11px] font-medium truncate ${isSelected ? (darkMode ? "text-purple-300" : "text-purple-700") : ""}`}
                >
                  {ft.name}
                </div>
                {ft.detail && (
                  <div
                    className={`text-[9px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {ft.detail}
                  </div>
                )}
              </div>
              <button
                type="button"
                tabIndex={-1}
                data-ocid="feature_tree.visibility.toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(ft.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    toggleVisibility(ft.id);
                  }
                }}
                className="p-0.5 rounded hover:bg-white/10 text-gray-500"
                aria-label={ft.visible ? "Hide feature" : "Show feature"}
              >
                {ft.visible ? <Eye size={10} /> : <EyeOff size={10} />}
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
