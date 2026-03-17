with open('src/frontend/src/components/frame/LeftSidebar.tsx', 'r') as f:
    content = f.read()

# Replace the unimplemented annotate tool with a functional dimension tool
old = '''  {
    id: "annotate",
    icon: PenLine,
    label: "Annotate",
    short: "Anno",
    key: "AN",
    description: "Add dimensions, text, and tags",
    unimplemented: true,
  },
];'''

new = '''  {
    id: "dimension",
    icon: Ruler,
    label: "Dimension",
    short: "Dim",
    key: "D",
    description: "Place a permanent linear dimension annotation",
  },
];'''

if old in content:
    content = content.replace(old, new)
    print("Architecture dimension tool added")
else:
    print("WARN: Could not find annotate tool in ARCH_TOOLS")

# Also add dimension tool to STR, MEP, PARTS tools sections if they have annotate
content = content.replace(
    '    description: "Add dimensions, text, and tags",\n    unimplemented: true,\n  },',
    '    description: "Place a permanent linear dimension annotation",\n  },'
)

# Remove now-unused PenLine import if possible (but keep it to avoid errors)

with open('src/frontend/src/components/frame/LeftSidebar.tsx', 'w') as f:
    f.write(content)

print("LeftSidebar updated")
