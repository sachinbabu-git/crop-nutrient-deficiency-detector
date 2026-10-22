import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, ShieldAlert } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Data: string, mimeType: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [loading, setLoading] = useState(true);

  // Initialize camera stream
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  async function startCamera() {
    setLoading(true);
    setError(null);
    stopCamera();

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(
        "Could not access your camera. Please ensure permissions are granted, or choose the manual file upload instead."
      );
      setLoading(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function handleCapture() {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Use actual video source dimensions to get full resolution
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current video frame on the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64 string
        const base64Data = canvas.toDataURL("image/jpeg", 0.92);
        // Split off data type header (e.g. "data:image/jpeg;base64,")
        const splitIndex = base64Data.indexOf(",");
        if (splitIndex !== -1) {
          const rawBase64 = base64Data.substring(splitIndex + 1);
          onCapture(rawBase64, "image/jpeg");
        }
      }
    } catch (err) {
      console.error("Capture failed:", err);
      setError("Failed to capture image frame. Please try again.");
    }
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/95 flex flex-col items-center justify-center p-4 sm:p-6 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-emerald-900/40 border border-emerald-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-800/80 flex items-center justify-between text-white bg-emerald-950/80">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="font-sans font-bold text-sm tracking-tight">AI Crop Viewfinder</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Stage */}
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-300">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-3 text-xs font-mono">Initializing camera feed...</span>
            </div>
          )}

          {error ? (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-12 h-12 bg-red-950 border border-red-800/50 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <p className="text-sm font-sans text-red-200 leading-relaxed">{error}</p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Retry Camera
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-900 border border-emerald-800 text-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-800"
                >
                  Upload File Instead
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover max-h-[60vh] ${loading ? "opacity-0" : "opacity-100"}`}
            />
          )}

          {/* Guide Overlay Grid */}
          {!loading && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Corner crosshairs */}
              <div className="w-64 h-64 border-2 border-dashed border-emerald-400/40 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400"></div>
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400"></div>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400"></div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400"></div>
                
                <span className="absolute inset-x-0 -bottom-8 text-center text-[10px] font-mono text-emerald-300 bg-emerald-950/80 py-1 px-2 rounded-full mx-auto w-max shadow-sm">
                  Position leaf or fruit in center
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        {!error && (
          <div className="px-6 py-6 border-t border-emerald-800 bg-emerald-950/90 flex items-center justify-between">
            <button
              onClick={toggleCamera}
              className="p-3 rounded-full bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-all duration-150 flex items-center justify-center"
              title="Flip Camera"
              disabled={loading}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleCapture}
              disabled={loading}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-2xl font-sans font-extrabold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-950 animate-ping"></div>
              <span>Capture Crop</span>
            </button>

            <div className="w-11"></div> {/* Spacer balance */}
          </div>
        )}

      </div>
    </div>
  );
}
