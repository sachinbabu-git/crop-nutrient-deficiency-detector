import { Leaf, Award, Compass, Sprout } from "lucide-react";

interface NavbarProps {
  activeTab: "scan" | "library" | "history";
  setActiveTab: (tab: "scan" | "library" | "history") => void;
  historyCount: number;
}

export default function Navbar({ activeTab, setActiveTab, historyCount }: NavbarProps) {
  return (
    <header className="w-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-900/40 text-white shadow-md backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("scan")}>
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 p-2 rounded-lg shadow-md flex items-center justify-center transition-transform hover:scale-105">
              <Sprout className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white block leading-none">
                Nutri<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Scan</span>
              </span>
              <span className="block text-[9px] font-mono text-emerald-400/85 tracking-wider uppercase mt-1">
                AI Agronomic Diagnostic Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === "scan"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Specimen Scan</span>
            </button>

            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === "library"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Knowledge Index</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                activeTab === "history"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scan Logs</span>
              {historyCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 rounded-full shadow-sm animate-pulse">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}
