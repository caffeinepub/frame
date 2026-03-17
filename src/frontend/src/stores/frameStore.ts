import { create } from "zustand";
import {
  LEVELS,
  SAMPLE_CLASHES,
  SAMPLE_COMMENTS,
  SAMPLE_ELEMENTS,
  SAMPLE_SNAPSHOTS,
} from "../data/sampleData";
import type {
  ArcDrawingState,
  ClashRecord,
  CommentRecord,
  Discipline,
  FrameAnnotation,
  FrameElement,
  Level,
  PermanentDimension,
  SectionBox,
  Snapshot,
} from "../types/frame";

export interface ActivityEntry {
  id: string;
  type: "add" | "delete" | "move" | "note";
  label: string;
  time: string;
  user: string;
}

interface AnalysisState {
  running: boolean;
  complete: boolean;
  maxDeflection: string;
  criticalMember: string;
  criticalRatio: number;
  failCount: number;
  warnCount: number;
}

export interface DimensionRecord {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
}

export interface ElementGroup {
  id: string;
  name: string;
  elementIds: string[];
  locked: boolean;
  visible: boolean;
  color: string;
}

const GROUP_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface FrameStore {
  // Discipline
  activeDiscipline: Discipline;
  setActiveDiscipline: (d: Discipline) => void;

  // Tools
  activeTool: string;
  setActiveTool: (t: string) => void;

  // Selection
  selectedElementId: string | null;
  hoveredElementId: string | null;
  setSelectedElement: (id: string | null) => void;
  setHoveredElement: (id: string | null) => void;

  // Multi-selection
  selectedElementIds: string[];
  toggleMultiSelect: (id: string) => void;
  clearMultiSelect: () => void;

  // Elements
  elements: FrameElement[];
  addElement: (el: FrameElement) => void;
  deleteSelectedElement: () => void;
  moveElement: (
    id: string,
    position: { x: number; y: number; z: number },
  ) => void;
  updateElement: (id: string, patch: Partial<FrameElement>) => void;

  // Undo / Redo
  elementHistory: FrameElement[][];
  redoStack: FrameElement[][];
  undo: () => void;
  redo: () => void;

  // Level
  activeLevel: string;
  setActiveLevel: (l: string) => void;
  levels: Level[];

  // Level visibility
  levelVisibility: Record<string, boolean>;
  toggleLevelVisibility: (id: string) => void;

  // Clashes
  clashes: ClashRecord[];
  resolveClash: (id: string) => void;

  // Comments
  comments: CommentRecord[];
  addComment: (elementId: string, text: string) => void;
  resolveComment: (id: string) => void;

  // Snapshots / version history
  snapshots: Snapshot[];
  saveSnapshot: (name: string) => void;
  restoreSnapshot: (id: string) => void;

  // Units
  units: "m" | "ft";
  setUnits: (u: "m" | "ft") => void;

  // Camera preset
  cameraPreset: string | null;
  setCameraPreset: (p: string | null) => void;

  // Panels
  showVersionHistory: boolean;
  setShowVersionHistory: (v: boolean) => void;
  showComments: boolean;
  setShowComments: (v: boolean) => void;
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
  showProjectBrowser: boolean;
  setShowProjectBrowser: (v: boolean) => void;
  showSheets: boolean;
  setShowSheets: (v: boolean) => void;
  showLayers: boolean;
  setShowLayers: (v: boolean) => void;
  showCollaboration: boolean;
  setShowCollaboration: (v: boolean) => void;

  // Command palette
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Active view (3d or documentation)
  activeView: "3d" | "documentation";
  setActiveView: (v: "3d" | "documentation") => void;

  // Doc level
  docLevel: string;
  setDocLevel: (id: string) => void;

  // View
  viewMode: "perspective" | "orthographic";
  toggleViewMode: () => void;
  disciplineVisibility: Record<Discipline, boolean>;
  toggleDisciplineVisibility: (d: Discipline) => void;

  // Display mode
  displayMode: "wireframe" | "shaded" | "rendered";
  setDisplayMode: (m: "wireframe" | "shaded" | "rendered") => void;

  // Drawing state (two-click tools)
  drawingState: null | {
    tool: string;
    startPoint: { x: number; y: number; z: number };
  };
  setDrawingState: (
    s: null | { tool: string; startPoint: { x: number; y: number; z: number } },
  ) => void;

  // Arc drawing state (three-click tools)
  arcDrawingState: ArcDrawingState | null;
  setArcDrawingState: (s: ArcDrawingState | null) => void;

  // Analysis
  analysis: AnalysisState;
  runAnalysis: () => void;

  // Stress overlay
  stressOverlay: { enabled: boolean; utilizations: Record<string, number> };
  setStressOverlay: (overlay: {
    enabled: boolean;
    utilizations: Record<string, number>;
  }) => void;

  // Discipline filters (for quick viewport filtering)
  disciplineFilters: {
    architecture: boolean;
    structure: boolean;
    mep: boolean;
    mechanical: boolean;
  };
  setDisciplineFilter: (
    discipline: keyof FrameStore["disciplineFilters"],
    value: boolean,
  ) => void;

  // Zoom
  zoom: number;
  setZoom: (z: number) => void;

  // Cursor position
  cursorPos: { x: number; z: number };
  setCursorPos: (x: number, z: number) => void;

  // Snap type
  snapType: string | null;
  setSnapType: (t: string | null) => void;

  // Dimensions (measure tool)
  dimensions: DimensionRecord[];
  addDimension: (d: DimensionRecord) => void;
  clearDimensions: () => void;

  // Permanent dimensions (dimension tool annotations)
  permanentDimensions: PermanentDimension[];
  addPermanentDimension: (d: PermanentDimension) => void;
  clearPermanentDimensions: () => void;

  // Section cut
  sectionCutActive: boolean;
  sectionCutHeight: number;
  setSectionCutHeight: (h: number) => void;
  setSectionCutActive: (v: boolean) => void;

  // Level management
  addLevel: (name: string) => void;
  deleteLevel: (id: string) => void;

  // Snap
  snapEnabled: boolean;
  toggleSnap: () => void;

  // Activity log
  activityLog: ActivityEntry[];
  addActivityEntry: (entry: ActivityEntry) => void;

  // Groups
  groups: ElementGroup[];
  createGroup: (name: string, elementIds: string[]) => void;
  deleteGroup: (id: string) => void;
  toggleGroupLock: (id: string) => void;
  toggleGroupVisibility: (id: string) => void;
  renameGroup: (id: string, name: string) => void;
  selectGroup: (id: string) => void;

  // Annotations
  annotations: FrameAnnotation[];
  addAnnotation: (a: FrameAnnotation) => void;
  deleteAnnotation: (id: string) => void;
  pendingAnnotationText: string;
  setPendingAnnotationText: (t: string) => void;

  // Section Box
  sectionBox: SectionBox;
  setSectionBox: (patch: Partial<SectionBox>) => void;
  toggleSectionBox: () => void;
  showSectionBox: boolean;
  setShowSectionBox: (v: boolean) => void;
  // Clipboard / Copy-Paste
  clipboard: FrameElement[];
  copySelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;

  // Alignment
  alignElements: (axis: "x" | "z", mode: "min" | "center" | "max") => void;
}

