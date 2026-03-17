import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  FileDown,
  FileText,
  FileUp,
  FolderOpen,
  Grid3x3,
  Layers,
  Moon,
  Redo2,
  Share2,
  Sparkles,
  Sun,
  Undo2,
  Users,
} from "lucide-react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";
import type { Discipline } from "../../types/frame";
import { DisciplineFilterBar } from "./DisciplineFilterBar";

const COLLABORATORS = [
  { initials: "AK", name: "Alex Kim", color: "#3b82f6" },
  { initials: "JL", name: "Jamie Lee", color: "#10b981" },
  { initials: "MR", name: "Morgan R.", color: "#f97316" },
];

const DISCIPLINE_LIST: { key: Discipline; label: string; ocid: string }[] = [
  { key: "architecture", label: "Architecture", ocid: "layers.arch.toggle" },
  { key: "structure", label: "Structure", ocid: "layers.structure.toggle" },
  { key: "mep", label: "MEP", ocid: "layers.mep.toggle" },
  { key: "parts", label: "Parts", ocid: "layers.parts.toggle" },
];

type Props = {
  onImport: () => void;
  onExport: () => void;
};

export function TopBar({ onImport, onExport }: Props) {
  const {
    darkMode,
    toggleDarkMode,
    setShowVersionHistory,
    showVersionHistory,
    setShowProjectBrowser,
    showProjectBrowser,
    showSheets,
    setShowSheets,
    showCollaboration,
    setShowCollaboration,
    displayMode,
    setDisplayMode,
    undo,
    redo,
    elementHistory,
    redoStack,
    disciplineVisibility,
    toggleDisciplineVisibility,
    elements,
    activeView,
    setActiveView,
    setActiveDiscipline,
  } = useFrameStore();

  const isTouchDevice = useIsTouchDevice();

  const barH = isTouchDevice ? "h-14" : "h-10";
  const tabCls = isTouchDevice ? "px-4 py-2 text-sm" : "px-2 py-1 text-xs";
  const genericBtnCls = isTouchDevice
    ? "px-4 py-2 text-sm"
    : "px-2 py-1 text-xs";
  const iconBtnSz = isTouchDevice ? "w-12 h-12" : "w-7 h-7";

  const btnCls = `flex items-center gap-1.5 ${genericBtnCls} rounded transition-colors ${
    darkMode
      ? "hover:bg-white/8 text-gray-400"
      : "hover:bg-gray-100 text-gray-600"
  }`;

  const activeBtnCls = "bg-blue-500/20 text-blue-400";

  const canUndo = elementHistory.length > 0;
  const canRedo = redoStack.length > 0;

  const undoRedoBtnCls = (enabled: boolean) =>
    `flex items-center justify-center ${iconBtnSz} rounded transition-colors ${
      enabled
        ? darkMode
          ? "hover:bg-white/8 text-gray-300"
          : "hover:bg-gray-100 text-gray-700"
        : darkMode
          ? "text-gray-600 cursor-not-allowed"
          : "text-gray-300 cursor-not-allowed"
    }`;

  // Count elements per discipline
  const disciplineCounts = elements.reduce(
    (acc, el) => {
      acc[el.discipline] = (acc[el.discipline] ?? 0) + 1;
      return acc;
    },
    {} as Record<Discipline, number>,
  );

  const handleDisciplineTab = (d: Discipline) => {
    setActiveDiscipline(d);
    setActiveView("3d");
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={`${barH} flex items-center px-3 gap-1.5 border-b select-none flex-shrink-0 ${
          darkMode
            ? "bg-[#1a1f2e] border-white/8 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-1">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[9px] font-bold tracking-tight">
              F
            </span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Frame</span>
        </div>

        <div
          className={`w-px h-5 flex-shrink-0 ${
            darkMode ? "bg-white/10" : "bg-gray-200"
          }`}
        />

        {/* File dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="topbar.file.button"
              className={btnCls}
            >
              <FileText size={13} />
              <span>File</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            <DropdownMenuItem
              data-ocid="topbar.file.import"
              onClick={onImport}
              className="gap-2 cursor-pointer"
            >
              <FileUp size={13} />
              Import...
            </DropdownMenuItem>
            <DropdownMenuItem
              data-ocid="topbar.file.export"
              onClick={onExport}
              className="gap-2 cursor-pointer"
            >
              <FileDown size={13} />
              Export...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Undo / Redo */}
        <div
          className={`flex items-center rounded overflow-hidden border ${
            darkMode ? "border-white/10" : "border-gray-200"
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="topbar.undo.button"
                onClick={undo}
                disabled={!canUndo}
                className={undoRedoBtnCls(canUndo)}
              >
                <Undo2 size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="topbar.redo.button"
                onClick={redo}
                disabled={!canRedo}
                className={undoRedoBtnCls(canRedo)}
              >
                <Redo2 size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Redo (Ctrl+Shift+Z)
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Project name — hide on touch to save space */}
        {!isTouchDevice && (
          <div className="flex items-center gap-1.5 ml-1">
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Riverside Office Building
            </span>
            <span
              className={`text-[10px] px-1 rounded ${
                darkMode
                  ? "bg-green-500/20 text-green-400"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Saved
            </span>
          </div>
        )}

        <div
          className={`w-px h-5 flex-shrink-0 mx-1 ${
            darkMode ? "bg-white/10" : "bg-gray-200"
          }`}
        />

        {/* Workspace / View tabs */}
        <div
          className={`flex items-center gap-0.5 ${isTouchDevice ? "overflow-x-auto" : ""}`}
        >
          {(["architecture", "structure", "mep", "parts"] as Discipline[]).map(
            (d) => (
              <button
                key={d}
                type="button"
                data-ocid={`topbar.discipline.${d}.tab`}
                onClick={() => handleDisciplineTab(d)}
                className={`${tabCls} rounded capitalize transition-colors touch-manipulation ${
                  activeView === "3d"
                    ? darkMode
                      ? "hover:bg-white/8 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                    : darkMode
                      ? "text-gray-600 hover:bg-white/8"
                      : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {isTouchDevice
                  ? d === "architecture"
                    ? "Arch"
                    : d === "structure"
                      ? "Struct"
                      : d.toUpperCase()
                  : d}
              </button>
            ),
          )}
          <button
            type="button"
            data-ocid="topbar.documentation.tab"
            onClick={() => setActiveView("documentation")}
            className={`flex items-center gap-1.5 ${tabCls} rounded transition-colors touch-manipulation ${
              activeView === "documentation"
                ? "bg-blue-500/20 text-blue-400"
                : darkMode
                  ? "hover:bg-white/8 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <FileText size={12} />
            {!isTouchDevice && "Documentation"}
            {isTouchDevice && "Docs"}
          </button>
        </div>

        <div className="flex-1" />

        {/* Display mode */}
        <div
          className={`flex items-center rounded overflow-hidden border ${
            darkMode ? "border-white/10" : "border-gray-200"
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="topbar.display.wireframe.button"
                onClick={() => setDisplayMode("wireframe")}
                className={`flex items-center justify-center ${iconBtnSz} transition-colors ${
                  displayMode === "wireframe"
                    ? "bg-blue-500/20 text-blue-400"
                    : darkMode
                      ? "hover:bg-white/8 text-gray-500"
                      : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Grid3x3 size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Wireframe</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="topbar.display.shaded.button"
                onClick={() => setDisplayMode("shaded")}
                className={`flex items-center justify-center ${iconBtnSz} transition-colors ${
                  displayMode === "shaded"
                    ? "bg-blue-500/20 text-blue-400"
                    : darkMode
                      ? "hover:bg-white/8 text-gray-500"
                      : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Layers size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Shaded</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="topbar.display.rendered.button"
                onClick={() => setDisplayMode("rendered")}
                className={`flex items-center justify-center ${iconBtnSz} transition-colors ${
                  displayMode === "rendered"
                    ? "bg-blue-500/20 text-blue-400"
                    : darkMode
                      ? "hover:bg-white/8 text-gray-500"
                      : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Sparkles size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Rendered</TooltipContent>
          </Tooltip>
        </div>

        <div
          className={`w-px h-5 flex-shrink-0 ${
            darkMode ? "bg-white/10" : "bg-gray-200"
          }`}
        />

        {/* Panel toggles */}
        <button
          type="button"
          data-ocid="topbar.project_browser.toggle"
          onClick={() => setShowProjectBrowser(!showProjectBrowser)}
          className={`${btnCls} ${showProjectBrowser ? activeBtnCls : ""}`}
        >
          <FolderOpen size={13} />
          {!isTouchDevice && <span>Browser</span>}
        </button>

        <button
          type="button"
          data-ocid="topbar.sheets.toggle"
          onClick={() => setShowSheets(!showSheets)}
          className={`${btnCls} ${showSheets ? activeBtnCls : ""}`}
        >
          <FileText size={13} />
          {!isTouchDevice && <span>Sheets</span>}
        </button>

        <button
          type="button"
          data-ocid="topbar.version_history.toggle"
          onClick={() => setShowVersionHistory(!showVersionHistory)}
          className={`${btnCls} ${showVersionHistory ? activeBtnCls : ""}`}
        >
          <Clock size={13} />
          {!isTouchDevice && <span>History</span>}
        </button>

        {/* Team / Collaboration */}
        <button
          type="button"
          data-ocid="topbar.team.toggle"
          onClick={() => setShowCollaboration(!showCollaboration)}
          className={`${btnCls} ${showCollaboration ? activeBtnCls : ""}`}
        >
          <Users size={13} />
          {!isTouchDevice && <span>Team</span>}
        </button>

        {/* Layers popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-ocid="topbar.layers.button"
              className={btnCls}
            >
              <Layers size={13} />
              {!isTouchDevice && <span>Layers</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className={`w-56 p-3 ${
              darkMode
                ? "bg-[#1a1f2e] border-white/10 text-gray-200"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            <div
              className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Visibility
            </div>
            <div className="space-y-2">
              {DISCIPLINE_LIST.map(({ key, label, ocid }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      data-ocid={ocid}
                      checked={disciplineVisibility[key]}
                      onCheckedChange={() => toggleDisciplineVisibility(key)}
                      className="scale-75 origin-left"
                    />
                    <span className="text-xs">{label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      darkMode
                        ? "bg-white/8 text-gray-400"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {disciplineCounts[key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div
          className={`w-px h-5 flex-shrink-0 ${
            darkMode ? "bg-white/10" : "bg-gray-200"
          }`}
        />

        {/* Share */}
        <button
          type="button"
          data-ocid="topbar.share.button"
          className={`flex items-center gap-1.5 ${genericBtnCls} rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors touch-manipulation`}
        >
          <Share2 size={12} />
          {!isTouchDevice && <span>Share</span>}
        </button>

        {/* Collaborators — hide on touch */}
        {!isTouchDevice && (
          <>
            <div
              className={`w-px h-5 flex-shrink-0 ${
                darkMode ? "bg-white/10" : "bg-gray-200"
              }`}
            />
            <div className="flex items-center gap-0.5">
              {COLLABORATORS.map((u, i) => (
                <div
                  key={u.initials}
                  className="relative"
                  style={{ marginLeft: i > 0 ? "-6px" : "0" }}
                  title={`${u.name} — Live`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-2"
                    style={{ background: u.color }}
                  >
                    {u.initials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-green-400 ring-1" />
                </div>
              ))}
              <span
                className={`text-[10px] ml-2 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                3 live
              </span>
            </div>
          </>
        )}

        <div
          className={`w-px h-5 flex-shrink-0 ${
            darkMode ? "bg-white/10" : "bg-gray-200"
          }`}
        />

        {/* Theme toggle */}
        <button
          type="button"
          data-ocid="topbar.theme.toggle"
          onClick={toggleDarkMode}
          className={`flex items-center justify-center ${isTouchDevice ? "w-12 h-12" : "p-1.5"} rounded transition-colors touch-manipulation ${
            darkMode
              ? "hover:bg-white/8 text-gray-400"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
      <DisciplineFilterBar />
    </TooltipProvider>
  );
}
