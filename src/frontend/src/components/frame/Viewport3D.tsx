import {
  Environment,
  Grid,
  Html,
  Line,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as THREE from "three";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";
import type { Discipline, FrameElement } from "../../types/frame";

// Module-level mutable refs (no re-renders)
const cursorWorldPos = new THREE.Vector3();
const snappedCursorPos = new THREE.Vector3();
const dragState = {
  active: false,
  elementId: "",
  elementY: 0,
  startX: 0,
  startZ: 0,
  multiStartPositions: {} as Record<
    string,
    { x: number; y: number; z: number }
  >,
};

// Snap guide line state (module-level)
const snapGuideRef = {
  active: false,
  p1: [0, 0, 0] as [number, number, number],
  p2: [0, 0, 0] as [number, number, number],
  type: "perp" as "perp" | "par",
};
// Smart axis guide state (module-level)
const smartAxisGuide = {
  xActive: false,
  zActive: false,
  xVal: 0,
  zVal: 0,
};

// Reset drag state globally (called on window pointerup)
function resetDragState() {
  dragState.active = false;
  dragState.elementId = "";
}

// Measure tool state (module-level)
let measureStart: [number, number, number] | null = null;
// Dimension tool state (module-level)
let dimensionStart: [number, number, number] | null = null;
// Snap type for indicator
let currentSnapType:
  | "endpoint"
  | "midpoint"
  | "grid"
  | "perp"
  | "par"
  | "edge"
  | null = null;
// Suppress box selection when clicking on an element
let suppressBoxSelect = false;

function snapToGrid(v: number, step = 0.5): number {
  return Math.round(v / step) * step;
}

function snapToElement(
  x: number,
  z: number,
  elements: FrameElement[],
  threshold = 0.8,
): {
  x: number;
  z: number;
  snapped: boolean;
  snapType: "endpoint" | "midpoint" | null;
} {
  let best: { x: number; z: number; dist: number; isMidpoint: boolean } | null =
    null;

  for (const el of elements) {
    const cx = el.position.x;
    const cz = el.position.z;

    const dcx = cx - x;
    const dcz = cz - z;
    const cdist = Math.sqrt(dcx * dcx + dcz * dcz);
    if (cdist < threshold && (!best || cdist < best.dist)) {
      best = { x: cx, z: cz, dist: cdist, isMidpoint: false };
    }

    if (
      (el.type === "wall" || el.type === "beam") &&
      el.rotation !== undefined
    ) {
      const rot = el.rotation;
      const halfLen = (el.dimensions.width || 1) / 2;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      const ep1 = { x: cx + halfLen * cosR, z: cz - halfLen * sinR };
      const ep2 = { x: cx - halfLen * cosR, z: cz + halfLen * sinR };

      for (const pt of [ep1, ep2]) {
        const dpx = pt.x - x;
        const dpz = pt.z - z;
        const dpDist = Math.sqrt(dpx * dpx + dpz * dpz);
        if (dpDist < threshold && (!best || dpDist < best.dist)) {
          best = { x: pt.x, z: pt.z, dist: dpDist, isMidpoint: false };
        }
      }

      const dmx = cx - x;
      const dmz = cz - z;
      const mdist = Math.sqrt(dmx * dmx + dmz * dmz);
      if (mdist < threshold && (!best || mdist < best.dist)) {
        best = { x: cx, z: cz, dist: mdist, isMidpoint: true };
      }
    }
  }

  if (best)
    return {
      x: best.x,
      z: best.z,
      snapped: true,
      snapType: best.isMidpoint ? "midpoint" : "endpoint",
    };
  return { x, z, snapped: false, snapType: null };
}

/** Snap to the nearest point on any element's bounding box edges */
function snapToEdge(
  x: number,
  z: number,
  elements: FrameElement[],
  threshold = 0.5,
): { x: number; z: number; snapped: boolean } {
  let bestDist = threshold;
  let bestX = x;
  let bestZ = z;
  let snapped = false;

  for (const el of elements) {
    const cx = el.position.x;
    const cz = el.position.z;
    const hw = (el.dimensions?.width ?? 1) / 2;
    const hd = (el.dimensions?.depth ?? 1) / 2;

    // 4 edges of bounding box (in local space, then rotated)
    const rot = el.rotation ?? 0;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    // corners in world space
    const corners = [
      { x: cx + hw * cosR - hd * -sinR, z: cz + hw * -sinR + hd * -cosR },
      { x: cx - hw * cosR - hd * -sinR, z: cz - hw * -sinR + hd * -cosR },
      { x: cx - hw * cosR + hd * -sinR, z: cz - hw * -sinR - hd * -cosR },
      { x: cx + hw * cosR + hd * -sinR, z: cz + hw * -sinR - hd * -cosR },
    ];

    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      // closest point on segment ab to (x,z)
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const len2 = abx * abx + abz * abz;
      if (len2 < 0.0001) continue;
      const t = Math.max(
        0,
        Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / len2),
      );
      const px = a.x + t * abx;
      const pz = a.z + t * abz;
      const dx = px - x;
      const dz = pz - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < bestDist) {
        bestDist = dist;
        bestX = px;
        bestZ = pz;
        snapped = true;
      }
    }
  }

  return { x: bestX, z: bestZ, snapped };
}

/** Check if current drawing direction is within threshold degrees of perp/par to existing walls/beams */
function checkPerpParSnap(
  startX: number,
  startZ: number,
  curX: number,
  curZ: number,
  elements: FrameElement[],
  thresholdDeg = 5,
): {
  snapped: boolean;
  x: number;
  z: number;
  type: "perp" | "par";
  guidePt1: [number, number, number];
  guidePt2: [number, number, number];
} | null {
  const dx = curX - startX;
  const dz = curZ - startZ;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.3) return null;

  const currentAngle = Math.atan2(dz, dx);
  const thresh = (thresholdDeg * Math.PI) / 180;

  for (const el of elements) {
    if (el.type !== "wall" && el.type !== "beam") continue;
    const elAngle = el.rotation ?? 0;

    // Normalize angles for comparison
    const anglesToCheck: Array<{ angle: number; type: "par" | "perp" }> = [
      { angle: elAngle, type: "par" },
      { angle: elAngle + Math.PI, type: "par" },
      { angle: elAngle + Math.PI / 2, type: "perp" },
      { angle: elAngle - Math.PI / 2, type: "perp" },
    ];

    for (const { angle, type } of anglesToCheck) {
      let diff = Math.abs(currentAngle - angle);
      // Normalize to [0, PI]
      while (diff > Math.PI) diff -= 2 * Math.PI;
      diff = Math.abs(diff);

      if (diff < thresh) {
        // Snap to this angle
        const snappedX = startX + len * Math.cos(angle);
        const snappedZ = startZ + len * Math.sin(angle);
        // Guide line extends 20m in both directions
        const guidePt1: [number, number, number] = [
          startX - 20 * Math.cos(angle),
          0.05,
          startZ - 20 * Math.sin(angle),
        ];
        const guidePt2: [number, number, number] = [
          startX + 20 * Math.cos(angle),
          0.05,
          startZ + 20 * Math.sin(angle),
        ];
        return {
          snapped: true,
          x: snappedX,
          z: snappedZ,
          type,
          guidePt1,
          guidePt2,
        };
      }
    }
  }
  return null;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

const SINGLE_CLICK_TOOLS = new Set([
  "column",
  "door",
  "window",
  "foundation",
  "equipment",
  "diffuser",
  "fixture",
  "floor",
  "room",
]);
const TWO_CLICK_TOOLS = new Set([
  "wall",
  "beam",
  "slab",
  "duct",
  "pipe",
  "cabletray",
]);

