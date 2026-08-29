import { Link, useLocation } from "react-router-dom";
import { History, BookOpen, Zap, Menu, X, Workflow, Github, ArrowRight } from "lucide-react";
import { useState } from "react";
import shieldLogo from "@/assets/shield-logo.png";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "API Analyzer", href: "/analyze", icon: Zap },
  { label: "Deep Flowchart", href: "/flowchart", icon: Workflow },
  { label: "History", href: "/history", icon: History },
  { label: "Docs & RFC", href: "/docs", icon: BookOpen },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img
                src={shieldLogo}
                alt="DriftShield"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all shadow-sm"
              />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                API DriftShield
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold">
                0.965 F1
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shadow-inner">
            {NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm font-bold border border-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-indigo-600" : "text-slate-500")} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/APIDriftShield"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200"
            >
              <Github className="w-3.5 h-3.5 text-slate-700" />
              <span>GitHub</span>
            </a>

            <Link
              to="/analyze"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Analyze API</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2 shadow-lg">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors",
                pathname === href
                  ? "text-indigo-700 bg-indigo-50 border border-indigo-100"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="w-4 h-4 text-indigo-600" />
              <span>{label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/analyze"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch API Analyzer</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
