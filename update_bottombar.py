import re

with open('src/frontend/src/components/frame/BottomBar.tsx', 'r') as f:
    content = f.read()

# Fix imports
content = content.replace(
    'import {\n  AlertTriangle,\n  Building2,\n  CheckCircle,\n  Loader2,\n  MousePointer2,\n} from "lucide-react";',
    'import {\n  AlertTriangle,\n  Building2,\n  CheckCircle,\n  Loader2,\n  MousePointer2,\n  Plus,\n  X,\n} from "lucide-react";'
)

# Add addLevel/deleteLevel to destructuring
content = content.replace(
    '    levels,\n    activeLevel,\n    setActiveLevel,\n    activeDiscipline,',
    '    levels,\n    activeLevel,\n    setActiveLevel,\n    addLevel,\n    deleteLevel,\n    activeDiscipline,'
)

# Replace level map with group + add/delete
old_map = '''        {levels.map((l) => (
          <button
            type="button"
            key={l.id}
            data-ocid={`bottombar.level.${l.id}.button`}
            onClick={() => setActiveLevel(l.id)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              activeLevel === l.id
                ? darkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-700"
                : darkMode
                  ? "hover:bg-white/8 hover:text-gray-300"
                  : "hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            {l.name}
          </button>
        ))}'''

new_map = '''        {levels.map((l, idx) => (
          <div key={l.id} className="relative group flex items-center">
            <button
              type="button"
              data-ocid={`bottombar.level.${l.id}.button`}
              onClick={() => setActiveLevel(l.id)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                activeLevel === l.id
                  ? darkMode
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-700"
                  : darkMode
                    ? "hover:bg-white/8 hover:text-gray-300"
                    : "hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {l.name}
            </button>
            {levels.length > 1 && idx > 0 && (
              <button
                type="button"
                data-ocid={`bottombar.level.delete.button.${idx + 1}`}
                onClick={() => deleteLevel(l.id)}
                className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full hidden group-hover:flex items-center justify-center z-10 ${
                  darkMode ? "bg-red-500/90 text-white" : "bg-red-400 text-white"
                }`}
                title={`Delete ${l.name}`}
              >
                <X size={8} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          data-ocid="bottombar.level.add.button"
          onClick={() => addLevel('L' + (levels.length + 1))}
          className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
            darkMode
              ? "hover:bg-white/8 text-gray-600 hover:text-gray-400"
              : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          }`}
          title="Add level"
        >
          <Plus size={10} />
        </button>'''

if old_map in content:
    content = content.replace(old_map, new_map)
    print("Level map replaced successfully")
else:
    print("ERROR: Could not find level map to replace")

with open('src/frontend/src/components/frame/BottomBar.tsx', 'w') as f:
    f.write(content)

print("BottomBar updated")
