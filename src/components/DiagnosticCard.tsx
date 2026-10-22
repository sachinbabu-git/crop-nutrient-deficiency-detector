import { ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb, Clock, Info, ShieldCheck, HeartPulse } from "lucide-react";
import { DiagnosticResult } from "../types";

interface DiagnosticCardProps {
  result: DiagnosticResult;
  imageUrl?: string;
  onReset: () => void;
}

export default function DiagnosticCard({ result, imageUrl, onReset }: DiagnosticCardProps) {
  const isHealthy = result.severity.toLowerCase() === "healthy";
  const isNonPlant = result.detectedDeficiency.toLowerCase().includes("non-plant") || result.detectedDeficiency.toLowerCase().includes("not a plant");

  // Severity Styling
  function getSeverityBadge(severity: string) {
    const sev = severity.toLowerCase();
    if (sev === "healthy") {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Healthy Crop Specimen</span>
        </span>
      );
    }
    if (sev === "mild") {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Mild Deficiency Grade</span>
        </span>
      );
    }
    if (sev === "moderate") {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          <span>Moderate Deficiency Grade</span>
        </span>
      );
    }
    if (sev === "severe") {
      return (
        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/35">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span>Severe Deficiency Alert</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/30">
        {severity}
      </span>
    );
  }

  // Confidence color meter
  const pct = Math.round(result.confidence * 100);
  const getConfidenceColor = (val: number) => {
    if (val > 0.8) return "bg-gradient-to-r from-emerald-400 to-teal-500";
    if (val > 0.6) return "bg-gradient-to-r from-amber-400 to-orange-500";
    return "bg-gradient-to-r from-red-400 to-rose-600";
  };

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md animate-fade-in space-y-0">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-8 sm:px-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-900/40">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-300 font-bold">
              Agronomic Scan Report
            </span>
            {getSeverityBadge(result.severity)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            {result.detectedDeficiency}
          </h2>
          <p className="text-emerald-300/80 text-xs font-semibold">
            Target Crop Class: <span className="text-white font-extrabold bg-emerald-500/20 px-2.5 py-0.5 rounded-md border border-emerald-500/20">{result.cropType}</span>
          </p>
        </div>

        {/* Confidence Gauge */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 p-4 rounded-xl flex flex-col items-center justify-center min-w-[130px] shadow-inner">
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Confidence</span>
          <span className="text-3xl font-display font-black text-white mt-0.5">{pct}%</span>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden border border-slate-600">
            <div className={`h-full ${getConfidenceColor(result.confidence)}`} style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Main Split: Image + Analysis Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Diagnostic Image */}
          {imageUrl && (
            <div className="lg:col-span-4 space-y-2.5">
              <span className="block text-xs font-mono font-bold text-slate-500 tracking-wider uppercase pl-0.5">
                Specimen Image File
              </span>
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200/80 bg-slate-50 shadow-md group">
                <img
                  src={imageUrl}
                  alt="Crop analysis specimen"
                  className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-xs p-2.5 rounded-lg text-white text-[11px] border border-slate-800">
                  <p className="font-bold truncate">{result.cropType} Class Specimen</p>
                </div>
              </div>
            </div>
          )}

          {/* Scientific Explanation */}
          <div className={`${imageUrl ? "lg:col-span-8" : "lg:col-span-12"} space-y-5`}>
            <div className="bg-emerald-50/25 border border-emerald-100 p-5 sm:p-6 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs font-sans">
                <Info className="w-4.5 h-4.5 text-emerald-600" />
                <span className="font-display font-bold text-sm tracking-tight">Agricultural Diagnostic Overview</span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-sans">
                {result.explanation}
              </p>
            </div>

            {/* Physiological Details */}
            {result.soilNutrientDetails && result.soilNutrientDetails.deficientNutrient !== "None" && (
              <div className="bg-teal-50/20 border border-teal-100/80 p-5 sm:p-6 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center space-x-2 text-teal-950 font-bold text-xs font-sans">
                  <HeartPulse className="w-4.5 h-4.5 text-teal-600" />
                  <span className="font-display font-bold text-sm tracking-tight">Physiological Function of {result.soilNutrientDetails.deficientNutrient}</span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                  {result.soilNutrientDetails.roleOfNutrient}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Symptoms and Root Causes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
          
          {/* Visible Symptoms */}
          <div className="space-y-3">
            <h3 className="text-sm font-display font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
              <span>Observed Visual Symptoms</span>
            </h3>
            {result.symptoms.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-sans pl-3">No distinctive visual symptoms observed.</p>
            ) : (
              <ul className="space-y-2.5 pl-1">
                {result.symptoms.map((symptom, idx) => (
                  <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start space-x-2.5 leading-relaxed bg-slate-50/40 border border-slate-100 p-2.5 rounded-lg">
                    <span className="text-amber-500 mt-1 font-bold shrink-0">•</span>
                    <span className="font-sans font-medium">{symptom}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Environmental Causes */}
          <div className="space-y-3">
            <h3 className="text-sm font-display font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
              <span>Probable Soil & Ecological Causes</span>
            </h3>
            {result.causes.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-sans pl-3">No direct environmental causes identified.</p>
            ) : (
              <ul className="space-y-2.5 pl-1">
                {result.causes.map((cause, idx) => (
                  <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start space-x-2.5 leading-relaxed bg-slate-50/40 border border-slate-100 p-2.5 rounded-lg">
                    <span className="text-rose-500 mt-1 font-bold shrink-0">•</span>
                    <span className="font-sans font-medium">{cause}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Immediate Cure & Corrective Actions */}
        {!isNonPlant && !isHealthy && (
          <div className="space-y-4 border-t border-slate-100 pt-8">
            <h3 className="text-sm font-display font-bold text-slate-800 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
              <span>Immediate Curative Treatments (Corrective Action Plan)</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md rounded-xl p-5 space-y-3 shadow-xs transition-all duration-200 group">
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-6 h-6 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xs font-bold group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="flex items-center space-x-1 text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{rec.timeline}</span>
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 group-hover:text-emerald-950 transition-colors">{rec.action}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-sans">{rec.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Long term Preventative Measures */}
        {!isNonPlant && (
          <div className="space-y-4 border-t border-slate-100 pt-8">
            <h3 className="text-sm font-display font-bold text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Long-Term Preventative Crop Care</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.preventativeMeasures.map((measure, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-[#fafcfa] border border-emerald-100 p-4 rounded-xl shadow-2xs hover:border-emerald-300 transition-all">
                  <span className="text-emerald-600 font-extrabold text-sm mt-0.5">★</span>
                  <span className="text-slate-700 text-xs sm:text-sm font-sans font-medium leading-relaxed">
                    {measure}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center border-t border-slate-100 pt-8">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-850 text-white font-display font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Scan Another Crop Specimen
          </button>
        </div>

      </div>

    </div>
  );
}
