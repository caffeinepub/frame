import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";
import type { ElementType, FrameElement } from "../../types/frame";
import { AnnotationsPanel } from "./AnnotationsPanel";
import { GroupsPanel } from "./GroupsPanel";

const MATERIAL_SWATCHES = [
  { id: "concrete", label: "Concrete", color: "#8d9fa6", category: "Masonry" },
  { id: "brick", label: "Brick", color: "#c1440e", category: "Masonry" },
  { id: "stone", label: "Stone", color: "#9b9280", category: "Masonry" },
  { id: "glass", label: "Glass", color: "#93c5d7", category: "Glazing" },
  { id: "wood", label: "Wood", color: "#c8a86b", category: "Timber" },
  { id: "timber", label: "Timber", color: "#8B6914", category: "Timber" },
  { id: "steel", label: "Steel", color: "#7f8ea3", category: "Metal" },
  { id: "aluminum", label: "Aluminum", color: "#b0b7bf", category: "Metal" },
  { id: "copper", label: "Copper", color: "#b87333", category: "Metal" },
  { id: "metal", label: "Metal", color: "#9ca3af", category: "Metal" },
  { id: "gypsum", label: "Gypsum", color: "#e8e8e0", category: "Finish" },
  { id: "paint", label: "Paint", color: "#f0f4f8", category: "Finish" },
];

const MATERIAL_CATEGORIES = [
  "Masonry",
  "Glazing",
  "Timber",
  "Metal",
  "Finish",
] as const;

const ELEMENT_TYPES: { value: ElementType; label: string }[] = [
  { value: "wall", label: "Wall" },
  { value: "column", label: "Column" },
  { value: "beam", label: "Beam" },
  { value: "floor", label: "Floor" },
  { value: "slab", label: "Slab" },
  { value: "door", label: "Door" },
  { value: "window", label: "Window" },
  { value: "duct", label: "Duct" },
  { value: "pipe", label: "Pipe" },
  { value: "foundation", label: "Foundation" },
  { value: "equipment", label: "Equipment" },
];

const ROTATABLE_TYPES = new Set([
  "wall",
  "beam",
  "slab",
  "duct",
  "pipe",
  "cable_tray",
]);

/** Convert meters to the active display unit */
function toDisplay(meters: number, units: "m" | "ft"): string {
  if (units === "ft") {
    return (meters * 3.28084).toFixed(2);
  }
  return meters.toFixed(2);
}

/** Convert mm to display unit */
function mmToDisplay(mm: number, units: "m" | "ft"): string {
  if (units === "ft") {
    return ((mm / 1000) * 3.28084).toFixed(3);
  }
  return mm.toFixed(0);
}

function unitLabel(units: "m" | "ft"): string {
  return units === "ft" ? "ft" : "mm";
}

function posUnitLabel(units: "m" | "ft"): string {
  return units === "ft" ? "ft" : "m";
}

