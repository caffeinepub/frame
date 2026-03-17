import { Send, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { useIsTouchDevice } from "../../hooks/use-touch-device";
import { useFrameStore } from "../../stores/frameStore";
import type { ActivityEntry } from "../../stores/frameStore";

const ONLINE_USERS = [
  {
    initials: "AK",
    name: "Alex Kim",
    color: "#3b82f6",
    role: "Architect",
    time: "Just now",
  },
  {
    initials: "JL",
    name: "Jamie Lee",
    color: "#10b981",
    role: "Structural Engineer",
    time: "2 min ago",
  },
  {
    initials: "MR",
    name: "Morgan R.",
    color: "#f97316",
    role: "MEP Coordinator",
    time: "5 min ago",
  },
];

function typeColor(type: ActivityEntry["type"]): string {
  switch (type) {
    case "add":
      return "#22c55e";
    case "delete":
      return "#ef4444";
    case "move":
      return "#3b82f6";
    case "note":
      return "#f59e0b";
  }
}

export function CollaborationPanel() {
  const {
    showCollaboration,
    setShowCollaboration,
    darkMode,
    activityLog,
    addActivityEntry,
  } = useFrameStore();
  const isTouchDevice = useIsTouchDevice();
  const [noteText, setNoteText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!showCollaboration) return null;

  const postNote = () => {
    const text = noteText.trim();
    if (!text) return;
    addActivityEntry({
      id: `act-${Date.now()}`,
      type: "note",
      label: text,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      user: "You",
    });
    setNoteText("");
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  const panelCls = darkMode
    ? "bg-[#161b27] border-white/8 text-gray-200"
    : "bg-white border-gray-200 text-gray-800";

  const mutedCls = darkMode ? "text-gray-500" : "text-gray-400";
  const dividerCls = darkMode ? "border-white/8" : "border-gray-200";
  const hoverCls = darkMode ? "hover:bg-white/8" : "hover:bg-gray-100";
  const inputCls = darkMode
    ? "bg-white/5 border-white/10 text-gray-200 placeholder-gray-600"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400";

  const closeSz = isTouchDevice ? "w-10 h-10" : "p-0.5";
  const noteInputH = isTouchDevice ? "h-12 text-sm" : "h-7 text-[11px]";
  const sendBtnSz = isTouchDevice ? "w-12 h-12" : "w-7 h-7";

  return (
    <div
      data-ocid="collaboration.panel"
      className={`absolute right-[272px] top-0 bottom-0 w-72 border-l z-20 flex flex-col ${panelCls}`}
    >
      {/* Header */}
      <div
        className={`h-9 flex items-center justify-between px-3 border-b flex-shrink-0 ${dividerCls}`}
      >
        <div className="flex items-center gap-2">
          <Users size={13} className="text-blue-400" />
          <span
            className={`text-[10px] uppercase tracking-widest font-semibold ${mutedCls}`}
          >
            Team
          </span>
        </div>
        <button
          type="button"
          data-ocid="collaboration.close.button"
          onClick={() => setShowCollaboration(false)}
          className={`flex items-center justify-center ${closeSz} rounded transition-colors touch-manipulation ${hoverCls} ${mutedCls}`}
        >
          <X size={12} />
        </button>
      </div>

      {/* Online now */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2">
        <div
          className={`text-[9px] uppercase tracking-widest font-semibold mb-2 ${mutedCls}`}
        >
          Online Now
        </div>
        <div className="space-y-2">
          {ONLINE_USERS.map((u) => (
            <div key={u.initials} className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: u.color }}
                >
                  {u.initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 ring-2 ring-[#161b27]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium leading-tight truncate">
                  {u.name}
                </div>
                <div className={`text-[10px] ${mutedCls} leading-tight`}>
                  {u.role}
                </div>
              </div>
              <div className={`text-[9px] ${mutedCls} flex-shrink-0`}>
                {u.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`mx-3 border-t ${dividerCls}`} />

      {/* Activity log */}
      <div className="flex-1 flex flex-col min-h-0 px-3 pt-3">
        <div
          className={`text-[9px] uppercase tracking-widest font-semibold mb-2 ${mutedCls}`}
        >
          Activity
        </div>
        <div
          ref={scrollRef}
          data-ocid="collaboration.activity.list"
          className="flex-1 overflow-y-auto space-y-1.5 pr-0.5"
        >
          {activityLog.length === 0 ? (
            <div
              data-ocid="collaboration.activity.empty_state"
              className={`text-[11px] ${mutedCls} text-center py-6`}
            >
              No activity yet
            </div>
          ) : (
            [...activityLog].reverse().map((entry, idx) => (
              <div
                key={entry.id}
                data-ocid={`collaboration.activity.item.${idx + 1}`}
                className={`flex items-start gap-2 p-1.5 rounded text-[10px] ${
                  darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white mt-0.5"
                  style={{
                    background: entry.user === "You" ? "#f59e0b" : "#3b82f6",
                  }}
                >
                  {entry.user === "You"
                    ? "YO"
                    : entry.user.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: typeColor(entry.type) }}
                    >
                      {entry.type}
                    </span>
                    <span className={`text-[9px] ${mutedCls}`}>·</span>
                    <span className={`text-[9px] ${mutedCls}`}>
                      {entry.time}
                    </span>
                  </div>
                  <div className="leading-snug text-[11px] truncate">
                    {entry.label}
                  </div>
                  <div className={`text-[9px] ${mutedCls}`}>{entry.user}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note input */}
      <div className={`flex-shrink-0 p-3 border-t ${dividerCls}`}>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            data-ocid="collaboration.note.input"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") postNote();
            }}
            placeholder="Post a note..."
            className={`flex-1 ${noteInputH} rounded px-2 border outline-none focus:border-blue-500/60 transition-colors touch-manipulation ${inputCls}`}
          />
          <button
            type="button"
            data-ocid="collaboration.note.submit_button"
            onClick={postNote}
            className={`flex-shrink-0 ${sendBtnSz} rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors touch-manipulation`}
          >
            <Send size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
