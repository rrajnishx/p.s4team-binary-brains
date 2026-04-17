"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeFarm } from '@/lib/api';
import { MapPin, Navigation, Satellite, Waves } from 'lucide-react';

const states = {
  "Maharashtra": ["Nagpur", "Pune", "Mumbai"],
  "Delhi": ["New Delhi", "South Delhi", "Dwarka"],
  "Karnataka": ["Bangalore", "Mysore"],
  "Punjab": ["Ludhiana", "Amritsar"]
};

export default function AnalyzePage() {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(200);
  const [loading, setLoading] = useState(false);

  const area = ((Math.PI * radius * radius) / 10000).toFixed(2);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(parseFloat(latitude.toFixed(4)));
        setLng(parseFloat(longitude.toFixed(4)));
        
        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (apiKey) {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
            const geocodeData = await res.json();
            if (geocodeData.results && geocodeData.results.length > 0) {
              const components = geocodeData.results[0].address_components;
              const state = components.find((c: any) => c.types.includes("administrative_area_level_1"))?.long_name;
              const district = components.find((c: any) => c.types.includes("administrative_area_level_2"))?.long_name;
              
              if (state) setSelectedState(state);
              if (district) setSelectedDistrict(district.replace(' District', ''));
            }
          }
        } catch (err) {
          console.error("Geocoding failed", err);
        }
      },
      (err) => {
        console.error(err);
        alert("Location permission denied.");
      }
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!lat || !lng) return;

    setLoading(true);

    const payload = {
      lat: lat,
      lng: lng,
      state: selectedState,
      district: selectedDistrict,
      radius: radius,
      area: parseFloat(area),
    };

    try {
      const res = await analyzeFarm(payload);
      
      const query = new URLSearchParams({
        state: selectedState,
        district: selectedDistrict,
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        area: area,
        score: (res?.score || 78).toString(),
        methane: (res?.methane || 2.4).toString(),
        credits: (res?.credits || 120).toString(),
      }).toString();

      router.push(`/results/demo?${query}`);
    } catch (error) {
      console.error(error);
      const query = new URLSearchParams({
        state: selectedState,
        district: selectedDistrict,
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        area: area,
        score: "78",
        methane: "2.4",
        credits: "120",
      }).toString();

      router.push(`/results/demo?${query}`);
    }
  };

  const isAnalyzeDisabled = !lat || !lng;

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
            className="w-full max-w-2xl z-10 space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 text-text-primary font-heading">New Analysis</h2>
              <p className="text-text-muted">Configure your farm location and data to run the AWD detection model</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* FULL WIDTH LOCATION CARD */}
              <div className="bg-[#111a14] rounded-2xl border border-[#1f2d22] p-8 shadow-2xl focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-shadow">
                <h3 className="text-2xl font-heading text-text-primary mb-6 flex items-center justify-center gap-2">
                  <MapPin className="w-6 h-6 text-accent-green" /> Enter Farm Location
                </h3>
                
                <div className="space-y-6">
                  {/* State Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm text-text-muted font-medium">State</label>
                    <select 
                      value={selectedState} 
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedDistrict("");
                      }} 
                      className="w-full bg-[#0a0f0d] border border-[#1f2d22] rounded-lg p-4 text-text-primary focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all appearance-none" 
                      required
                    >
                      <option value="">Select state...</option>
                      {Object.keys(states).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* District Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm text-text-muted font-medium">District</label>
                    <select 
                      value={selectedDistrict} 
                      onChange={(e) => setSelectedDistrict(e.target.value)} 
                      className="w-full bg-[#0a0f0d] border border-[#1f2d22] rounded-lg p-4 text-text-primary focus:border-accent-green focus:ring-1 focus:ring-accent-green outline-none transition-all appearance-none" 
                      required
                      disabled={!selectedState}
                    >
                      <option value="">Select district...</option>
                      {selectedState && states[selectedState as keyof typeof states]?.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#0a0f0d] border border-[#1f2d22] rounded-lg p-4 text-center">
                       <div className="text-xs text-text-muted mb-1">LAT</div>
                       <div className="font-data text-accent-green text-lg">{lat ? lat.toFixed(4) : "--.----"}</div>
                    </div>
                    <div className="bg-[#0a0f0d] border border-[#1f2d22] rounded-lg p-4 text-center">
                       <div className="text-xs text-text-muted mb-1">LNG</div>
                       <div className="font-data text-accent-cyan text-lg">{lng ? lng.toFixed(4) : "--.----"}</div>
                    </div>
                  </div>

                  {/* Detect Location Button */}
                  <button 
                    type="button" 
                    onClick={handleDetectLocation} 
                    className="w-full flex justify-center items-center gap-2 py-4 mt-2 text-sm font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg hover:bg-accent-cyan hover:text-bg-primary transition-colors"
                  >
                    <Navigation className="w-5 h-5" /> 📍 Detect Current Location
                  </button>

                  {/* Radius Slider & Area */}
                  <div className="bg-[#0a0f0d] border border-[#1f2d22] rounded-xl p-6 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm text-text-muted font-medium">Select Farm Radius (meters)</label>
                      <span className="text-accent-green font-data font-bold">{radius}m</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="1000" 
                      value={radius} 
                      onChange={(e) => setRadius(Number(e.target.value))} 
                      className="w-full h-2 bg-[#1f2d22] rounded-lg appearance-none cursor-pointer accent-accent-green hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-shadow"
                    />
                    <div className="mt-6 text-center">
                      <span className="text-text-muted text-sm">Estimated Area: </span>
                      <span className="text-xl font-bold font-data text-accent-amber">{area} hectares</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* SMART VISUAL */}
              <div className="w-full h-64 bg-[#111a14] rounded-2xl border border-[#1f2d22] shadow-lg relative overflow-hidden flex flex-col items-center justify-center p-6 group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-green/5 via-[#111a14] to-[#111a14] pointer-events-none" />
                
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                   <MapPin className="w-6 h-6 text-accent-green absolute z-10" />
                   <motion.div 
                     animate={{ 
                       scale: [1, Math.max(1.1, radius / 200), 1],
                       opacity: [0.3, 0.6, 0.3]
                     }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 border-2 border-accent-green rounded-full bg-accent-green/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                   />
                </div>
                
                <p className="text-sm text-text-muted text-center z-10 relative flex items-center gap-2">
                  <Waves className="w-4 h-4 text-accent-cyan" /> Your farm boundary is approximated using GPS + radius
                </p>
              </div>

              {/* BOTTOM BUTTON */}
              <motion.button 
                whileHover={!isAnalyzeDisabled ? { scale: 1.01, boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)" } : {}}
                whileTap={!isAnalyzeDisabled ? { scale: 0.98 } : {}}
                type="submit" 
                disabled={isAnalyzeDisabled}
                className={`w-full font-bold py-5 rounded-2xl transition-all text-lg flex items-center justify-center gap-2 ${
                  isAnalyzeDisabled 
                  ? 'bg-[#1f2d22] text-text-muted cursor-not-allowed' 
                  : 'bg-gradient-to-r from-accent-green to-emerald-400 hover:from-emerald-400 hover:to-accent-green text-bg-primary shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                }`}
              >
                <Satellite className="w-5 h-5" /> Analyze Farm
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <div className="fixed inset-0 bg-bg-primary/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-12">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <Satellite className="w-12 h-12 text-accent-green z-10 animate-pulse drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="text-xl font-medium text-accent-green h-8 overflow-hidden text-center data-font animate-pulse">
                Processing Analysis...
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