function getElementGeometry(
  type: string,
  dims: { width: number; height: number; depth: number },
): [number, number, number] {
  switch (type) {
    case "wall":
      return [dims.width, dims.height || 3, dims.depth || 0.2];
    case "floor":
    case "slab":
      return [dims.width || 4, dims.height || 0.2, dims.depth || 4];
    case "door":
      return [0.9, 2.1, 0.15];
    case "window":
      return [1.2, 1.0, 0.1];
    case "column":
      return [0.3, 3, 0.3];
    case "beam":
      return [dims.width || 4, 0.3, 0.3];
    case "duct":
      return [dims.width || 4, 0.4, 0.4];
    case "pipe":
      return [dims.width || 4, 0.2, 0.2];
    case "equipment":
      return [1, 1, 1];
    case "foundation":
      return [1.5, 0.5, 1.5];
    case "room":
      return [5, 0.1, 5];
    default:
      return [dims.width || 1, dims.height || 1, dims.depth || 1];
  }
}

function getMaterialColor(
  el: FrameElement,
  selected: boolean,
  hovered: boolean,
  analysisMode: boolean,
): string {
  if (selected) return "#3b82f6";
  if (hovered) return "#93c5fd";
  if (analysisMode && el.utilizationRatio !== undefined) {
    const u = el.utilizationRatio;
    if (u > 1.0) return "#ef4444";
    if (u > 0.7) return "#f59e0b";
    return "#22c55e";
  }
  switch (el.type) {
    case "wall":
      return "#c8b8a2";
    case "floor":
    case "slab":
      return "#b0a898";
    case "column":
      return "#8090a0";
    case "beam":
      return "#7a8a9a";
    case "door":
      return "#8b6914";
    case "window":
      return "#4da6b3";
    case "duct":
      return "#7a9a80";
    case "pipe":
      return "#b87333";
    case "equipment":
      return "#6080a0";
    default:
      return "#888888";
  }
}

function getMaterialPBR(material?: string): {
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
  transparent?: boolean;
  opacity?: number;
} {
  switch (material) {
    case "concrete":
      return {
        roughness: 0.85,
        metalness: 0.0,
        emissive: "#000000",
        emissiveIntensity: 0,
      };
    case "brick":
      return {
        roughness: 0.95,
        metalness: 0.0,
        emissive: "#200800",
        emissiveIntensity: 0.03,
      };
    case "stone":
      return {
        roughness: 0.9,
        metalness: 0.0,
        emissive: "#000000",
        emissiveIntensity: 0,
      };
    case "glass":
      return {
        roughness: 0.05,
        metalness: 0.1,
        emissive: "#a0d8ef",
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.55,
      };
    case "wood":
    case "timber":
      return {
        roughness: 0.75,
        metalness: 0.0,
        emissive: "#100800",
        emissiveIntensity: 0.02,
      };
    case "steel":
      return {
        roughness: 0.25,
        metalness: 0.85,
        emissive: "#000000",
        emissiveIntensity: 0,
      };
    case "aluminum":
      return {
        roughness: 0.3,
        metalness: 0.8,
        emissive: "#000000",
        emissiveIntensity: 0,
      };
    case "copper":
      return {
        roughness: 0.45,
        metalness: 0.75,
        emissive: "#1a0500",
        emissiveIntensity: 0.05,
      };
    case "metal":
      return {
        roughness: 0.4,
        metalness: 0.7,
        emissive: "#000000",
        emissiveIntensity: 0,
      };
    default:
      return {
        roughness: 0.8,
        metalness: 0.1,
        emissive: "#000000",
        emissiveIntensity: 0,
      };
  }
}

function BuildingElement({ el }: { el: FrameElement }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const selected = useFrameStore((s) => s.selectedElementId === el.id);
  const selectedElementIds = useFrameStore((s) => s.selectedElementIds);
  const hovered = useFrameStore((s) => s.hoveredElementId === el.id);
  const analysisComplete = useFrameStore((s) => s.analysis.complete);
  const stressOverlay = useFrameStore((s) => s.stressOverlay);
  const activeDiscipline = useFrameStore((s) => s.activeDiscipline);
  const disciplineVisibility = useFrameStore((s) => s.disciplineVisibility);
  const displayMode = useFrameStore((s) => s.displayMode);
  const sectionCutActive = useFrameStore((s) => s.sectionCutActive);
  const sectionCutHeight = useFrameStore((s) => s.sectionCutHeight);
  const setSelectedElement = useFrameStore((s) => s.setSelectedElement);
  const toggleMultiSelect = useFrameStore((s) => s.toggleMultiSelect);
  const setHoveredElement = useFrameStore((s) => s.setHoveredElement);
  const activeTool = useFrameStore((s) => s.activeTool);

  if (!disciplineVisibility[el.discipline]) return null;

  const isMultiSelected = selectedElementIds.includes(el.id);
  const isSelected = selected || isMultiSelected;

  const isOtherDiscipline =
    activeDiscipline !== el.discipline && !["", "select"].includes(activeTool);
  const pbr = getMaterialPBR(el.material);
  const isGlass = el.material === "glass";
  const glassTransparent =
    displayMode === "rendered" && isGlass && !isSelected && !hovered;
  const transparent =
    isOtherDiscipline || displayMode === "wireframe" || glassTransparent;
  const opacity = isOtherDiscipline
    ? 0.2
    : glassTransparent
      ? (pbr.opacity ?? 0.55)
      : 1;
  const roughness = displayMode === "rendered" ? pbr.roughness : 0.8;
  const metalness = displayMode === "rendered" ? pbr.metalness : 0;
  const emissive = displayMode === "rendered" ? pbr.emissive : "#000000";
  const emissiveIntensity =
    displayMode === "rendered" ? pbr.emissiveIntensity : 0;

  const color = getMaterialColor(el, isSelected, hovered, analysisComplete);

  const rotation = el.rotation ?? 0;
  const [gw, gh, gd] = getElementGeometry(el.type, el.dimensions);

  const clippingPlanes = sectionCutActive
    ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), sectionCutHeight)]
    : [];

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js R3F mesh - not a DOM element
    <mesh
      ref={meshRef}
      position={[el.position.x, el.position.y, el.position.z]}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        if (activeTool !== "select") return;
        e.stopPropagation();
        if (e.nativeEvent.shiftKey) {
          toggleMultiSelect(el.id);
        } else {
          setSelectedElement(el.id);
        }
      }}
      onPointerDown={(e) => {
        if (activeTool === "select") {
          e.stopPropagation();
          suppressBoxSelect = true;
          setTimeout(() => {
            suppressBoxSelect = false;
          }, 0);
          dragState.active = true;
          dragState.elementId = el.id;
          dragState.elementY = el.position.y;
          dragState.startX = el.position.x;
          dragState.startZ = el.position.z;
          const state = useFrameStore.getState();
          const ids = state.selectedElementIds;
          dragState.multiStartPositions = {};
          for (const elem of state.elements) {
            if (ids.includes(elem.id) || elem.id === el.id) {
              dragState.multiStartPositions[elem.id] = { ...elem.position };
            }
          }
        }
      }}
      onPointerUp={() => {
        resetDragState();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredElement(el.id);
      }}
      onPointerOut={() => setHoveredElement(null)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[gw, gh, gd]} />
      <meshStandardMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        wireframe={displayMode === "wireframe"}
        clippingPlanes={clippingPlanes}
        clipShadows
      />
      {stressOverlay.enabled &&
        stressOverlay.utilizations[el.id] !== undefined && (
          <mesh scale={[1.01, 1.01, 1.01]}>
            <boxGeometry args={[gw, gh, gd]} />
            <meshStandardMaterial
              color={
                stressOverlay.utilizations[el.id] > 0.7
                  ? "#ef4444"
                  : stressOverlay.utilizations[el.id] > 0.4
                    ? "#eab308"
                    : "#22c55e"
              }
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
        )}
    </mesh>
  );
}

