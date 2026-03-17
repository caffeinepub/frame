with open('src/frontend/src/components/frame/ViewportOverlay.tsx', 'r') as f:
    content = f.read()

# 1. Add permanentDimensions to store subscriptions
content = content.replace(
    '    dimensions,\n    clearDimensions,\n    sectionCutActive,',
    '    dimensions,\n    clearDimensions,\n    permanentDimensions,\n    clearPermanentDimensions,\n    sectionCutActive,'
)

# 2. Add dimension to TWO_CLICK_TOOLS set
content = content.replace(
    'const TWO_CLICK_TOOLS = new Set([\n  "wall",\n  "beam",\n  "slab",\n  "duct",\n  "pipe",\n  "cabletray",\n]);',
    'const TWO_CLICK_TOOLS = new Set([\n  "wall",\n  "beam",\n  "slab",\n  "duct",\n  "pipe",\n  "cabletray",\n  "dimension",\n]);'
)

# 3. Add permanent dimension SVG overlay before the closing fragment
# Find the closing </> and insert before it
svg_overlay = '''
      {/* Permanent dimension annotations SVG */}
      {permanentDimensions.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
          aria-hidden="true"
        >
          {permanentDimensions.map((dim) => {
            // Top-view 2D projection: 4% of width per meter, centered at 50%
            const toSx = (wx: number) => `${50 + wx * 4}%`;
            const toSy = (wz: number) => `${50 + wz * 4}%`;
            const mx = `${50 + ((dim.start[0] + dim.end[0]) / 2) * 4}%`;
            const my = `${50 + ((dim.start[2] + dim.end[2]) / 2) * 4 - 2}%`;
            return (
              <g key={dim.id}>
                <line
                  x1={toSx(dim.start[0])}
                  y1={toSy(dim.start[2])}
                  x2={toSx(dim.end[0])}
                  y2={toSy(dim.end[2])}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="5 2"
                />
                <circle cx={toSx(dim.start[0])} cy={toSy(dim.start[2])} r="3" fill="#f59e0b" />
                <circle cx={toSx(dim.end[0])} cy={toSy(dim.end[2])} r="3" fill="#f59e0b" />
                <text
                  x={mx}
                  y={my}
                  fill="#f59e0b"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {dim.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Clear permanent dimensions button */}
      {permanentDimensions.length > 0 && (
        <div className="absolute top-14 right-3">
          <button
            type="button"
            data-ocid="viewport.perm_dims.clear.button"
            onClick={clearPermanentDimensions}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] backdrop-blur-sm transition-colors ${
              darkMode
                ? "bg-black/50 hover:bg-red-500/20 text-amber-400 hover:text-red-400 border border-white/10"
                : "bg-white/80 hover:bg-red-50 text-amber-600 hover:text-red-500 border border-gray-200"
            }`}
            title="Clear all dimension annotations"
          >
            <Trash2 size={10} />
            <span>{permanentDimensions.length} dim{permanentDimensions.length !== 1 ? "s" : ""}</span>
          </button>
        </div>
      )}
'''

# Insert before closing </>
content = content.replace(
    '\n    </>\n  );\n}',
    svg_overlay + '\n    </>\n  );\n}'
)

with open('src/frontend/src/components/frame/ViewportOverlay.tsx', 'w') as f:
    f.write(content)

print("ViewportOverlay updated")
