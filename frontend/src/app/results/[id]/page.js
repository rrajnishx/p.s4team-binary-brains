"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getResults, downloadCertificate } from '../../../../lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Download, Loader2, CheckCircle, AlertTriangle, ShieldCheck, Droplets, Flame } from 'lucide-react';

export default function ResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getResults(id);
        setData(result);
      } catch (err) {
        setError("Failed to load results.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 text-xl">
        {error || "No data found."}
      </div>
    );
  }

  const isAWD = data.awdStatus === "AWD_DETECTED";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 z-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
              Analysis Results
            </h1>
            <p className="text-gray-400 mt-2">
              Farm Location: {data.farmDetails.district}, {data.farmDetails.state}
            </p>
          </div>
          <button 
            onClick={() => downloadCertificate(id)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full transition-colors font-medium"
          >
            <Download className="w-5 h-5" /> Download Certificate
          </button>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className={`w-6 h-6 ${isAWD ? 'text-emerald-500' : 'text-red-500'}`} />
              <h3 className="text-gray-400 font-medium">AWD Status</h3>
            </div>
            <div className="text-3xl font-bold">{isAWD ? "Verified Compliant" : "Not Detected"}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-blue-500" />
              <h3 className="text-gray-400 font-medium">Methane Saved</h3>
            </div>
            <div className="text-3xl font-bold">{data.methaneSaved.toFixed(2)} <span className="text-lg text-gray-500">kg CH₄</span></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-purple-500" />
              <h3 className="text-gray-400 font-medium">Compliance Score</h3>
            </div>
            <div className="text-3xl font-bold">{data.complianceScore.toFixed(0)} <span className="text-lg text-gray-500">/ 100</span></div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Level Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-400" /> Water Level & Rainfall (12 Weeks)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.waterLevelGraphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" stroke="#888" />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="ndwi" stroke="#3b82f6" strokeWidth={3} name="NDWI (Water Index)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="rainfall" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Rainfall (mm)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Methane Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Emissions Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.methaneChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={80}>
                    {data.methaneChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-6">Observation Timeline</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {data.timelineData.map((item, idx) => (
              <div key={idx} className="min-w-[150px] bg-black/40 border border-white/5 p-4 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-center">
                <div className="text-sm text-gray-400 mb-2">{item.date}</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${item.status === 'Flooded' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {item.status}
                </div>
                <div className="text-xs text-gray-500">
                  {item.eventType.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
