import {
  AppWindow,
  Box,
  Cable,
  CheckSquare,
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
  Maximize2,
  Minus,
  Monitor,
  MousePointer2,
  Move,
  PanelTop,
  PenLine,
  RotateCcw,
  Ruler,
  Slash,
  Square,
  Triangle,
  Wind,
  Zap,
} from "lucide-react";
import { useFrameStore } from "../../stores/frameStore";
import type { Discipline } from "../../types/frame";

type ToolDef = {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  unimplemented?: boolean;
};

const ARCH_TOOLS: ToolDef[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "wall", icon: Square, label: "Wall" },
  { id: "floor", icon: Layers, label: "Floor" },
  { id: "roof", icon: Home, label: "Roof", unimplemented: true },
  { id: "door", icon: DoorOpen, label: "Door" },
  { id: "window", icon: AppWindow, label: "Window" },
  { id: "column", icon: Columns, label: "Column" },
  { id: "room", icon: Grid3x3, label: "Room" },
  {
    id: "curtainwall",
    icon: PanelTop,
    label: "Curtain Wall",
    unimplemented: true,
  },
  { id: "measure", icon: Ruler, label: "Measure" },
  { id: "section", icon: Slash, label: "Section" },
  { id: "dimension", icon: Ruler, label: "Dim" },
];

const STR_TOOLS: ToolDef[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "column", icon: Columns, label: "Column" },
  { id: "beam", icon: Minus, label: "Beam" },
  { id: "slab", icon: Layers, label: "Slab" },
  { id: "foundation", icon: Box, label: "Found." },
  { id: "load", icon: Triangle, label: "Load", unimplemented: true },
  { id: "analyze", icon: Cpu, label: "Analyze" },
  { id: "autosize", icon: Ruler, label: "Auto-Size", unimplemented: true },
  { id: "connection", icon: GitMerge, label: "Connect", unimplemented: true },
];

const MEP_TOOLS: ToolDef[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "duct", icon: Wind, label: "Duct" },
  { id: "pipe", icon: Droplets, label: "Pipe" },
  { id: "cabletray", icon: Cable, label: "Cable" },
  { id: "equipment", icon: Monitor, label: "Equip." },
  { id: "diffuser", icon: CircleDot, label: "Diffuser" },
  { id: "fixture", icon: Zap, label: "Fixture" },
  { id: "autoroute", icon: GitMerge, label: "Route", unimplemented: true },
  { id: "clash", icon: CheckSquare, label: "Clash", unimplemented: true },
];

const PARTS_TOOLS: ToolDef[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "sketch", icon: PenLine, label: "Sketch", unimplemented: true },
  { id: "extrude", icon: Box, label: "Extrude", unimplemented: true },
  { id: "revolve", icon: RotateCcw, label: "Revolve", unimplemented: true },
  { id: "sweep", icon: Move, label: "Sweep", unimplemented: true },
  { id: "loft", icon: Maximize2, label: "Loft", unimplemented: true },
  { id: "fillet", icon: CircleDot, label: "Fillet", unimplemented: true },
  { id: "bom", icon: List, label: "BOM", unimplemented: true },
];

const TOOLS_BY_DISCIPLINE: Record<Discipline, ToolDef[]> = {
  architecture: ARCH_TOOLS,
  structure: STR_TOOLS,
  mep: MEP_TOOLS,
  parts: PARTS_TOOLS,
};

const DISCIPLINE_COLORS: Record<Discipline, string> = {
  architecture: "#3b82f6",
  structure: "#10b981",
  mep: "#f59e0b",
  parts: "#8b5cf6",
};

export function TouchToolTray() {
  const { activeDiscipline, activeTool, setActiveTool, darkMode } =
    useFrameStore();
  const tools = TOOLS_BY_DISCIPLINE[activeDiscipline];
  const disciplineColor = DISCIPLINE_COLORS[activeDiscipline];

  return (
    <div
      className={`fixed bottom-16 left-0 right-0 z-40 flex items-center gap-1.5 px-2 py-1.5 overflow-x-auto border-t ${
        darkMode
          ? "bg-[#161b27]/95 border-white/8 backdrop-blur-sm"
          : "bg-gray-50/95 border-gray-200 backdrop-blur-sm"
      }`}
      style={{ scrollbarWidth: "none" }}
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const active = activeTool === tool.id;
        const dimmed = !!tool.unimplemented;
        return (
          <button
            key={tool.id}
            type="button"
            data-ocid={`touch_tray.${tool.id}.button`}
            onClick={() => {
              if (!dimmed) setActiveTool(tool.id);
            }}
            disabled={dimmed}
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all touch-manipulation relative ${
              dimmed
                ? `opacity-30 cursor-not-allowed ${
                    darkMode ? "text-gray-600" : "text-gray-400"
                  }`
                : active
                  ? darkMode
                    ? "text-white"
                    : "text-white"
                  : darkMode
                    ? "text-gray-400 active:text-gray-200 active:bg-white/10"
                    : "text-gray-500 active:text-gray-800 active:bg-gray-200"
            }`}
            style={
              !dimmed && active
                ? {
                    background: `${disciplineColor}33`,
                    color: disciplineColor,
                    boxShadow: `0 0 0 1.5px ${disciplineColor}55`,
                  }
                : {}
            }
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            <span className="text-[9px] font-semibold tracking-wide leading-none">
              {tool.label}
            </span>
            {dimmed && (
              <Lock size={8} className="absolute top-1 right-1 opacity-50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
