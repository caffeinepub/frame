import {
  Eye,
  EyeOff,
  Lock,
  MousePointer2,
  Plus,
  Trash2,
  Unlock,
} from "lucide-react";
import { useRef, useState } from "react";
import { useFrameStore } from "../../stores/frameStore";

export function GroupsPanel() {
  const {
    groups,
    createGroup,
    deleteGroup,
    toggleGroupLock,
    toggleGroupVisibility,
    renameGroup,
    selectGroup,
    selectedElementIds,
    darkMode,
  } = useFrameStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const canCreate = selectedElementIds.length >= 2;

  const handleCreate = () => {
    if (!canCreate) return;
    const groupNum = groups.length + 1;
    createGroup(`Group ${groupNum}`, [...selectedElementIds]);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      renameGroup(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const panelBase = darkMode
    ? "bg-[#161b27] text-gray-200"
    : "bg-white text-gray-800";
  const borderColor = darkMode ? "border-white/8" : "border-gray-200";
  const rowBase = darkMode
    ? "hover:bg-white/5 border-white/5"
    : "hover:bg-gray-50 border-gray-100";
  const iconBtn = `p-1 rounded transition-colors ${darkMode ? "hover:bg-white/10 text-gray-500 hover:text-gray-300" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`;

  return (
    <div className={`${panelBase} flex flex-col`}>
      {/* Header */}
      <div
        className={`h-9 flex items-center justify-between px-3 border-b flex-shrink-0 ${borderColor}`}
      >
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Groups
        </span>
        <button
          type="button"
          data-ocid="groups.create.button"
          onClick={handleCreate}
          disabled={!canCreate}
          title={
            canCreate
              ? `Create group from ${selectedElementIds.length} selected elements`
              : "Select 2+ elements to create a group"
          }
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
            canCreate
              ? darkMode
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
              : darkMode
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <Plus size={10} />
          <span>Group</span>
        </button>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div
            data-ocid="groups.empty_state"
            className={`p-4 text-center text-[11px] ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            <div className="mb-1 opacity-50">No groups yet</div>
            <div className="text-[10px] opacity-40">
              Select 2+ elements, then click Group (or Ctrl+G)
            </div>
          </div>
        ) : (
          <div className="py-1">
            {groups.map((grp, idx) => (
              <div
                key={grp.id}
                data-ocid={`groups.item.${idx + 1}`}
                className={`flex items-center gap-1.5 px-2 py-1.5 border-b text-[11px] ${
                  rowBase
                } ${!grp.visible ? "opacity-40" : ""}`}
              >
                {/* Color badge */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: grp.color }}
                />

                {/* Name (editable on double-click) */}
                <div className="flex-1 min-w-0">
                  {editingId === grp.id ? (
                    <input
                      ref={inputRef}
                      data-ocid="groups.name.input"
                      className={`w-full bg-transparent border-b text-[11px] outline-none ${
                        darkMode
                          ? "border-blue-500 text-gray-200"
                          : "border-blue-400 text-gray-800"
                      }`}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span
                      className="truncate block cursor-default select-none"
                      onDoubleClick={() => startEdit(grp.id, grp.name)}
                      title="Double-click to rename"
                    >
                      {grp.name}
                    </span>
                  )}
                  <span
                    className={`text-[9px] ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {grp.elementIds.length} element
                    {grp.elementIds.length !== 1 ? "s" : ""}
                    {grp.locked ? " · locked" : ""}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {/* Select group */}
                  <button
                    type="button"
                    data-ocid={`groups.select.button.${idx + 1}`}
                    title="Select all elements in group"
                    onClick={() => selectGroup(grp.id)}
                    className={iconBtn}
                  >
                    <MousePointer2 size={11} />
                  </button>

                  {/* Toggle visibility */}
                  <button
                    type="button"
                    data-ocid={`groups.visibility.toggle.${idx + 1}`}
                    title={grp.visible ? "Hide group" : "Show group"}
                    onClick={() => toggleGroupVisibility(grp.id)}
                    className={iconBtn}
                  >
                    {grp.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>

                  {/* Toggle lock */}
                  <button
                    type="button"
                    data-ocid={`groups.lock.toggle.${idx + 1}`}
                    title={grp.locked ? "Unlock group" : "Lock group"}
                    onClick={() => toggleGroupLock(grp.id)}
                    className={`${iconBtn} ${
                      grp.locked
                        ? darkMode
                          ? "text-amber-400"
                          : "text-amber-500"
                        : ""
                    }`}
                  >
                    {grp.locked ? <Lock size={11} /> : <Unlock size={11} />}
                  </button>

                  {/* Delete group */}
                  <button
                    type="button"
                    data-ocid={`groups.delete.button.${idx + 1}`}
                    title="Delete group (elements remain)"
                    onClick={() => deleteGroup(grp.id)}
                    className={`${iconBtn} hover:text-red-400`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
