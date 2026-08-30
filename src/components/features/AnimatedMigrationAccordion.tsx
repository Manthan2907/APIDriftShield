import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface MigrationItem {
  change_id?: string;
  breaking_change_type?: string;
  change_description?: string;
  severity?: string;
  old_code?: string;
  new_code?: string;
  legacy_code_snippet?: string;
  migrated_code_snippet?: string;
  steps?: string[];
  remediation_steps?: string[];
  sed_command?: string;
  bash_command?: string;
  regex_find_replace?: {
    find: string;
    replace: string;
  };
}

export function AnimatedMigrationAccordion({ migration }: { migration: MigrationItem }) {
  const [expanded, setExpanded] = useState<string | null>("old_code");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const oldCode = migration.legacy_code_snippet || migration.old_code || "// Old client code";
  const newCode = migration.migrated_code_snippet || migration.new_code || "// Migrated v2 code";
  const stepsList = migration.remediation_steps || migration.steps || [
    "Identify legacy call",
    "Update to v2 contract",
    "Run tests",
  ];
  const regexFind =
    migration.regex_find_replace?.find || migration.sed_command || migration.bash_command || "legacy_endpoint";
  const regexReplace = migration.regex_find_replace?.replace || "/v2/resource";

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const items = [
    {
      id: "old_code",
      title: "Legacy v1 Client Code",
      icon: "❌",
      content: oldCode,
      color: "red",
      isCode: true,
    },
    {
      id: "new_code",
      title: "Migrated v2 Replacement",
      icon: "✅",
      content: newCode,
      color: "green",
      isCode: true,
    },
    {
      id: "steps",
      title: "Step-by-Step Remediation Instructions",
      icon: "📋",
      content: (
        <ol className="space-y-1.5 pl-1">
          {stepsList.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      ),
      color: "blue",
      isCode: false,
    },
    {
      id: "regex",
      title: "Bulk Find & Replace (sed / regex)",
      icon: "🔍",
      content: (
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-gray-500">Pattern / Command:</span>
            <code className="block bg-gray-900 text-indigo-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto mt-1 select-all">
              {migration.sed_command || `s|${regexFind}|${regexReplace}|g`}
            </code>
          </div>
        </div>
      ),
      color: "purple",
      isCode: false,
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; headerBg: string }> = {
    red: {
      bg: "bg-red-50/60",
      border: "border-red-200",
      text: "text-red-700",
      headerBg: "hover:bg-red-100/50",
    },
    green: {
      bg: "bg-emerald-50/60",
      border: "border-emerald-200",
      text: "text-emerald-700",
      headerBg: "hover:bg-emerald-100/50",
    },
    blue: {
      bg: "bg-blue-50/60",
      border: "border-blue-200",
      text: "text-blue-700",
      headerBg: "hover:bg-blue-100/50",
    },
    purple: {
      bg: "bg-purple-50/60",
      border: "border-purple-200",
      text: "text-purple-700",
      headerBg: "hover:bg-purple-100/50",
    },
  };

  return (
    <div className="space-y-2 font-sans">
      {items.map((item) => {
        const isItemExpanded = expanded === item.id;
        const col = colorMap[item.color];

        return (
          <motion.div
            key={item.id}
            className={`${col.bg} border ${col.border} rounded-2xl overflow-hidden shadow-2xs`}
          >
            <button
              onClick={() => setExpanded(isItemExpanded ? null : item.id)}
              className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${col.headerBg}`}
            >
              <div className="flex items-center gap-2 text-left">
                <span className="text-sm">{item.icon}</span>
                <span className={`font-bold text-xs ${col.text}`}>{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isItemExpanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown className={`w-4 h-4 ${col.text}`} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isItemExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden px-4 pb-4 border-t border-inherit"
                >
                  <div className="bg-white rounded-xl p-3 mt-3 font-mono text-xs text-gray-800 border border-gray-200 shadow-2xs relative group">
                    {item.isCode && typeof item.content === "string" ? (
                      <div className="relative">
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words leading-relaxed text-[11.5px] text-gray-900">
                          {item.content}
                        </pre>
                        <button
                          onClick={() => copyText(item.content as string, item.id)}
                          className="absolute top-0 right-0 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold font-sans"
                        >
                          {copiedKey === item.id ? (
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedKey === item.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    ) : (
                      item.content
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export default AnimatedMigrationAccordion;
