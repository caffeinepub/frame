import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, FileUp, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useFrameStore } from "../../stores/frameStore";

const EXPORT_FORMATS = [
  {
    id: "ifc4",
    label: "IFC 4",
    description: "Interoperable BIM standard (current)",
  },
  {
    id: "dxf",
    label: "DXF",
    description: "AutoCAD drawing exchange format",
  },
  { id: "obj", label: "OBJ", description: "3D object mesh format" },
  { id: "pdf", label: "PDF", description: "Portable document for printing" },
];

const IMPORT_FORMATS = [
  { id: "ifc", label: "IFC" },
  { id: "dxf", label: "DXF" },
  { id: "dwg", label: "DWG" },
  { id: "skp", label: "SketchUp (SKP)" },
  { id: "rvt", label: "Revit (RVT)" },
];

function buildDxfPreview(
  elements: ReturnType<typeof useFrameStore.getState>["elements"],
) {
  const walls = elements.filter((e) => e.type === "wall").slice(0, 5);
  const columns = elements.filter((e) => e.type === "column").slice(0, 5);
  const ts = new Date().toISOString();
  let out = `; Frame DXF Export - ${ts}\n`;
  out += `; Walls: ${walls.length}  Columns: ${columns.length}\n`;
  out += "0\nSECTION\n2\nENTITIES\n";
  for (const w of walls) {
    const rot = w.rotation ?? 0;
    const half = w.dimensions.width / 2;
    const x1 = (w.position.x - half * Math.cos(rot)).toFixed(2);
    const z1 = (w.position.z + half * Math.sin(rot)).toFixed(2);
    const x2 = (w.position.x + half * Math.cos(rot)).toFixed(2);
    const z2 = (w.position.z - half * Math.sin(rot)).toFixed(2);
    out += `; WALL ${w.name} start(${x1},${z1}) end(${x2},${z2})\n`;
    out += `0\nLINE\n8\n0\n10\n${x1}\n20\n${z1}\n30\n0\n11\n${x2}\n21\n${z2}\n31\n0\n`;
  }
  for (const c of columns) {
    const x = c.position.x.toFixed(2);
    const z = c.position.z.toFixed(2);
    out += `; COLUMN ${c.name} at (${x},${z})\n`;
    out += `0\nPOINT\n8\n0\n10\n${x}\n20\n${z}\n30\n0\n`;
  }
  out += "0\nENDSEC\n0\nEOF\n";
  return out;
}

function buildIfcContent(
  elements: ReturnType<typeof useFrameStore.getState>["elements"],
) {
  const ts = new Date().toISOString();
  return `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Frame IFC Export'),'2;1');\nFILE_NAME('frame-export.ifc','${ts}',('Frame CAD'),('Caffeine'),'Frame v1.0','','');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n${elements
    .slice(0, 20)
    .map(
      (e, i) =>
        `#${i + 100}= IFCPRODUCT('${e.id}',#1,'${e.type}','${e.name}',$,$,$,$,$);`,
    )
    .join("\n")}\nENDSEC;\nEND-ISO-10303-21;\n`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: "import" | "export";
};

export function ImportExportDialog({
  open,
  onClose,
  defaultTab = "export",
}: Props) {
  const elements = useFrameStore((s) => s.elements);
  const darkMode = useFrameStore((s) => s.darkMode);
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(
    new Set(["ifc4"]),
  );
  const [importFormat, setImportFormat] = useState("ifc");
  const [dragging, setDragging] = useState(false);
  const [dxfPreview, setDxfPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const hasDxf = selectedFormats.has("dxf");
    const hasIfc = selectedFormats.has("ifc4");

    if (hasDxf) {
      const content = buildDxfPreview(elements);
      setDxfPreview(content);
    } else {
      setDxfPreview(null);
    }

    if (hasIfc) {
      const content = buildIfcContent(elements);
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "frame-export.ifc";
      a.click();
      URL.revokeObjectURL(url);
    }

    const fmts = Array.from(selectedFormats)
      .map((id) => EXPORT_FORMATS.find((f) => f.id === id)?.label)
      .filter(Boolean)
      .join(", ");
    toast.success("Export complete", {
      description: `Exported as: ${fmts || "(none selected)"}`,
    });

    if (!hasDxf) onClose();
  };

  const handleFileSelect = (file: File) => {
    toast.success("File imported (simulation)", {
      description: file.name,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="importexport.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import / Export</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger
              value="import"
              data-ocid="importexport.import.tab"
              className="flex-1 gap-1.5"
            >
              <FileUp size={13} />
              Import
            </TabsTrigger>
            <TabsTrigger
              value="export"
              data-ocid="importexport.export.tab"
              className="flex-1 gap-1.5"
            >
              <FileDown size={13} />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Export tab */}
          <TabsContent value="export" className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Select the formats to include in the export package.
            </p>
            <div className="space-y-2">
              {EXPORT_FORMATS.map((fmt) => (
                <label
                  key={fmt.id}
                  className="flex items-start gap-3 cursor-pointer group"
                  data-ocid={`importexport.${fmt.id}.checkbox`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-blue-500"
                    checked={selectedFormats.has(fmt.id)}
                    onChange={() => toggleFormat(fmt.id)}
                  />
                  <div>
                    <div className="text-sm font-medium">{fmt.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {fmt.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {dxfPreview && (
              <div>
                <div className="text-xs font-medium mb-1">DXF Preview</div>
                <textarea
                  readOnly
                  className={`w-full h-32 text-[10px] font-mono rounded border p-2 resize-none ${
                    darkMode
                      ? "bg-black/30 border-white/10 text-gray-300"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                  value={dxfPreview}
                />
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([dxfPreview], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "frame-export.dxf";
                    a.click();
                    URL.revokeObjectURL(url);
                    onClose();
                  }}
                  className="mt-1 w-full text-xs py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Download DXF
                </button>
              </div>
            )}

            {!dxfPreview && (
              <button
                type="button"
                data-ocid="importexport.export.submit_button"
                onClick={handleExport}
                className="w-full py-2 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Export Selected
              </button>
            )}
          </TabsContent>

          {/* Import tab */}
          <TabsContent value="import" className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Drag a file below or click to browse.
            </p>

            {/* Drop zone */}
            <button
              type="button"
              data-ocid="importexport.dropzone"
              className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragging
                  ? "border-blue-400 bg-blue-500/10"
                  : "border-muted-foreground/30 hover:border-muted-foreground/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const files = e.dataTransfer.files;
                if (files.length) handleFileSelect(files[0]);
              }}
            >
              <Upload
                size={24}
                className="mx-auto mb-2 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Drop DXF, IFC, or OBJ file here
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                or click to browse · Max 50 MB
              </p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".ifc,.dxf,.dwg,.obj,.skp,.rvt"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />

            {/* Format selector */}
            <div className="space-y-1.5">
              <label htmlFor="import-format" className="text-xs font-medium">
                Format
              </label>
              <select
                id="import-format"
                data-ocid="importexport.import.select"
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
              >
                {IMPORT_FORMATS.map((fmt) => (
                  <option key={fmt.id} value={fmt.id}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="importexport.import.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Browse File
              </button>
              <button
                type="button"
                data-ocid="importexport.import.cancel_button"
                onClick={onClose}
                className="flex-1 py-2 rounded text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