export const useFrameStore = create<FrameStore>((set, get) => ({
  activeDiscipline: "architecture",
  setActiveDiscipline: (d) =>
    set({ activeDiscipline: d, activeTool: "select" }),

  activeTool: "select",
  setActiveTool: (t) => {
    const prev = get().activeTool;
    const isSectionCut = t === "section";
    const wasSectionCut = prev === "section";
    set({
      activeTool: t,
      sectionCutActive: isSectionCut
        ? true
        : wasSectionCut
          ? false
          : get().sectionCutActive,
    });
  },

  selectedElementId: null,
  hoveredElementId: null,
  setSelectedElement: (id) =>
    set({ selectedElementId: id, selectedElementIds: [] }),
  setHoveredElement: (id) => set({ hoveredElementId: id }),

  // Multi-selection
  selectedElementIds: [],
  toggleMultiSelect: (id) =>
    set((s) => {
      const existing = s.selectedElementIds.includes(id);
      return {
        selectedElementIds: existing
          ? s.selectedElementIds.filter((eid) => eid !== id)
          : [...s.selectedElementIds, id],
        selectedElementId: existing ? s.selectedElementId : id,
      };
    }),
  clearMultiSelect: () =>
    set({ selectedElementIds: [], selectedElementId: null }),

  elements: SAMPLE_ELEMENTS,
  addElement: (el) =>
    set((s) => {
      const stamped = el.level ? el : { ...el, level: s.activeLevel };
      return {
        elementHistory: [...s.elementHistory, s.elements],
        redoStack: [],
        elements: [...s.elements, stamped],
        activityLog: [
          ...s.activityLog,
          {
            id: `act-${Date.now()}`,
            type: "add" as const,
            label: `${el.type} added`,
            time: nowTime(),
            user: "You",
          },
        ],
      };
    }),
  deleteSelectedElement: () =>
    set((s) => {
      // Respect group locks
      const lockedIds = new Set<string>();
      for (const g of s.groups) {
        if (g.locked) {
          for (const eid of g.elementIds) lockedIds.add(eid);
        }
      }
      const toDelete = new Set<string>();
      if (s.selectedElementId && !lockedIds.has(s.selectedElementId))
        toDelete.add(s.selectedElementId);
      for (const id of s.selectedElementIds) {
        if (!lockedIds.has(id)) toDelete.add(id);
      }
      const count = toDelete.size;
      return {
        elementHistory: [...s.elementHistory, s.elements],
        redoStack: [],
        elements: s.elements.filter((e) => !toDelete.has(e.id)),
        selectedElementId: null,
        selectedElementIds: [],
        activityLog:
          count > 0
            ? [
                ...s.activityLog,
                {
                  id: `act-${Date.now()}`,
                  type: "delete" as const,
                  label:
                    count > 1 ? `${count} elements deleted` : "element deleted",
                  time: nowTime(),
                  user: "You",
                },
              ]
            : s.activityLog,
      };
    }),
  moveElement: (id, position) =>
    set((s) => {
      // Respect group locks
      const lockedIds = new Set<string>();
      for (const g of s.groups) {
        if (g.locked) {
          for (const eid of g.elementIds) lockedIds.add(eid);
        }
      }
      if (lockedIds.has(id)) return {};
      return {
        elements: s.elements.map((e) => (e.id === id ? { ...e, position } : e)),
        activityLog: [
          ...s.activityLog,
          {
            id: `act-${Date.now()}`,
            type: "move" as const,
            label: "element moved",
            time: nowTime(),
            user: "You",
          },
        ].slice(-50),
      };
    }),
  updateElement: (id, patch) =>
    set((s) => ({
      elementHistory: [...s.elementHistory, s.elements],
      redoStack: [],
      elements: s.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),

  // Undo / Redo
  elementHistory: [],
  redoStack: [],
  undo: () => {
    const { elementHistory, redoStack, elements } = get();
    if (elementHistory.length === 0) return;
    const prev = elementHistory[elementHistory.length - 1];
    set({
      elements: prev,
      elementHistory: elementHistory.slice(0, -1),
      redoStack: [elements, ...redoStack],
    });
  },
  redo: () => {
    const { elementHistory, redoStack, elements } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    set({
      elements: next,
      redoStack: redoStack.slice(1),
      elementHistory: [...elementHistory, elements],
    });
  },

  activeLevel: "l1",
  setActiveLevel: (l) => set({ activeLevel: l }),
  levels: LEVELS,

  levelVisibility: {},
  toggleLevelVisibility: (id) =>
    set((s) => {
      const current = s.levelVisibility[id] !== false;
      return {
        levelVisibility: { ...s.levelVisibility, [id]: !current },
      };
    }),

  clashes: SAMPLE_CLASHES,
  resolveClash: (id) =>
    set((s) => ({
      clashes: s.clashes.map((c) =>
        c.id === id ? { ...c, resolved: true } : c,
      ),
    })),

  comments: SAMPLE_COMMENTS,
  addComment: (elementId, text) =>
    set((s) => ({
      comments: [
        ...s.comments,
        {
          id: `comment-${Date.now()}`,
          elementId,
          author: "You",
          text,
          createdAt: new Date().toISOString(),
          resolved: false,
        },
      ],
    })),
  resolveComment: (id) =>
    set((s) => ({
      comments: s.comments.map((c) =>
        c.id === id ? { ...c, resolved: true } : c,
      ),
    })),

  snapshots: SAMPLE_SNAPSHOTS,
  saveSnapshot: (name) =>
    set((s) => ({
      snapshots: [
        {
          id: `snap-${Date.now()}`,
          name: name || `Version ${s.snapshots.length + 1}`,
          description: `${s.elements.length} elements`,
          author: "You",
          createdAt: new Date().toISOString(),
          elementCount: s.elements.length,
          elementSnapshot: JSON.parse(JSON.stringify(s.elements)),
          permanentDimensions: JSON.parse(
            JSON.stringify(s.permanentDimensions),
          ),
          levelsSnapshot: JSON.parse(JSON.stringify(s.levels)),
          groupsSnapshot: JSON.parse(JSON.stringify(s.groups)),
        },
        ...s.snapshots,
      ],
    })),
  restoreSnapshot: (id) =>
    set((s) => {
      const snap = s.snapshots.find((sn) => sn.id === id);
      if (!snap) return {};
      return {
        elementHistory: [...s.elementHistory, s.elements],
        redoStack: [],
        elements: snap.elementSnapshot
          ? JSON.parse(JSON.stringify(snap.elementSnapshot))
          : s.elements,
        permanentDimensions: snap.permanentDimensions
          ? JSON.parse(JSON.stringify(snap.permanentDimensions))
          : s.permanentDimensions,
        levels: snap.levelsSnapshot
          ? JSON.parse(JSON.stringify(snap.levelsSnapshot))
          : s.levels,
        groups: snap.groupsSnapshot
          ? JSON.parse(JSON.stringify(snap.groupsSnapshot))
          : s.groups,
      };
    }),

  // Units
  units: "m",
  setUnits: (u) => set({ units: u }),

  // Camera preset
  cameraPreset: null,
  setCameraPreset: (p) => set({ cameraPreset: p }),

  showVersionHistory: false,
  setShowVersionHistory: (v) => set({ showVersionHistory: v }),
  showComments: false,
  setShowComments: (v) => set({ showComments: v }),
  showShortcuts: false,
  setShowShortcuts: (v) => set({ showShortcuts: v }),
  showProjectBrowser: false,
  setShowProjectBrowser: (v) => set({ showProjectBrowser: v }),
  showSheets: false,
  setShowSheets: (v) => set({ showSheets: v }),
  showLayers: false,
  setShowLayers: (v) => set({ showLayers: v }),
  showCollaboration: false,
  setShowCollaboration: (v) => set({ showCollaboration: v }),

  showCommandPalette: false,
  setShowCommandPalette: (v) => set({ showCommandPalette: v }),

  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  activeView: "3d",
  setActiveView: (v) => set({ activeView: v }),

  docLevel: "",
  setDocLevel: (id) => set({ docLevel: id }),

  viewMode: "perspective",
  toggleViewMode: () =>
    set((s) => ({
      viewMode: s.viewMode === "perspective" ? "orthographic" : "perspective",
    })),

  disciplineVisibility: {
    architecture: true,
    structure: true,
    mep: true,
    parts: true,
  },
  toggleDisciplineVisibility: (d) =>
    set((s) => ({
      disciplineVisibility: {
        ...s.disciplineVisibility,
        [d]: !s.disciplineVisibility[d],
      },
    })),

  displayMode: "shaded",
  setDisplayMode: (m) => set({ displayMode: m }),

  drawingState: null,
  setDrawingState: (s) => set({ drawingState: s }),

  // Arc drawing state
  arcDrawingState: null,
  setArcDrawingState: (s) => set({ arcDrawingState: s }),

  analysis: {
    running: false,
    complete: false,
    maxDeflection: "",
    criticalMember: "",
    criticalRatio: 0,
    failCount: 0,
    warnCount: 0,
  },
  runAnalysis: () => {
    set({
      analysis: {
        running: true,
        complete: false,
        maxDeflection: "",
        criticalMember: "",
        criticalRatio: 0,
        failCount: 0,
        warnCount: 0,
      },
    });
    setTimeout(() => {
      set({
        analysis: {
          running: false,
          complete: true,
          maxDeflection: "12.3 mm (L/287)",
          criticalMember: "Beam B-14",
          criticalRatio: 0.94,
          failCount: 0,
          warnCount: 3,
        },
      });
    }, 2800);
  },

  // Stress overlay
  stressOverlay: { enabled: false, utilizations: {} },
  setStressOverlay: (overlay) => set({ stressOverlay: overlay }),

  // Discipline filters
  disciplineFilters: {
    architecture: true,
    structure: true,
    mep: true,
    mechanical: true,
  },
  setDisciplineFilter: (discipline, value) =>
    set((s) => ({
      disciplineFilters: { ...s.disciplineFilters, [discipline]: value },
    })),

  zoom: 100,
  setZoom: (z) => set({ zoom: z }),

  cursorPos: { x: 0, z: 0 },
  setCursorPos: (x, z) => set({ cursorPos: { x, z } }),

  snapType: null,
  setSnapType: (t) => set({ snapType: t }),

  dimensions: [],
  addDimension: (d) => set((s) => ({ dimensions: [...s.dimensions, d] })),
  clearDimensions: () => set({ dimensions: [] }),

  permanentDimensions: [],
  addPermanentDimension: (d) =>
    set((s) => ({ permanentDimensions: [...s.permanentDimensions, d] })),
  clearPermanentDimensions: () => set({ permanentDimensions: [] }),

  sectionCutActive: false,
  sectionCutHeight: 1.2,
  setSectionCutHeight: (h) => set({ sectionCutHeight: h }),
  setSectionCutActive: (v) => set({ sectionCutActive: v }),

  addLevel: (name) =>
    set((s) => {
      const maxElev = Math.max(...s.levels.map((l) => l.elevation), 0);
      return {
        levels: [
          ...s.levels,
          { id: `l-${Date.now()}`, name, elevation: maxElev + 3600 },
        ],
      };
    }),

  deleteLevel: (id) =>
    set((s) => {
      if (s.levels.length <= 1) return {};
      return {
        levels: s.levels.filter((l) => l.id !== id),
        elements: s.elements.filter((e) => e.level !== id),
        activeLevel: s.activeLevel === id ? s.levels[0].id : s.activeLevel,
      };
    }),

  snapEnabled: true,
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  activityLog: [],
  addActivityEntry: (entry) =>
    set((s) => ({ activityLog: [...s.activityLog, entry].slice(-100) })),

  // Groups
  groups: [],
  createGroup: (name, elementIds) =>
    set((s) => ({
      groups: [
        ...s.groups,
        {
          id: `grp-${Date.now()}`,
          name,
          elementIds,
          locked: false,
          visible: true,
          color: GROUP_COLORS[s.groups.length % GROUP_COLORS.length],
        },
      ],
    })),
  deleteGroup: (id) =>
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),
  toggleGroupLock: (id) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === id ? { ...g, locked: !g.locked } : g,
      ),
    })),
  toggleGroupVisibility: (id) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === id ? { ...g, visible: !g.visible } : g,
      ),
    })),
  renameGroup: (id, name) =>
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, name } : g)),
    })),
  selectGroup: (id) =>
    set((s) => {
      const grp = s.groups.find((g) => g.id === id);
      if (!grp) return {};
      return {
        selectedElementIds: grp.elementIds,
        selectedElementId: grp.elementIds[0] ?? null,
      };
    }),

  // Annotations
  annotations: [],
  addAnnotation: (a) => set((s) => ({ annotations: [...s.annotations, a] })),
  deleteAnnotation: (id) =>
    set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),
  pendingAnnotationText: "Note",
  setPendingAnnotationText: (t) => set({ pendingAnnotationText: t }),

  // Section Box
  sectionBox: {
    enabled: false,
    minX: -20,
    maxX: 20,
    minY: -5,
    maxY: 20,
    minZ: -20,
    maxZ: 20,
  },
  setSectionBox: (patch) =>
    set((s) => ({ sectionBox: { ...s.sectionBox, ...patch } })),
  toggleSectionBox: () =>
    set((s) => ({
      sectionBox: { ...s.sectionBox, enabled: !s.sectionBox.enabled },
    })),
  showSectionBox: false,
  setShowSectionBox: (v) => set({ showSectionBox: v }),
  // Clipboard
  clipboard: [],
  copySelection: () => {
    const { selectedElementId, selectedElementIds, elements } = get();
    const ids =
      selectedElementIds.length > 0
        ? selectedElementIds
        : selectedElementId
          ? [selectedElementId]
          : [];
    const copied = elements.filter((e) => ids.includes(e.id));
    set({ clipboard: JSON.parse(JSON.stringify(copied)) });
  },
  pasteClipboard: () => {
    const { clipboard, activeLevel, elements, elementHistory } = get();
    if (clipboard.length === 0) return;
    const now = Date.now();
    const newElements = clipboard.map((el, i) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `el-${now + i}-${Math.random().toString(36).slice(2)}`,
      level: activeLevel,
      position: {
        x: el.position.x + 1,
        y: el.position.y,
        z: el.position.z + 1,
      },
    }));
    set({
      elementHistory: [...elementHistory, elements],
      redoStack: [],
      elements: [...elements, ...newElements],
    });
  },
  duplicateSelection: () => {
    const { copySelection } = get();
    copySelection();
    const { activeLevel, elements, elementHistory } = get();
    const freshClipboard = get().clipboard;
    if (freshClipboard.length === 0) return;
    const now = Date.now();
    const newElements = freshClipboard.map((el, i) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `el-${now + i}-${Math.random().toString(36).slice(2)}`,
      level: activeLevel,
      position: {
        x: el.position.x + 1,
        y: el.position.y,
        z: el.position.z + 1,
      },
    }));
    const newIds = newElements.map((e) => e.id);
    set({
      elementHistory: [...elementHistory, elements],
      redoStack: [],
      elements: [...elements, ...newElements],
      selectedElementIds: newIds,
      selectedElementId: newIds[0] ?? null,
    });
  },

  // Alignment
  alignElements: (axis, mode) => {
    const { selectedElementIds, elements } = get();
    if (selectedElementIds.length < 2) return;
    const selected = elements.filter((e) => selectedElementIds.includes(e.id));
    const vals = selected.map((e) =>
      axis === "x" ? e.position.x : e.position.z,
    );
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const centerVal = (minVal + maxVal) / 2;
    const target =
      mode === "min" ? minVal : mode === "max" ? maxVal : centerVal;
    set({
      elements: elements.map((e) => {
        if (!selectedElementIds.includes(e.id)) return e;
        return {
          ...e,
          position:
            axis === "x"
              ? { ...e.position, x: target }
              : { ...e.position, z: target },
        };
      }),
    });
  },
}));
