'use client';

import { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const mapRef = useRef<MapRef>(null);
  const [stats, setStats] = useState<any>(null);
  const [timeStamp, setTimeStamp] = useState('');
  const [popupInfo, setPopupInfo] = useState<any>(null);

  const fetchLiveStats = async (query: string, fallback: string) => {
    try {
      const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=3&apikey=${GNEWS_API_KEY}`);
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        const match = data.articles[0].title.match(/[\d,]+/);
        return match ? match[0] : fallback;
      }
      return fallback;
    } catch { return fallback; }
  };

  const fetchBcomclPrice = async () => {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=WTI&apikey=${ALPHA_VANTAGE_KEY}`);
      const data = await res.json();
      if (data.data && data.data.length > 1) {
        const rawCurrent = parseFloat(data.data[0].value);
        const rawPrev = parseFloat(data.data[1].value);
        const bcomclIndex = rawCurrent * 2.0867;
        const absoluteChange = (rawCurrent - rawPrev) * 2.0867;
        const percentChange = ((rawCurrent - rawPrev) / rawPrev * 100).toFixed(2);
        return { price: bcomclIndex.toFixed(4), abs: absoluteChange.toFixed(4), percent: percentChange };
      }
      return { price: "134.6332", abs: "3.6731", percent: "2.80" };
    } catch { return { price: "134.6332", abs: "3.6731", percent: "2.80" }; }
  };

  // 🖱️ 작전 일지 클릭 시 지도만 이동 (FlyTo)
  const handleTimelineClick = (item: any) => {
    setPopupInfo(item);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [item.lon, item.lat],
        zoom: 7.5,
        essential: true,
        duration: 2500 // 2.5초 동안 부드럽게 이동
      });
    }
  };

  const loadData = async (type: 'MIDDLE_EAST' | 'RUSSIA_UKRAINE') => {
    setTimeStamp(getCurrentTimeStamp());
    setPopupInfo(null);
    const oil = await fetchBcomclPrice();
    const deathKey = type === 'MIDDLE_EAST' ? 'Israel Iran "death toll"' : 'Ukraine Russia "casualties"';
    const liveDeaths = await fetchLiveStats(deathKey, type === 'MIDDLE_EAST' ? "3,200" : "520,000");

    setStats({
      type,
      name: type === 'MIDDLE_EAST' ? "중동 전면전 상황실" : "러우 전쟁 상황실",
      days: type === 'MIDDLE_EAST' ? getDiffDays("2026-02-28") : getDiffDays("2022-02-24"),
      deaths: `${liveDeaths}+`,
      damage: type === 'MIDDLE_EAST' ? "$120B" : "$486B",
      oil: type === 'MIDDLE_EAST' ? oil : null,
      timeline: type === 'MIDDLE_EAST' ? [
        { date: "02.28 11:40", event: "테헤란 內 하메나이 암살 (정밀 드론 타격)", risk: "🔴 위기", lat: 35.6892, lon: 51.3890 },
        { date: "02.28 14:15", event: "이란 국가안보최고회의 긴급 소집 및 보복 선포", risk: "🔴 위기", lat: 35.6892, lon: 51.3890 },
        { date: "03.02 03:00", event: "호르무즈 해협 이란 해군 전면 봉쇄 단행", risk: "🔴 위기", lat: 26.59, lon: 56.45 },
        { date: "03.05 09:00", event: "이스라엘 국방부(IDF) 예비군 추가 소집 및 비상경계", risk: "🟠 경계", lat: 31.7683, lon: 35.2137 },
        { date: "03.15 22:30", event: "미 해군 제5함대 항공모함 타격단 전진 배치", risk: "🟠 경계", lat: 26.2, lon: 50.6 },
        { date: "03.22 현재", event: "이란 탄도 미사일 기지 가동 포착 / 위기 최고조", risk: "🔴 위기", lat: 32.65, lon: 51.66 }
      ] : [
        { date: "22.02.24", event: "러시아 군, 우크라이나 전면 침공 개시", risk: "🔴 위기", lat: 50.45, lon: 30.52 },
        { date: "26.03 현재", event: "동부 전선 소모전 지속 및 드론 공격 격화", risk: "🟠 경계", lat: 48.37, lon: 38.01 }
      ]
    });
  };

  useEffect(() => { setTimeStamp(getCurrentTimeStamp()); }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WARBOARD</h1>
          <p className="text-slate-500 text-[9px] mt-3 font-mono uppercase tracking-[0.5em]">Strategic Intelligence / world-war.kr</p>
        </div>
        {stats && <button onClick={() => setStats(null)} className="text-[10px] font-bold border border-slate-700 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">EXIT MONITOR</button>}
      </div>

      {!stats ? (
        <div className="max-w-7xl mx-auto h-[400px] bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[50px] flex flex-col items-center justify-center space-y-10">
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => loadData('MIDDLE_EAST')} className="px-12 py-6 bg-red-600 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl">중동 전쟁 분석</button>
            <button onClick={() => loadData('RUSSIA_UKRAINE')} className="px-12 py-6 bg-blue-700 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-2xl">러우 전쟁 분석</button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
          
          <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.type === 'MIDDLE_EAST' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            <StatCard title="교전 기간" value={`${stats.days}일차`} sub="실시간 추적 중" color="text-white" />
            <StatCard title="추정 사망자" value={stats.deaths} sub={timeStamp} color="text-red-500" extra="LIVE" />
            <StatCard title="경제적 피해" value={stats.damage} sub={timeStamp} color="text-blue-400" />
            {stats.oil && (
              <StatCard title="WTI Index" value={stats.oil.price} color="text-yellow-500" oilInfo={stats.oil} sub="Bloomberg BCOMCL" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 📜 깔끔한 작전 일지 리스트 */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 h-[550px] flex flex-col overflow-hidden">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-8 tracking-widest border-l-4 border-red-600 pl-3 italic font-black">Tactical Log</h3>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                {stats.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative pl-6 border-l border-slate-800 pb-5 last:border-0 cursor-pointer group" onClick={() => handleTimelineClick(item)}>
                    <div className="absolute -left-[5px] top-1 w-2 h-2 bg-slate-700 rounded-full group-hover:bg-red-600 transition-colors"></div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-red-500 font-black">{item.date}</span>
                      <span className="text-[8px] font-black text-slate-100 bg-red-950 px-2 py-0.5 rounded uppercase tracking-tighter">{item.risk}</span>
                    </div>
                    <p className="text-sm text-slate-300 font-bold leading-relaxed group-hover:text-white transition-colors tracking-tight">{item.event}</p>
                    <p className="text-[9px] text-slate-600 mt-1 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">지도에서 위치 보기 →</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 🗺️ 지도 모니터 */}
            <div className="lg:col-span-2 h-[550px] bg-slate-900 rounded-[40px] overflow-hidden border border-slate-800 shadow-2xl relative">
              <Map
                ref={mapRef}
                initialViewState={{ longitude: 50, latitude: 25, zoom: 4 }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <NavigationControl position="top-right" />
                
                {popupInfo && (
                  <Popup longitude={popupInfo.lon} latitude={popupInfo.lat} anchor="top" onClose={() => setPopupInfo(null)} className="z-50" closeButton={false}>
                    <div className="p-3 text-black max-w-[220px]">
                      <p className="text-[10px] font-black text-red-600 mb-1">{popupInfo.date} • {popupInfo.risk}</p>
                      <p className="text-xs font-black leading-snug">{popupInfo.event}</p>
                    </div>
                  </Popup>
                )}
                
                <Marker longitude={56.3} latitude={26.6}>
                  <div className="relative cursor-pointer">
                    <div className="w-12 h-12 rounded-full animate-ping absolute -top-4 -left-4 opacity-20 bg-red-600"></div>
                    <div className="w-4 h-4 rounded-full border-2 border-white bg-red-600 shadow-2xl"></div>
                  </div>
                </Marker>
              </Map>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, color, sub, oilInfo }: any) {
  const isOil = !!oilInfo;
  const isPositive = oilInfo ? parseFloat(oilInfo.abs) >= 0 : true;

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[30px] shadow-xl hover:bg-slate-900 transition-all">
      <h4 className="text-slate-600 text-[8px] font-bold uppercase mb-3 tracking-[0.2em] font-mono">{title}</h4>
      <div className="flex flex-col gap-1">
        <p className={`text-4xl font-black leading-none ${color} tracking-tighter`}>{value}</p>
        {isOil && (
          <span className={`text-[10px] font-black ${isPositive ? 'text-red-500' : 'text-blue-500'} flex items-center gap-1 mt-2`}>
            {isPositive ? '▲' : '▼'} +{oilInfo.abs} (+{oilInfo.percent}%)
          </span>
        )}
      </div>
      <p className="text-slate-500 text-[9px] font-bold mt-4 border-t border-slate-800/50 pt-3 tracking-tighter uppercase italic">{sub}</p>
    </div>
  );
}