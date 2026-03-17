import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";

type FilterKey = "architecture" | "structure" | "mep" | "mechanical";

const FILTERS: {
  key: FilterKey;
  label: string;
  short: string;
  color: string;
}[] = [
  {
    key: "architecture",
    label: "Architecture",
    short: "Arch",
    color: "#3b82f6",
  },
  { key: "structure", label: "Structure", short: "Struct", color: "#10b981" },
  { key: "mep", label: "MEP", short: "MEP", color: "#f59e0b" },
  { key: "mechanical", label: "Mechanical", short: "Mech", color: "#8b5cf6" },
];

export function DisciplineFilterBar() {
  const { darkMode, disciplineFilters, setDisciplineFilter } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();

  const allOn = Object.values(disciplineFilters).every(Boolean);

  const toggleAll = () => {
    const next = !allOn;
    for (const f of FILTERS) {
      setDisciplineFilter(f.key, next);
    }
  };

  const btnH = isTouchDevice
    ? "min-h-[44px] px-3 text-xs"
    : "h-7 px-2.5 text-[10px]";

  return (
    <div
      className={`flex items-center gap-1 px-3 border-b flex-shrink-0 ${
        darkMode
          ? "bg-[#141820] border-white/8"
          : "bg-gray-50/80 border-gray-200"
      }`}
      style={{ minHeight: isTouchDevice ? "44px" : "28px" }}
    >
      <span
        className={`text-[9px] uppercase tracking-widest font-semibold mr-1 flex-shrink-0 ${
          darkMode ? "text-gray-600" : "text-gray-400"
        }`}
      >
        Filter:
      </span>

      {/* All toggle */}
      <button
        type="button"
        data-ocid="discipline_filter.all.tab"
        onClick={toggleAll}
        className={`${btnH} rounded font-semibold transition-colors touch-manipulation flex items-center gap-1 ${
          allOn
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            : darkMode
              ? "text-gray-500 hover:text-gray-300 border border-white/10 hover:border-white/20"
              : "text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300"
        }`}
      >
        All
      </button>

      <div
        className={`w-px self-stretch mx-0.5 ${
          darkMode ? "bg-white/10" : "bg-gray-200"
        }`}
      />

      {/* Individual filters */}
      {FILTERS.map((f) => {
        const active = disciplineFilters[f.key];
        return (
          <button
            key={f.key}
            type="button"
            data-ocid="discipline_filter.tab"
            onClick={() => setDisciplineFilter(f.key, !active)}
            className={`${btnH} rounded font-medium transition-all touch-manipulation flex items-center gap-1.5 ${
              active
                ? darkMode
                  ? "border"
                  : "border"
                : darkMode
                  ? "text-gray-600 border border-white/8 hover:text-gray-400 hover:border-white/15"
                  : "text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300"
            }`}
            style={
              active
                ? {
                    background: `${f.color}22`,
                    color: f.color,
                    borderColor: `${f.color}44`,
                  }
                : {}
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: active ? f.color : "transparent",
                border: `1.5px solid ${f.color}88`,
              }}
            />
            {isTouchDevice ? f.label : f.short}
          </button>
        );
      })}
    </div>
  );
}