function UtilizationBar({ value, label }: { value: number; label?: string }) {
  const color = value > 1.0 ? "#ef4444" : value > 0.7 ? "#f59e0b" : "#22c55e";
  const pct = Math.min(value * 100, 100);
  return (
    <div className="space-y-1">
      {label && (
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
          {label}
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-[11px] font-mono font-medium" style={{ color }}>
          {value.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ElementTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    wall: "#3b82f6",
    column: "#10b981",
    beam: "#10b981",
    floor: "#8b5cf6",
    window: "#06b6d4",
    door: "#f59e0b",
    duct: "#f59e0b",
    pipe: "#3b82f6",
    stair: "#ef4444",
    slab: "#8b5cf6",
    foundation: "#6b7280",
  };
  const color = colors[type] ?? "#6b7280";
  return (
    <span
      className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
      style={{ background: `${color}22`, color }}
    >
      {type.toUpperCase()}
    </span>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-600 pt-2 pb-0.5 border-b border-white/5">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  unit,
}: {
  label: string;
  children: React.ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-[10px] text-gray-600 w-14 shrink-0">{label}</span>
      {children}
      {unit && (
        <span className="text-[9px] text-gray-700 shrink-0">{unit}</span>
      )}
    </div>
  );
}

function getInputCls(touch: boolean) {
  const h = touch ? "h-11 text-base" : "h-6 text-[11px]";
  return `flex-1 min-w-0 ${h} bg-white/5 border border-white/10 rounded-sm px-1.5 font-mono text-gray-200 focus:outline-none focus:border-blue-500/60 transition-colors frame-touch-input`;
}
function getSelectCls(touch: boolean) {
  const h = touch ? "h-11 text-base" : "h-6 text-[11px]";
  return `flex-1 min-w-0 ${h} bg-white/5 border border-white/10 rounded-sm px-1 text-gray-200 focus:outline-none focus:border-blue-500/60 transition-colors frame-touch-select`;
}

function MaterialLibrary({
  currentMaterial,
  onApply,
  compact = false,
}: {
  currentMaterial?: string;
  onApply: (matId: string) => void;
  compact?: boolean;
}) {
  const isTouchMat = useIsTouchDevice();
  // Touch-optimized swatch sizes: 48x48px minimum
  const swatchSz = isTouchMat
    ? compact
      ? "w-12 h-12"
      : "w-12 h-12"
    : compact
      ? "w-7 h-7"
      : "w-8 h-8";
  const btnW = isTouchMat
    ? compact
      ? "w-12"
      : "w-14"
    : compact
      ? "w-7"
      : "w-9";
  return (
    <div className="space-y-2.5">
      {MATERIAL_CATEGORIES.map((cat) => {
        const mats = MATERIAL_SWATCHES.filter((m) => m.category === cat);
        return (
          <div key={cat}>
            <div
              className={`uppercase tracking-widest text-gray-700 mb-1.5 ${isTouchMat ? "text-[10px]" : "text-[8px]"}`}
            >
              {cat}
            </div>
            <div
              className={`flex flex-wrap ${isTouchMat ? "gap-2" : "gap-1.5"}`}
            >
              {mats.map((mat) => (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => onApply(mat.id)}
                  title={mat.label}
                  className={`group flex flex-col items-center gap-0.5 touch-manipulation ${btnW}`}
                >
                  <div
                    className={`${swatchSz} rounded border-2 transition-all ${
                      currentMaterial === mat.id
                        ? "border-blue-400 scale-110 shadow-md shadow-blue-500/30"
                        : "border-transparent hover:border-white/30 hover:scale-105"
                    }`}
                    style={{ background: mat.color }}
                  />
                  {!compact && (
                    <span
                      className={`${isTouchMat ? "text-[9px]" : "text-[8px]"} text-gray-600 leading-none text-center truncate w-full`}
                    >
                      {mat.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MultiSelectPanel({ count }: { count: number }) {
  const { deleteSelectedElement, selectedElementIds, elements, updateElement } =
    useFrameStore();
  const isTouchMulti = useIsTouchDevice();
  const deleteBtnH = isTouchMulti ? "h-12 text-sm" : "h-7 text-xs";

  const handleBulkMaterial = (matId: string) => {
    for (const id of selectedElementIds) {
      updateElement(id, { material: matId });
    }
  };

  const mats = selectedElementIds
    .map((id) => elements.find((e) => e.id === id)?.material)
    .filter(Boolean);
  const allSame = mats.length > 0 && mats.every((m) => m === mats[0]);
  const sharedMaterial = allSame ? (mats[0] as string) : undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex items-center gap-2 py-2 px-2.5 rounded bg-blue-500/10 border border-blue-500/20">
          <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <span className="text-[11px] text-blue-300 font-medium">
            {count} elements selected
          </span>
        </div>
        <div className="text-[9px] text-gray-600 leading-relaxed">
          Shift+click to add/remove from selection. Actions apply to all
          selected elements.
        </div>
        <Section title="Apply Material to All">
          <div className="mt-1">
            <MaterialLibrary
              currentMaterial={sharedMaterial}
              onApply={handleBulkMaterial}
              compact
            />
          </div>
        </Section>
      </div>
      <div className="flex-shrink-0 px-3 py-2 border-t border-white/5">
        <button
          type="button"
          data-ocid="properties.delete_button"
          onClick={() => deleteSelectedElement()}
          className={`w-full flex items-center justify-center gap-1.5 ${deleteBtnH} rounded border border-red-500/25 hover:bg-red-500/12 text-red-400/80 hover:text-red-400 transition-colors touch-manipulation`}
        >
          <Trash2 size={11} />
          Delete All Selected ({count})
        </button>
      </div>
    </div>
  );
}

const ELEMENT_SPECS: Record<
  string,
  { key: string; label: string; defaultValue: string; unit?: string }[]
> = {
  wall: [
    { key: "thickness", label: "Thickness", defaultValue: "200 mm" },
    { key: "fire", label: "Fire Rating", defaultValue: "EI 60" },
    { key: "uValue", label: "U-Value", defaultValue: "0.35 W/m²K" },
    { key: "finish", label: "Finish", defaultValue: "Painted" },
  ],
  column: [
    { key: "section", label: "Section", defaultValue: "UC 203×203×60" },
    { key: "material", label: "Grade", defaultValue: "C30/37" },
    { key: "loadCapacity", label: "Load Cap.", defaultValue: "500 kN" },
  ],
  beam: [
    { key: "section", label: "Section", defaultValue: "IPE 300" },
    { key: "material", label: "Grade", defaultValue: "S355" },
    { key: "spanDepthRatio", label: "Span/Depth", defaultValue: "20" },
  ],
  slab: [
    { key: "thickness", label: "Thickness", defaultValue: "200 mm" },
    { key: "material", label: "Grade", defaultValue: "C30/37" },
    { key: "fire", label: "Fire Rating", defaultValue: "REI 60" },
  ],
  floor: [
    { key: "finish", label: "Finish", defaultValue: "Screed" },
    { key: "loading", label: "Live Load", defaultValue: "2.5 kN/m²" },
  ],
  door: [
    { key: "width", label: "Width", defaultValue: "900 mm" },
    { key: "height", label: "Height", defaultValue: "2100 mm" },
    { key: "fire", label: "Fire Rating", defaultValue: "EI 30" },
    { key: "hardware", label: "Hardware", defaultValue: "Lever Handle" },
  ],
  window: [
    { key: "width", label: "Width", defaultValue: "1200 mm" },
    { key: "glazing", label: "Glazing", defaultValue: "Double 4/12/4" },
    { key: "uValue", label: "U-Value", defaultValue: "1.4 W/m²K" },
    { key: "frame", label: "Frame", defaultValue: "Aluminium" },
  ],
  duct: [
    { key: "size", label: "Size", defaultValue: "400×400 mm" },
    { key: "system", label: "System", defaultValue: "Supply Air" },
    { key: "flowRate", label: "Flow Rate", defaultValue: "500 L/s" },
    { key: "insulation", label: "Insulation", defaultValue: "25 mm" },
  ],
  pipe: [
    { key: "diameter", label: "Diameter", defaultValue: "100 mm" },
    { key: "system", label: "System", defaultValue: "Cold Water" },
    { key: "material", label: "Material", defaultValue: "Copper" },
    { key: "pressure", label: "Pressure", defaultValue: "10 bar" },
  ],
  foundation: [
    { key: "type", label: "Type", defaultValue: "Pad" },
    { key: "bearingCap", label: "Bearing Cap.", defaultValue: "150 kN/m²" },
    { key: "material", label: "Grade", defaultValue: "C35/45" },
  ],
  equipment: [
    { key: "type", label: "Type", defaultValue: "AHU" },
    { key: "capacity", label: "Capacity", defaultValue: "10000 m³/h" },
    { key: "power", label: "Power", defaultValue: "7.5 kW" },
  ],
};

function SelectedElementPanel({ el }: { el: FrameElement }) {
  const { updateElement, levels, units } = useFrameStore();
  const isTouchPanel = useIsTouchDevice();
  const inputCls = getInputCls(isTouchPanel);
  const selectCls = getSelectCls(isTouchPanel);
  const rotDeg = ((el.rotation ?? 0) * 180) / Math.PI;
  const isRotatable = ROTATABLE_TYPES.has(el.type);
  const dimUnit = unitLabel(units);
  const posUnit = posUnitLabel(units);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 pb-2">
        {/* Identity */}
        <Section title="Identity">
          <div className="flex items-center gap-1.5 mb-1">
            <ElementTypeBadge type={el.type} />
          </div>
          <Field label="Name">
            <input
              data-ocid="properties.name.input"
              className={inputCls}
              value={el.name}
              onChange={(e) => updateElement(el.id, { name: e.target.value })}
            />
          </Field>
          <Field label="Type">
            <select
              data-ocid="properties.type.select"
              className={selectCls}
              value={el.type}
              onChange={(e) =>
                updateElement(el.id, { type: e.target.value as ElementType })
              }
            >
              {ELEMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        {el.utilizationRatio !== undefined && (
          <div className="pt-2">
            <UtilizationBar
              value={el.utilizationRatio}
              label="Utilization Ratio"
            />
          </div>
        )}

        {/* Dimensions */}
        <Section title="Dimensions">
          <div className="grid grid-cols-3 gap-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-600">W</span>
              <input
                data-ocid="properties.width.input"
                className={inputCls}
                type="number"
                value={mmToDisplay(el.dimensions.width * 1000, units)}
                onChange={(e) =>
                  updateElement(el.id, {
                    dimensions: {
                      ...el.dimensions,
                      width:
                        units === "ft"
                          ? Number(e.target.value) / 3.28084
                          : Number(e.target.value) / 1000,
                    },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-600">H</span>
              <input
                data-ocid="properties.height.input"
                className={inputCls}
                type="number"
                value={mmToDisplay(el.dimensions.height * 1000, units)}
                onChange={(e) =>
                  updateElement(el.id, {
                    dimensions: {
                      ...el.dimensions,
                      height:
                        units === "ft"
                          ? Number(e.target.value) / 3.28084
                          : Number(e.target.value) / 1000,
                    },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-600">D</span>
              <input
                data-ocid="properties.depth.input"
                className={inputCls}
                type="number"
                value={mmToDisplay(el.dimensions.depth * 1000, units)}
                onChange={(e) =>
                  updateElement(el.id, {
                    dimensions: {
                      ...el.dimensions,
                      depth:
                        units === "ft"
                          ? Number(e.target.value) / 3.28084
                          : Number(e.target.value) / 1000,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="text-[9px] text-gray-700 mt-0.5">{dimUnit}</div>
        </Section>

        {/* Placement */}
        <Section title="Placement">
          <Field label="X" unit={posUnit}>
            <input
              data-ocid="properties.pos-x.input"
              className={inputCls}
              type="number"
              value={toDisplay(el.position.x, units)}
              onChange={(e) =>
                updateElement(el.id, {
                  position: {
                    ...el.position,
                    x:
                      units === "ft"
                        ? Number(e.target.value) / 3.28084
                        : Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="Z" unit={posUnit}>
            <input
              data-ocid="properties.pos-z.input"
              className={inputCls}
              type="number"
              value={toDisplay(el.position.z, units)}
              onChange={(e) =>
                updateElement(el.id, {
                  position: {
                    ...el.position,
                    z:
                      units === "ft"
                        ? Number(e.target.value) / 3.28084
                        : Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          {isRotatable && (
            <Field label="Rotation" unit="deg">
              <input
                data-ocid="properties.rotation.input"
                className={inputCls}
                type="number"
                value={rotDeg.toFixed(1)}
                onChange={(e) =>
                  updateElement(el.id, {
                    rotation: (Number(e.target.value) * Math.PI) / 180,
                  })
                }
              />
            </Field>
          )}
          {levels.length > 0 && (
            <Field label="Level">
              <select
                data-ocid="properties.level.select"
                className={selectCls}
                value={el.level}
                onChange={(e) =>
                  updateElement(el.id, { level: e.target.value })
                }
              >
                {levels.map((lv) => (
                  <option key={lv.id} value={lv.id}>
                    {lv.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </Section>

        {/* Specifications */}
        {ELEMENT_SPECS[el.type] && (
          <Section title="Specifications">
            {ELEMENT_SPECS[el.type].map((spec) => (
              <Field key={spec.key} label={spec.label}>
                <input
                  data-ocid={`properties.spec_${spec.key}.input`}
                  className={inputCls}
                  value={
                    (el.properties as Record<string, string>)?.[spec.key] ??
                    spec.defaultValue
                  }
                  onChange={(e) =>
                    updateElement(el.id, {
                      properties: {
                        ...(el.properties as object),
                        [spec.key]: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            ))}
          </Section>
        )}

        {/* Material */}
        <Section title="Material">
          <MaterialLibrary
            currentMaterial={el.material}
            onApply={(matId) => updateElement(el.id, { material: matId })}
          />
        </Section>
      </div>

      <div className="flex-shrink-0 px-3 py-2 border-t border-white/5 space-y-1.5">
        <button
          type="button"
          data-ocid="properties.delete_button"
          onClick={() => useFrameStore.getState().deleteSelectedElement()}
          className={`w-full flex items-center justify-center gap-1.5 text-xs ${isTouchPanel ? "h-12 text-sm" : "h-8"} rounded border border-red-500/25 hover:bg-red-500/12 text-red-400/80 hover:text-red-400 transition-colors touch-manipulation`}
        >
          <Trash2 size={11} />
          Delete Element
        </button>
      </div>
    </div>
  );
}

function ProjectSummaryPanel() {
  const { elements, levels, activeDiscipline, darkMode } = useFrameStore();
  const byType: Record<string, number> = {};
  for (const el of elements) {
    byType[el.type] = (byType[el.type] ?? 0) + 1;
  }
  const topTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const colors: Record<string, string> = {
    wall: "#3b82f6",
    column: "#10b981",
    beam: "#10b981",
    floor: "#8b5cf6",
    window: "#06b6d4",
    door: "#f59e0b",
    duct: "#f59e0b",
    pipe: "#3b82f6",
    slab: "#8b5cf6",
    foundation: "#6b7280",
  };
  return (
    <div className="p-3 space-y-3">
      <div
        className={`flex flex-col gap-1 rounded-lg p-2.5 ${
          darkMode ? "bg-white/4" : "bg-gray-100"
        }`}
      >
        <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">
          Project Stats
        </div>
        <div className="flex gap-3 mt-1">
          <div>
            <div className="text-[18px] font-bold text-gray-200 leading-none">
              {elements.length}
            </div>
            <div className="text-[9px] text-gray-600">elements</div>
          </div>
          <div>
            <div className="text-[18px] font-bold text-gray-200 leading-none">
              {levels.length}
            </div>
            <div className="text-[9px] text-gray-600">levels</div>
          </div>
          <div>
            <div
              className="text-[18px] font-bold leading-none"
              style={{
                color:
                  activeDiscipline === "architecture"
                    ? "#3b82f6"
                    : activeDiscipline === "structure"
                      ? "#10b981"
                      : activeDiscipline === "mep"
                        ? "#f59e0b"
                        : "#8b5cf6",
              }}
            >
              {activeDiscipline.slice(0, 4).toUpperCase()}
            </div>
            <div className="text-[9px] text-gray-600">active</div>
          </div>
        </div>
      </div>

      {topTypes.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">
            By Type
          </div>
          {topTypes.map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: colors[type] ?? "#6b7280" }}
              />
              <span className="text-[10px] text-gray-500 capitalize flex-1">
                {type}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[9px] text-gray-700 leading-relaxed pt-1">
        Click an element in the viewport to view and edit its properties.
      </div>
    </div>
  );
}

export function RightPanel() {
  const {
    selectedElementId,
    selectedElementIds,
    elements,
    darkMode,
    setSelectedElement,
    clearMultiSelect,
  } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();
  const [collapsed, setCollapsed] = useState(false);

  // Default collapsed on touch
  useEffect(() => {
    if (isTouchDevice) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isTouchDevice]);

  const selectedEl = elements.find((e) => e.id === selectedElementId);
  const multiCount = selectedElementIds.length;
  const isMultiSelect = multiCount > 1;

  let headerLabel = "Project";
  if (isMultiSelect) headerLabel = "Multi-Select";
  else if (selectedEl) headerLabel = "Properties";

  const panelContent = (
    <>
      <div
        className={`${isTouchDevice ? "h-14 px-4" : "h-9 px-3"} flex items-center justify-between border-b flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {headerLabel}
        </span>
        {(selectedEl || isMultiSelect) && (
          <button
            type="button"
            data-ocid="properties.close.button"
            onClick={() => {
              setSelectedElement(null);
              clearMultiSelect();
            }}
            className={`rounded transition-colors touch-manipulation ${isTouchDevice ? "w-12 h-12" : "p-0.5 min-w-[32px] min-h-[32px]"} flex items-center justify-center ${
              darkMode
                ? "hover:bg-white/8 text-gray-500"
                : "hover:bg-gray-100 text-gray-400"
            }`}
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {isMultiSelect ? (
          <MultiSelectPanel count={multiCount} />
        ) : selectedEl ? (
          <SelectedElementPanel el={selectedEl} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ProjectSummaryPanel />
          </div>
        )}
      </div>
      <div
        className={`border-t flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <AnnotationsPanel />
      </div>
      <div
        className={`border-t flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <GroupsPanel />
      </div>
    </>
  );

  // Desktop layout: unchanged
  if (!isTouchDevice) {
    return (
      <div
        className={`w-[272px] flex-shrink-0 border-l flex flex-col ${
          darkMode
            ? "bg-[#161b27] border-white/8 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        {panelContent}
      </div>
    );
  }

  // Touch/iPad: fixed overlay with collapse handle
  return (
    <div
      className={`fixed right-0 z-[39] flex items-stretch ${isTouchDevice ? "top-14 bottom-16" : "top-10 bottom-8"}`}
      style={{ pointerEvents: "none" }}
    >
      {/* Handle tab */}
      <button
        type="button"
        data-ocid="rightpanel.toggle.button"
        onClick={() => setCollapsed(!collapsed)}
        className={`self-center flex items-center justify-center w-10 h-24 rounded-l-2xl shadow-lg border-y border-l transition-colors touch-manipulation ${
          darkMode
            ? "bg-[#161b27] border-white/10 text-gray-400 hover:text-gray-200"
            : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"
        }`}
        style={{ pointerEvents: "auto" }}
        title={collapsed ? "Show properties" : "Hide properties"}
      >
        {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Panel */}
      <div
        className={`w-[272px] flex flex-col border-l overflow-hidden transition-transform duration-200 ${
          collapsed ? "translate-x-[272px]" : "translate-x-0"
        } ${
          darkMode
            ? "bg-[#161b27] border-white/8 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        }`}
        style={{ pointerEvents: "auto" }}
      >
        {panelContent}
      </div>
    </div>
  );
}
