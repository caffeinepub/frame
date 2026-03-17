import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AppWindow,
  BookMarked,
  Box,
  Cable,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Columns,
  Cpu,
  DoorOpen,
  Droplets,
  GitMerge,
  Grid3x3,
  Home,
  Layers,
  List,
  Lock,
  MapPin,
  Maximize2,
  Minus,
  Monitor,
  MousePointer2,
  Move,
  PanelTop,
  PenLine,
  RotateCcw,
  Ruler,
  Scissors,
  Slash,
  SlidersHorizontal,
  Square,
  Triangle,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";
import type { Discipline } from "../../types/frame";

type ToolDef = {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  short: string;
  key: string;
  description: string;
  unimplemented?: boolean;
};

// Inline SVG arc icon component
function ArcIcon({
  size = 16,
  strokeWidth = 1.5,
}: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Arc"
    >
      <title>Arc</title>
      <path d="M2 12 C5 5, 19 5, 22 12" />
      <circle cx="2" cy="12" r="1.5" fill="currentColor" />
      <circle cx="22" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

const DISCIPLINES: {
  id: Discipline;
  label: string;
  short: string;
  color: string;
}[] = [
  {
    id: "architecture",
    label: "Architecture",
    short: "ARCH",
    color: "#3b82f6",
  },
  { id: "structure", label: "Structure", short: "STR", color: "#10b981" },
  { id: "mep", label: "MEP", short: "MEP", color: "#f59e0b" },
  { id: "parts", label: "Parts", short: "PARTS", color: "#8b5cf6" },
];

const ARCH_TOOLS: ToolDef[] = [
  {
    id: "select",
    icon: MousePointer2,
    label: "Select",
    short: "Sel",
    key: "V",
    description: "Pick and move elements",
  },
  {
    id: "wall",
    icon: Square,
    label: "Wall",
    short: "Wall",
    key: "WA",
    description: "Draw walls by clicking start and end points",
  },
  {
    id: "arc-wall",
    icon: ArcIcon,
    label: "Arc Wall",
    short: "ArcW",
    key: "AW",
    description: "Draw a curved wall using three points",
  },
  {
    id: "floor",
    icon: Layers,
    label: "Floor",
    short: "Flr",
    key: "FL",
    description: "Place a floor slab on the active level",
  },
  {
    id: "roof",
    icon: Home,
    label: "Roof",
    short: "Roof",
    key: "RF",
    description: "Generate a roof from the building footprint",
    unimplemented: true,
  },
  {
    id: "door",
    icon: DoorOpen,
    label: "Door",
    short: "Door",
    key: "DR",
    description: "Insert a door into an existing wall",
  },
  {
    id: "window",
    icon: AppWindow,
    label: "Window",
    short: "Win",
    key: "WN",
    description: "Insert a window into an existing wall",
  },
  {
    id: "stair",
    icon: Layers,
    label: "Stair",
    short: "Stair",
    key: "ST",
    description: "Add a stair between two levels",
    unimplemented: true,
  },
  {
    id: "column",
    icon: Columns,
    label: "Column",
    short: "Col",
    key: "CO",
    description: "Place a vertical structural column",
  },
  {
    id: "room",
    icon: Grid3x3,
    label: "Room",
    short: "Room",
    key: "RM",
    description: "Tag and define a room boundary",
  },
  {
    id: "curtainwall",
    icon: PanelTop,
    label: "Curtain Wall",
    short: "CW",
    key: "CW",
    description: "Place a glazed curtain wall system",
    unimplemented: true,
  },
  {
    id: "measure",
    icon: Ruler,
    label: "Measure",
    short: "Meas",
    key: "M",
    description: "Measure distance between two points",
  },
  {
    id: "section",
    icon: Slash,
    label: "Section Cut",
    short: "Sect",
    key: "X",
    description: "Draw a section cut through the model",
  },
  {
    id: "dimension",
    icon: Ruler,
    label: "Dimension",
    short: "Dim",
    key: "D",
    description: "Place a permanent linear dimension annotation",
  },
];

const STR_TOOLS: ToolDef[] = [
  {
    id: "select",
    icon: MousePointer2,
    label: "Select",
    short: "Sel",
    key: "V",
    description: "Pick and move elements",
  },
  {
    id: "column",
    icon: Columns,
    label: "Column",
    short: "Col",
    key: "CO",
    description: "Place a structural column",
  },
  {
    id: "beam",
    icon: Minus,
    label: "Beam",
    short: "Beam",
    key: "BM",
    description: "Draw a horizontal beam between two points",
  },
  {
    id: "arc-beam",
    icon: ArcIcon,
    label: "Arc Beam",
    short: "ArcB",
    key: "AB",
    description: "Draw a curved beam using three points",
  },
  {
    id: "slab",
    icon: Layers,
    label: "Slab",
    short: "Slab",
    key: "SL",
    description: "Place a structural floor slab",
  },
  {
    id: "foundation",
    icon: Box,
    label: "Foundation",
    short: "Fnd",
    key: "FN",
    description: "Add a foundation element",
  },
  {
    id: "load",
    icon: Triangle,
    label: "Load",
    short: "Load",
    key: "LD",
    description: "Apply point, line, or area loads",
    unimplemented: true,
  },
  {
    id: "analyze",
    icon: Cpu,
    label: "Analyze",
    short: "Anlz",
    key: "F5",
    description: "Run structural FEA analysis",
  },
  {
    id: "autosize",
    icon: SlidersHorizontal,
    label: "Auto-Size",
    short: "Auto",
    key: "AS",
    description: "Automatically size members for loads",
    unimplemented: true,
  },
  {
    id: "connection",
    icon: GitMerge,
    label: "Connection",
    short: "Conn",
    key: "CN",
    description: "Define a bolted or welded connection",
    unimplemented: true,
  },
  {
    id: "rebar",
    icon: Grid3x3,
    label: "Rebar",
    short: "Rebar",
    key: "RB",
    description: "Add reinforcement to concrete elements",
    unimplemented: true,
  },
];

const MEP_TOOLS: ToolDef[] = [
  {
    id: "select",
    icon: MousePointer2,
    label: "Select",
    short: "Sel",
    key: "V",
    description: "Pick and move elements",
  },
  {
    id: "duct",
    icon: Wind,
    label: "Duct",
    short: "Duct",
    key: "DU",
    description: "Route a rectangular or round duct",
  },
  {
    id: "pipe",
    icon: Droplets,
    label: "Pipe",
    short: "Pipe",
    key: "PI",
    description: "Route a plumbing or HVAC pipe",
  },
  {
    id: "cabletray",
    icon: Cable,
    label: "Cable Tray",
    short: "CTray",
    key: "CT",
    description: "Route an electrical cable tray",
  },
  {
    id: "equipment",
    icon: Monitor,
    label: "Equipment",
    short: "Equip",
    key: "EQ",
    description: "Place mechanical or electrical equipment",
  },
  {
    id: "diffuser",
    icon: CircleDot,
    label: "Diffuser",
    short: "Diff",
    key: "DF",
    description: "Insert an air diffuser or grille",
  },
  {
    id: "fixture",
    icon: Zap,
    label: "Fixture",
    short: "Fix",
    key: "FX",
    description: "Place an electrical fixture",
  },
  {
    id: "autoroute",
    icon: GitMerge,
    label: "Auto Route",
    short: "Route",
    key: "RA",
    description: "Automatically route selected systems",
    unimplemented: true,
  },
  {
    id: "size",
    icon: Ruler,
    label: "Size",
    short: "Size",
    key: "SZ",
    description: "Calculate and assign pipe/duct sizes",
    unimplemented: true,
  },
  {
    id: "clash",
    icon: CheckSquare,
    label: "Clash Check",
    short: "Clash",
    key: "CC",
    description: "Detect and highlight system clashes",
    unimplemented: true,
  },
];

const PARTS_TOOLS: ToolDef[] = [
  {
    id: "select",
    icon: MousePointer2,
    label: "Select",
    short: "Sel",
    key: "V",
    description: "Pick and move elements",
  },
  {
    id: "sketch",
    icon: PenLine,
    label: "Sketch",
    short: "Sktch",
    key: "SK",
    description: "Draw a 2D profile for a feature",
    unimplemented: true,
  },
  {
    id: "extrude",
    icon: Box,
    label: "Extrude",
    short: "Extr",
    key: "E",
    description: "Pull a 2D profile into a 3D solid",
    unimplemented: true,
  },
  {
    id: "revolve",
    icon: RotateCcw,
    label: "Revolve",
    short: "Rev",
    key: "RV",
    description: "Spin a profile around an axis",
    unimplemented: true,
  },
  {
    id: "sweep",
    icon: Move,
    label: "Sweep",
    short: "Swp",
    key: "SW",
    description: "Sweep a profile along a path",
    unimplemented: true,
  },
  {
    id: "loft",
    icon: Maximize2,
    label: "Loft",
    short: "Loft",
    key: "LF",
    description: "Blend between two or more profiles",
    unimplemented: true,
  },
  {
    id: "fillet",
    icon: CircleDot,
    label: "Fillet",
    short: "Fill",
    key: "FI",
    description: "Round a sharp edge",
    unimplemented: true,
  },
  {
    id: "pattern",
    icon: Grid3x3,
    label: "Pattern",
    short: "Patt",
    key: "PT",
    description: "Repeat a feature in a pattern",
    unimplemented: true,
  },
  {
    id: "mate",
    icon: GitMerge,
    label: "Mate",
    short: "Mate",
    key: "MA",
    description: "Constrain two parts together",
    unimplemented: true,
  },
  {
    id: "bom",
    icon: List,
    label: "BOM",
    short: "BOM",
    key: "BM",
    description: "Generate a bill of materials",
    unimplemented: true,
  },
];

const TOOLS_BY_DISCIPLINE: Record<Discipline, ToolDef[]> = {
  architecture: ARCH_TOOLS,
  structure: STR_TOOLS,
  mep: MEP_TOOLS,
  parts: PARTS_TOOLS,
};

// Suppress unused import warning
const _Wrench = Wrench;

export function LeftSidebar() {
  const {
    activeDiscipline,
    setActiveDiscipline,
    activeTool,
    setActiveTool,
    darkMode,
    setShowSectionBox,
    showSectionBox,
  } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();
  const [collapsed, setCollapsed] = useState(false);

  // Default collapsed on touch devices
  useEffect(() => {
    if (isTouchDevice) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isTouchDevice]);

  const tools = TOOLS_BY_DISCIPLINE[activeDiscipline];
  const disciplineColor =
    DISCIPLINES.find((d) => d.id === activeDiscipline)?.color ?? "#3b82f6";

  // Touch-responsive sizing
  const sidebarW = isTouchDevice ? "w-[88px]" : "w-14";
  const translateX = isTouchDevice ? "-translate-x-[88px]" : "-translate-x-14";
  const handleW = isTouchDevice ? "w-10" : "w-7";
  const handleH = isTouchDevice ? "h-24" : "h-16";
  const iconSize = isTouchDevice ? 22 : 16;
  const toolBtnH = isTouchDevice ? "min-h-[64px]" : "min-h-[44px]";
  const discTabH = isTouchDevice ? "min-h-[52px]" : "";
  const labelCls = isTouchDevice ? "text-[10px]" : "text-[7px]";

  const sidebarContent = (
    <div
      className={`flex flex-col h-full ${sidebarW} select-none ${
        darkMode ? "bg-[#161b27]" : "bg-gray-50"
      }`}
    >
      {/* Discipline switcher */}
      <div
        className={`border-b py-1 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        {DISCIPLINES.map((d) => (
          <Tooltip key={d.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid={`discipline.${d.id}.tab`}
                onClick={() => setActiveDiscipline(d.id)}
                className={`w-full flex flex-col items-center py-2 px-1 gap-0.5 transition-colors relative touch-manipulation ${discTabH} ${
                  activeDiscipline === d.id
                    ? darkMode
                      ? "text-white"
                      : "text-gray-900"
                    : darkMode
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {activeDiscipline === d.id && (
                  <div
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                    style={{ background: disciplineColor }}
                  />
                )}
                <span
                  className={`${isTouchDevice ? "text-[9px]" : "text-[8px]"} font-semibold tracking-wider`}
                  style={
                    activeDiscipline === d.id ? { color: disciplineColor } : {}
                  }
                >
                  {d.short}
                </span>
              </button>
            </TooltipTrigger>
            {!isTouchDevice && (
              <TooltipContent side="right" className="text-xs">
                <span className="font-semibold">{d.label}</span>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>

      {/* Tool palette */}
      <div className="flex-1 overflow-y-auto py-1 flex flex-col gap-0.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;
          const dimmed = !!tool.unimplemented;
          return (
            <div key={tool.id} className="relative px-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-ocid={`tool.${tool.id}.button`}
                    onClick={() => {
                      if (!dimmed) {
                        setActiveTool(tool.id);
                        // Auto-collapse on touch after tool selection
                        if (isTouchDevice) setCollapsed(true);
                      }
                    }}
                    disabled={dimmed}
                    className={`w-full flex flex-col items-center py-2 px-1 gap-1 rounded transition-all touch-manipulation ${toolBtnH} ${
                      dimmed
                        ? `opacity-30 cursor-not-allowed ${
                            darkMode
                              ? "bg-white/2 text-gray-600"
                              : "bg-gray-200/50 text-gray-400"
                          }`
                        : active
                          ? "text-white"
                          : darkMode
                            ? "text-gray-400 hover:text-gray-200 hover:bg-white/6"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                    }`}
                    style={
                      !dimmed && active
                        ? {
                            background: `${disciplineColor}33`,
                            color: disciplineColor,
                          }
                        : {}
                    }
                  >
                    <Icon size={iconSize} strokeWidth={active ? 2 : 1.5} />
                    <span
                      className={`${labelCls} font-semibold tracking-wide leading-none text-center`}
                    >
                      {isTouchDevice ? tool.label : tool.short}
                    </span>
                    {dimmed && (
                      <Lock
                        size={7}
                        className="absolute top-1 right-1 text-gray-500"
                      />
                    )}
                  </button>
                </TooltipTrigger>
                {!isTouchDevice && (
                  <TooltipContent side="right" className="max-w-[180px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">
                          {tool.label}
                          {dimmed && (
                            <span className="ml-1 text-yellow-400 text-[10px]">
                              ⚠ Coming soon
                            </span>
                          )}
                        </span>
                        <span className="ml-auto text-[10px] font-mono bg-white/10 border border-white/20 rounded px-1 py-0.5 leading-none">
                          {tool.key}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {tool.description}
                        {dimmed ? " (Coming soon)" : ""}
                      </p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* Markup / annotation tools */}
      <div
        className={`border-t py-1 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <div
          className={`px-1 py-0.5 ${isTouchDevice ? "text-[9px]" : "text-[7px]"} uppercase tracking-widest text-center ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Markup
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-ocid="tool.annotate-pin.button"
              onClick={() => {
                setActiveTool("annotate-pin");
                if (isTouchDevice) setCollapsed(true);
              }}
              className={`w-full flex flex-col items-center py-2 px-1 gap-1 rounded transition-all touch-manipulation ${toolBtnH} ${
                activeTool === "annotate-pin"
                  ? "text-white"
                  : darkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-white/6"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
              }`}
              style={
                activeTool === "annotate-pin"
                  ? { background: "#f59e0b33", color: "#f59e0b" }
                  : {}
              }
            >
              <MapPin
                size={iconSize}
                strokeWidth={activeTool === "annotate-pin" ? 2 : 1.5}
              />
              <span
                className={`${labelCls} font-semibold tracking-wide leading-none text-center`}
              >
                {isTouchDevice ? "Pin" : "Pin"}
              </span>
            </button>
          </TooltipTrigger>
          {!isTouchDevice && (
            <TooltipContent side="right" className="max-w-[180px]">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs">Annotation Pin</span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Click in the viewport to place a labeled pin annotation
                </p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-ocid="tool.section-box.button"
              onClick={() => setShowSectionBox(!showSectionBox)}
              className={`w-full flex flex-col items-center py-2 px-1 gap-1 rounded transition-all touch-manipulation ${toolBtnH} ${
                showSectionBox
                  ? "text-white"
                  : darkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-white/6"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
              }`}
              style={
                showSectionBox
                  ? { background: "#06b6d433", color: "#06b6d4" }
                  : {}
              }
            >
              <Scissors
                size={iconSize}
                strokeWidth={showSectionBox ? 2 : 1.5}
              />
              <span
                className={`${labelCls} font-semibold tracking-wide leading-none text-center`}
              >
                {isTouchDevice ? "S.Box" : "Box"}
              </span>
            </button>
          </TooltipTrigger>
          {!isTouchDevice && (
            <TooltipContent side="right" className="max-w-[180px]">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs">Section Box</span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Toggle a 3D clipping box to slice through the model
                </p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );

  // Desktop: unchanged layout
  if (!isTouchDevice) {
    return (
      <TooltipProvider delayDuration={400}>
        <div
          className={`flex flex-col w-14 border-r select-none flex-shrink-0 ${
            darkMode
              ? "bg-[#161b27] border-white/8"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {sidebarContent}
        </div>
      </TooltipProvider>
    );
  }

  // Touch/iPad: fixed overlay with collapse handle
  return (
    <TooltipProvider delayDuration={400}>
      {/* Fixed overlay sidebar */}
      <div
        className={`fixed left-0 z-40 flex items-stretch ${isTouchDevice ? "top-14 bottom-16" : "top-10 bottom-8"}`}
        style={{ pointerEvents: "none" }}
      >
        {/* Sidebar panel */}
        <div
          className={`${sidebarW} border-r overflow-hidden transition-transform duration-200 ${
            collapsed ? translateX : "translate-x-0"
          } ${
            darkMode
              ? "bg-[#161b27] border-white/8"
              : "bg-gray-50 border-gray-200"
          }`}
          style={{ pointerEvents: "auto" }}
        >
          {sidebarContent}
        </div>

        {/* Handle tab — enlarged for easy thumb reach */}
        <button
          type="button"
          data-ocid="sidebar.toggle.button"
          onClick={() => setCollapsed(!collapsed)}
          className={`self-center flex items-center justify-center ${handleW} ${handleH} rounded-r-2xl shadow-lg border-y border-r transition-colors touch-manipulation ${
            darkMode
              ? "bg-[#161b27] border-white/10 text-gray-400 hover:text-gray-200"
              : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-800"
          }`}
          style={{ pointerEvents: "auto" }}
          title={collapsed ? "Show tools" : "Hide tools"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </TooltipProvider>
  );
}