function LevelPlanes() {
  const levels = useFrameStore((s) => s.levels);
  return (
    <>
      {levels
        .filter((l) => l.elevation >= 0)
        .map((level) => (
          <group key={level.id}>
            <Line
              points={[
                [-12, level.elevation / 1000, -8],
                [12, level.elevation / 1000, -8],
              ]}
              color="#3b82f6"
              lineWidth={1}
              dashed
              dashSize={0.3}
              gapSize={0.15}
              opacity={0.4}
              transparent
            />
          </group>
        ))}
    </>
  );
}

const GRID_LETTERS = ["A", "B", "C", "D"];
const GRID_NUMBERS = ["1", "2", "3"];

function GridLines() {
  return (
    <group>
      {GRID_LETTERS.map((letter, i) => (
        <Line
          key={`gl-${letter}`}
          points={[
            [-7.5 + i * 5, 0, -8],
            [-7.5 + i * 5, 0, 8],
          ]}
          color="#ef4444"
          lineWidth={0.5}
          opacity={0.3}
          transparent
        />
      ))}
      {GRID_NUMBERS.map((num, i) => (
        <Line
          key={`gn-${num}`}
          points={[
            [-12, 0, -5 + i * 5],
            [12, 0, -5 + i * 5],
          ]}
          color="#ef4444"
          lineWidth={0.5}
          opacity={0.3}
          transparent
        />
      ))}
    </group>
  );
}

function createSingleClickElement(
  tool: string,
  x: number,
  z: number,
  level: string,
  _discipline: Discipline,
): FrameElement {
  const id = newId(tool);
  switch (tool) {
    case "column":
      return {
        id,
        type: "column",
        discipline: "structure",
        name: "Column",
        level,
        position: { x, y: 1.5, z },
        dimensions: { width: 0.3, height: 3, depth: 0.3 },
        properties: {
          section: "UC 203\u00d7203\u00d760",
          material: "Concrete C30",
        },
        material: "concrete",
      };
    case "door":
      return {
        id,
        type: "door",
        discipline: "architecture",
        name: "Door",
        level,
        position: { x, y: 1.05, z },
        dimensions: { width: 0.9, height: 2.1, depth: 0.15 },
        properties: {
          width: "900 mm",
          height: "2100 mm",
          type: "Single Swing",
        },
        material: "wood",
      };
    case "window":
      return {
        id,
        type: "window",
        discipline: "architecture",
        name: "Window",
        level,
        position: { x, y: 1.5, z },
        dimensions: { width: 1.2, height: 1.0, depth: 0.1 },
        properties: {
          width: "1200 mm",
          height: "1000 mm",
          type: "Fixed Double Glazed",
        },
        material: "glass",
      };
    case "foundation":
      return {
        id,
        type: "foundation",
        discipline: "structure",
        name: "Foundation",
        level,
        position: { x, y: -0.25, z },
        dimensions: { width: 1.5, height: 0.5, depth: 1.5 },
        properties: { type: "Pad", material: "Concrete C35" },
        material: "concrete",
      };
    case "equipment":
      return {
        id,
        type: "equipment",
        discipline: "mep",
        name: "Equipment",
        level,
        position: { x, y: 0.5, z },
        dimensions: { width: 1, height: 1, depth: 1 },
        properties: { type: "AHU", capacity: "10000 m\u00b3/h" },
        material: "metal",
      };
    case "floor":
      return {
        id,
        type: "floor",
        discipline: "architecture",
        name: "Floor",
        level,
        position: { x, y: 0.1, z },
        dimensions: { width: 5, height: 0.2, depth: 5 },
        properties: { material: "Concrete C25", finish: "Screed" },
        material: "concrete",
      };
    case "room":
      return {
        id,
        type: "floor" as const,
        discipline: "architecture",
        name: "Room",
        level,
        position: { x, y: 0.05, z },
        dimensions: { width: 5, height: 0.1, depth: 5 },
        properties: { use: "Office", area: "25 m\u00b2" },
        material: "gypsum",
      };
    case "diffuser":
      return {
        id,
        type: "diffuser",
        discipline: "mep",
        name: "Diffuser",
        level,
        position: { x, y: 3.0, z },
        dimensions: { width: 0.6, height: 0.1, depth: 0.6 },
        properties: { type: "Supply", airflow: "200 L/s" },
        material: "metal",
      };
    case "fixture":
      return {
        id,
        type: "fixture",
        discipline: "mep",
        name: "Fixture",
        level,
        position: { x, y: 2.8, z },
        dimensions: { width: 0.3, height: 0.3, depth: 0.3 },
        properties: { type: "Light Fixture", wattage: "60W" },
        material: "metal",
      };
    default:
      return {
        id,
        type: tool as import("../../types/frame").ElementType,
        discipline: "architecture",
        name: tool,
        level,
        position: { x, y: 0.5, z },
        dimensions: { width: 1, height: 1, depth: 1 },
        properties: {},
        material: "concrete",
      };
  }
}

function createTwoClickElement(
  tool: string,
  start: { x: number; y: number; z: number },
  end: { x: number; y: number; z: number },
  level: string,
  discipline: Discipline,
): FrameElement {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz) || 0.1;
  const midX = (start.x + end.x) / 2;
  const midZ = (start.z + end.z) / 2;
  const rot = Math.atan2(-dz, dx);
  const id = newId(tool);

  switch (tool) {
    case "wall":
      return {
        id,
        type: "wall",
        discipline: "architecture",
        name: "Wall",
        level,
        position: { x: midX, y: 1.5, z: midZ },
        dimensions: { width: length, height: 3, depth: 0.2 },
        rotation: rot,
        properties: { thickness: "200 mm", material: "Brick", fire: "60 min" },
        material: "brick",
      };
    case "beam":
      return {
        id,
        type: "beam",
        discipline: "structure",
        name: "Beam",
        level,
        position: { x: midX, y: 3.1, z: midZ },
        dimensions: { width: length, height: 0.3, depth: 0.3 },
        rotation: rot,
        properties: { section: "IPE 300", material: "Steel S355" },
        material: "steel",
        utilizationRatio: Math.random() * 0.8 + 0.1,
      };
    case "slab":
      return {
        id,
        type: "slab",
        discipline: "structure",
        name: "Slab",
        level,
        position: { x: midX, y: 0.15, z: midZ },
        dimensions: {
          width: Math.abs(dx) || 1,
          height: 0.2,
          depth: Math.abs(dz) || 1,
        },
        properties: { thickness: "200 mm", material: "Concrete C30" },
        material: "concrete",
      };
    case "duct":
      return {
        id,
        type: "duct",
        discipline: "mep",
        name: "Duct",
        level,
        position: { x: midX, y: 3.6, z: midZ },
        dimensions: { width: length, height: 0.4, depth: 0.4 },
        rotation: rot,
        properties: {
          size: "400\u00d7400 mm",
          system: "Supply Air",
          material: "Galvanized Steel",
        },
        material: "metal",
      };
    case "pipe":
      return {
        id,
        type: "pipe",
        discipline: "mep",
        name: "Pipe",
        level,
        position: { x: midX, y: 3.6, z: midZ },
        dimensions: { width: length, height: 0.2, depth: 0.2 },
        rotation: rot,
        properties: {
          diameter: "100 mm",
          material: "Copper",
          system: "Cold Water",
        },
        material: "metal",
      };
    case "cabletray":
      return {
        id,
        type: "cable_tray",
        discipline: "mep",
        name: "Cable Tray",
        level,
        position: { x: midX, y: 3.4, z: midZ },
        dimensions: { width: length, height: 0.15, depth: 0.4 },
        rotation: rot,
        properties: { width: "400 mm", material: "Galvanized Steel" },
        material: "metal",
      };
    default:
      return {
        id,
        type: "wall",
        discipline: discipline,
        name: tool,
        level,
        position: { x: midX, y: 1.5, z: midZ },
        dimensions: { width: length, height: 3, depth: 0.2 },
        rotation: rot,
        properties: {},
        material: "concrete",
      };
  }
}

