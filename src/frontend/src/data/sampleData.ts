import type {
  ClashRecord,
  CommentRecord,
  FrameElement,
  Level,
  Snapshot,
} from "../types/frame";

export const LEVELS: Level[] = [
  { id: "b1", name: "B1", elevation: -3600 },
  { id: "l1", name: "L1", elevation: 0 },
  { id: "l2", name: "L2", elevation: 3600 },
  { id: "l3", name: "L3", elevation: 7200 },
  { id: "roof", name: "Roof", elevation: 10800 },
];

// Fixed utilization ratios — no Math.random()
const UTIL_RATIOS = [
  0.42, 0.55, 0.61, 0.38, 0.48, 0.53, 0.67, 0.44, 0.58, 0.39, 0.71, 0.46, 0.52,
  0.63, 0.4, 0.57, 0.45, 0.65, 0.5, 0.43, 0.69, 0.38, 0.54, 0.6, 0.47, 0.73,
  0.41, 0.56, 0.62, 0.49, 0.66, 0.51, 0.44, 0.59, 0.75, 0.38, 0.53, 0.48, 0.7,
  0.42, 0.57, 0.64, 0.46, 0.55, 0.61, 0.39, 0.68, 0.43, 0.52, 0.58,
];

function util(idx: number): number {
  return UTIL_RATIOS[idx % UTIL_RATIOS.length];
}

function status(ratio: number): "pass" | "warning" | "fail" {
  return ratio > 0.7 ? "warning" : "pass";
}

// Column grid positions
const COL_X = [-10, -5, 0, 5, 10];
const COL_Z = [-6, 0, 6];

