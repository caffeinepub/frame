import { Box, X } from "lucide-react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

export function SectionBoxPanel() {
  const { sectionBox, setSectionBox, toggleSectionBox, darkMode } =
    useFrameStore();
  const isTouchDevice = useIsTouchDevice();

  const sliderH = isTouchDevice ? "h-6" : "h-4";

  const SliderRow = ({
    label,
    field,
    min,
    max,
    color,
  }: {
    label: string;
    field: keyof typeof sectionBox;
    min: number;
    max: number;
    color: string;
  }) => {
    const val = sectionBox[field] as number;
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 w-10 shrink-0 text-right">
          {label}
        </span>
        <input
          data-ocid={`sectionbox.${field}.input`}
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={val}
          onChange={(e) => setSectionBox({ [field]: Number(e.target.value) })}
          className={`flex-1 accent-[${color}] ${sliderH} touch-manipulation`}
          style={{ accentColor: color }}
        />
        <span className="text-[10px] font-mono text-gray-500 w-8 shrink-0">
          {val.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`absolute right-4 top-12 z-30 rounded-lg border shadow-2xl ${
        darkMode
          ? "bg-[#1a1f2e] border-white/10 text-gray-200"
          : "bg-white border-gray-200 text-gray-800"
      }`}
      style={{ width: 240 }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 ${
          isTouchDevice ? "h-12" : "h-9"
        } border-b ${darkMode ? "border-white/8" : "border-gray-200"}`}
      >
        <div className="flex items-center gap-2">
          <Box size={13} className="text-cyan-400" />
          <span className="text-xs font-semibold">Section Box</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-ocid="sectionbox.toggle"
            onClick={toggleSectionBox}
            className={`text-[11px] px-2 rounded transition-colors touch-manipulation ${
              isTouchDevice ? "py-1.5" : "py-0.5"
            } ${
              sectionBox.enabled
                ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                : darkMode
                  ? "bg-white/8 text-gray-400 hover:bg-white/12"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {sectionBox.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="px-3 py-3 space-y-2.5">
        <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">
          X Bounds
        </div>
        <SliderRow
          label="Left"
          field="minX"
          min={-20}
          max={sectionBox.maxX - 0.5}
          color="#06b6d4"
        />
        <SliderRow
          label="Right"
          field="maxX"
          min={sectionBox.minX + 0.5}
          max={20}
          color="#06b6d4"
        />

        <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1 mt-1">
          Y Bounds
        </div>
        <SliderRow
          label="Bottom"
          field="minY"
          min={-5}
          max={sectionBox.maxY - 0.5}
          color="#8b5cf6"
        />
        <SliderRow
          label="Top"
          field="maxY"
          min={sectionBox.minY + 0.5}
          max={20}
          color="#8b5cf6"
        />

        <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1 mt-1">
          Z Bounds
        </div>
        <SliderRow
          label="Front"
          field="minZ"
          min={-20}
          max={sectionBox.maxZ - 0.5}
          color="#f59e0b"
        />
        <SliderRow
          label="Back"
          field="maxZ"
          min={sectionBox.minZ + 0.5}
          max={20}
          color="#f59e0b"
        />

        <button
          type="button"
          data-ocid="sectionbox.reset.button"
          onClick={() =>
            setSectionBox({
              minX: -20,
              maxX: 20,
              minY: -5,
              maxY: 20,
              minZ: -20,
              maxZ: 20,
            })
          }
          className={`w-full mt-1 rounded text-[11px] transition-colors touch-manipulation ${
            isTouchDevice ? "py-2" : "py-1"
          } ${
            darkMode
              ? "bg-white/6 hover:bg-white/10 text-gray-400"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          Reset Bounds
        </button>
      </div>
    </div>
  );
}
