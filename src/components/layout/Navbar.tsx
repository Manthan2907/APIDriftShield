import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Zap, Workflow, History, BookOpen, Github, Menu, X } from "lucide-react";
import { useState } from "react";
import shieldLogo from "@/assets/shield-logo.png";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: "analyzer", label: "API Analyzer", href: "/analyze", icon: Zap },
    { id: "flowchart", label: "Deep Flowchart", href: "/flowchart", icon: Workflow },
    { id: "history", label: "History", href: "/history", icon: History },
    { id: "docs", label: "Docs & RFC", href: "/docs", icon: BookOpen },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur-md shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2"
          >
            <div className="relative">
              <img
                src={shieldLogo}
                alt="DriftShield"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-500/20 group-hover:ring-blue-500 transition-all shadow-sm"
              />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">API DriftShield</h1>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              0.965 F1
            </span>
          </motion.div>
        </Link>

        {/* Tabs Desktop */}
        <div className="hidden md:flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-xl border border-gray-200/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link key={tab.id} to={tab.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                    isActive
                      ? "bg-white text-blue-600 border border-blue-200 shadow-sm font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-gray-500")} />
                  <span>{tab.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/Manthan2907/APIDriftShield"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 border border-gray-200"
          >
            <Github className="w-3.5 h-3.5 text-gray-700" />
            <span>GitHub</span>
          </a>

          <Link to="/analyze">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Analyze API</span>
            </motion.button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200 bg-white p-4 space-y-2 shadow-lg"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.id}
                to={tab.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold",
                  isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;
