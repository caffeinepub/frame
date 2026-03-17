import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from "lucide-react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

interface AlignBtn {
  label: string;
  icon: React.ReactNode;
  axis: "x" | "z";
  mode: "min" | "center" | "max";
  ocid: string;
}

const ALIGN_BUTTONS: AlignBtn[] = [
  {
    label: "Align Left",
    icon: <AlignStartVertical size={14} />,
    axis: "x",
    mode: "min",
    ocid: "align.left.button",
  },
  {
    label: "Center X",
    icon: <AlignCenterVertical size={14} />,
    axis: "x",
    mode: "center",
    ocid: "align.center_x.button",
  },
  {
    label: "Align Right",
    icon: <AlignEndVertical size={14} />,
    axis: "x",
    mode: "max",
    ocid: "align.right.button",
  },
  {
    label: "Align Top",
    icon: <AlignStartHorizontal size={14} />,
    axis: "z",
    mode: "min",
    ocid: "align.top.button",
  },
  {
    label: "Center Z",
    icon: <AlignCenterHorizontal size={14} />,
    axis: "z",
    mode: "center",
    ocid: "align.center_z.button",
  },
  {
    label: "Align Bottom",
    icon: <AlignEndHorizontal size={14} />,
    axis: "z",
    mode: "max",
    ocid: "align.bottom.button",
  },
];

export function AlignmentToolbar() {
  const selectedElementIds = useFrameStore((s) => s.selectedElementIds);
  const alignElements = useFrameStore((s) => s.alignElements);
  const darkMode = useFrameStore((s) => s.darkMode);
  const isTouchDevice = useIsTouchDevice();

  if (selectedElementIds.length < 2) return null;

  const btnSize = isTouchDevice ? "w-12 h-12" : "w-8 h-8";
  const iconColor = darkMode ? "text-gray-300" : "text-gray-700";
  const hoverBg = darkMode ? "hover:bg-white/10" : "hover:bg-black/10";

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 rounded-full px-2 py-1 shadow-xl pointer-events-auto"
      style={{
        background: darkMode ? "rgba(17,24,39,0.92)" : "rgba(255,255,255,0.92)",
        border: darkMode
          ? "1px solid rgba(255,255,255,0.10)"
          : "1px solid rgba(0,0,0,0.10)",
        backdropFilter: "blur(12px)",
      }}
      data-ocid="align.panel"
    >
      {/* Divider after first 3 */}
      {ALIGN_BUTTONS.map((btn, i) => (
        <>
          {i === 3 && (
            <div
              key="divider"
              className="w-px h-5 mx-1"
              style={{
                background: darkMode
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.15)",
              }}
            />
          )}
          <button
            key={btn.ocid}
            type="button"
            title={btn.label}
            data-ocid={btn.ocid}
            onClick={() => alignElements(btn.axis, btn.mode)}
            className={`${btnSize} flex items-center justify-center rounded-full transition-colors touch-manipulation ${iconColor} ${hoverBg}`}
          >
            {btn.icon}
          </button>
        </>
      ))}

      <div
        className="ml-1 text-xs font-medium select-none"
        style={{
          color: darkMode ? "rgba(156,163,175,0.8)" : "rgba(107,114,128,0.9)",
          fontSize: "10px",
        }}
      >
        {selectedElementIds.length} selected
      </div>
    </div>
  );
}
