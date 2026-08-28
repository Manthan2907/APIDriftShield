import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, FileJson, X, CheckCircle } from "lucide-react";
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

  const vBadge = version === "v1"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-violet-50 text-violet-700 border-violet-200";

  if (fileName) {
    return (
      <div>
        <label className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${vBadge}`}>{version.toUpperCase()}</span>
          <span className="text-xs font-medium text-slate-600">{label}</span>
        </label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm text-emerald-800 truncate flex-1 font-medium">{fileName}</span>
          <button onClick={onClear} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${vBadge}`}>{version.toUpperCase()}</span>
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200",
          dragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white"
        )}
      >
        <Upload className="w-5 h-5 text-slate-400" />
        <div className="text-center">
          <p className="text-sm text-slate-600 font-medium">Drop file or click to browse</p>
          <p className="text-xs text-slate-400 mt-0.5">.json · .yaml · .yml — max 10 MB</p>
        </div>
        <input ref={inputRef} type="file" accept=".json,.yaml,.yml" className="sr-only" onChange={handleChange} />
      </div>
    </div>
  );
}
