import { CheckCircle, MessageSquare, Send, X } from "lucide-react";
import { useState } from "react";
import { useFrameStore } from "../../stores/frameStore";

export function CommentsPanel() {
  const {
    comments,
    showComments,
    setShowComments,
    addComment,
    resolveComment,
    darkMode,
    selectedElementId,
  } = useFrameStore();
  const [newText, setNewText] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const filtered = comments.filter((c) =>
    filter === "all" ? true : filter === "open" ? !c.resolved : c.resolved,
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const authorColors: Record<string, string> = {
    "Sarah K.": "#3b82f6",
    "James T.": "#10b981",
    You: "#f59e0b",
  };

  if (!showComments) return null;

  return (
    <div
      className={`absolute right-[272px] top-0 bottom-0 w-64 border-l z-20 flex flex-col ${
        darkMode
          ? "bg-[#161b27] border-white/8 text-gray-200"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      <div
        className={`h-9 flex items-center justify-between px-3 border-b flex-shrink-0 ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={13} className="text-gray-500" />
          <span
            className={`text-[10px] uppercase tracking-widest font-semibold ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Comments
          </span>
        </div>
        <button
          type="button"
          data-ocid="comments.close.button"
          onClick={() => setShowComments(false)}
          className={`p-0.5 rounded transition-colors ${darkMode ? "hover:bg-white/8 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
        >
          <X size={12} />
        </button>
      </div>

      {/* Filter tabs */}
      <div
        className={`flex border-b ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        {(["all", "open", "resolved"] as const).map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`comments.filter.${f}.tab`}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-[10px] capitalize transition-colors ${
              filter === f
                ? darkMode
                  ? "text-blue-400 border-b border-blue-400"
                  : "text-blue-600 border-b border-blue-500"
                : darkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-4 text-center">
            <MessageSquare size={20} className="mx-auto mb-1 text-gray-500" />
            <span className="text-[11px] text-gray-500">No comments</span>
          </div>
        )}
        {filtered.map((c, i) => (
          <div
            key={c.id}
            data-ocid={`comments.item.${i + 1}`}
            className={`p-3 border-b transition-colors ${
              c.resolved
                ? darkMode
                  ? "border-white/5 opacity-50"
                  : "border-gray-50 opacity-50"
                : darkMode
                  ? "border-white/8 hover:bg-white/4"
                  : "border-gray-100 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{ background: authorColors[c.author] ?? "#6b7280" }}
              >
                {initials(c.author)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium">{c.author}</span>
                  <span
                    className={`text-[9px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {formatTime(c.createdAt)}
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-0.5 leading-relaxed ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {c.text}
                </p>
                {!c.resolved && (
                  <button
                    type="button"
                    data-ocid="comments.resolve.button"
                    onClick={() => resolveComment(c.id)}
                    className="mt-1.5 flex items-center gap-1 text-[9px] text-gray-500 hover:text-green-400 transition-colors"
                  >
                    <CheckCircle size={10} />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New comment */}
      <div
        className={`p-2 border-t ${
          darkMode ? "border-white/8" : "border-gray-200"
        }`}
      >
        <div className="flex gap-1">
          <input
            data-ocid="comments.new.input"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newText.trim()) {
                addComment(selectedElementId ?? "general", newText.trim());
                setNewText("");
              }
            }}
            placeholder="Add a comment…"
            className={`flex-1 text-[11px] px-2 py-1.5 rounded border outline-none ${
              darkMode
                ? "bg-white/5 border-white/10 text-gray-300 placeholder-gray-600 focus:border-blue-500/50"
                : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-300"
            }`}
          />
          <button
            type="button"
            data-ocid="comments.submit.button"
            onClick={() => {
              if (newText.trim()) {
                addComment(selectedElementId ?? "general", newText.trim());
                setNewText("");
              }
            }}
            className="p-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