function AnnotationPins() {
  const annotations = useFrameStore((s) => s.annotations);
  return (
    <>
      {annotations.map((ann) => (
        <group
          key={ann.id}
          position={[ann.position.x, ann.position.y + 0.1, ann.position.z]}
        >
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={ann.color} />
          </mesh>
          <Html
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
            position={[0, 0.4, 0]}
          >
            <div
              style={{
                background: ann.color,
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                transform: "translateY(-100%)",
              }}
            >
              {ann.text}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

const COLLAB_USERS = [
  { name: "Alex K.", color: "#3b82f6", ox: 3, oz: 2, phase: 0 },
  { name: "Mira R.", color: "#10b981", ox: -4, oz: 3, phase: 1.8 },
  { name: "Tom L.", color: "#f97316", ox: 2, oz: -3, phase: 3.5 },
];

function CollaborationCursors() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    COLLAB_USERS.forEach((u, i) => {
      const ref = refs.current[i];
      if (!ref) return;
      ref.position.x = u.ox + Math.sin(t * 0.3 + u.phase) * 2.5;
      ref.position.z = u.oz + Math.cos(t * 0.25 + u.phase) * 2;
    });
  });
  return (
    <>
      {COLLAB_USERS.map((u, i) => (
        <group
          key={u.name}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[u.ox, 0.15, u.oz]}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial color={u.color} transparent opacity={0.85} />
          </mesh>
          <Html
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
            position={[0, 0.2, 0]}
          >
            <div
              style={{
                background: u.color,
                color: "#fff",
                fontSize: "10px",
                fontWeight: 600,
                padding: "1px 5px",
                borderRadius: "3px",
                whiteSpace: "nowrap",
                transform: "translateY(-100%)",
              }}
            >
              {u.name}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

function SectionBoxEffect() {
  const sectionBox = useFrameStore((s) => s.sectionBox);
  const { gl } = useThree();

  useEffect(() => {
    if (!sectionBox.enabled) {
      gl.clippingPlanes = [];
      return;
    }
    gl.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -sectionBox.minX),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), sectionBox.maxX),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), -sectionBox.minY),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), sectionBox.maxY),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -sectionBox.minZ),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), sectionBox.maxZ),
    ];
    return () => {
      gl.clippingPlanes = [];
    };
  }, [gl, sectionBox]);

  if (!sectionBox.enabled) return null;

  const { minX, maxX, minY, maxY, minZ, maxZ } = sectionBox;

  const corners: [number, number, number][] = [
    [minX, minY, minZ],
    [maxX, minY, minZ],
    [maxX, maxY, minZ],
    [minX, maxY, minZ],
    [minX, minY, maxZ],
    [maxX, minY, maxZ],
    [maxX, maxY, maxZ],
    [minX, maxY, maxZ],
  ];
  const edges: [[number, number, number], [number, number, number]][] = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
    [corners[4], corners[5]],
    [corners[5], corners[6]],
    [corners[6], corners[7]],
    [corners[7], corners[4]],
    [corners[0], corners[4]],
    [corners[1], corners[5]],
    [corners[2], corners[6]],
    [corners[3], corners[7]],
  ];

  return (
    <>
      {edges.map((edge, i) => (
        <Line
          // biome-ignore lint/suspicious/noArrayIndexKey: edges are static geometry
          key={i}
          points={edge}
          color="#06b6d4"
          lineWidth={1.5}
          opacity={0.7}
          transparent
        />
      ))}
    </>
  );
}

function GhostPreview() {
  const meshRef = useRef<THREE.Mesh>(null);
  const drawingState = useFrameStore((s) => s.drawingState);
  const activeTool = useFrameStore((s) => s.activeTool);

  useFrame(() => {
    if (!meshRef.current || !drawingState) return;
    const start = drawingState.startPoint;
    const end = snappedCursorPos;
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dz * dz) || 0.1;
    const midX = (start.x + end.x) / 2;
    const midZ = (start.z + end.z) / 2;
    const rot = Math.atan2(-dz, dx);

    let yPos = 1.5;
    let heightDim = 3;
    let crossSection = 0.2;
    if (activeTool === "beam") {
      yPos = 3.1;
      heightDim = 0.3;
      crossSection = 0.3;
    }
    if (activeTool === "slab") {
      yPos = 0.15;
      heightDim = 0.2;
      crossSection = Math.abs(dz) || 1;
    }
    if (activeTool === "duct") {
      yPos = 3.6;
      heightDim = 0.4;
      crossSection = 0.4;
    }
    if (activeTool === "pipe") {
      yPos = 3.6;
      heightDim = 0.2;
      crossSection = 0.2;
    }
    if (activeTool === "cabletray") {
      yPos = 3.4;
      heightDim = 0.15;
      crossSection = 0.4;
    }

    const lenForScale = activeTool === "slab" ? Math.abs(dx) || 1 : length;
    meshRef.current.position.set(midX, yPos, midZ);
    meshRef.current.scale.set(lenForScale, heightDim, crossSection);
    meshRef.current.rotation.y = activeTool === "slab" ? 0 : rot;
  });

  if (!drawingState || !TWO_CLICK_TOOLS.has(activeTool)) return null;

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3b82f6" transparent opacity={0.35} />
    </mesh>
  );
}

function StartPointMarker() {
  const drawingState = useFrameStore((s) => s.drawingState);
  if (!drawingState) return null;
  const { startPoint } = drawingState;
  return (
    <mesh position={[startPoint.x, 0.05, startPoint.z]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color="#3b82f6" />
    </mesh>
  );
}

function SnapCursorIndicator() {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const endpointRef = useRef<THREE.Mesh>(null);
  const midpointRef = useRef<THREE.Mesh>(null);
  const perpParRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.Mesh>(null);
  const activeTool = useFrameStore((s) => s.activeTool);
  const snapEnabled = useFrameStore((s) => s.snapEnabled);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(snappedCursorPos);
    groupRef.current.position.y = 0.06;
    const st = currentSnapType;
    if (sphereRef.current)
      sphereRef.current.visible = st === "grid" || st === null;
    if (endpointRef.current) endpointRef.current.visible = st === "endpoint";
    if (midpointRef.current) midpointRef.current.visible = st === "midpoint";
    if (perpParRef.current)
      perpParRef.current.visible = st === "perp" || st === "par";
    if (edgeRef.current) edgeRef.current.visible = st === "edge";
  });

  if (activeTool === "select" || !snapEnabled) return null;

  return (
    <group ref={groupRef}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      <mesh ref={endpointRef}>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      <mesh ref={midpointRef} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.15, 0.05, 0.15]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* Perp/Par: ring indicator */}
      <mesh ref={perpParRef}>
        <torusGeometry args={[0.15, 0.03, 8, 16]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      {/* Edge snap: magenta circle */}
      <mesh ref={edgeRef}>
        <torusGeometry args={[0.18, 0.04, 8, 20]} />
        <meshBasicMaterial color="#e879f9" />
      </mesh>
    </group>
  );
}

