import {
  AppWindow,
  Box,
  Cable,
  CheckSquare,
  CircleDot,
  Clock,
  Columns,
  Cpu,
  DoorOpen,
  Droplets,
  FileText,
  GitMerge,
  Grid3x3,
  Home,
  Keyboard,
  Layers,
  Maximize2,
  Minus,
  Monitor,
  Moon,
  MousePointer2,
  PanelTop,
  PenLine,
  Rotate3d,
  RotateCcw,
  Ruler,
  Slash,
  SlidersHorizontal,
  Square,
  Sun,
  Triangle,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

type CommandItem = {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description: string;
  discipline?: string;
  disciplineColor?: string;
  shortcut?: string;
  action: () => void;
  unimplemented?: boolean;
};

export function CommandPalette() {
  const {
    showCommandPalette,
    setShowCommandPalette,
    setActiveTool,
    setActiveDiscipline,
    setActiveView,
    setShowVersionHistory,
    setShowShortcuts,
    toggleDarkMode,
    darkMode,
  } = useFrameStore();

  const isTouchDevice = useIsTouchDevice();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activate = (
    tool: string,
    discipline: "architecture" | "structure" | "mep" | "parts",
  ) => {
    setActiveDiscipline(discipline);
    setActiveTool(tool);
    setShowCommandPalette(false);
  };

  const commands: CommandItem[] = [
    // Architecture tools
    {
      id: "arch-select",
      icon: MousePointer2,
      label: "Select",
      description: "Pick and move elements",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "V",
      action: () => activate("select", "architecture"),
    },
    {
      id: "arch-wall",
      icon: Square,
      label: "Wall",
      description: "Draw walls by clicking start and end points",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "WA",
      action: () => activate("wall", "architecture"),
    },
    {
      id: "arch-floor",
      icon: Layers,
      label: "Floor",
      description: "Place a floor slab on the active level",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "FL",
      action: () => activate("floor", "architecture"),
    },
    {
      id: "arch-door",
      icon: DoorOpen,
      label: "Door",
      description: "Insert a door into an existing wall",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "DR",
      action: () => activate("door", "architecture"),
    },
    {
      id: "arch-window",
      icon: AppWindow,
      label: "Window",
      description: "Insert a window into an existing wall",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "WN",
      action: () => activate("window", "architecture"),
    },
    {
      id: "arch-column",
      icon: Columns,
      label: "Column",
      description: "Place a vertical structural column",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "CO",
      action: () => activate("column", "architecture"),
    },
    {
      id: "arch-room",
      icon: Grid3x3,
      label: "Room",
      description: "Tag and define a room boundary",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "RM",
      action: () => activate("room", "architecture"),
    },
    {
      id: "arch-roof",
      icon: Home,
      label: "Roof",
      description: "Generate a roof from the building footprint",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "RF",
      action: () => activate("roof", "architecture"),
      unimplemented: true,
    },
    {
      id: "arch-stair",
      icon: Layers,
      label: "Stair",
      description: "Add a stair between two levels",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "ST",
      action: () => activate("stair", "architecture"),
      unimplemented: true,
    },
    {
      id: "arch-curtainwall",
      icon: PanelTop,
      label: "Curtain Wall",
      description: "Place a glazed curtain wall system",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "CW",
      action: () => activate("curtainwall", "architecture"),
      unimplemented: true,
    },
    {
      id: "arch-measure",
      icon: Ruler,
      label: "Measure",
      description: "Measure distance between two points",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "M",
      action: () => activate("measure", "architecture"),
    },
    {
      id: "arch-dimension",
      icon: Ruler,
      label: "Dimension",
      description: "Place a permanent linear dimension annotation",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "D",
      action: () => activate("dimension", "architecture"),
    },
    {
      id: "arch-section",
      icon: Slash,
      label: "Section Cut",
      description: "Draw a section cut through the model",
      discipline: "Architecture",
      disciplineColor: "#3b82f6",
      shortcut: "X",
      action: () => activate("section", "architecture"),
    },
    // Structure tools
    {
      id: "str-column",
      icon: Columns,
      label: "Column",
      description: "Place a structural column",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "CO",
      action: () => activate("column", "structure"),
    },
    {
      id: "str-beam",
      icon: Minus,
      label: "Beam",
      description: "Draw a horizontal beam between two points",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "BM",
      action: () => activate("beam", "structure"),
    },
    {
      id: "str-slab",
      icon: Layers,
      label: "Slab",
      description: "Place a structural floor slab",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "SL",
      action: () => activate("slab", "structure"),
    },
    {
      id: "str-foundation",
      icon: Box,
      label: "Foundation",
      description: "Add a foundation element",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "FN",
      action: () => activate("foundation", "structure"),
    },
    {
      id: "str-analyze",
      icon: Cpu,
      label: "Analyze",
      description: "Run structural FEA analysis",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "F5",
      action: () => activate("analyze", "structure"),
    },
    {
      id: "str-autosize",
      icon: SlidersHorizontal,
      label: "Auto-Size",
      description: "Automatically size members for loads",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "AS",
      action: () => activate("autosize", "structure"),
      unimplemented: true,
    },
    {
      id: "str-rebar",
      icon: Grid3x3,
      label: "Rebar",
      description: "Add reinforcement to concrete elements",
      discipline: "Structure",
      disciplineColor: "#10b981",
      shortcut: "RB",
      action: () => activate("rebar", "structure"),
      unimplemented: true,
    },
    // MEP tools
    {
      id: "mep-duct",
      icon: Wind,
      label: "Duct",
      description: "Route a rectangular or round duct",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "DU",
      action: () => activate("duct", "mep"),
    },
    {
      id: "mep-pipe",
      icon: Droplets,
      label: "Pipe",
      description: "Route a plumbing or HVAC pipe",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "PI",
      action: () => activate("pipe", "mep"),
    },
    {
      id: "mep-cable",
      icon: Cable,
      label: "Cable Tray",
      description: "Route an electrical cable tray",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "CT",
      action: () => activate("cabletray", "mep"),
    },
    {
      id: "mep-equipment",
      icon: Monitor,
      label: "Equipment",
      description: "Place mechanical or electrical equipment",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "EQ",
      action: () => activate("equipment", "mep"),
    },
    {
      id: "mep-diffuser",
      icon: CircleDot,
      label: "Diffuser",
      description: "Insert an air diffuser or grille",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "DF",
      action: () => activate("diffuser", "mep"),
    },
    {
      id: "mep-fixture",
      icon: Zap,
      label: "Fixture",
      description: "Place an electrical fixture",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "FX",
      action: () => activate("fixture", "mep"),
    },
    {
      id: "mep-autoroute",
      icon: GitMerge,
      label: "Auto Route",
      description: "Automatically route selected systems",
      discipline: "MEP",
      disciplineColor: "#f59e0b",
      shortcut: "RA",
      action: () => activate("autoroute", "mep"),
      unimplemented: true,
    },
    // Parts tools
    {
      id: "parts-sketch",
      icon: PenLine,
      label: "Sketch",
      description: "Draw a 2D profile for a feature",
      discipline: "Parts",
      disciplineColor: "#8b5cf6",
      shortcut: "SK",
      action: () => activate("sketch", "parts"),
      unimplemented: true,
    },
    {
      id: "parts-extrude",
      icon: Box,
      label: "Extrude",
      description: "Pull a 2D profile into a 3D solid",
      discipline: "Parts",
      disciplineColor: "#8b5cf6",
      shortcut: "E",
      action: () => activate("extrude", "parts"),
      unimplemented: true,
    },
    {
      id: "parts-revolve",
      icon: RotateCcw,
      label: "Revolve",
      description: "Spin a profile around an axis",
      discipline: "Parts",
      disciplineColor: "#8b5cf6",
      shortcut: "RV",
      action: () => activate("revolve", "parts"),
      unimplemented: true,
    },
    {
      id: "parts-fillet",
      icon: CircleDot,
      label: "Fillet",
      description: "Round a sharp edge",
      discipline: "Parts",
      disciplineColor: "#8b5cf6",
      shortcut: "FI",
      action: () => activate("fillet", "parts"),
      unimplemented: true,
    },
    {
      id: "parts-assembly",
      icon: Wrench,
      label: "Assembly",
      description: "Create a part assembly",
      discipline: "Parts",
      disciplineColor: "#8b5cf6",
      shortcut: "ASM",
      action: () => activate("assembly", "parts"),
      unimplemented: true,
    },
    // View/panel actions
    {
      id: "view-3d",
      icon: Rotate3d,
      label: "3D View",
      description: "Switch to the 3D viewport",
      action: () => {
        setActiveView("3d");
        setShowCommandPalette(false);
      },
    },
    {
      id: "view-docs",
      icon: FileText,
      label: "Documentation View",
      description: "Switch to the 2D floor plan documentation view",
      action: () => {
        setActiveView("documentation");
        setShowCommandPalette(false);
      },
    },
    {
      id: "version-history",
      icon: Clock,
      label: "Version History",
      description: "Open the version history panel",
      action: () => {
        setShowVersionHistory(true);
        setShowCommandPalette(false);
      },
    },
    {
      id: "shortcuts",
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      description: "Open the keyboard shortcuts panel",
      shortcut: "?",
      action: () => {
        setShowShortcuts(true);
        setShowCommandPalette(false);
      },
    },
    {
      id: "toggle-dark",
      icon: darkMode ? Sun : Moon,
      label: darkMode ? "Light Mode" : "Dark Mode",
      description: "Toggle the application color theme",
      action: () => {
        toggleDarkMode();
        setShowCommandPalette(false);
      },
    },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          (c.discipline?.toLowerCase().includes(query.toLowerCase()) ?? false),
      )
    : commands;

  useEffect(() => {
    if (showCommandPalette) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  useEffect(() => {
    if (!showCommandPalette) return;
    const el = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, showCommandPalette]);

  if (!showCommandPalette) return null;

  const bg = darkMode ? "#1a1f2e" : "#ffffff";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const mutedColor = darkMode ? "#64748b" : "#94a3b8";
  const inputH = isTouchDevice ? "h-14 text-base" : "h-10 text-sm";
  const rowH = isTouchDevice ? "h-14" : "h-9";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={() => setShowCommandPalette(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setShowCommandPalette(false);
      }}
    >
      <div
        data-ocid="command_palette.panel"
        className="w-full max-w-[600px] rounded-xl overflow-hidden shadow-2xl"
        style={{ background: bg, border: `1px solid ${border}` }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") setShowCommandPalette(false);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter" && filtered[activeIndex]) {
            filtered[activeIndex].action();
          }
        }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          <svg
            className="shrink-0"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={mutedColor}
            strokeWidth="2"
            aria-hidden="true"
            role="img"
          >
            <title>Search</title>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            data-ocid="command_palette.search_input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, tools, actions..."
            className={`flex-1 ${inputH} bg-transparent outline-none`}
            style={{ color: darkMode ? "#e2e8f0" : "#1e293b" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{ color: mutedColor }}
              className="shrink-0 hover:opacity-80"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="overflow-y-auto"
          style={{ maxHeight: isTouchDevice ? "60vh" : "400px" }}
        >
          {filtered.length === 0 ? (
            <div
              data-ocid="command_palette.empty_state"
              className="py-12 text-center text-sm"
              style={{ color: mutedColor }}
            >
              No commands match &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-ocid={`command_palette.${item.id}.button`}
                  onClick={() => item.action()}
                  className={`w-full flex items-center gap-3 px-4 ${rowH} text-left transition-colors touch-manipulation`}
                  style={{
                    background: isActive
                      ? darkMode
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(59,130,246,0.06)"
                      : "transparent",
                    opacity: item.unimplemented ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: item.disciplineColor
                        ? `${item.disciplineColor}20`
                        : darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)",
                    }}
                  >
                    <Icon size={15} className="shrink-0" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[13px] font-medium"
                        style={{
                          color: darkMode ? "#e2e8f0" : "#1e293b",
                        }}
                      >
                        {item.label}
                      </span>
                      {item.unimplemented && (
                        <span
                          className="text-[9px] px-1 py-0.5 rounded uppercase tracking-wide font-semibold flex-shrink-0"
                          style={{
                            background: darkMode
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.05)",
                            color: mutedColor,
                          }}
                        >
                          Soon
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[11px] truncate mt-0.5"
                      style={{ color: mutedColor }}
                    >
                      {item.description}
                    </div>
                  </div>

                  {/* Right: discipline badge + shortcut */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.discipline && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
                        style={{
                          background: `${item.disciplineColor}22`,
                          color: item.disciplineColor,
                        }}
                      >
                        {item.discipline}
                      </span>
                    )}
                    {item.shortcut && (
                      <kbd
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{
                          background: darkMode
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.06)",
                          color: mutedColor,
                          border: `1px solid ${border}`,
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t"
          style={{
            borderColor: border,
            background: darkMode
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.02)",
          }}
        >
          <div className="flex items-center gap-3">
            {[
              { keys: ["↑", "↓"], label: "navigate" },
              { keys: ["↵"], label: "select" },
              { keys: ["ESC"], label: "close" },
            ].map(({ keys, label }) => (
              <div key={label} className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="text-[10px] px-1 py-0.5 rounded font-mono"
                    style={{
                      background: darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                      color: mutedColor,
                      border: `1px solid ${border}`,
                    }}
                  >
                    {k}
                  </kbd>
                ))}
                <span className="text-[10px]" style={{ color: mutedColor }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <span className="text-[10px]" style={{ color: mutedColor }}>
            {filtered.length} command{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
