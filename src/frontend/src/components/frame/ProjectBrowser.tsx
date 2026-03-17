import {
  ChevronRight,
  Eye,
  Grid,
  Layers,
  Printer,
  Search,
  Table,
  X,
} from "lucide-react";
import { useState } from "react";
import { useFrameStore } from "../../stores/frameStore";

const BROWSER_SECTIONS = [
  {
    id: "levels",
    label: "Levels",
    icon: Layers,
    items: ["B1 (-3600)", "L1 (0)", "L2 (3600)", "L3 (7200)", "Roof (10800)"],
  },
  {
    id: "grids",
    label: "Grids",
    icon: Grid,
    items: [
      "Grid A",
      "Grid B",
      "Grid C",
      "Grid D",
      "Grid 1",
      "Grid 2",
      "Grid 3",
    ],
  },
  {
    id: "views",
    label: "Views",
    icon: Eye,
    items: [
      "Floor Plan L1",
      "Floor Plan L2",
      "Floor Plan L3",
      "Section A-A",
      "Section B-B",
      "East Elevation",
      "North Elevation",
      "3D View - Default",
    ],
  },
  {
    id: "sheets",
    label: "Sheets",
    icon: Printer,
    items: [
      "A1.01 - Site Plan",
      "A1.02 - Ground Floor Plan",
      "A2.01 - Sections",
      "S1.01 - Foundation Plan",
      "M1.01 - Mechanical",
    ],
  },
  {
    id: "schedules",
    label: "Schedules",
    icon: Table,
    items: [
      "Door Schedule",
      "Window Schedule",
      "Room Schedule",
      "Column Schedule",
      "Beam Schedule",
    ],
  },
];

export function ProjectBrowser() {
  const { showProjectBrowser, setShowProjectBrowser, darkMode } =
    useFrameStore();
  const [search, setSearch] = useState("");

  if (!showProjectBrowser) return null;

  const query = search.toLowerCase().trim();

  // Filter sections and items by search
  const filteredSections = BROWSER_SECTIONS.map((section) => ({
    ...section,
    filteredItems: section.items.filter(
      (item) =>
        !query ||
        item.toLowerCase().includes(query) ||
        section.label.toLowerCase().includes(query),
    ),
  })).filter((s) => s.filteredItems.length > 0);

  const hasResults = filteredSections.length > 0;

  return (
    <div
      className={`absolute left-14 top-0 bottom-0 w-56 border-r z-20 flex flex-col ${
        darkMode
          ? "bg-[#161b27] border-white/8 text-gray-200"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {/* Header */}
      <div
        className={`h-9 flex items-center justify-between px-3 border-b flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Project Browser
        </span>
        <button
          type="button"
          data-ocid="project_browser.close.button"
          onClick={() => setShowProjectBrowser(false)}
          className={`p-0.5 rounded transition-colors ${darkMode ? "hover:bg-white/8 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
        >
          <X size={12} />
        </button>
      </div>

      {/* Search input */}
      <div
        className={`px-2 py-1.5 border-b flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <div className="relative">
          <Search
            size={10}
            className={`absolute left-2 top-1/2 -translate-y-1/2 ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <input
            type="text"
            data-ocid="project_browser.search.input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className={`w-full h-6 rounded pl-6 pr-2 text-[11px] border outline-none transition-colors ${
              darkMode
                ? "bg-white/5 border-white/10 text-gray-200 placeholder-gray-600 focus:border-blue-500/50"
                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400"
            }`}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 ${
                darkMode
                  ? "text-gray-600 hover:text-gray-400"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <X size={9} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto py-1">
        {!hasResults && query && (
          <div
            data-ocid="project_browser.empty_state"
            className={`px-4 py-6 text-center text-[11px] ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            No results for &ldquo;{search}&rdquo;
          </div>
        )}
        {filteredSections.map(({ id, label, icon: Icon, filteredItems }) => (
          <details key={id} className="group" open={id === "views" || !!query}>
            <summary
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer list-none transition-colors ${
                darkMode
                  ? "hover:bg-white/5 text-gray-300"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <ChevronRight
                size={11}
                className="transition-transform group-open:rotate-90 text-gray-500"
              />
              <Icon size={12} className="text-gray-500" />
              <span className="text-[11px] font-medium">{label}</span>
            </summary>
            {filteredItems.map((item) => (
              <div
                key={item}
                data-ocid={`project_browser.${id}.item.${filteredItems.indexOf(item) + 1}`}
                className={`flex items-center gap-2 pl-8 pr-3 py-1 cursor-pointer text-[11px] transition-colors ${
                  darkMode
                    ? "hover:bg-white/5 text-gray-400"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                {item}
              </div>
            ))}
          </details>
        ))}
      </div>
    </div>
  );
}
