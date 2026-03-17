export type Discipline = "architecture" | "structure" | "mep" | "parts";

export type ElementType =
  | "wall"
  | "floor"
  | "roof"
  | "door"
  | "window"
  | "stair"
  | "column"
  | "beam"
  | "slab"
  | "foundation"
  | "duct"
  | "pipe"
  | "cable_tray"
  | "equipment"
  | "diffuser"
  | "fixture"
  | "part"
  | "assembly"
  | "arc-wall"
  | "arc-beam";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface FrameElement {
  id: string;
  type: ElementType;
  discipline: Discipline;
  name: string;
  level: string;
  position: Vec3;
  dimensions: { width: number; height: number; depth: number };
  rotation?: number;
  properties: Record<string, string | number | boolean>;
  material?: string;
  selected?: boolean;
  hovered?: boolean;
  analysisStatus?: "pass" | "warning" | "fail";
  utilizationRatio?: number;
}

export interface Level {
  id: string;
  name: string;
  elevation: number;
}

export interface ClashRecord {
  id: string;
  element1Id: string;
  element1Name: string;
  element2Id: string;
  element2Name: string;
  clashType: "hard" | "soft" | "workflow";
  severity: "critical" | "high" | "medium" | "low";
  location: string;
  resolved: boolean;
}

export interface CommentRecord {
  id: string;
  elementId: string;
  author: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface Snapshot {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  elementCount?: number;
  elementSnapshot?: FrameElement[];
  permanentDimensions?: Array<{
    id: string;
    start: [number, number, number];
    end: [number, number, number];
    label: string;
  }>;
  levelsSnapshot?: Level[];
  groupsSnapshot?: unknown[];
}

export interface Tool {
  id: string;
  label: string;
  shortcut: string;
  icon: string;
  group?: string;
}

export interface PermanentDimension {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  label: string;
}

export interface FrameAnnotation {
  id: string;
  type: "pin" | "cloud";
  position: { x: number; y: number; z: number };
  text: string;
  color: string;
}

export interface SectionBox {
  enabled: boolean;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ArcDrawingState {
  phase: "start" | "end" | "bulge";
  tool: "arc-wall" | "arc-beam";
  startPoint: [number, number, number] | null;
  endPoint: [number, number, number] | null;
}
