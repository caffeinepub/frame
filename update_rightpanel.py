with open('src/frontend/src/components/frame/RightPanel.tsx', 'r') as f:
    content = f.read()

# Replace the MATERIALS array and material section with visual swatches
old_materials = '''const MATERIALS = [
  "concrete",
  "steel",
  "glass",
  "wood",
  "metal",
  "brick",
  "timber",
  "gypsum",
];'''

new_materials = '''const MATERIAL_SWATCHES = [
  { id: "concrete", label: "Concrete", color: "#8d9fa6", category: "Masonry" },
  { id: "brick", label: "Brick", color: "#c1440e", category: "Masonry" },
  { id: "glass", label: "Glass", color: "#93c5d7", category: "Glazing" },
  { id: "wood", label: "Wood", color: "#c8a86b", category: "Timber" },
  { id: "steel", label: "Steel", color: "#7f8ea3", category: "Metal" },
  { id: "aluminum", label: "Aluminum", color: "#b0b7bf", category: "Metal" },
  { id: "stone", label: "Stone", color: "#9b9280", category: "Masonry" },
  { id: "gypsum", label: "Gypsum", color: "#e8e8e0", category: "Finish" },
  { id: "copper", label: "Copper", color: "#b87333", category: "Metal" },
  { id: "timber", label: "Timber", color: "#8B6914", category: "Timber" },
  { id: "metal", label: "Metal", color: "#9ca3af", category: "Metal" },
  { id: "paint", label: "Paint", color: "#f0f4f8", category: "Finish" },
];'''

content = content.replace(old_materials, new_materials)

# Replace the material Section in SelectedElementPanel with visual swatches
old_mat_section = '''        {/* Material */}
        <Section title="Material">
          <select
            data-ocid="properties.material.select"
            className={selectCls}
            value={el.material ?? "concrete"}
            onChange={(e) => updateElement(el.id, { material: e.target.value })}
          >
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </Section>'''

new_mat_section = '''        {/* Material */}
        <Section title="Material">
          <div className="grid grid-cols-6 gap-1 mt-1">
            {MATERIAL_SWATCHES.map((mat, idx) => (
              <button
                key={mat.id}
                type="button"
                data-ocid={`rightpanel.material.swatch.${idx + 1}`}
                onClick={() => updateElement(el.id, { material: mat.id })}
                title={`${mat.label} (${mat.category})`}
                className={`w-full aspect-square rounded-sm border-2 transition-all ${
                  (el.material ?? "concrete") === mat.id
                    ? "border-blue-400 scale-110 shadow-md shadow-blue-500/30"
                    : "border-transparent hover:border-white/30 hover:scale-105"
                }`}
                style={{ background: mat.color }}
              />
            ))}
          </div>
          <div className="text-[9px] text-gray-600 mt-1 text-center capitalize">
            {MATERIAL_SWATCHES.find((m) => m.id === (el.material ?? "concrete"))?.label ?? "Concrete"}
          </div>
        </Section>'''

content = content.replace(old_mat_section, new_mat_section)

with open('src/frontend/src/components/frame/RightPanel.tsx', 'w') as f:
    f.write(content)

print("RightPanel updated")
