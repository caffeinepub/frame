import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useFrameStore } from "../../stores/frameStore";

const TUTORIAL_KEY = "frame_tutorial_done";

const STEPS = [
  {
    title: "Welcome to Frame",
    subtitle: "CAD/BIM for the modern team",
    content:
      "Frame is a unified design platform for architecture, structural engineering, and MEP systems. Model buildings in 3D, generate 2D documentation, run analysis, and collaborate — all in one place.",
    visual: (
      <div className="flex items-center justify-center py-6">
        <div className="relative">
          {/* Abstract building illustration */}
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            fill="none"
            aria-hidden="true"
          >
            {/* Ground */}
            <rect
              x="10"
              y="100"
              width="140"
              height="3"
              rx="1.5"
              fill="rgba(99,102,241,0.3)"
            />
            {/* Main building */}
            <rect
              x="40"
              y="30"
              width="80"
              height="70"
              rx="2"
              fill="rgba(59,130,246,0.15)"
              stroke="rgba(59,130,246,0.5)"
              strokeWidth="1.5"
            />
            {/* Floors */}
            <line
              x1="40"
              y1="55"
              x2="120"
              y2="55"
              stroke="rgba(59,130,246,0.25)"
              strokeWidth="1"
            />
            <line
              x1="40"
              y1="77"
              x2="120"
              y2="77"
              stroke="rgba(59,130,246,0.25)"
              strokeWidth="1"
            />
            {/* Windows */}
            <rect
              x="52"
              y="38"
              width="14"
              height="10"
              rx="1"
              fill="rgba(147,197,253,0.4)"
            />
            <rect
              x="72"
              y="38"
              width="14"
              height="10"
              rx="1"
              fill="rgba(147,197,253,0.4)"
            />
            <rect
              x="92"
              y="38"
              width="14"
              height="10"
              rx="1"
              fill="rgba(147,197,253,0.4)"
            />
            <rect
              x="52"
              y="62"
              width="14"
              height="10"
              rx="1"
              fill="rgba(147,197,253,0.3)"
            />
            <rect
              x="72"
              y="62"
              width="14"
              height="10"
              rx="1"
              fill="rgba(147,197,253,0.3)"
            />
            <rect
              x="92"
              y="62"
              width="14"
              height="10"
              rx="1"
              fill="rgba(147,197,253,0.3)"
            />
            {/* Door */}
            <rect
              x="68"
              y="82"
              width="24"
              height="18"
              rx="1"
              fill="rgba(99,102,241,0.3)"
              stroke="rgba(99,102,241,0.5)"
              strokeWidth="1"
            />
            {/* Columns */}
            <rect
              x="33"
              y="30"
              width="6"
              height="70"
              rx="1"
              fill="rgba(16,185,129,0.3)"
              stroke="rgba(16,185,129,0.5)"
              strokeWidth="1"
            />
            <rect
              x="121"
              y="30"
              width="6"
              height="70"
              rx="1"
              fill="rgba(16,185,129,0.3)"
              stroke="rgba(16,185,129,0.5)"
              strokeWidth="1"
            />
            {/* Roof beam */}
            <rect
              x="28"
              y="26"
              width="104"
              height="6"
              rx="2"
              fill="rgba(16,185,129,0.2)"
              stroke="rgba(16,185,129,0.4)"
              strokeWidth="1"
            />
            {/* MEP pipe */}
            <path
              d="M10 80 Q25 75 40 80"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.6"
            />
            {/* Dimension line */}
            <line
              x1="33"
              y1="112"
              x2="127"
              y2="112"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.7"
            />
            <text
              x="72"
              y="120"
              fontSize="8"
              fill="#f59e0b"
              textAnchor="middle"
              opacity="0.8"
            >
              24.0 m
            </text>
          </svg>
        </div>
      </div>
    ),
  },
  {
    title: "Draw a Wall",
    subtitle: "Your first element",
    content:
      "Pick the Wall tool from the left sidebar, then click once in the viewport to set the start point. Move your cursor and click again to place the end point.",
    visual: (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1.5px solid rgba(59,130,246,0.4)",
                color: "#60a5fa",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <span
              className="text-[10px] text-center"
              style={{ color: "#94a3b8" }}
            >
              Select
              <br />
              Wall tool
            </span>
          </div>
          <svg
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6h14m0 0-4-4m4 4-4 4"
              stroke="#4b5563"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1.5px solid rgba(16,185,129,0.3)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#34d399" }}
              />
            </div>
            <span
              className="text-[10px] text-center"
              style={{ color: "#94a3b8" }}
            >
              Click
              <br />
              start
            </span>
          </div>
          <svg
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6h14m0 0-4-4m4 4-4 4"
              stroke="#4b5563"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1.5px solid rgba(16,185,129,0.3)",
              }}
            >
              <div className="relative">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#34d399" }}
                />
                <div
                  className="absolute top-0 left-5 w-1.5 h-1.5 rounded-full"
                  style={{ background: "#34d399" }}
                />
                <svg
                  className="absolute -top-0.5 left-0.5"
                  width="20"
                  height="4"
                  aria-hidden="true"
                >
                  <line
                    x1="0"
                    y1="2"
                    x2="20"
                    y2="2"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <span
              className="text-[10px] text-center"
              style={{ color: "#94a3b8" }}
            >
              Click
              <br />
              end
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Select & Inspect",
    subtitle: "Properties and editing",
    content:
      "Click any element in the viewport to select it. The right panel shows its properties — position, dimensions, and material. You can edit values directly.",
    visual: (
      <div className="flex items-center justify-center gap-6 py-4">
        {/* Viewport preview */}
        <div
          className="rounded-lg p-3 flex flex-col gap-1"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            minWidth: "80px",
          }}
        >
          <div
            className="w-16 h-3 rounded"
            style={{ background: "rgba(59,130,246,0.3)" }}
          />
          <div
            className="w-16 h-3 rounded"
            style={{
              background: "rgba(59,130,246,0.6)",
              boxShadow: "0 0 0 2px rgba(59,130,246,0.5)",
            }}
          />
          <div
            className="w-16 h-3 rounded"
            style={{ background: "rgba(59,130,246,0.3)" }}
          />
          <div
            className="text-[9px] mt-1 text-center"
            style={{ color: "#60a5fa" }}
          >
            Selected
          </div>
        </div>
        <svg
          width="24"
          height="14"
          viewBox="0 0 24 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 7h18m0 0-5-5m5 5-5 5"
            stroke="#4b5563"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Properties preview */}
        <div
          className="rounded-lg p-3 flex flex-col gap-1.5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            minWidth: "100px",
          }}
        >
          <div
            className="text-[9px] font-semibold"
            style={{ color: "#60a5fa" }}
          >
            Wall · L1
          </div>
          {[
            { label: "Length", val: "4.5 m" },
            { label: "Height", val: "3.0 m" },
            { label: "Material", val: "Concrete" },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="flex justify-between items-center gap-4"
            >
              <span className="text-[9px]" style={{ color: "#64748b" }}>
                {label}
              </span>
              <span
                className="text-[9px] font-mono"
                style={{ color: "#e2e8f0" }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Keyboard Shortcuts",
    subtitle: "Work faster",
    content:
      "Frame has keyboard shortcuts for common actions. Press ? at any time to see the full list.",
    visual: (
      <div className="grid grid-cols-2 gap-2 py-2">
        {[
          { key: "W", label: "Wall tool" },
          { key: "D", label: "Dimension" },
          { key: "M", label: "Measure" },
          { key: "V", label: "Select" },
          { key: "⌘K", label: "Command palette" },
          { key: "?", label: "All shortcuts" },
          { key: "⌘Z", label: "Undo" },
          { key: "ESC", label: "Cancel" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <kbd
              className="px-2 py-1 rounded font-mono text-[11px] font-semibold flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2e8f0",
                minWidth: "32px",
                textAlign: "center",
              }}
            >
              {key}
            </kbd>
            <span className="text-[11px]" style={{ color: "#94a3b8" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function TutorialOverlay() {
  const { darkMode } = useFrameStore();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const current = STEPS[step];

  const bg = darkMode ? "rgba(13,15,23,0.97)" : "rgba(255,255,255,0.98)";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const textColor = darkMode ? "#e2e8f0" : "#111827";
  const mutedColor = darkMode ? "#64748b" : "#9ca3af";
  const btnBg = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const btnHover = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-ocid="tutorial.dialog"
        >
          <motion.div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: bg,
              border: `1px solid ${border}`,
            }}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "#3b82f6" }}
                  >
                    {current.subtitle}
                  </div>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: textColor }}
                  >
                    {current.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  data-ocid="tutorial.skip.button"
                  className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{
                    background: btnBg,
                    color: mutedColor,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      btnHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = btnBg;
                  }}
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Visual area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-6"
              >
                {current.visual}

                {/* Description */}
                <p
                  className="text-sm leading-relaxed pb-4"
                  style={{ color: mutedColor }}
                >
                  {current.content}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div
              className="px-6 pb-6 flex items-center justify-between"
              style={{ borderTop: `1px solid ${border}`, paddingTop: "16px" }}
            >
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setStep(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === step ? "20px" : "6px",
                      height: "6px",
                      background:
                        i === step
                          ? "#3b82f6"
                          : darkMode
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.12)",
                    }}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    data-ocid="tutorial.back.button"
                    className="px-4 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      minHeight: "44px",
                      background: btnBg,
                      color: mutedColor,
                      border: `1px solid ${border}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        btnHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = btnBg;
                    }}
                  >
                    Back
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={next}
                    data-ocid="tutorial.next.button"
                    className="px-5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      minHeight: "44px",
                      background: "#3b82f6",
                      color: "#ffffff",
                      boxShadow: "0 2px 12px rgba(59,130,246,0.35)",
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={dismiss}
                    data-ocid="tutorial.finish.button"
                    className="px-5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      minHeight: "44px",
                      background: "#3b82f6",
                      color: "#ffffff",
                      boxShadow: "0 2px 12px rgba(59,130,246,0.35)",
                    }}
                  >
                    Start Building ✓
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