/** Renders axis-alignment smart guides (X=blue vertical, Z=green horizontal) */
function SmartGuides() {
  const [state, setState] = useState({
    xActive: false,
    zActive: false,
    xVal: 0,
    zVal: 0,
  });
  useFrame(() => {
    if (
      state.xActive !== smartAxisGuide.xActive ||
      state.zActive !== smartAxisGuide.zActive ||
      state.xVal !== smartAxisGuide.xVal ||
      state.zVal !== smartAxisGuide.zVal
    ) {
      setState({ ...smartAxisGuide });
    }
  });
  return (
    <>
      {state.xActive && (
        <Line
          points={[
            [state.xVal, 0.15, -20],
            [state.xVal, 0.15, 20],
          ]}
          color="#3b82f6"
          lineWidth={1}
          dashed
          dashSize={0.3}
          gapSize={0.15}
          opacity={0.5}
          transparent
        />
      )}
      {state.zActive && (
        <Line
          points={[
            [-20, 0.15, state.zVal],
            [20, 0.15, state.zVal],
          ]}
          color="#22c55e"
          lineWidth={1}
          dashed
          dashSize={0.3}
          gapSize={0.15}
          opacity={0.5}
          transparent
        />
      )}
    </>
  );
}

/** Renders perp/par guide lines when active */
function SnapGuideLines() {
  const [guideState, setGuideState] = useState<{
    active: boolean;
    p1: [number, number, number];
    p2: [number, number, number];
    type: "perp" | "par";
    cursorPos: [number, number, number];
  }>({
    active: false,
    p1: [0, 0, 0],
    p2: [0, 0, 0],
    type: "perp",
    cursorPos: [0, 0, 0],
  });

  useFrame(() => {
    if (
      snapGuideRef.active !== guideState.active ||
      (snapGuideRef.active &&
        (snapGuideRef.p1[0] !== guideState.p1[0] ||
          snapGuideRef.p2[0] !== guideState.p2[0]))
    ) {
      setGuideState({
        active: snapGuideRef.active,
        p1: [...snapGuideRef.p1] as [number, number, number],
        p2: [...snapGuideRef.p2] as [number, number, number],
        type: snapGuideRef.type,
        cursorPos: [snappedCursorPos.x, 0.2, snappedCursorPos.z],
      });
    }
  });

  if (!guideState.active) return null;

  const color = guideState.type === "perp" ? "#22c55e" : "#3b82f6";
  const label = guideState.type === "perp" ? "PERP" : "PAR";

  return (
    <group>
      <Line
        points={[guideState.p1, guideState.p2]}
        color={color}
        lineWidth={1.5}
        dashed
        dashSize={0.4}
        gapSize={0.2}
        opacity={0.7}
        transparent
      />
      <group position={guideState.cursorPos}>
        <Html
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            style={{
              background: color,
              color: "white",
              fontSize: "10px",
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: "3px",
              letterSpacing: "0.05em",
              transform: "translateY(-20px)",
            }}
          >
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
}

function MeasureStartMarker() {
  const activeTool = useFrameStore((s) => s.activeTool);
  if (activeTool !== "measure" || !measureStart) return null;
  return (
    <mesh position={measureStart}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color="#f59e0b" />
    </mesh>
  );
}

function GroundPlane() {
  const activeTool = useFrameStore((s) => s.activeTool);
  const drawingState = useFrameStore((s) => s.drawingState);
  const setDrawingState = useFrameStore((s) => s.setDrawingState);
  const arcDrawingState = useFrameStore((s) => s.arcDrawingState);
  const setArcDrawingState = useFrameStore((s) => s.setArcDrawingState);
  const addElement = useFrameStore((s) => s.addElement);
  const moveElement = useFrameStore((s) => s.moveElement);
  const setSelectedElement = useFrameStore((s) => s.setSelectedElement);
  const activeLevel = useFrameStore((s) => s.activeLevel);
  const activeDiscipline = useFrameStore((s) => s.activeDiscipline);
  const setCursorPos = useFrameStore((s) => s.setCursorPos);
  const addDimension = useFrameStore((s) => s.addDimension);
  const addPermanentDimension = useFrameStore((s) => s.addPermanentDimension);
  const elements = useFrameStore((s) => s.elements);
  const snapEnabled = useFrameStore((s) => s.snapEnabled);
  const frameCount = useRef(0);
  const { gl } = useThree();

  const handleClick = (e: {
    point: THREE.Vector3;
    stopPropagation: () => void;
  }) => {
    e.stopPropagation();
    if (dragState.active) {
      resetDragState();
      return;
    }
    const rawX = e.point.x;
    const rawZ = e.point.z;
    const x = snapEnabled ? snapToGrid(rawX) : rawX;
    const z = snapEnabled ? snapToGrid(rawZ) : rawZ;

    if (activeTool === "select") {
      setSelectedElement(null);
      return;
    }

    if (activeTool === "dimension") {
      if (!dimensionStart) {
        dimensionStart = [x, 0, z];
        setDrawingState({ tool: "dimension", startPoint: { x, y: 0, z } });
      } else {
        const start = dimensionStart;
        dimensionStart = null;
        setDrawingState(null);
        const dx = x - start[0];
        const dz = z - start[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        addPermanentDimension({
          id: `pdim-${Date.now()}`,
          start,
          end: [x, 0, z],
          label: `${dist.toFixed(2)} m`,
        });
      }
      return;
    }

    if (activeTool === "measure") {
      if (!measureStart) {
        measureStart = [x, 0, z];
      } else {
        const start = measureStart;
        measureStart = null;
        addDimension({
          id: `dim-${Date.now()}`,
          start,
          end: [x, 0, z],
        });
      }
      return;
    }

    if (activeTool === "annotate-pin") {
      const st = useFrameStore.getState();
      const pendingText = st.pendingAnnotationText || "Note";
      st.addAnnotation({
        id: `ann-${Date.now()}`,
        type: "pin",
        position: { x, y: 0.1, z },
        text: pendingText,
        color: "#f59e0b",
      });
      return;
    }

    // Arc wall / arc beam (three-click: start, end, bulge)
    if (activeTool === "arc-wall" || activeTool === "arc-beam") {
      const arcTool = activeTool as "arc-wall" | "arc-beam";
      if (!arcDrawingState) {
        setArcDrawingState({
          phase: "start",
          tool: arcTool,
          startPoint: [x, 0, z],
          endPoint: null,
        });
      } else if (
        arcDrawingState.phase === "start" &&
        arcDrawingState.startPoint
      ) {
        setArcDrawingState({
          ...arcDrawingState,
          phase: "end",
          endPoint: [x, 0, z],
        });
      } else if (
        arcDrawingState.phase === "end" &&
        arcDrawingState.startPoint &&
        arcDrawingState.endPoint
      ) {
        // Third click: use current point as bulge/mid control point
        const sp = arcDrawingState.startPoint;
        const ep = arcDrawingState.endPoint;
        const yPos = arcTool === "arc-wall" ? 1.5 : 3.1;
        const midPt: [number, number, number] = [x, yPos, z];
        const arcPoints: [number, number, number][] = [
          [sp[0], yPos, sp[2]],
          midPt,
          [ep[0], yPos, ep[2]],
        ];
        const id = newId(arcTool);
        addElement({
          id,
          type: arcTool,
          discipline: arcTool === "arc-wall" ? "architecture" : "structure",
          name: arcTool === "arc-wall" ? "Arc Wall" : "Arc Beam",
          level: activeLevel,
          position: { x: midPt[0], y: yPos, z: midPt[2] },
          dimensions: {
            width: 1,
            height: arcTool === "arc-wall" ? 3 : 0.3,
            depth: arcTool === "arc-wall" ? 0.2 : 0.3,
          },
          properties: { arcPoints: JSON.stringify(arcPoints) },
          material: arcTool === "arc-wall" ? "brick" : "steel",
        });
        setArcDrawingState(null);
        toast.success(
          `${arcTool === "arc-wall" ? "Arc Wall" : "Arc Beam"} placed`,
        );
      }
      return;
    }

    if (SINGLE_CLICK_TOOLS.has(activeTool)) {
      const el = createSingleClickElement(
        activeTool,
        x,
        z,
        activeLevel,
        activeDiscipline,
      );
      addElement(el);
      return;
    }

    if (TWO_CLICK_TOOLS.has(activeTool)) {
      if (!drawingState) {
        setDrawingState({ tool: activeTool, startPoint: { x, y: 0, z } });
      } else {
        const el = createTwoClickElement(
          activeTool,
          drawingState.startPoint,
          { x, y: 0, z },
          activeLevel,
          activeDiscipline,
        );
        addElement(el);
        setDrawingState(null);
        snapGuideRef.active = false;
      }
    }
  };

  const handlePointerMove = (e: {
    point: THREE.Vector3;
    nativeEvent?: PointerEvent;
  }) => {
    const rawX = e.point.x;
    const rawZ = e.point.z;
    let sx = snapEnabled ? snapToGrid(rawX) : rawX;
    let sz = snapEnabled ? snapToGrid(rawZ) : rawZ;
    let newSnapType:
      | "endpoint"
      | "midpoint"
      | "grid"
      | "perp"
      | "par"
      | "edge"
      | null = null;

    if (snapEnabled && activeTool !== "select") {
      const ep = snapToElement(rawX, rawZ, elements);
      if (ep.snapped) {
        sx = ep.x;
        sz = ep.z;
        newSnapType = ep.snapType;
      } else {
        const edgeSnap = snapToEdge(rawX, rawZ, elements);
        if (edgeSnap.snapped) {
          sx = edgeSnap.x;
          sz = edgeSnap.z;
          newSnapType = "edge";
        } else if (snapEnabled) {
          newSnapType = "grid";
        }
      }
    }

    // 45° angle constrain: if Shift held and mid-draw, snap to nearest 45°
    if (e.nativeEvent?.shiftKey && drawingState) {
      const start = drawingState.startPoint;
      const dx = sx - start.x;
      const dz = sz - start.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len > 0.01) {
        const angle = Math.atan2(dz, dx);
        const snap45 = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        sx = start.x + len * Math.cos(snap45);
        sz = start.z + len * Math.sin(snap45);
      }
    } else if (
      drawingState &&
      TWO_CLICK_TOOLS.has(activeTool) &&
      !e.nativeEvent?.shiftKey
    ) {
      // Check perpendicular/parallel snap to existing walls/beams
      const ppSnap = checkPerpParSnap(
        drawingState.startPoint.x,
        drawingState.startPoint.z,
        sx,
        sz,
        elements,
      );
      if (ppSnap) {
        sx = ppSnap.x;
        sz = ppSnap.z;
        newSnapType = ppSnap.type;
        snapGuideRef.active = true;
        snapGuideRef.p1 = ppSnap.guidePt1;
        snapGuideRef.p2 = ppSnap.guidePt2;
        snapGuideRef.type = ppSnap.type;
      } else {
        snapGuideRef.active = false;
      }
    } else {
      snapGuideRef.active = false;
    }

    currentSnapType = newSnapType;
    // Smart axis guides: snap to X or Z of nearby element endpoints
    {
      const AXIS_THRESHOLD = 0.15;
      let xSnapped = false;
      let zSnapped = false;
      let xSnapVal = sx;
      let zSnapVal = sz;
      if (!snapGuideRef.active) {
        for (const el of elements) {
          const ex = el.position.x;
          const ez = el.position.z;
          if (Math.abs(ex - sx) < AXIS_THRESHOLD && !xSnapped) {
            xSnapVal = ex;
            xSnapped = true;
          }
          if (Math.abs(ez - sz) < AXIS_THRESHOLD && !zSnapped) {
            zSnapVal = ez;
            zSnapped = true;
          }
        }
        if (xSnapped) sx = xSnapVal;
        if (zSnapped) sz = zSnapVal;
      }
      smartAxisGuide.xActive = xSnapped;
      smartAxisGuide.zActive = zSnapped;
      smartAxisGuide.xVal = xSnapVal;
      smartAxisGuide.zVal = zSnapVal;
    }
    cursorWorldPos.set(e.point.x, e.point.y, e.point.z);
    snappedCursorPos.set(sx, 0, sz);
    frameCount.current++;
    if (frameCount.current % 4 === 0) {
      setCursorPos(sx, sz);
      useFrameStore.getState().setSnapType(newSnapType);
    }

    if (dragState.active && dragState.elementId) {
      const state = useFrameStore.getState();
      const multiIds = state.selectedElementIds;

      if (multiIds.length > 1) {
        const offsetX = sx - dragState.startX;
        const offsetZ = sz - dragState.startZ;
        for (const [eid, startPos] of Object.entries(
          dragState.multiStartPositions,
        )) {
          moveElement(eid, {
            x: startPos.x + offsetX,
            y: startPos.y,
            z: startPos.z + offsetZ,
          });
        }
      } else {
        moveElement(dragState.elementId, {
          x: sx,
          y: dragState.elementY,
          z: sz,
        });
      }
    }

    if (activeTool !== "select") {
      gl.domElement.style.cursor = "crosshair";
    } else {
      gl.domElement.style.cursor = dragState.active ? "grabbing" : "auto";
    }
  };

  const handlePointerUp = () => {
    resetDragState();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Three.js R3F mesh - not a DOM element
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CameraPresetHandler() {
  const { camera, controls } = useThree();
  const cameraPreset = useFrameStore((s) => s.cameraPreset);
  const setCameraPreset = useFrameStore((s) => s.setCameraPreset);

  useEffect(() => {
    if (!cameraPreset) return;
    const presets: Record<
      string,
      { pos: [number, number, number]; target: [number, number, number] }
    > = {
      top: { pos: [0, 30, 0.001], target: [0, 0, 0] },
      front: { pos: [0, 5, 30], target: [0, 5, 0] },
      right: { pos: [30, 5, 0], target: [0, 5, 0] },
      "3d": { pos: [20, 20, 20], target: [0, 0, 0] },
    };
    const preset = presets[cameraPreset];
    if (!preset) {
      setCameraPreset(null);
      return;
    }
    camera.position.set(...preset.pos);
    camera.lookAt(...preset.target);
    camera.updateProjectionMatrix();
    const orbitControls = controls as any;
    if (orbitControls?.target) {
      orbitControls.target.set(...preset.target);
      orbitControls.update?.();
    }
    setCameraPreset(null);
  }, [cameraPreset, camera, controls, setCameraPreset]);

  return null;
}

function SceneOrbitControls() {
  const activeTool = useFrameStore((s) => s.activeTool);
  const isDrawingTool = activeTool !== "select";

  return (
    <OrbitControls
      makeDefault
      target={[0, 0, 0]}
      minDistance={2}
      maxDistance={80}
      enableDamping
      dampingFactor={0.08}
      enabled={!isDrawingTool}
    />
  );
}

function CameraSetup({
  viewMode,
}: { viewMode: "perspective" | "orthographic" }) {
  const { camera } = useThree();
  // biome-ignore lint/correctness/useExhaustiveDependencies: viewMode triggers re-aim
  useEffect(() => {
    camera.position.set(18, 14, 18);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, viewMode]);
  return null;
}

// Arc element component - renders arc-wall and arc-beam elements stored in the elements array
function ArcElements() {
  const elements = useFrameStore((s) => s.elements);
  const levelVisibility = useFrameStore((s) => s.levelVisibility);
  const disciplineFilters = useFrameStore((s) => s.disciplineFilters);
  const selectedElementId = useFrameStore((s) => s.selectedElementId);
  const setSelectedElement = useFrameStore((s) => s.setSelectedElement);
  const displayMode = useFrameStore((s) => s.displayMode);
  const stressOverlay = useFrameStore((s) => s.stressOverlay);

  const arcEls = elements.filter(
    (el) =>
      (el.type === "arc-wall" || el.type === "arc-beam") &&
      levelVisibility[el.level] !== false &&
      disciplineFilters[
        el.type === "arc-wall" ? "architecture" : "structure"
      ] !== false,
  );

  return (
    <>
      {arcEls.map((el) => {
        let pts: [number, number, number][] = [];
        try {
          pts = JSON.parse(el.properties.arcPoints as string);
        } catch {
          return null;
        }
        if (pts.length < 3) return null;

        const curve = new THREE.CatmullRomCurve3(
          pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
        );
        const radius = el.type === "arc-wall" ? 0.15 : 0.1;
        const tubeSegments = 30;
        const tubeGeo = new THREE.TubeGeometry(
          curve,
          tubeSegments,
          radius,
          8,
          false,
        );

        const isSelected = selectedElementId === el.id;
        const color = isSelected
          ? "#3b82f6"
          : el.type === "arc-wall"
            ? "#c8b8a2"
            : "#7a8a9a";
        const utilization = stressOverlay.enabled
          ? stressOverlay.utilizations[el.id]
          : undefined;
        const overlayColor =
          utilization !== undefined
            ? utilization > 0.7
              ? "#ef4444"
              : utilization > 0.4
                ? "#eab308"
                : "#22c55e"
            : null;

        return (
          <group key={el.id}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js R3F mesh */}
            <mesh
              geometry={tubeGeo}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(el.id);
              }}
            >
              <meshStandardMaterial
                color={color}
                wireframe={displayMode === "wireframe"}
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>
            {overlayColor && (
              <mesh geometry={tubeGeo} scale={[1.05, 1.05, 1.05]}>
                <meshStandardMaterial
                  color={overlayColor}
                  transparent
                  opacity={0.45}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}

// Arc preview - shows while user is drawing an arc
function ArcPreview() {
  const arcDrawingState = useFrameStore((s) => s.arcDrawingState);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!arcDrawingState || !meshRef.current) return;
    // Preview is handled by line component below
  });

  if (!arcDrawingState) return null;

  const { startPoint, endPoint } = arcDrawingState;
  if (!startPoint) return null;

  const cursorPos: [number, number, number] = [
    snappedCursorPos.x,
    0,
    snappedCursorPos.z,
  ];

  // Phase: start only - show start marker
  if (!endPoint) {
    return (
      <mesh position={startPoint}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
    );
  }

  // Phase: end set - show line from start to cursor as bulge point preview
  const midPoint: [number, number, number] = [
    (startPoint[0] + cursorPos[0]) / 2,
    (startPoint[1] + cursorPos[1]) / 2,
    (startPoint[2] + cursorPos[2]) / 2,
  ];

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(startPoint[0], startPoint[1], startPoint[2]),
    new THREE.Vector3(midPoint[0], midPoint[1], midPoint[2]),
    new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]),
  ]);

  const pts = curve
    .getPoints(40)
    .map((p) => [p.x, p.y, p.z] as [number, number, number]);

  return (
    <>
      <mesh position={startPoint}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={endPoint}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <Line
        points={pts}
        color="#10b981"
        lineWidth={2}
        dashed
        dashSize={0.3}
        gapSize={0.15}
        opacity={0.8}
        transparent
      />
    </>
  );
}

