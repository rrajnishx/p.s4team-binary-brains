"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeFarm } from '@/lib/api';
import { MapPin, Map, Navigation, Maximize, UploadCloud, Satellite } from 'lucide-react';

const LOADING_STEPS = [
  "Establishing satellite uplink...",
  "Fetching Sentinel-1 SAR imagery...",
  "Processing NDWI indices...",
  "Cross-referencing OpenWeather data...",
  "Running AWD detection model...",
  "Calculating methane savings...",
  "Finalizing compliance dashboard..."
];

export default function AnalyzePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lat: 28.7041,
    lng: 77.1025,
    state: "Delhi",
    district: "New Delhi",
    area: 5.5
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 2 : prev));
    }, 100);

    try {
      const data = {
        lat: parseFloat(formData.lat.toString()),
        lng: parseFloat(formData.lng.toString()),
        state: formData.state,
        district: formData.district,
        area: parseFloat(formData.area.toString()),
      };
      
      const result = await analyzeFarm(data);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        router.push(`/results/${result.farmId}`);
      }, 500);
    } catch (error) {
      console.error(error);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setLoading(false);
      alert("Failed to analyze farm.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative font-body">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-accent-green/10 blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass-card w-full max-w-xl p-8 z-10 shadow-2xl shadow-accent-green/5"
          >
            <h2 className="text-4xl font-bold mb-2 text-text-primary text-center font-heading">New Analysis</h2>
            <p className="text-text-muted text-center mb-8">Enter coordinates to run the AWD detection model</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-bg-primary/30 hover:border-accent-green/50 hover:bg-accent-green/5 transition-colors cursor-pointer group">
                <UploadCloud className="w-10 h-10 text-text-muted group-hover:text-accent-green mb-3 transition-colors" />
                <span className="text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors">Upload GeoJSON Boundary (Optional)</span>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm text-text-muted flex items-center gap-2 font-medium"><MapPin className="w-4 h-4 text-accent-green" /> Latitude</label>
                  <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full bg-bg-primary border border-border rounded-lg p-3 text-text-primary focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all data-font" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-muted flex items-center gap-2 font-medium"><Navigation className="w-4 h-4 text-accent-cyan" /> Longitude</label>
                  <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full bg-bg-primary border border-border rounded-lg p-3 text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan outline-none transition-all data-font" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm text-text-muted flex items-center gap-2 font-medium"><Map className="w-4 h-4 text-text-muted" /> State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-bg-primary border border-border rounded-lg p-3 text-text-primary focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-muted flex items-center gap-2 font-medium"><Map className="w-4 h-4 text-text-muted" /> District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full bg-bg-primary border border-border rounded-lg p-3 text-text-primary focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-text-muted flex items-center gap-2 font-medium"><Maximize className="w-4 h-4 text-accent-amber" /> Area (Hectares)</label>
                <input type="number" step="any" name="area" value={formData.area} onChange={handleChange} className="w-full bg-bg-primary border border-border rounded-lg p-3 text-text-primary focus:border-accent-amber focus:ring-1 focus:ring-accent-amber outline-none transition-all data-font" required />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-accent-green hover:bg-emerald-400 text-bg-primary font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg shadow-accent-green/20"
              >
                Execute Analysis
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-bg-primary/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-12"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 2], opacity: [1, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-24 h-24 rounded-full border-2 border-accent-green bg-accent-green/20"
              />
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [1, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-24 h-24 rounded-full border-2 border-accent-cyan bg-accent-cyan/10"
              />
              <Satellite className="w-12 h-12 text-accent-green z-10 animate-pulse drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="text-xl font-medium text-accent-green h-8 overflow-hidden text-center data-font">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={loadingStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="h-2 w-full bg-bg-card rounded-full overflow-hidden border border-border">
                <motion.div 
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right text-sm text-accent-green data-font">{progress}% Complete</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