// ──────────────────────────────────────────────
// 1. B1 BASEMENT COLUMNS (15)
// ──────────────────────────────────────────────
const colB1: FrameElement[] = COL_X.flatMap((cx, xi) =>
  COL_Z.map((cz, zi) => {
    const idx = xi * 3 + zi;
    const r = util(idx);
    return {
      id: `col-b1-${xi}-${zi}`,
      type: "column" as const,
      discipline: "structure" as const,
      name: `Column B1-${String.fromCharCode(65 + xi)}${zi + 1}`,
      level: "b1",
      position: { x: cx, y: -1.8, z: cz },
      dimensions: { width: 0.4, height: 3.6, depth: 0.4 },
      properties: {
        section: "400×400 RC Column",
        material: "Concrete C35/45",
        baseCondition: "Fixed",
        topCondition: "Fixed",
        rebarCover: "50 mm",
        fireRating: "R120",
      },
      material: "concrete",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

// ──────────────────────────────────────────────
// 2. L1 STEEL COLUMNS (15)
// ──────────────────────────────────────────────
const colL1: FrameElement[] = COL_X.flatMap((cx, xi) =>
  COL_Z.map((cz, zi) => {
    const idx = 15 + xi * 3 + zi;
    const r = util(idx);
    return {
      id: `col-l1-${xi}-${zi}`,
      type: "column" as const,
      discipline: "structure" as const,
      name: `Column L1-${String.fromCharCode(65 + xi)}${zi + 1}`,
      level: "l1",
      position: { x: cx, y: 1.8, z: cz },
      dimensions: { width: 0.26, height: 3.6, depth: 0.26 },
      properties: {
        section: "UC 254×254×89",
        material: "Structural Steel S355",
        baseCondition: "Fixed",
        topCondition: "Pinned",
        fireProtection: "Intumescent Paint 90 min",
        loadCapacity: "1850 kN",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

// ──────────────────────────────────────────────
// 3. L2 STEEL COLUMNS (15)
// ──────────────────────────────────────────────
const colL2: FrameElement[] = COL_X.flatMap((cx, xi) =>
  COL_Z.map((cz, zi) => {
    const idx = 30 + xi * 3 + zi;
    const r = util(idx);
    return {
      id: `col-l2-${xi}-${zi}`,
      type: "column" as const,
      discipline: "structure" as const,
      name: `Column L2-${String.fromCharCode(65 + xi)}${zi + 1}`,
      level: "l2",
      position: { x: cx, y: 5.4, z: cz },
      dimensions: { width: 0.24, height: 3.6, depth: 0.24 },
      properties: {
        section: "UC 254×254×73",
        material: "Structural Steel S355",
        baseCondition: "Fixed",
        topCondition: "Pinned",
        fireProtection: "Intumescent Paint 90 min",
        loadCapacity: "1540 kN",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

// ──────────────────────────────────────────────
// 4. L3 STEEL COLUMNS (15)
// ──────────────────────────────────────────────
const colL3: FrameElement[] = COL_X.flatMap((cx, xi) =>
  COL_Z.map((cz, zi) => {
    const idx = 45 + xi * 3 + zi;
    const r = util(idx);
    return {
      id: `col-l3-${xi}-${zi}`,
      type: "column" as const,
      discipline: "structure" as const,
      name: `Column L3-${String.fromCharCode(65 + xi)}${zi + 1}`,
      level: "l3",
      position: { x: cx, y: 9.0, z: cz },
      dimensions: { width: 0.21, height: 3.6, depth: 0.21 },
      properties: {
        section: "UC 203×203×60",
        material: "Structural Steel S355",
        baseCondition: "Pinned",
        topCondition: "Pinned",
        fireProtection: "Intumescent Paint 60 min",
        loadCapacity: "1190 kN",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

// ──────────────────────────────────────────────
// 5 & 6. X-DIRECTION BEAMS L2 & L3 (12 each)
// Pairs: (-10,-5), (-5,0), (0,5), (5,10) × z: -6, 0, 6
// ──────────────────────────────────────────────
const BEAM_X_PAIRS: [number, number][] = [
  [-10, -5],
  [-5, 0],
  [0, 5],
  [5, 10],
];

const beamXL2: FrameElement[] = BEAM_X_PAIRS.flatMap(([x1, x2], pi) =>
  COL_Z.map((cz, zi) => {
    const idx = pi * 3 + zi;
    const r = util(10 + idx);
    return {
      id: `beam-x-l2-${pi}-${zi}`,
      type: "beam" as const,
      discipline: "structure" as const,
      name: `Beam X-L2-${pi + 1}${zi + 1}`,
      level: "l2",
      position: { x: (x1 + x2) / 2, y: 3.75, z: cz },
      dimensions: { width: 5, height: 0.4, depth: 0.18 },
      properties: {
        section: "UB 356×171×45",
        material: "Structural Steel S355",
        span: "5000 mm",
        camber: "10 mm",
        fireProtection: "Intumescent Paint 90 min",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

const beamXL3: FrameElement[] = BEAM_X_PAIRS.flatMap(([x1, x2], pi) =>
  COL_Z.map((cz, zi) => {
    const idx = pi * 3 + zi;
    const r = util(22 + idx);
    return {
      id: `beam-x-l3-${pi}-${zi}`,
      type: "beam" as const,
      discipline: "structure" as const,
      name: `Beam X-L3-${pi + 1}${zi + 1}`,
      level: "l3",
      position: { x: (x1 + x2) / 2, y: 7.35, z: cz },
      dimensions: { width: 5, height: 0.4, depth: 0.18 },
      properties: {
        section: "UB 356×171×45",
        material: "Structural Steel S355",
        span: "5000 mm",
        camber: "10 mm",
        fireProtection: "Intumescent Paint 60 min",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

// ──────────────────────────────────────────────
// 7 & 8. Z-DIRECTION BEAMS L2 & L3 (10 each)
// Pairs: (-6,0), (0,6) × x: -10, -5, 0, 5, 10
// ──────────────────────────────────────────────
const BEAM_Z_PAIRS: [number, number][] = [
  [-6, 0],
  [0, 6],
];

const beamZL2: FrameElement[] = COL_X.flatMap((cx, xi) =>
  BEAM_Z_PAIRS.map(([z1, z2], pi) => {
    const idx = xi * 2 + pi;
    const r = util(34 + idx);
    return {
      id: `beam-z-l2-${xi}-${pi}`,
      type: "beam" as const,
      discipline: "structure" as const,
      name: `Beam Z-L2-${xi + 1}${pi + 1}`,
      level: "l2",
      position: { x: cx, y: 3.72, z: (z1 + z2) / 2 },
      dimensions: { width: 0.18, height: 0.4, depth: 6 },
      properties: {
        section: "UB 305×165×40",
        material: "Structural Steel S355",
        span: "6000 mm",
        camber: "8 mm",
        fireProtection: "Intumescent Paint 90 min",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

const beamZL3: FrameElement[] = COL_X.flatMap((cx, xi) =>
  BEAM_Z_PAIRS.map(([z1, z2], pi) => {
    const idx = xi * 2 + pi;
    const r = util(44 + idx);
    return {
      id: `beam-z-l3-${xi}-${pi}`,
      type: "beam" as const,
      discipline: "structure" as const,
      name: `Beam Z-L3-${xi + 1}${pi + 1}`,
      level: "l3",
      position: { x: cx, y: 7.32, z: (z1 + z2) / 2 },
      dimensions: { width: 0.18, height: 0.4, depth: 6 },
      properties: {
        section: "UB 305×165×40",
        material: "Structural Steel S355",
        span: "6000 mm",
        camber: "8 mm",
        fireProtection: "Intumescent Paint 60 min",
      },
      material: "steel",
      analysisStatus: status(r),
      utilizationRatio: r,
    };
  }),
);

// ──────────────────────────────────────────────
// 9. FLOOR SLABS (5)
// ──────────────────────────────────────────────
const floorSlabs: FrameElement[] = [
  {
    id: "slab-b1",
    type: "slab",
    discipline: "structure",
    name: "Basement Slab B1",
    level: "b1",
    position: { x: 0, y: -3.6, z: 0 },
    dimensions: { width: 22, height: 0.3, depth: 14 },
    properties: {
      type: "Ground Bearing Slab 300mm",
      thickness: "300 mm",
      area: "308 m²",
      material: "Concrete C32/40",
      reinforcement: "T16 @ 200 EW",
    },
    material: "concrete",
  },
  {
    id: "slab-l1",
    type: "slab",
    discipline: "structure",
    name: "Floor Slab L1",
    level: "l1",
    position: { x: 0, y: 0, z: 0 },
    dimensions: { width: 22, height: 0.25, depth: 14 },
    properties: {
      type: "Composite Metal Deck 250mm",
      thickness: "250 mm",
      area: "308 m²",
      material: "Concrete C30/37 + ComFlor 60",
      loading: "5.0 kN/m² imposed",
    },
    material: "concrete",
  },
  {
    id: "slab-l2",
    type: "slab",
    discipline: "structure",
    name: "Floor Slab L2",
    level: "l2",
    position: { x: 0, y: 3.6, z: 0 },
    dimensions: { width: 22, height: 0.25, depth: 14 },
    properties: {
      type: "Composite Metal Deck 250mm",
      thickness: "250 mm",
      area: "308 m²",
      material: "Concrete C30/37 + ComFlor 60",
      loading: "5.0 kN/m² imposed",
    },
    material: "concrete",
  },
  {
    id: "slab-l3",
    type: "slab",
    discipline: "structure",
    name: "Floor Slab L3",
    level: "l3",
    position: { x: 0, y: 7.2, z: 0 },
    dimensions: { width: 22, height: 0.25, depth: 14 },
    properties: {
      type: "Composite Metal Deck 250mm",
      thickness: "250 mm",
      area: "308 m²",
      material: "Concrete C30/37 + ComFlor 60",
      loading: "5.0 kN/m² imposed",
    },
    material: "concrete",
  },
  {
    id: "slab-roof",
    type: "roof",
    discipline: "architecture",
    name: "Roof Slab",
    level: "roof",
    position: { x: 0, y: 10.8, z: 0 },
    dimensions: { width: 22, height: 0.2, depth: 14 },
    properties: {
      type: "Flat Roof — Inverted Warm Roof",
      thickness: "200 mm structural + 150 mm insulation",
      area: "308 m²",
      uValue: "0.18 W/m²K",
      waterproofing: "Single-ply EPDM membrane",
    },
    material: "concrete",
  },
];

// ──────────────────────────────────────────────
// 10. BASEMENT RETAINING WALLS (4)
// ──────────────────────────────────────────────
const retainingWalls: FrameElement[] = [
  {
    id: "wall-ret-n",
    type: "wall",
    discipline: "structure",
    name: "Retaining Wall North",
    level: "b1",
    position: { x: 0, y: -1.8, z: -7 },
    dimensions: { width: 22, height: 3.6, depth: 0.35 },
    properties: {
      type: "RC Retaining Wall 350mm",
      thickness: "350 mm",
      height: "3600 mm",
      material: "Concrete C35/45",
      waterproofing: "Tanking membrane type A",
      fireRating: "REI 120",
    },
    material: "concrete",
  },
  {
    id: "wall-ret-s",
    type: "wall",
    discipline: "structure",
    name: "Retaining Wall South",
    level: "b1",
    position: { x: 0, y: -1.8, z: 7 },
    dimensions: { width: 22, height: 3.6, depth: 0.35 },
    properties: {
      type: "RC Retaining Wall 350mm",
      thickness: "350 mm",
      height: "3600 mm",
      material: "Concrete C35/45",
      waterproofing: "Tanking membrane type A",
      fireRating: "REI 120",
    },
    material: "concrete",
  },
  {
    id: "wall-ret-e",
    type: "wall",
    discipline: "structure",
    name: "Retaining Wall East",
    level: "b1",
    position: { x: 11, y: -1.8, z: 0 },
    dimensions: { width: 0.35, height: 3.6, depth: 14 },
    properties: {
      type: "RC Retaining Wall 350mm",
      thickness: "350 mm",
      height: "3600 mm",
      material: "Concrete C35/45",
      waterproofing: "Tanking membrane type A",
      fireRating: "REI 120",
    },
    material: "concrete",
  },
  {
    id: "wall-ret-w",
    type: "wall",
    discipline: "structure",
    name: "Retaining Wall West",
    level: "b1",
    position: { x: -11, y: -1.8, z: 0 },
    dimensions: { width: 0.35, height: 3.6, depth: 14 },
    properties: {
      type: "RC Retaining Wall 350mm",
      thickness: "350 mm",
      height: "3600 mm",
      material: "Concrete C35/45",
      waterproofing: "Tanking membrane type A",
      fireRating: "REI 120",
    },
    material: "concrete",
  },
];

// ──────────────────────────────────────────────
// 11-13. EXTERIOR WALLS (4 per floor × 3 floors = 12)
// ──────────────────────────────────────────────
const exteriorWallConfigs = [
  {
    level: "l1" as const,
    yCenter: 1.8,
    suffix: "l1",
  },
  {
    level: "l2" as const,
    yCenter: 5.4,
    suffix: "l2",
  },
  {
    level: "l3" as const,
    yCenter: 9.0,
    suffix: "l3",
  },
];

const exteriorWalls: FrameElement[] = exteriorWallConfigs.flatMap(
  ({ level, yCenter, suffix }): FrameElement[] => [
    {
      id: `wall-n-${suffix}`,
      type: "wall" as const,
      discipline: "architecture" as const,
      name: `Curtain Wall North ${suffix.toUpperCase()}`,
      level,
      position: { x: 0, y: yCenter, z: -6 },
      dimensions: { width: 20, height: 3.6, depth: 0.2 },
      properties: {
        type: "Curtain Wall - Aluminium Unitised",
        thickness: "200 mm",
        height: "3600 mm",
        material: "Aluminium + Triple Glazing",
        uValue: "1.1 W/m²K",
        vlt: "42%",
        fireRating: "None",
        structural: false,
        locationLine: "Wall Centerline",
      },
      material: "glass",
    },
    {
      id: `wall-s-${suffix}`,
      type: "wall" as const,
      discipline: "architecture" as const,
      name: `Brick Wall South ${suffix.toUpperCase()}`,
      level,
      position: { x: 0, y: yCenter, z: 6 },
      dimensions: { width: 20, height: 3.6, depth: 0.2 },
      properties: {
        type: "Exterior - Brick + Insulation",
        thickness: "200 mm",
        height: "3600 mm",
        material: "Brick outer / Mineral wool insulation / Blockwork inner",
        uValue: "0.27 W/m²K",
        fireRating: "REI 90",
        structural: false,
        locationLine: "Wall Centerline",
      },
      material: "brick",
    },
    {
      id: `wall-e-${suffix}`,
      type: "wall" as const,
      discipline: "architecture" as const,
      name: `Concrete Wall East ${suffix.toUpperCase()}`,
      level,
      position: { x: 10, y: yCenter, z: 0 },
      dimensions: { width: 0.2, height: 3.6, depth: 12 },
      properties: {
        type: "Exterior - Concrete Panel + Rain Screen",
        thickness: "200 mm",
        height: "3600 mm",
        material: "Precast Concrete",
        uValue: "0.25 W/m²K",
        fireRating: "REI 120",
        structural: true,
      },
      material: "concrete",
    },
    {
      id: `wall-w-${suffix}`,
      type: "wall" as const,
      discipline: "architecture" as const,
      name: `Concrete Wall West ${suffix.toUpperCase()}`,
      level,
      position: { x: -10, y: yCenter, z: 0 },
      dimensions: { width: 0.2, height: 3.6, depth: 12 },
      properties: {
        type: "Exterior - Concrete Panel + Rain Screen",
        thickness: "200 mm",
        height: "3600 mm",
        material: "Precast Concrete",
        uValue: "0.25 W/m²K",
        fireRating: "REI 120",
        structural: true,
      },
      material: "concrete",
    },
  ],
);

// ──────────────────────────────────────────────
// 14. INTERIOR PARTITION WALLS (6)
// ──────────────────────────────────────────────
const interiorWalls: FrameElement[] = [
  {
    id: "wall-int-lobby",
    type: "wall",
    discipline: "architecture",
    name: "Lobby Partition L1",
    level: "l1",
    position: { x: 5, y: 1.8, z: 0 },
    dimensions: { width: 0.15, height: 3.6, depth: 8 },
    properties: {
      type: "Interior - Blockwork 150mm",
      thickness: "150 mm",
      height: "3600 mm",
      material: "Concrete Blockwork",
      fireRating: "EI 60",
      acoustic: "Rw 45 dB",
    },
    material: "concrete",
  },
  {
    id: "wall-int-core",
    type: "wall",
    discipline: "architecture",
    name: "Core Wall L1",
    level: "l1",
    position: { x: 8, y: 1.8, z: -2 },
    dimensions: { width: 0.2, height: 3.6, depth: 4 },
    properties: {
      type: "Core - Concrete Shear Wall 200mm",
      thickness: "200 mm",
      height: "3600 mm",
      material: "Concrete C30/37",
      fireRating: "REI 120",
      structural: true,
    },
    material: "concrete",
  },
  {
    id: "wall-int-corridor-l2",
    type: "wall",
    discipline: "architecture",
    name: "Glazed Corridor Spine L2",
    level: "l2",
    position: { x: 0, y: 5.4, z: 0 },
    dimensions: { width: 14, height: 1.2, depth: 0.15 },
    properties: {
      type: "Interior - Glazed Screen 150mm",
      thickness: "150 mm",
      height: "1200 mm",
      material: "Aluminium + Double Glazing",
      uValue: "1.6 W/m²K",
    },
    material: "glass",
  },
  {
    id: "wall-int-meeting-l2",
    type: "wall",
    discipline: "architecture",
    name: "Meeting Room Partition L2",
    level: "l2",
    position: { x: -7, y: 5.4, z: 3 },
    dimensions: { width: 6, height: 3.6, depth: 0.15 },
    properties: {
      type: "Interior - Glazed Partition 150mm",
      thickness: "150 mm",
      height: "3600 mm",
      material: "Aluminium + Double Glazing",
      uValue: "1.6 W/m²K",
      acoustic: "Rw 38 dB",
    },
    material: "glass",
  },
  {
    id: "wall-int-corridor-l3",
    type: "wall",
    discipline: "architecture",
    name: "Glazed Corridor Spine L3",
    level: "l3",
    position: { x: 0, y: 9.0, z: 0 },
    dimensions: { width: 14, height: 1.2, depth: 0.15 },
    properties: {
      type: "Interior - Glazed Screen 150mm",
      thickness: "150 mm",
      height: "1200 mm",
      material: "Aluminium + Double Glazing",
      uValue: "1.6 W/m²K",
    },
    material: "glass",
  },
  {
    id: "wall-int-boardroom-l3",
    type: "wall",
    discipline: "architecture",
    name: "Boardroom Partition L3",
    level: "l3",
    position: { x: -7, y: 9.0, z: 3 },
    dimensions: { width: 6, height: 3.6, depth: 0.15 },
    properties: {
      type: "Interior - Glazed Partition 150mm",
      thickness: "150 mm",
      height: "3600 mm",
      material: "Aluminium + Double Glazing",
      uValue: "1.6 W/m²K",
      acoustic: "Rw 42 dB",
    },
    material: "glass",
  },
];

// ──────────────────────────────────────────────
// 15. WINDOWS (~36)
// ──────────────────────────────────────────────
const WIN_XS = [-7.5, -2.5, 2.5, 7.5];

type WinFacadeConfig = {
  facade: "N" | "S" | "E" | "W";
  z: number;
  xs: number[];
  zFixed?: number;
  xFixed?: number;
  yByLevel: number[];
  dims: { width: number; height: number; depth: number };
};

const WIN_CONFIGS: WinFacadeConfig[] = [
  {
    facade: "N",
    z: -6.1,
    xs: WIN_XS,
    yByLevel: [2.15, 5.75, 9.35],
    dims: { width: 2.8, height: 2.2, depth: 0.12 },
  },
  {
    facade: "S",
    z: 6.1,
    xs: WIN_XS,
    yByLevel: [2.15, 5.75, 9.35],
    dims: { width: 2.8, height: 2.2, depth: 0.12 },
  },
];

const WIN_LEVELS = ["l1", "l2", "l3"] as const;

const windows: FrameElement[] = [
  // N and S facades, 4 windows per floor per facade
  ...WIN_CONFIGS.flatMap(({ facade, z, xs, yByLevel, dims }) =>
    WIN_LEVELS.flatMap((lvl, li) =>
      xs.map((wx, wi) => ({
        id: `win-${facade.toLowerCase()}-${lvl}-${wi}`,
        type: "window" as const,
        discipline: "architecture" as const,
        name: `Window ${facade}${li + 1}-${wi + 1}`,
        level: lvl,
        position: { x: wx, y: yByLevel[li], z },
        dimensions: dims,
        properties: {
          type: "Unitised Curtain Wall Panel",
          width: `${dims.width * 1000} mm`,
          height: `${dims.height * 1000} mm`,
          glazing: "Triple Low-e 6/16/6/16/6",
          uValue: "0.8 W/m²K",
          vlt: "48%",
          gValue: "0.35",
          sillHeight: "700 mm",
        },
        material: "glass",
      })),
    ),
  ),
  // E facade windows (2 per floor)
  ...WIN_LEVELS.flatMap((lvl, li) =>
    [-3, 3].map((wz, wi) => ({
      id: `win-e-${lvl}-${wi}`,
      type: "window" as const,
      discipline: "architecture" as const,
      name: `Window E${li + 1}-${wi + 1}`,
      level: lvl,
      position: { x: 10.1, y: [2.15, 5.75, 9.35][li], z: wz },
      dimensions: { width: 0.12, height: 2.0, depth: 2.4 },
      properties: {
        type: "Fixed Casement Double Glazed",
        width: "2400 mm",
        height: "2000 mm",
        glazing: "Double Low-e 6/16/6",
        uValue: "1.2 W/m²K",
        sillHeight: "900 mm",
      },
      material: "glass",
    })),
  ),
  // W facade windows (2 per floor)
  ...WIN_LEVELS.flatMap((lvl, li) =>
    [-3, 3].map((wz, wi) => ({
      id: `win-w-${lvl}-${wi}`,
      type: "window" as const,
      discipline: "architecture" as const,
      name: `Window W${li + 1}-${wi + 1}`,
      level: lvl,
      position: { x: -10.1, y: [2.15, 5.75, 9.35][li], z: wz },
      dimensions: { width: 0.12, height: 2.0, depth: 2.4 },
      properties: {
        type: "Fixed Casement Double Glazed",
        width: "2400 mm",
        height: "2000 mm",
        glazing: "Double Low-e 6/16/6",
        uValue: "1.2 W/m²K",
        sillHeight: "900 mm",
      },
      material: "glass",
    })),
  ),
];

// ──────────────────────────────────────────────
// 16. DOORS (4)
// ──────────────────────────────────────────────
const doors: FrameElement[] = [
  {
    id: "door-main-entrance",
    type: "door",
    discipline: "architecture",
    name: "Main Entrance Door",
    level: "l1",
    position: { x: 0, y: 1.5, z: -6.1 },
    dimensions: { width: 2.4, height: 3.0, depth: 0.1 },
    properties: {
      type: "Automatic Sliding Door",
      width: "2400 mm",
      height: "3000 mm",
      material: "Aluminium + Toughened Glass",
      operator: "Automatic — KONE Entreway 140S",
      fireRating: "None",
      security: "Access Control — RFID",
    },
    material: "glass",
  },
  {
    id: "door-fire-exit-l1",
    type: "door",
    discipline: "architecture",
    name: "Fire Exit Door L1",
    level: "l1",
    position: { x: 8.5, y: 1.2, z: -6.1 },
    dimensions: { width: 1.0, height: 2.4, depth: 0.1 },
    properties: {
      type: "Fire Door FD60",
      width: "1000 mm",
      height: "2400 mm",
      material: "Steel",
      fireRating: "FD60S",
      hardware: "Push bar + Self-closing",
    },
    material: "steel",
  },
  {
    id: "door-stair-l2",
    type: "door",
    discipline: "architecture",
    name: "Stair Door L2",
    level: "l2",
    position: { x: 8.5, y: 5.0, z: -6.1 },
    dimensions: { width: 1.0, height: 2.4, depth: 0.1 },
    properties: {
      type: "Fire Door FD60",
      width: "1000 mm",
      height: "2400 mm",
      material: "Steel",
      fireRating: "FD60S",
      hardware: "Push bar + Self-closing",
    },
    material: "steel",
  },
  {
    id: "door-stair-l3",
    type: "door",
    discipline: "architecture",
    name: "Stair Door L3",
    level: "l3",
    position: { x: 8.5, y: 8.6, z: -6.1 },
    dimensions: { width: 1.0, height: 2.4, depth: 0.1 },
    properties: {
      type: "Fire Door FD60",
      width: "1000 mm",
      height: "2400 mm",
      material: "Steel",
      fireRating: "FD60S",
      hardware: "Push bar + Self-closing",
    },
    material: "steel",
  },
];

// ──────────────────────────────────────────────
// 17. STAIRS (3)
// ──────────────────────────────────────────────
const stairs: FrameElement[] = [
  {
    id: "stair-b1-l1",
    type: "stair",
    discipline: "architecture",
    name: "Stair B1 to L1",
    level: "b1",
    position: { x: 8, y: -1.8, z: -4 },
    dimensions: { width: 1.5, height: 3.6, depth: 3.5 },
    properties: {
      type: "RC In-situ Stair",
      width: "1500 mm",
      rise: "180 mm",
      going: "250 mm",
      flights: "2",
      material: "Concrete C30/37",
      fireRating: "R 120",
      handrail: "Stainless steel 42mm dia",
    },
    material: "concrete",
  },
  {
    id: "stair-l1-l2",
    type: "stair",
    discipline: "architecture",
    name: "Stair L1 to L2",
    level: "l1",
    position: { x: 8, y: 1.8, z: -4 },
    dimensions: { width: 1.5, height: 3.6, depth: 3.5 },
    properties: {
      type: "Steel Stair with Concrete Treads",
      width: "1500 mm",
      rise: "175 mm",
      going: "250 mm",
      flights: "2",
      material: "Structural Steel S355 + Concrete treads",
      fireRating: "R 90",
      handrail: "Stainless steel 42mm dia",
    },
    material: "steel",
  },
  {
    id: "stair-l2-l3",
    type: "stair",
    discipline: "architecture",
    name: "Stair L2 to L3",
    level: "l2",
    position: { x: 8, y: 5.4, z: -4 },
    dimensions: { width: 1.5, height: 3.6, depth: 3.5 },
    properties: {
      type: "Steel Stair with Concrete Treads",
      width: "1500 mm",
      rise: "175 mm",
      going: "250 mm",
      flights: "2",
      material: "Structural Steel S355 + Concrete treads",
      fireRating: "R 90",
      handrail: "Stainless steel 42mm dia",
    },
    material: "steel",
  },
];

// ──────────────────────────────────────────────
// 18. MEP ELEMENTS (~15)
// ──────────────────────────────────────────────
const mepElements: FrameElement[] = [
  // L1 MEP
  {
    id: "duct-supply-l1",
    type: "duct",
    discipline: "mep",
    name: "Supply Duct Main L1",
    level: "l1",
    position: { x: 0, y: 3.1, z: 0 },
    dimensions: { width: 18, height: 0.5, depth: 0.4 },
    properties: {
      shape: "Rectangular",
      size: "500×400 mm",
      system: "Supply Air",
      material: "Galvanized Steel",
      flowRate: "4500 L/s",
      insulation: "25mm mineral wool",
    },
    material: "metal",
  },
  {
    id: "duct-return-l1",
    type: "duct",
    discipline: "mep",
    name: "Return Duct L1",
    level: "l1",
    position: { x: 0, y: 3.0, z: 3 },
    dimensions: { width: 16, height: 0.45, depth: 0.35 },
    properties: {
      shape: "Rectangular",
      size: "450×350 mm",
      system: "Return Air",
      material: "Galvanized Steel",
      flowRate: "4000 L/s",
    },
    material: "metal",
  },
  {
    id: "pipe-cw-l1",
    type: "pipe",
    discipline: "mep",
    name: "Cold Water Main L1",
    level: "l1",
    position: { x: -8, y: 3.0, z: -2 },
    dimensions: { width: 0.1, height: 0.1, depth: 10 },
    properties: {
      diameter: "100 mm",
      material: "Copper",
      system: "Domestic Cold Water",
      pressure: "3.5 bar",
      insulation: "19mm Armaflex",
    },
    material: "metal",
  },
  {
    id: "pipe-hw-l1",
    type: "pipe",
    discipline: "mep",
    name: "Hot Water Main L1",
    level: "l1",
    position: { x: -8, y: 2.85, z: -2.3 },
    dimensions: { width: 0.08, height: 0.08, depth: 10 },
    properties: {
      diameter: "80 mm",
      material: "Copper",
      system: "Domestic Hot Water",
      pressure: "3.0 bar",
      insulation: "32mm Armaflex",
      temperature: "60°C flow / 50°C return",
    },
    material: "metal",
  },
  // L2 MEP
  {
    id: "duct-supply-l2",
    type: "duct",
    discipline: "mep",
    name: "Supply Duct Main L2",
    level: "l2",
    position: { x: 0, y: 6.7, z: 0 },
    dimensions: { width: 18, height: 0.5, depth: 0.4 },
    properties: {
      shape: "Rectangular",
      size: "500×400 mm",
      system: "Supply Air",
      material: "Galvanized Steel",
      flowRate: "4500 L/s",
      insulation: "25mm mineral wool",
    },
    material: "metal",
  },
  {
    id: "duct-branch-a-l2",
    type: "duct",
    discipline: "mep",
    name: "Branch Duct A L2",
    level: "l2",
    position: { x: -5, y: 6.65, z: -3 },
    dimensions: { width: 0.3, height: 0.25, depth: 6 },
    properties: {
      shape: "Rectangular",
      size: "300×250 mm",
      system: "Supply Air Branch",
      material: "Galvanized Steel",
      flowRate: "850 L/s",
    },
    material: "metal",
  },
  {
    id: "duct-branch-b-l2",
    type: "duct",
    discipline: "mep",
    name: "Branch Duct B L2",
    level: "l2",
    position: { x: 5, y: 6.65, z: -3 },
    dimensions: { width: 0.3, height: 0.25, depth: 6 },
    properties: {
      shape: "Rectangular",
      size: "300×250 mm",
      system: "Supply Air Branch",
      material: "Galvanized Steel",
      flowRate: "850 L/s",
    },
    material: "metal",
  },
  {
    id: "pipe-sprinkler-l2",
    type: "pipe",
    discipline: "mep",
    name: "Sprinkler Main L2",
    level: "l2",
    position: { x: 0, y: 6.6, z: -4 },
    dimensions: { width: 16, height: 0.065, depth: 0.065 },
    properties: {
      diameter: "65 mm",
      material: "Black Steel",
      system: "Sprinkler — Wet Pipe",
      pressure: "6.0 bar",
    },
    material: "metal",
  },
  {
    id: "diffuser-1-l2",
    type: "diffuser",
    discipline: "mep",
    name: "Diffuser DIF-01 L2",
    level: "l2",
    position: { x: -7.5, y: 6.58, z: -3 },
    dimensions: { width: 0.6, height: 0.06, depth: 0.6 },
    properties: {
      type: "Square Face Diffuser 600×600",
      airVolume: "200 L/s",
      system: "Supply Air",
      throw: "3.5 m",
    },
    material: "metal",
  },
  {
    id: "diffuser-2-l2",
    type: "diffuser",
    discipline: "mep",
    name: "Diffuser DIF-02 L2",
    level: "l2",
    position: { x: -2.5, y: 6.58, z: -3 },
    dimensions: { width: 0.6, height: 0.06, depth: 0.6 },
    properties: {
      type: "Square Face Diffuser 600×600",
      airVolume: "200 L/s",
      system: "Supply Air",
      throw: "3.5 m",
    },
    material: "metal",
  },
  // L3 MEP
  {
    id: "duct-supply-l3",
    type: "duct",
    discipline: "mep",
    name: "Supply Duct Main L3",
    level: "l3",
    position: { x: 0, y: 10.3, z: 0 },
    dimensions: { width: 18, height: 0.4, depth: 0.35 },
    properties: {
      shape: "Rectangular",
      size: "400×350 mm",
      system: "Supply Air",
      material: "Galvanized Steel",
      flowRate: "3600 L/s",
      insulation: "25mm mineral wool",
    },
    material: "metal",
  },
  {
    id: "pipe-sprinkler-l3",
    type: "pipe",
    discipline: "mep",
    name: "Sprinkler Main L3",
    level: "l3",
    position: { x: 0, y: 10.2, z: -4 },
    dimensions: { width: 16, height: 0.065, depth: 0.065 },
    properties: {
      diameter: "65 mm",
      material: "Black Steel",
      system: "Sprinkler — Wet Pipe",
      pressure: "6.0 bar",
    },
    material: "metal",
  },
  {
    id: "cable-tray-l3",
    type: "cable_tray",
    discipline: "mep",
    name: "Cable Tray CT-01 L3",
    level: "l3",
    position: { x: -4, y: 10.25, z: 2 },
    dimensions: { width: 14, height: 0.1, depth: 0.3 },
    properties: {
      type: "Perforated Cable Tray 300mm wide",
      width: "300 mm",
      depth: "100 mm",
      material: "Hot-dip galvanized steel",
      system: "LV Power + Data",
      fill: "35%",
    },
    material: "metal",
  },
  // Roof MEP
  {
    id: "equip-ahu-01",
    type: "equipment",
    discipline: "mep",
    name: "AHU-01 Roof",
    level: "roof",
    position: { x: -5, y: 11.2, z: -2 },
    dimensions: { width: 4, height: 0.8, depth: 2.5 },
    properties: {
      type: "Air Handling Unit",
      model: "TROX X-CUBE 15000",
      airflow: "15000 m³/h",
      weight: "1850 kg",
      power: "18.5 kW",
      heatExchanger: "Rotary — 80% efficiency",
    },
    material: "metal",
  },
  {
    id: "equip-ahu-02",
    type: "equipment",
    discipline: "mep",
    name: "AHU-02 Roof",
    level: "roof",
    position: { x: 5, y: 11.2, z: -2 },
    dimensions: { width: 3, height: 0.7, depth: 2 },
    properties: {
      type: "Air Handling Unit",
      model: "TROX X-CUBE 10000",
      airflow: "10000 m³/h",
      weight: "1420 kg",
      power: "11.0 kW",
      heatExchanger: "Rotary — 80% efficiency",
    },
    material: "metal",
  },
  {
    id: "equip-cooling-tower",
    type: "equipment",
    discipline: "mep",
    name: "Cooling Tower CT-01",
    level: "roof",
    position: { x: 0, y: 11.4, z: 4 },
    dimensions: { width: 3, height: 1.0, depth: 3 },
    properties: {
      type: "Cooling Tower — Forced Draft",
      model: "Evapco AT-25",
      capacity: "250 kW",
      weight: "980 kg",
      waterFlow: "42 L/s",
      noise: "55 dB(A) at 1m",
    },
    material: "metal",
  },
];

// ──────────────────────────────────────────────
// COMBINED EXPORT
// ──────────────────────────────────────────────
export const SAMPLE_ELEMENTS: FrameElement[] = [
  ...colB1,
  ...colL1,
  ...colL2,
  ...colL3,
  ...beamXL2,
  ...beamXL3,
  ...beamZL2,
  ...beamZL3,
  ...floorSlabs,
  ...retainingWalls,
  ...exteriorWalls,
  ...interiorWalls,
  ...windows,
  ...doors,
  ...stairs,
  ...mepElements,
];

export const SAMPLE_CLASHES: ClashRecord[] = [
  {
    id: "clash-1",
    element1Id: "duct-supply-l2",
    element1Name: "Supply Duct Main L2",
    element2Id: "beam-x-l2-1-1",
    element2Name: "Beam X-L2-22",
    clashType: "hard",
    severity: "critical",
    location: "L2 — Grid C-2 (duct penetrates beam flange)",
    resolved: false,
  },
  {
    id: "clash-2",
    element1Id: "pipe-cw-l1",
    element1Name: "Cold Water Main L1",
    element2Id: "duct-return-l1",
    element2Name: "Return Duct L1",
    clashType: "soft",
    severity: "medium",
    location: "L1 — Grid A-2 (pipe too close to duct base)",
    resolved: false,
  },
  {
    id: "clash-3",
    element1Id: "cable-tray-l3",
    element1Name: "Cable Tray CT-01 L3",
    element2Id: "wall-int-corridor-l3",
    element2Name: "Glazed Corridor Spine L3",
    clashType: "hard",
    severity: "high",
    location: "L3 — Corridor spine (cable tray passes through partition)",
    resolved: false,
  },
  {
    id: "clash-4",
    element1Id: "duct-branch-a-l2",
    element1Name: "Branch Duct A L2",
    element2Id: "col-l2-0-0",
    element2Name: "Column L2-A1",
    clashType: "hard",
    severity: "high",
    location: "L2 — Grid A-1 (duct branch intersects column flange)",
    resolved: false,
  },
  {
    id: "clash-5",
    element1Id: "pipe-sprinkler-l2",
    element1Name: "Sprinkler Main L2",
    element2Id: "beam-z-l2-2-0",
    element2Name: "Beam Z-L2-31",
    clashType: "soft",
    severity: "low",
    location: "L2 — Grid C-1 (sprinkler pipe within 50mm of beam web)",
    resolved: true,
  },
  {
    id: "clash-6",
    element1Id: "duct-return-l1",
    element1Name: "Return Duct L1",
    element2Id: "col-l1-3-1",
    element2Name: "Column L1-D2",
    clashType: "workflow",
    severity: "medium",
    location: "L1 — Grid D-2 (duct route conflicts with column access)",
    resolved: false,
  },
  {
    id: "clash-7",
    element1Id: "pipe-sprinkler-l3",
    element1Name: "Sprinkler Main L3",
    element2Id: "beam-x-l3-0-0",
    element2Name: "Beam X-L3-11",
    clashType: "soft",
    severity: "low",
    location: "L3 — Grid A-1 (sprinkler pipe close to beam flange)",
    resolved: false,
  },
];

export const SAMPLE_COMMENTS: CommentRecord[] = [
  {
    id: "comment-1",
    elementId: "wall-n-l1",
    author: "Sarah K.",
    text: "Confirm structural rating for this curtain wall — need to verify wind load resistance per BS EN 1991-1-4.",
    createdAt: "2026-03-11T10:23:00Z",
    resolved: false,
  },
  {
    id: "comment-2",
    elementId: "beam-x-l2-2-1",
    author: "James T.",
    text: "Beam X-L2-32 utilization at 73% — consider upsizing to UB 406×178×54 to provide more headroom.",
    createdAt: "2026-03-10T14:05:00Z",
    resolved: false,
  },
  {
    id: "comment-3",
    elementId: "duct-supply-l2",
    author: "You",
    text: "Supply duct routing revised to avoid clash with L2 beam grid. Coordination complete — check IFC export.",
    createdAt: "2026-03-09T09:11:00Z",
    resolved: true,
  },
  {
    id: "comment-4",
    elementId: "slab-roof",
    author: "Elena M.",
    text: "Roof slab drainage falls need to be checked — minimum 1:80 fall to outlets per BB 93 guidance.",
    createdAt: "2026-03-12T16:30:00Z",
    resolved: false,
  },
  {
    id: "comment-5",
    elementId: "equip-ahu-01",
    author: "James T.",
    text: "AHU-01 access for filter maintenance — confirm 1200mm clear zone on service side per manufacturer.",
    createdAt: "2026-03-13T11:00:00Z",
    resolved: false,
  },
];

export const SAMPLE_SNAPSHOTS: Snapshot[] = [
  {
    id: "snap-1",
    name: "Permit Issue Set",
    description:
      "Final set submitted to council for permit approval — Meridian House Stage 2",
    author: "You",
    createdAt: "2026-03-10T16:00:00Z",
  },
  {
    id: "snap-2",
    name: "Structure Review Rev B",
    description:
      "Structural engineer review comments incorporated — column and beam grid confirmed",
    author: "Sarah K.",
    createdAt: "2026-03-07T11:30:00Z",
  },
  {
    id: "snap-3",
    name: "MEP Coordination v2",
    description:
      "Second round MEP coordination after clash review — 5 critical clashes resolved",
    author: "James T.",
    createdAt: "2026-03-03T15:45:00Z",
  },
  {
    id: "snap-4",
    name: "Schematic Design Approved",
    description:
      "Approved schematic design milestone — all disciplines signed off",
    author: "You",
    createdAt: "2026-02-28T09:00:00Z",
  },
  {
    id: "snap-5",
    name: "Concept Design",
    description:
      "Initial concept design — structural grid and facade strategy established",
    author: "Elena M.",
    createdAt: "2026-02-14T13:30:00Z",
  },
];

export const FEATURE_TREE = [
  { id: "ft-1", name: "Base Sketch", icon: "sketch", depth: 0, visible: true },
  {
    id: "ft-2",
    name: "Extrude 1",
    detail: "40 mm",
    icon: "extrude",
    depth: 0,
    visible: true,
  },
  {
    id: "ft-3",
    name: "Fillet 1",
    detail: "R3 mm · 4 edges",
    icon: "fillet",
    depth: 0,
    visible: true,
  },
  {
    id: "ft-4",
    name: "Cut-Extrude 1",
    detail: "Ø8 mm hole",
    icon: "cut",
    depth: 0,
    visible: true,
  },
  {
    id: "ft-5",
    name: "Pattern 1",
    detail: "Linear · 4×",
    icon: "pattern",
    depth: 0,
    visible: true,
  },
  {
    id: "ft-6",
    name: "Shell 1",
    detail: "2 mm wall",
    icon: "shell",
    depth: 0,
    visible: false,
  },
];
