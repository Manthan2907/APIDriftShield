import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, FileJson, X, CheckCircle, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  label: string;
  version: "v1" | "v2";
  fileName: string | null;
  onFileContent: (content: string, name: string) => void;
  onClear: () => void;
}

export default function DropZone({ label, version, fileName, onFileContent, onClear }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => onFileContent(ev.target?.result as string, file.name);
    reader.readAsText(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const vBadge =
    version === "v1"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-indigo-50 text-indigo-700 border-indigo-200";

  if (fileName) {
    return (
      <div>
        <label className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${vBadge}`}>
            {version.toUpperCase()}
          </span>
          <span className="text-xs font-semibold text-slate-700">{label}</span>
        </label>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs text-emerald-900 truncate flex-1 font-mono font-bold">{fileName}</span>
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 hover:bg-emerald-100 rounded-lg cursor-pointer"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${vBadge}`}>
          {version.toUpperCase()}
        </span>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 bg-slate-50/80"
        )}
      >
        <Upload className="w-5 h-5 text-indigo-600" />
        <div className="text-center">
          <p className="text-xs text-slate-700 font-semibold">Drop spec or click to browse</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">.json · .yaml · .yml (OpenAPI 3.x)</p>
        </div>
        <input ref={inputRef} type="file" accept=".json,.yaml,.yml" className="sr-only" onChange={handleChange} />
      </div>
    </div>
  );
}
