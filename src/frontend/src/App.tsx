import { Toaster } from "@/components/ui/sonner";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlignmentToolbar } from "./components/frame/AlignmentToolbar";
import { AnalysisPanel } from "./components/frame/AnalysisPanel";
import { BottomBar } from "./components/frame/BottomBar";
import { ClashPanel } from "./components/frame/ClashPanel";
import { CollaborationPanel } from "./components/frame/CollaborationPanel";
import { CommandPalette } from "./components/frame/CommandPalette";
import { CommentsPanel } from "./components/frame/CommentsPanel";
import { DocumentationView } from "./components/frame/DocumentationView";
import { FeatureTree } from "./components/frame/FeatureTree";
import { FloatingActionBar } from "./components/frame/FloatingActionBar";
import { ImportExportDialog } from "./components/frame/ImportExportDialog";
import { LeftSidebar } from "./components/frame/LeftSidebar";
import { MiniMap } from "./components/frame/MiniMap";
import { ProjectBrowser } from "./components/frame/ProjectBrowser";
import { RightPanel } from "./components/frame/RightPanel";
import { SectionBoxPanel } from "./components/frame/SectionBoxPanel";
import { SheetsPanel } from "./components/frame/SheetsPanel";
import { ShortcutsModal } from "./components/frame/ShortcutsModal";
import { TopBar } from "./components/frame/TopBar";
import { TouchToolTray } from "./components/frame/TouchToolTray";
import { TutorialOverlay } from "./components/frame/TutorialOverlay";
import { VersionHistoryPanel } from "./components/frame/VersionHistoryPanel";
import { Viewport3D } from "./components/frame/Viewport3D";
import { ViewportOverlay } from "./components/frame/ViewportOverlay";
import { useIsTouchDevice } from "./hooks/use-touch-device";
import { useFrameStore } from "./stores/frameStore";

