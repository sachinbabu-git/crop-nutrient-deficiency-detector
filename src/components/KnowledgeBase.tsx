import { useEffect, useState } from "react";
import { Search, Info, HelpCircle, Activity, ShieldCheck, Flame } from "lucide-react";
import { DeficiencyKnowledge } from "../types";

export default function KnowledgeBase() {
  const [data, setData] = useState<DeficiencyKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("nitrogen");

  useEffect(() => {
    async function fetchKnowledge() {
      try {
        const res = await fetch("/api/knowledge-base");
        if (res.ok) {
          const list = await res.json();
          setData(list);
          if (list.length > 0) {
            setSelectedId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading knowledge base", err);
      } finally {
        setLoading(false);
      }
    }
    fetchKnowledge();
  }, []);

  const filteredData = data.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      item.nutrient.toLowerCase().includes(term) ||
      item.role.toLowerCase().includes(term) ||
      item.symptoms.some((s) => s.toLowerCase().includes(term))
    );
  });

  const activeItem = data.find((item) => item.id === selectedId);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper header */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Nutrient Deficiencies Index
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-2xl">
            A comprehensive reference database compiling key deficiency symptoms, primary ecological causes, and curative actions for micro and macro nutrients.
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search nutrients or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white/80 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-slate-500 text-sm font-semibold">No results found matching your search term.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List panel */}
          <div className="lg:col-span-4 space-y-3">
            <span className="block text-[11px] font-mono font-bold text-emerald-800 tracking-wider uppercase pl-0.5 bg-emerald-500/10 px-2.5 py-1 rounded-md inline-block">
              Select Nutrient Specimen
            </span>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 border text-slate-800 ${
                    selectedId === item.id
                      ? "bg-gradient-to-r from-emerald-800 to-teal-950 text-white border-transparent shadow-md scale-[1.01]"
                      : "bg-white/80 text-slate-800 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/10 hover:scale-[1.005] shadow-2xs"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display font-extrabold text-sm block">{item.nutrient}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        selectedId === item.id
                          ? "bg-emerald-700 text-emerald-100 border-emerald-600"
                          : "bg-slate-100 text-slate-500 border-slate-200/60"
                      }`}
                    >
                      {item.id === "iron" ? "Micro" : "Macro"}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                      selectedId === item.id ? "text-emerald-100/90" : "text-slate-500"
                    }`}
                  >
                    {item.role}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Details panel */}
          {activeItem && (
            <div className="lg:col-span-8 bg-white/95 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-8">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-800 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-emerald-500/15">
                      Nutrient Profile
                    </span>
                    <span className="text-[10px] font-mono bg-teal-500/10 text-teal-800 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-teal-500/15">
                      {activeItem.id === "iron" ? "Micronutrient" : "Macronutrient"}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-2">
                    {activeItem.nutrient} Deficiency Profile
                  </h3>
                </div>
              </div>

              {/* Grid sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Essential Role */}
                <div className="space-y-3 bg-[#fafcfa] border border-emerald-100 p-5 rounded-xl shadow-2xs">
                  <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs font-sans">
                    <Info className="w-4.5 h-4.5 text-emerald-600" />
                    <span className="font-display font-bold text-sm tracking-tight">Biological Role</span>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                    {activeItem.role}
                  </p>
                </div>

                {/* Root Causes */}
                <div className="space-y-3 bg-[#fbfafb] border border-slate-200 p-5 rounded-xl shadow-2xs">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs font-sans">
                    <HelpCircle className="w-4.5 h-4.5 text-slate-500" />
                    <span className="font-display font-bold text-sm tracking-tight">Soil & Environmental Causes</span>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {activeItem.causes.map((cause, idx) => (
                      <li key={idx} className="text-slate-600 text-xs sm:text-sm flex items-start space-x-2 leading-relaxed">
                        <span className="text-slate-400 mt-1 font-bold shrink-0">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Symptoms */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs font-sans">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="font-display font-bold text-sm tracking-tight">Key Visual Symptoms to Look For</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeItem.symptoms.map((symptom, idx) => (
                    <div key={idx} className="flex items-start space-x-3 bg-white border border-slate-200 hover:border-emerald-200 p-4 rounded-xl transition-colors shadow-2xs">
                      <span className="w-5 h-5 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600 text-xs sm:text-sm font-sans font-medium leading-relaxed">
                        {symptom}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatments and Prevention tabbed section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                
                {/* Active Treatments */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs font-sans">
                    <Activity className="w-4.5 h-4.5 text-emerald-600" />
                    <span className="font-display font-bold text-sm tracking-tight">Immediate Curative Treatments</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeItem.treatments.map((tr, idx) => (
                      <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start space-x-2.5 leading-relaxed bg-emerald-50/30 border border-emerald-100/60 p-3 rounded-xl">
                        <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                        <span className="font-sans font-medium">{tr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Long-term prevention */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-teal-950 font-bold text-xs font-sans">
                    <ShieldCheck className="w-4.5 h-4.5 text-teal-600" />
                    <span className="font-display font-bold text-sm tracking-tight">Long-Term Preventative Care</span>
                  </div>
                  <ul className="space-y-2.5">
                    {activeItem.prevention.map((prev, idx) => (
                      <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start space-x-2.5 leading-relaxed bg-teal-50/20 border border-teal-100/50 p-3 rounded-xl">
                        <span className="text-teal-600 shrink-0 font-bold">★</span>
                        <span className="font-sans font-medium">{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