// Map element types to discipline filter keys
function getElementDisciplineFilter(
  type: string,
): keyof typeof DEFAULT_DISCIPLINE_FILTERS {
  const archTypes = new Set([
    "wall",
    "floor",
    "roof",
    "door",
    "window",
    "stair",
    "slab",
    "ceiling",
    "ramp",
    "room",
    "arc-wall",
  ]);
  const strTypes = new Set([
    "column",
    "beam",
    "brace",
    "footing",
    "foundation",
    "structural-wall",
    "arc-beam",
  ]);
  const mepTypes = new Set([
    "duct",
    "pipe",
    "conduit",
    "cable_tray",
    "equipment",
    "sprinkler",
    "diffuser",
    "lighting",
    "outlet",
    "fixture",
  ]);
  const mechTypes = new Set(["mechanical-equipment", "pump", "fan", "boiler"]);
  if (archTypes.has(type)) return "architecture";
  if (strTypes.has(type)) return "structure";
  if (mepTypes.has(type)) return "mep";
  if (mechTypes.has(type)) return "mechanical";
  return "architecture";
}

const DEFAULT_DISCIPLINE_FILTERS = {
  architecture: true,
  structure: true,
  mep: true,
  mechanical: true,
};

function Scene({ viewMode }: { viewMode: "perspective" | "orthographic" }) {
  const elements = useFrameStore((s) => s.elements);
  const levelVisibility = useFrameStore((s) => s.levelVisibility);
  const displayMode = useFrameStore((s) => s.displayMode);
  const disciplineFilters = useFrameStore((s) => s.disciplineFilters);

  const ambientIntensity = displayMode === "rendered" ? 0.4 : 0.6;
  const dirIntensity = displayMode === "rendered" ? 1.5 : 1.2;

  return (
    <>
      {viewMode === "orthographic" ? (
        <OrthographicCamera
          makeDefault
          zoom={30}
          position={[18, 14, 18]}
          near={0.1}
          far={500}
          up={[0, 1, 0]}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          fov={45}
          position={[18, 14, 18]}
          near={0.1}
          far={500}
          up={[0, 1, 0]}
        />
      )}

      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={dirIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} />
      {displayMode === "rendered" && (
        <pointLight position={[0, 8, 0]} intensity={0.8} color="#ffeedd" />
      )}

      <Grid
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#374151"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#4b5563"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
        position={[0, -0.01, 0]}
      />

      <GridLines />
      <LevelPlanes />

      {elements
        .filter((el) => levelVisibility[el.level] !== false)
        .filter((el) => {
          const disciplineKey = getElementDisciplineFilter(el.type);
          return disciplineFilters[disciplineKey] !== false;
        })
        .map((el) => (
          <BuildingElement key={el.id} el={el} />
        ))}

      <SmartGuides />
      <GhostPreview />
      <StartPointMarker />
      <SnapCursorIndicator />
      <SnapGuideLines />
      <MeasureStartMarker />
      <AnnotationPins />
      <CollaborationCursors />
      <SectionBoxEffect />
      <ArcElements />
      <ArcPreview />
      <GroundPlane />

      <CameraSetup viewMode={viewMode} />
      <SceneOrbitControls />
      <CameraPresetHandler />
      <Environment preset={displayMode === "rendered" ? "sunset" : "city"} />
    </>
  );
}