export default function App() {
  const {
    darkMode,
    activeDiscipline,
    setShowShortcuts,
    setShowComments,
    showComments,
    deleteSelectedElement,
    selectedElementId,
    undo,
    redo,
    drawingState,
    setDrawingState,
    setActiveTool,
    activeView,
    showCommandPalette,
    setShowCommandPalette,
    showSectionBox,
    copySelection,
    pasteClipboard,
    duplicateSelection,
  } = useFrameStore();

  const isTouchDevice = useIsTouchDevice();

  const [importExportOpen, setImportExportOpen] = useState(false);
  const [importExportTab, setImportExportTab] = useState<"import" | "export">(
    "export",
  );

  const openImport = () => {
    setImportExportTab("import");
    setImportExportOpen(true);
  };

  const openExport = () => {
    setImportExportTab("export");
    setImportExportOpen(true);
  };

  // Collaboration join toast on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast("Alex K. joined the session", {
        description: "3 collaborators online",
        duration: 4000,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Set data-touch attribute on document root for CSS targeting
  useEffect(() => {
    if (isTouchDevice) {
      document.documentElement.setAttribute("data-touch", "true");
    } else {
      document.documentElement.removeAttribute("data-touch");
    }
  }, [isTouchDevice]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Command palette: Cmd+K or / (not in input)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }
      if (e.key === "/" && !e.shiftKey && !isInput && !showCommandPalette) {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      if (isInput) return;

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        setShowShortcuts(true);
      }
      if (e.key === "Escape") {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (drawingState !== null) {
          setDrawingState(null);
        } else {
          setShowShortcuts(false);
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault();
        deleteSelectedElement();
      }
      if (e.key === "d" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tagLow = (
          document.activeElement as HTMLElement
        )?.tagName?.toLowerCase();
        if (tagLow !== "input" && tagLow !== "textarea") {
          setActiveTool("dimension");
        }
      }
      if (e.key === "m" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tagLow = (
          document.activeElement as HTMLElement
        )?.tagName?.toLowerCase();
        if (tagLow !== "input" && tagLow !== "textarea") {
          setActiveTool("measure");
        }
      }
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (e.ctrlKey && e.key === "c" && !e.shiftKey) {
        e.preventDefault();
        copySelection();
      }
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        pasteClipboard();
      }
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        duplicateSelection();
      }
      if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        const st = useFrameStore.getState();
        if (st.selectedElementIds.length >= 2) {
          const groupNum = st.groups.length + 1;
          st.createGroup(`Group ${groupNum}`, [...st.selectedElementIds]);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    drawingState,
    selectedElementId,
    setShowShortcuts,
    deleteSelectedElement,
    undo,
    redo,
    setDrawingState,
    setActiveTool,
    showCommandPalette,
    setShowCommandPalette,
    copySelection,
    pasteClipboard,
    duplicateSelection,
  ]);

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden ${
        darkMode ? "dark" : ""
      }`}
      style={{
        background: darkMode ? "#111827" : "#f3f4f6",
        color: darkMode ? "#e5e7eb" : "#111827",
      }}
    >
      <TopBar onImport={openImport} onExport={openExport} />

      <div className="flex flex-1 overflow-hidden relative">
        {activeView === "3d" && <LeftSidebar />}
        <ProjectBrowser />

        <div
          className={`flex-1 relative overflow-hidden ${
            isTouchDevice && activeView === "3d" ? "pb-16" : ""
          }`}
        >
          {activeView === "documentation" ? (
            <DocumentationView />
          ) : (
            <>
              <Viewport3D />
              <AlignmentToolbar />
              <ViewportOverlay />
              <MiniMap />
              {showSectionBox && <SectionBoxPanel />}
            </>
          )}
        </div>

        <VersionHistoryPanel />
        <CommentsPanel />
        <CollaborationPanel />
        <SheetsPanel />

        {/* Desktop: right panel with discipline-specific panels inline */}
        {!isTouchDevice && (
          <div
            className={`flex flex-col border-l ${
              darkMode ? "border-white/8" : "border-gray-200"
            }`}
          >
            <RightPanel />

            {activeDiscipline === "structure" && (
              <div
                className={`w-[272px] flex-shrink-0 ${
                  darkMode
                    ? "bg-[#161b27] text-gray-200"
                    : "bg-white text-gray-800"
                }`}
              >
                <AnalysisPanel />
              </div>
            )}

            {activeDiscipline === "mep" && (
              <div
                className={`w-[272px] flex-shrink-0 ${
                  darkMode
                    ? "bg-[#161b27] text-gray-200"
                    : "bg-white text-gray-800"
                }`}
              >
                <ClashPanel />
              </div>
            )}

            {activeDiscipline === "parts" && (
              <div
                className={`w-[272px] flex-shrink-0 ${
                  darkMode
                    ? "bg-[#161b27] text-gray-200"
                    : "bg-white text-gray-800"
                }`}
              >
                <FeatureTree />
              </div>
            )}
          </div>
        )}

        {/* Touch/iPad: right panel as fixed overlay (no layout wrapper) */}
        {isTouchDevice && <RightPanel />}
      </div>

      <BottomBar />

      {/* Touch tool tray above bottom bar — only on touch when in 3D view */}
      {isTouchDevice && activeView === "3d" && <TouchToolTray />}

      {/* Modals */}
      <ShortcutsModal />
      <ImportExportDialog
        open={importExportOpen}
        onClose={() => setImportExportOpen(false)}
        defaultTab={importExportTab}
      />

      {/* Global overlays */}
      <CommandPalette />
      <TutorialOverlay />

      {/* Touch FAB — only on touch devices */}
      {isTouchDevice && <FloatingActionBar />}

      {/* Comments FAB */}
      <button
        type="button"
        data-ocid="app.comments.open_modal_button"
        onClick={() => setShowComments(!showComments)}
        className={`fixed z-30 rounded-full flex items-center justify-center shadow-lg transition-all touch-manipulation ${
          isTouchDevice
            ? "bottom-[13rem] right-4 w-12 h-12"
            : "bottom-14 right-4 w-10 h-10"
        } ${
          darkMode
            ? "bg-[#1e2435] hover:bg-[#252d42] border border-white/10"
            : "bg-white hover:bg-gray-50 border border-gray-200"
        }`}
        title="Comments"
      >
        <MessageSquare
          size={isTouchDevice ? 20 : 16}
          className={darkMode ? "text-gray-400" : "text-gray-500"}
        />
      </button>

      <Toaster />
    </div>
  );
}
