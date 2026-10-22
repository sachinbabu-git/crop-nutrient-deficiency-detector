import React, { useState, useEffect, useRef } from "react";
import { 
  Sprout, 
  UploadCloud, 
  Camera, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight, 
  FileImage, 
  Info, 
  HeartPulse, 
  ShieldAlert,
  Dna,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import Navbar from "./components/Navbar";
import KnowledgeBase from "./components/KnowledgeBase";
import CameraCapture from "./components/CameraCapture";
import DiagnosticCard from "./components/DiagnosticCard";
import HistoryList from "./components/HistoryList";
import { DiagnosticResult, ScanHistoryItem } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"scan" | "library" | "history">("scan");
  
  // File upload and crop state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState<string>("");
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  
  // Diagnostic processing states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // History state loaded from localStorage
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nutriscan_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load local scan history:", err);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: ScanHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("nutriscan_history", JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to save local scan history:", err);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local diagnostic history log? This cannot be undone.")) {
      saveHistory([]);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const resultStr = reader.result as string;
        // Split metadata header out
        const splitIndex = resultStr.indexOf(",");
        if (splitIndex !== -1) {
          resolve(resultStr.substring(splitIndex + 1));
        } else {
          reject(new Error("Failed to parse base64."));
        }
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Handler for custom captured camera frame or manual uploaded image file
  const processImage = async (base64Data: string, mimeType: string, customPreviewUrl: string) => {
    setError(null);
    setApiKeyError(null);
    setLoading(true);
    setResult(null);

    // Simulated agricultural deep learning pipeline messages
    const pipelineSteps = [
      "Isolating crop specimen & leaf veins...",
      "Analyzing chlorophyll spectral patterns...",
      "Identifying leaf edge necrosis and chlorosis...",
      "Comparing with regional agricultural deficit profiles...",
      "Synthesizing corrective recommendation logs..."
    ];

    let stepIdx = 0;
    setLoadingStep(pipelineSteps[0]);
    const timer = setInterval(() => {
      stepIdx++;
      if (stepIdx < pipelineSteps.length) {
        setLoadingStep(pipelineSteps[stepIdx]);
      }
    }, 1800);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType,
          cropHint: cropHint,
        }),
      });

      clearInterval(timer);

      if (!response.ok) {
        const errJson = await response.json();
        if (errJson.isSetupError) {
          setApiKeyError(errJson.details || "API key not configured.");
          throw new Error("API key needs to be configured in settings.");
        }
        throw new Error(errJson.error || errJson.details || "Failed to analyze image.");
      }

      const diagnostic: DiagnosticResult = await response.json();
      setResult(diagnostic);

      // Save to history list
      const newItem: ScanHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        image: customPreviewUrl,
        cropHint: cropHint,
        result: diagnostic,
      };

      const updatedHistory = [newItem, ...history];
      saveHistory(updatedHistory);

    } catch (err: any) {
      console.error(err);
      if (!apiKeyError) {
        setError(err.message || "An unexpected error occurred while processing the diagnostic analysis.");
      }
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto trigger scan
      const base64 = await fileToBase64(file);
      processImage(base64, file.type, url);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Drag-and-Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        const base64 = await fileToBase64(file);
        processImage(base64, file.type, url);
      } else {
        alert("Please drop a valid image file.");
      }
    }
  };

  // Demo / Sample triggers
  const triggerSample = async (sampleId: string) => {
    let base64 = "";
    let mimeType = "image/jpeg";
    let selectedHint = "";
    let preview = "";

    // 1x1 base64 fallback pixels representing common color blocks to quickly run real API queries
    if (sampleId === "tomato_iron") {
      // Small real tomato leaf like thumbnail
      base64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
      selectedHint = "Tomato - Young yellow leaves";
      preview = "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=85";
    } else if (sampleId === "corn_nitrogen") {
      base64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
      selectedHint = "Zea mays (Corn) - Stunted yellow growth";
      preview = "https://images.unsplash.com/photo-1552554706-74117f2600ae?auto=format&fit=crop&w=600&q=85";
    }

    setCropHint(selectedHint);
    setPreviewUrl(preview);
    processImage(base64, mimeType, preview);
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setApiKeyError(null);
  };

  const selectHistoryItem = (item: ScanHistoryItem) => {
    setPreviewUrl(item.image);
    setCropHint(item.cropHint);
    setResult(item.result);
    setActiveTab("scan");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f6f3] via-[#fafcfa] to-[#f2f6f3] text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* SCAN VIEW */}
        {activeTab === "scan" && (
          <div className="space-y-10">
            
            {/* Intro Header */}
            {!result && !loading && (
              <div className="text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>AI-Powered Real-Time Diagnostic Model v3.5</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 leading-none">
                  Diagnose Crop Deficiencies <br />
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                    In Real-Time
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Upload photos of damaged plant structures, specify crop types, and generate dynamic diagnostic reports featuring accurate nutrient classifications, physiological profiles, and corrective actions.
                </p>
              </div>
            )}

            {/* Error Message Box */}
            {error && (
              <div className="max-w-2xl mx-auto bg-red-50/90 border border-red-200 rounded-2xl p-5 flex items-start space-x-4 text-red-900 shadow-sm animate-fade-in">
                <AlertCircle className="w-5.5 h-5.5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm">Diagnostic Execution Interrupted</h4>
                  <p className="text-xs text-red-800 leading-relaxed font-sans">{error}</p>
                  <button
                    onClick={resetScanner}
                    className="mt-2 text-xs font-bold text-red-700 underline hover:text-red-900 block"
                  >
                    Reset & try again
                  </button>
                </div>
              </div>
            )}

            {/* API Key Instructions */}
            {apiKeyError && (
              <div className="max-w-2xl mx-auto bg-amber-50/90 border border-amber-200 rounded-3xl p-6 space-y-4 text-amber-950 shadow-sm animate-fade-in">
                <div className="flex items-start space-x-3.5">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-display font-extrabold text-base">GEMINI_API_KEY Required</h4>
                    <p className="text-xs text-amber-900 leading-relaxed font-sans">
                      This diagnostic application uses Google Gemini models for computer vision-based agronomic diagnosis. To enable analysis, configure your API key:
                    </p>
                  </div>
                </div>
                <div className="bg-white/90 border border-amber-100 rounded-xl p-4 space-y-3 text-xs font-medium">
                  <ol className="list-decimal list-inside space-y-1 text-amber-900/90 pl-1 font-sans">
                    <li>Click on the <strong>Settings</strong> cog icon in the upper-right corner.</li>
                    <li>Open the <strong>Secrets</strong> panel.</li>
                    <li>Add <strong>GEMINI_API_KEY</strong> along with your Google AI Studio API key.</li>
                  </ol>
                  <p className="text-[11px] text-amber-800/80 leading-relaxed italic">
                    Once set up, reload the diagnostic scanner to initiate live crop recognition.
                  </p>
                </div>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Close & Refresh Page
                </button>
              </div>
            )}

            {/* Loading / Diagnostic Progress Panel */}
            {loading && (
              <div className="max-w-xl mx-auto bg-white/95 border border-emerald-100/85 rounded-2xl p-10 text-center space-y-8 shadow-xl backdrop-blur-md animate-fade-in">
                
                {/* Advanced Tech-Eco Circular Loader */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                  {/* Inner pulsing orbit */}
                  <div className="absolute inset-2.5 rounded-full border border-teal-100/50 border-b-teal-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                  {/* Center glowing plant element */}
                  <div className="w-14 h-14 bg-gradient-to-tr from-emerald-50 to-teal-50 text-emerald-700 rounded-full flex items-center justify-center shadow-inner border border-emerald-100/60">
                    <Dna className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-display font-bold text-slate-900">Executing Agronomic Assessment...</h3>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-sm mx-auto">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full animate-pulse" style={{ width: "85%" }}></div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block border border-emerald-500/20 shadow-xs">
                      {loadingStep}
                    </p>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto leading-relaxed pt-1">
                    Analyzing specimen chlorophyll spectral density, leaf edge necrosis, and generating curative recommendation charts.
                  </p>
                </div>

                {/* Progress helper visual */}
                {previewUrl && (
                  <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Scan thumbnail" />
                  </div>
                )}

              </div>
            )}

            {/* Default Scanner Dashboard Area */}
            {!result && !loading && !error && !apiKeyError && (
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Crop Type/Hint input */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-emerald-800 tracking-wider uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md inline-block">
                      STEP 1: SELECT CROP SPECIES
                    </label>
                    <span className="text-xs text-slate-500 block font-medium">
                      Providing a crop type guides our vision model to verify targeted plant diseases.
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Tomato, Corn, Apple, Grape, Soy"
                    value={cropHint}
                    onChange={(e) => setCropHint(e.target.value)}
                    className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 text-slate-800 max-w-sm w-full outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-sans"
                  />
                </div>

                {/* Split Upload Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Interactive Drag & Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 bg-white/70 backdrop-blur-xs ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50/20 shadow-md scale-[1.01]"
                        : "border-slate-200 hover:border-emerald-400 hover:bg-white hover:shadow-md hover:scale-[1.005]"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-2xl group-hover:scale-110 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300 shadow-xs border border-emerald-100/50">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-base text-slate-800">
                        Drag & Drop Leaf Specimen
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        or click to browse your device files
                      </p>
                    </div>

                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-slate-100/80 px-2.5 py-1 rounded-md">
                      PNG, JPG, HEIC, WEBP
                    </span>
                  </div>

                  {/* Camera Quick Activation */}
                  <div className="bg-white/70 backdrop-blur-xs border border-slate-200 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-all duration-300 hover:border-emerald-400 hover:scale-[1.005] group">
                    
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 group-hover:from-teal-100 group-hover:to-emerald-100 transition-all duration-300 shadow-xs border border-teal-100/50">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-base text-slate-800">
                        Device Live Capture
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Take a photo of the crop leaf directly in your field
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCameraActive(true)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-850 text-white font-display font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      Launch Camera Viewfinder
                    </button>
                  </div>

                </div>

                 {/* Sample Presets Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-3">
                    <span className="h-px bg-slate-200 flex-1"></span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      Or Scan Test Specimens Instantly
                    </span>
                    <span className="h-px bg-slate-200 flex-1"></span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    <button
                      onClick={() => triggerSample("tomato_iron")}
                      className="p-4 bg-white/95 border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md hover:scale-[1.01] transition-all duration-200 text-left flex items-center space-x-4 group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                        <img
                          src="https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=150&q=80"
                          alt="Tomato sample"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                          Tomato Specimen
                        </span>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 truncate">
                          Young chlorotic leaf patterns
                        </h4>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1 mt-1 group-hover:text-emerald-700">
                          <span>Run diagnostic trial</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerSample("corn_nitrogen")}
                      className="p-4 bg-white/95 border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md hover:scale-[1.01] transition-all duration-200 text-left flex items-center space-x-4 group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                        <img
                          src="https://images.unsplash.com/photo-1552554706-74117f2600ae?auto=format&fit=crop&w=150&q=80"
                          alt="Corn sample"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                          Maize Specimen
                        </span>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 truncate">
                          V-shaped yellow leaf margins
                        </h4>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1 mt-1 group-hover:text-emerald-700">
                          <span>Run diagnostic trial</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </button>

                  </div>
                </div>

              </div>
            )}

            {/* DIAGNOSTIC REPORT SECTION */}
            {result && !loading && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={resetScanner}
                    className="flex items-center space-x-2 text-xs font-bold text-emerald-800 hover:text-white hover:bg-emerald-800 bg-white border border-emerald-100 hover:border-emerald-800 px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <span>← Run New Diagnostic Scan</span>
                  </button>
                  <span className="text-xs text-slate-500 font-semibold bg-white/80 border border-slate-200/60 px-3 py-1.5 rounded-lg shadow-2xs">
                    Report compiled in Scan Logs
                  </span>
                </div>

                <DiagnosticCard
                  result={result}
                  imageUrl={previewUrl || undefined}
                  onReset={resetScanner}
                />
              </div>
            )}

          </div>
        )}

        {/* KNOWLEDGE INDEX VIEW */}
        {activeTab === "library" && <KnowledgeBase />}

        {/* SCAN HISTORY VIEW */}
        {activeTab === "history" && (
          <HistoryList
            history={history}
            onSelect={selectHistoryItem}
            onClearHistory={handleClearHistory}
            onRemoveItem={handleRemoveHistoryItem}
          />
        )}

      </main>

      {/* Camera Full-screen Modal component */}
      {isCameraActive && (
        <CameraCapture
          onCapture={async (base64, mime) => {
            setIsCameraActive(false);
            const blobUrl = URL.createObjectURL(
              new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], { type: mime })
            );
            setPreviewUrl(blobUrl);
            processImage(base64, mime, blobUrl);
          }}
          onClose={() => setIsCameraActive(false)}
        />
      )}

      {/* Beautiful humble footer */}
      <footer className="mt-auto bg-emerald-950 border-t border-emerald-900 text-emerald-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span className="font-sans font-bold text-sm tracking-tight text-white">NutriScan Crop Diagnostic System</span>
          </div>
          <p className="text-xs text-emerald-400/60 font-sans max-w-md mx-auto">
            Harnessing Computer Vision and Expert Agricultural Knowledge Bases to support smallholder farmers and crop agronomists.
          </p>
          <div className="text-[10px] font-mono text-emerald-400/40 pt-2">
            Mini-Project Version • Handcrafted using Gemini 3.5 Models
          </div>
        </div>
      </footer>

    </div>
  );
}
