'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 발급받은 3가지 키를 여기에 입력하세요
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8';
const ALPHA_VANTAGE_KEY = 'XDGLHB3T4MRBSMA7';

const getDiffDays = (date: string) => {
  const start = new Date(date);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const getCurrentTimeStamp = () => {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 기준`;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeStamp, setTimeStamp] = useState('');

  // 🌍 1. 뉴스에서 실시간 수치(사망자/피해액) 추출
  const fetchLiveStats = async (query: string, fallback: string) => {
    try {
      const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`);
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        const match = data.articles[0].title.match(/[\d,]+/);
        return match ? match[0] : fallback;
      }
      return fallback;
    } catch { return fallback; }
  };

  // 🛢️ 2. WTI 실시간 가격 및 변동폭 가져오기
  const fetchWtiPrice = async () => {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=WTI&apikey=${ALPHA_VANTAGE_KEY}`);
      const data = await res.json();
      if (data.data && data.data.length > 1) {
        const current = parseFloat(data.data[0].value);
        const prev = parseFloat(data.data[1].value);
        const change = ((current - prev) / prev * 100).toFixed(1);
        return { price: current.toFixed(2), change: parseFloat(change) };
      }
      return { price: "0.00", change: 0 };
    } catch { return { price: "0.00", change: 0 }; }
  };

  const loadData = async (type: 'MIDDLE_EAST' | 'RUSSIA_UKRAINE') => {
    setLoading(true);
    setMapLoading(true);
    setTimeStamp(getCurrentTimeStamp());

    const wti = await fetchWtiPrice();
    const deathKey = type === 'MIDDLE_EAST' ? 'Israel Iran "death toll"' : 'Ukraine Russia "casualties"';
    const liveDeaths = await fetchLiveStats(deathKey, type === 'MIDDLE_EAST' ? "3,200" : "520,000");

    setStats({
      type,
      name: type === 'MIDDLE_EAST' ? "중동 전쟁 (이란-이스라엘)" : "러시아-우크라이나 전쟁",
      days: type === 'MIDDLE_EAST' ? getDiffDays("2026-02-28") : getDiffDays("2022-02-24"),
      deaths: `${liveDeaths}+`,
      damage: type === 'MIDDLE_EAST' ? "$120B" : "$486B",
      oil: type === 'MIDDLE_EAST' ? { val: wti.price, change: wti.change, src: "WTI Crude Oil Live" } : null
    });
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-16 font-sans overflow-x-hidden selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto flex justify-between items-start mb-12 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-5xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WARBOARD</h1>
          <p className="text-slate-500 text-[10px] mt-4 font-mono uppercase tracking-[0.4em]">Intelligence Monitoring / world-war.kr</p>
        </div>
        {stats && <button onClick={() => setStats(null)} className="text-[10px] font-bold border border-slate-700 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">BACK TO MENU</button>}
      </div>

      {!stats ? (
        <div className="max-w-7xl mx-auto h-[450px] bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[50px] flex flex-col items-center justify-center space-y-12">
          <p className="text-slate-600 text-xs font-black uppercase tracking-[0.7em] animate-pulse text-center">현재 분석 중인 주요 분쟁 지역</p>
          <div className="flex flex-wrap justify-center gap-6 px-4">
            <button onClick={() => loadData('MIDDLE_EAST')} className="px-12 py-6 bg-red-600 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-red-900/40">중동 전쟁 (이란-이스라엘)</button>
            <button onClick={() => loadData('RUSSIA_UKRAINE')} className="px-12 py-6 bg-blue-700 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-blue-900/40">러시아-우크라이나 전쟁</button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
          
          <div className="h-[650px] w-full bg-slate-900 rounded-[50px] overflow-hidden border-2 border-slate-800 shadow-2xl relative">
            {mapLoading && (
              <div className="absolute inset-0 bg-slate-950 z-10 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-600 font-mono tracking-widest uppercase italic">Loading Intelligence Map...</p>
              </div>
            )}
            <Map
              initialViewState={stats.type === 'MIDDLE_EAST' ? { longitude: 50, latitude: 25, zoom: 4.5 } : { longitude: 35, latitude: 48, zoom: 4.5 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              onLoad={() => setMapLoading(false)}
            >
              <NavigationControl position="top-right" />
              <Marker longitude={stats.type === 'MIDDLE_EAST' ? 56.3 : 37.6} latitude={stats.type === 'MIDDLE_EAST' ? 26.6 : 48.3}>
                <div className="relative cursor-pointer">
                  <div className={`w-16 h-16 rounded-full animate-ping absolute -top-5 -left-5 opacity-40 ${stats.type === 'MIDDLE_EAST' ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                  <div className={`w-6 h-6 rounded-full border-4 border-white shadow-2xl relative ${stats.type === 'MIDDLE_EAST' ? 'bg-red-600 shadow-red-600' : 'bg-blue-600 shadow-blue-600'}`}></div>
                </div>
              </Marker>
            </Map>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.type === 'MIDDLE_EAST' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
            <StatCard title="교전 기간" value={`${stats.days}일차`} sub="공식 교전일 기준 자동 계산" color="text-white" />
            <StatCard title="추정 사망자" value={stats.deaths} sub={timeStamp} color="text-red-500" extra="실시간 마이닝" />
            <StatCard title="예상 피해액" value={stats.damage} sub={timeStamp} color="text-blue-400" extra="추정치" />
            {stats.oil && (
              <StatCard 
                title="WTI Crude Oil" 
                value={`$${stats.oil.val}`} 
                color="text-yellow-500" 
                extra={`${stats.oil.change}%`} 
                sub={`최신 변동폭 기준`}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, color, extra, sub }: any) {
  const changeValue = extra && extra.includes('%') ? parseFloat(extra) : 0;
  const isPositive = changeValue >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';

  return (
    <div className="bg-slate-900/40 border-2 border-slate-800 p-10 rounded-[40px] shadow-xl hover:border-slate-700 transition-all group overflow-hidden relative">
      <h4 className="text-slate-600 text-[10px] font-bold uppercase mb-4 tracking-[0.3em] font-mono">{title}</h4>
      <div className="flex items-baseline gap-3 relative z-10">
        <p className={`text-4xl font-black leading-none ${color} tracking-tighter`}>{value}</p>
        {extra && extra.includes('%') && (
          <span className={`text-sm font-black ${changeColor} flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md`}>
            {arrow} {extra}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-[11px] font-medium italic mt-8 border-t border-slate-800 pt-6">
        {sub}
      </p>
    </div>
  );
}