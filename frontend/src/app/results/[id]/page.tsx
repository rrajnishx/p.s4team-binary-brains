"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { getResults } from '@/lib/api';
import jsPDF from 'jspdf';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart
} from 'recharts';
import { Download, Loader2, ShieldCheck, Droplets, Flame, Satellite, MapPin, AlertTriangle, Leaf, Activity } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-full w-full bg-bg-card flex items-center justify-center animate-pulse rounded-xl" /> });

const yearlyData = [
  { month: "Jan", methane: 1.2, score: 70, credits: 5 },
  { month: "Feb", methane: 1.8, score: 75, credits: 6 },
  { month: "Mar", methane: 2.1, score: 80, credits: 7 },
  { month: "Apr", methane: 2.4, score: 78, credits: 6 },
  { month: "May", methane: 2.8, score: 82, credits: 8 },
  { month: "Jun", methane: 3.0, score: 85, credits: 9 },
  { month: "Jul", methane: 2.7, score: 83, credits: 8 },
  { month: "Aug", methane: 2.5, score: 81, credits: 7 },
  { month: "Sep", methane: 2.3, score: 79, credits: 6 },
  { month: "Oct", methane: 2.0, score: 76, credits: 6 },
  { month: "Nov", methane: 1.7, score: 74, credits: 5 },
  { month: "Dec", methane: 1.5, score: 72, credits: 5 }
];

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent-green animate-spin" />
        <p className="text-text-muted font-data animate-pulse">Loading Results Dashboard...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getResults(id as string);
        setData(result);
      } catch (err) {
        setError("Failed to load results. Returning to safe mode.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent-green animate-spin" />
        <p className="text-text-muted font-data animate-pulse">Decrypting satellite payload...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center text-accent-red space-y-4">
        <AlertTriangle className="w-16 h-16" />
        <div className="text-xl font-heading">{error || "Data stream corrupted."}</div>
      </div>
    );
  }

  const qState = searchParams.get('state');
  const qDistrict = searchParams.get('district');
  const qLat = searchParams.get('lat');
  const qLng = searchParams.get('lng');
  const qArea = searchParams.get('area');
  const qScore = searchParams.get('score');
  const qMethane = searchParams.get('methane');
  const qCredits = searchParams.get('credits');

  const displayState = qState || data.farmDetails.state;
  const displayDistrict = qDistrict || data.farmDetails.district;
  const displayLat = qLat ? parseFloat(qLat) : data.farmDetails.lat;
  const displayLng = qLng ? parseFloat(qLng) : data.farmDetails.lng;
  const displayArea = qArea ? parseFloat(qArea) : data.farmDetails.area;
  
  const displayScore = qScore ? parseFloat(qScore) : data.complianceScore;
  const displayMethane = qMethane ? parseFloat(qMethane) : data.methaneSaved;
  const displayCredits = qCredits ? parseFloat(qCredits) : 12;

  const isAWD = displayScore > 60;
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const handleDownloadCertificate = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("AWD Compliance Certificate", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Farm Location: ${displayDistrict}, ${displayState}`, 20, 40);
    doc.text(`Coordinates: ${displayLat.toFixed(4)}, ${displayLng.toFixed(4)}`, 20, 50);
    doc.text(`Area: ${displayArea} hectares`, 20, 60);
    
    doc.text(`Compliance Score: ${displayScore}%`, 20, 80);
    doc.text(`Methane Reduced: ${displayMethane} tonnes CO2eq`, 20, 90);
    doc.text(`Carbon Credits Earned: ${displayCredits}`, 20, 100);
    
    doc.text("Verified by AgroSense AI System", 20, 130);
    
    doc.save("AWD_Certificate.pdf");
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-10 font-body relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[20%] w-[50%] h-[30%] bg-accent-green/5 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-10 z-10 relative">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass p-6 rounded-2xl border border-border"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-accent-cyan" />
              <h1 className="text-3xl font-bold font-heading">
                {displayDistrict}, {displayState}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-text-muted text-sm font-data">
              <span>LAT: {displayLat.toFixed(4)}</span>
              <span>LNG: {displayLng.toFixed(4)}</span>
              <span>AREA: {displayArea} ha</span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 bg-accent-green/10 border border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary px-6 py-3 rounded-full transition-all font-bold"
          >
            <Download className="w-5 h-5" /> Download Certificate
          </motion.button>
        </motion.div>

        {/* ROW 1: STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`glass-card p-6 border-t-4 ${isAWD ? 'border-t-accent-green' : 'border-t-accent-red'} relative overflow-hidden`}>
            {isAWD && <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 blur-[30px]" />}
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className={`w-6 h-6 ${isAWD ? 'text-accent-green' : 'text-accent-red'}`} />
              <h3 className="text-text-muted font-medium text-sm tracking-wider uppercase">AWD Status ({currentMonth})</h3>
            </div>
            <div className={`text-xl font-bold font-heading ${isAWD ? 'text-accent-green' : 'text-accent-red'}`}>
              {isAWD ? `AWD VERIFIED ✅` : "NOT VERIFIED ❌"}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-t-4 border-t-accent-cyan relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 blur-[30px]" />
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-6 h-6 text-accent-cyan" />
              <h3 className="text-text-muted font-medium text-sm tracking-wider uppercase">Methane Mitigated ({currentMonth})</h3>
            </div>
            <div className="text-4xl font-bold font-data text-white flex items-baseline">
              <CountUp end={displayMethane} decimals={2} duration={2} />
              <span className="text-lg text-text-muted ml-2">tonnes CO₂eq</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex flex-col justify-center items-center">
             <div className="relative w-24 h-24 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-bg-card-hover" />
                 <motion.circle 
                   initial={{ strokeDasharray: "0 251" }}
                   animate={{ strokeDasharray: `${(displayScore / 100) * 251} 251` }}
                   transition={{ duration: 2, ease: "easeOut" }}
                   cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className={isAWD ? "text-accent-green" : "text-accent-red"} strokeLinecap="round" 
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-xl font-bold font-data text-white">{displayScore.toFixed(0)}%</span>
               </div>
             </div>
             <h3 className="text-text-muted font-medium text-sm mt-3 uppercase tracking-wider">Score ({currentMonth})</h3>
          </motion.div>

          {/* NEW CARD: Carbon Credits Earned */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 border-t-4 border-t-accent-amber relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/10 blur-[30px]" />
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-6 h-6 text-accent-amber" />
              <h3 className="text-text-muted font-medium text-sm tracking-wider uppercase">Carbon Credits Earned</h3>
            </div>
            <div className="text-4xl font-bold font-data text-white flex items-baseline">
              <CountUp end={displayCredits} duration={2} />
              <span className="text-lg text-text-muted ml-2">Carbon Credits</span>
            </div>
            <div className="text-sm text-text-muted mt-2">for {currentMonth}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 border-t-4 border-t-text-muted">
            <div className="flex items-center gap-3 mb-4">
              <Satellite className="w-6 h-6 text-text-muted" />
              <h3 className="text-text-muted font-medium text-sm tracking-wider uppercase">Observation Count</h3>
            </div>
            <div className="text-4xl font-bold font-data text-white flex items-baseline">
              <CountUp end={data.satelliteObservations} duration={2} />
              <span className="text-lg text-text-muted ml-2">Passes</span>
            </div>
          </motion.div>
        </div>

        {/* YEARLY PERFORMANCE ANALYTICS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent-green" /> Yearly Performance Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Methane Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold font-heading mb-4 text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent-cyan" /> Methane Reduction
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d22" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111a14', borderColor: '#1f2d22', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="methane" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3, fill: '#06b6d4' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold font-heading mb-4 text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-green" /> Compliance Score
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d22" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111a14', borderColor: '#1f2d22', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} dot={{ r: 3, fill: '#22c55e' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Credits Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold font-heading mb-4 text-white flex items-center gap-2">
                <Leaf className="w-4 h-4 text-accent-amber" /> Carbon Credits
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2d22" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#111a14', borderColor: '#1f2d22', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="credits" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ROW 2: MAP */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-card p-2 h-[400px] overflow-hidden relative">
           <MapWithNoSSR lat={displayLat} lng={displayLng} area={displayArea} />
        </motion.div>

        {/* ROW 3: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Water Level Area Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2"><Droplets className="w-5 h-5 text-accent-cyan" /> NDWI & Rainfall Over Time</h3>
              <div className="flex items-center gap-4 text-xs font-data">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-cyan" /> NDWI</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-amber" /> Rainfall</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.waterLevelGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNdwi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d22" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111a14', borderColor: '#1f2d22', borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-data)' }} />
                  <Area isAnimationActive={false} yAxisId="left" type="monotone" dataKey="ndwi" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorNdwi)" activeDot={{ r: 6, strokeWidth: 0, fill: '#06b6d4' }} />
                  <Line isAnimationActive={false} yAxisId="right" type="monotone" dataKey="rainfall" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Methane Comparison Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold font-heading mb-8 flex items-center gap-2"><Flame className="w-5 h-5 text-accent-red" /> IPCC Emissions Model</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.methaneChartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d22" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{fontSize: 12, fontFamily: 'var(--font-heading)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'var(--font-data)'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#111a14', borderColor: '#1f2d22', borderRadius: '8px', color: '#fff' }} />
                  <Bar isAnimationActive={false} dataKey="value" barSize={80} radius={[8, 8, 0, 0]}>
                    {data.methaneChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ROW 4: TIMELINE */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold font-heading mb-6 text-white">Observation Timeline</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {data.timelineData.map((item: any, idx: number) => {
              const isFlooded = item.status === 'Flooded';
              const isRain = item.eventType === 'RAIN_EVENT';
              const color = isFlooded ? (isRain ? 'border-accent-amber text-accent-amber' : 'border-accent-cyan text-accent-cyan') : 'border-text-muted text-text-muted';
              
              return (
                <motion.div 
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                  key={idx} 
                  className={`min-w-[160px] bg-bg-primary/50 border-t-2 ${color.split(' ')[0]} p-5 rounded-xl flex-shrink-0 flex flex-col transition-all cursor-default`}
                >
                  <div className="text-xs text-text-muted font-data mb-3">{item.date}</div>
                  <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${color.split(' ')[1]}`}>
                    {item.status}
                  </div>
                  <div className="text-xs text-text-muted">
                    {item.eventType.replace('_', ' ')}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