type ContextMenu = { x: number; y: number; targetId: string } | null;

export function Viewport3D() {
  const darkMode = useFrameStore((s) => s.darkMode);
  const viewMode = useFrameStore((s) => s.viewMode);
  const activeTool = useFrameStore((s) => s.activeTool);
  const stressOverlay = useFrameStore((s) => s.stressOverlay);
  const selectedElementId = useFrameStore((s) => s.selectedElementId);
  const elements = useFrameStore((s) => s.elements);
  const levels = useFrameStore((s) => s.levels);
  const deleteSelectedElement = useFrameStore((s) => s.deleteSelectedElement);
  const clearMultiSelect = useFrameStore((s) => s.clearMultiSelect);
  const toggleMultiSelect = useFrameStore((s) => s.toggleMultiSelect);
  const addElement = useFrameStore((s) => s.addElement);
  const updateElement = useFrameStore((s) => s.updateElement);
  const isDrawing = activeTool !== "select";

  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxRect, setBoxRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const boxStartRef = useRef<{
    px: number;
    py: number;
    wx: number;
    wz: number;
  } | null>(null);

  useEffect(() => {
    const onWindowPointerUp = () => resetDragState();
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => window.removeEventListener("pointerup", onWindowPointerUp);
  }, []);

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    if (activeTool !== "select") return;
    if (suppressBoxSelect) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    boxStartRef.current = {
      px: e.clientX,
      py: e.clientY,
      wx: snappedCursorPos.x,
      wz: snappedCursorPos.z,
    };
    setBoxRect(null);
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (!boxStartRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - boxStartRef.current.px;
    const dy = e.clientY - boxStartRef.current.py;
    const left = (dx >= 0 ? boxStartRef.current.px : e.clientX) - rect.left;
    const top = (dy >= 0 ? boxStartRef.current.py : e.clientY) - rect.top;
    setBoxRect({ left, top, width: Math.abs(dx), height: Math.abs(dy) });
  };

  const handleContainerPointerUp = () => {
    if (!boxStartRef.current) return;
    const start = boxStartRef.current;
    boxStartRef.current = null;
    if (boxRect && (boxRect.width > 5 || boxRect.height > 5)) {
      const endWx = snappedCursorPos.x;
      const endWz = snappedCursorPos.z;
      const minX = Math.min(start.wx, endWx);
      const maxX = Math.max(start.wx, endWx);
      const minZ = Math.min(start.wz, endWz);
      const maxZ = Math.max(start.wz, endWz);
      clearMultiSelect();
      const { elements: els } = useFrameStore.getState();
      for (const el of els) {
        if (
          el.position.x >= minX &&
          el.position.x <= maxX &&
          el.position.z >= minZ &&
          el.position.z <= maxZ
        ) {
          toggleMultiSelect(el.id);
        }
      }
    }
    setBoxRect(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!selectedElementId) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      targetId: selectedElementId,
    });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  const handleDuplicate = () => {
    if (!contextMenu) return;
    const el = elements.find((e) => e.id === contextMenu.targetId);
    if (!el) return;
    addElement({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      position: {
        x: el.position.x + 1,
        y: el.position.y,
        z: el.position.z + 1,
      },
      name: `${el.name} (copy)`,
    });
    setContextMenu(null);
  };

  const handleIsolate = () => {
    if (!contextMenu) return;
    if (isolatedId === contextMenu.targetId) {
      setIsolatedId(null);
    } else {
      setIsolatedId(contextMenu.targetId);
    }
    setContextMenu(null);
  };

  const handleDelete = () => {
    deleteSelectedElement();
    setContextMenu(null);
  };

  const handleMoveToLevel = (levelId: string) => {
    if (!contextMenu) return;
    updateElement(contextMenu.targetId, { level: levelId });
    setContextMenu(null);
  };

  // --- Touch support ---
  const pinchStartDistRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTouchPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Long-press: show context menu after 600ms on single finger hold
      const touch = e.touches[0];
      longPressTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
      longPressTimerRef.current = setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        const pos = longPressTouchPosRef.current;
        if (!rect || !pos || !selectedElementId) return;
        setContextMenu({
          x: pos.x - rect.left,
          y: pos.y - rect.top,
          targetId: selectedElementId,
        });
      }, 600);
    } else if (e.touches.length === 2) {
      // Cancel long-press on two-finger
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long-press if finger moved more than 10px
    if (e.touches.length === 1 && longPressTouchPosRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - longPressTouchPosRef.current.x;
      const dy = touch.clientY - longPressTouchPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Pinch scale handled by OrbitControls touch events natively
      pinchStartDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchPosRef.current = null;
    pinchStartDistRef.current = null;
  };

  const isTouchDevice = useIsTouchDevice();
  const menuDark = darkMode
    ? "bg-[#1a1f2e] border-white/10 text-gray-200"
    : "bg-white border-gray-200 text-gray-800";
  const menuItemRowCls = isTouchDevice
    ? "py-3 min-h-[48px] text-sm"
    : "py-1.5 text-xs";
  const menuItemCls = darkMode
    ? `px-3 ${menuItemRowCls} cursor-pointer hover:bg-white/8 flex items-center gap-2`
    : `px-3 ${menuItemRowCls} cursor-pointer hover:bg-gray-100 flex items-center gap-2`;
  const menuDivider = darkMode ? "border-white/8" : "border-gray-200";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ cursor: isDrawing ? "crosshair" : "auto", touchAction: "none" }}
      onContextMenu={handleContextMenu}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Box selection overlay */}
      {boxRect && (
        <div
          style={{
            position: "absolute",
            left: boxRect.left,
            top: boxRect.top,
            width: boxRect.width,
            height: boxRect.height,
            border: "1.5px dashed #3b82f6",
            background: "rgba(59,130,246,0.08)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}
      <Canvas
        shadows
        gl={{ antialias: true, localClippingEnabled: true }}
        style={{ background: darkMode ? "#111827" : "#e5e7eb" }}
      >
        <Scene viewMode={viewMode} />
      </Canvas>

      {/* Stress overlay legend */}
      {stressOverlay.enabled && (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "12px",
            zIndex: 10,
            background: darkMode
              ? "rgba(17,24,39,0.9)"
              : "rgba(255,255,255,0.92)",
            border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: "6px",
            padding: "8px 10px",
            fontSize: "10px",
            color: darkMode ? "#9ca3af" : "#6b7280",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "6px",
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Stress Utilization
          </div>
          {[
            { color: "#22c55e", label: "Low (<40%)" },
            { color: "#eab308", label: "Moderate (40–70%)" },
            { color: "#ef4444", label: "High (>70%)" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "3px",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Isolation banner */}
      {isolatedId && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 z-10">
          <span>Isolating 1 element</span>
          <button
            type="button"
            onClick={() => setIsolatedId(null)}
            className="underline hover:no-underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: context menu handled by window click
        <div
          data-ocid="viewport.context_menu.popover"
          className={`absolute z-50 min-w-[160px] rounded border shadow-xl overflow-hidden ${menuDark}`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-ocid="viewport.context_menu.duplicate.button"
            className={`${menuItemCls} w-full text-left`}
            onClick={handleDuplicate}
          >
            <span>&#8853;</span> Duplicate
          </button>
          <button
            type="button"
            data-ocid="viewport.context_menu.isolate.button"
            className={`${menuItemCls} w-full text-left`}
            onClick={handleIsolate}
          >
            <span>&#9678;</span>
            {isolatedId === contextMenu.targetId ? "Show All" : "Isolate"}
          </button>

          <div className={`border-t ${menuDivider}`}>
            <div
              className={`px-3 py-1 text-[9px] uppercase tracking-widest ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Move to Level
            </div>
            {levels.map((lv) => (
              <button
                key={lv.id}
                type="button"
                data-ocid="viewport.context_menu.move_level.button"
                className={`${menuItemCls} w-full text-left pl-5`}
                onClick={() => handleMoveToLevel(lv.id)}
              >
                {lv.name}
              </button>
            ))}
          </div>

          <div className={`border-t ${menuDivider}`}>
            <button
              type="button"
              data-ocid="viewport.context_menu.delete.button"
              className={`${menuItemCls} w-full text-left text-red-400 hover:bg-red-500/10`}
              onClick={handleDelete}
            >
              <span>&#x2715;</span> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
