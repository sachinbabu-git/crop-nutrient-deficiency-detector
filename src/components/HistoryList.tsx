import { Trash2, AlertTriangle, CheckCircle, ShieldAlert, Calendar, ArrowRight, CornerDownRight } from "lucide-react";
import { ScanHistoryItem } from "../types";

interface HistoryListProps {
  history: ScanHistoryItem[];
  onSelect: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export default function HistoryList({ history, onSelect, onClearHistory, onRemoveItem }: HistoryListProps) {
  
  function getSeverityIcon(severity: string) {
    const sev = severity.toLowerCase();
    if (sev === "healthy") {
      return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
    }
    if (sev === "mild") {
      return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    }
    if (sev === "moderate") {
      return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />;
    }
    if (sev === "severe") {
      return <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />;
    }
    return <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0" />;
  }

  function getSeverityBg(severity: string) {
    return "bg-white/90 border-slate-200 hover:border-emerald-300";
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section with delete action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Diagnostic History Log
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Access previous diagnostic records saved on this browser session, including visual symptoms and action plans.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 px-4 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold self-start sm:self-center transition-all shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe History Cache</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white/80 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-inner border border-slate-200/40">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-display font-bold text-slate-800">No Scan Records Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              When you capture leaves/fruits or upload images to diagnose crop nutrient deficiencies, your reports will compile here for review.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xs relative group hover:shadow-md hover:scale-[1.01] ${getSeverityBg(
                item.result.severity
              )}`}
            >
              
              {/* Delete individual icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/95 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-all border border-slate-200 z-10 shadow-sm"
                title="Remove Report"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Main Card trigger area */}
              <div onClick={() => onSelect(item)} className="cursor-pointer flex-1 flex flex-col">
                
                {/* Visual spec image */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                  <img
                    src={item.image}
                    alt={item.result.detectedDeficiency}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/85 px-2.5 py-1 rounded-lg border border-slate-700 text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                    {item.result.cropType}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {new Date(item.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-800 font-bold">
                      {Math.round(item.result.confidence * 100)}% Match
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5">{getSeverityIcon(item.result.severity)}</div>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 text-sm leading-snug truncate max-w-[190px]">
                        {item.result.detectedDeficiency}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
                        Severity: {item.result.severity}
                      </p>
                    </div>
                  </div>

                  {item.cropHint && (
                    <div className="flex items-start space-x-1.5 text-xs text-slate-500 pl-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="italic text-[11px] text-slate-600 font-medium">Hint: "{item.cropHint}"</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                    {item.result.explanation}
                  </p>
                </div>

              </div>

              {/* Action footer */}
              <div
                onClick={() => onSelect(item)}
                className="bg-slate-50/60 border-t border-slate-100 px-5 py-3 cursor-pointer flex items-center justify-between text-xs font-sans font-bold text-slate-700 hover:bg-emerald-500/10 hover:text-emerald-950 transition-colors"
              >
                <span>Full Diagnosis Report</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors group-hover:translate-x-0.5" />
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
