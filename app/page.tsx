'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // 💡 지도 스타일 필수!

// 🔑 API 키 (본인의 키로 교체하세요)
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
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true); // 🗺️ 지도 로딩 상태
  const [activeTab, setActiveTab] = useState('IDLE');
  const [timeStamp, setTimeStamp] = useState('');
  const [stats, setStats] = useState<any>(null);

  const loadConflictData = async (type: 'MIDDLE_EAST' | 'RUSSIA_UKRAINE') => {
    setLoading(true);
    setMapLoading(true); // 전쟁 변경 시 지도 다시 로딩
    const time = getCurrentTimeStamp();
    setTimeStamp(time);
    
    // 💡 실제로는 여기서 뉴스/유가 API를 호출합니다. (예시 데이터 유지)
    const oilChange = type === 'MIDDLE_EAST' ? 4.2 : -0.8;

    if (type === 'MIDDLE_EAST') {
      setStats({
        type,
        name: "중동 전쟁 (이란-이스라엘 전면전 위기)",
        days: getDiffDays("2026-02-28"), // Day 23
        deaths: "3,200+",
        damage: "$120B",
        oil: { val: "112.40", change: oilChange, src: "Qatar Energy" }
      });
      setActiveTab('중동');
    } else {
      setStats({
        type,
        name: "러시아-우크라이나 전쟁",
        days: getDiffDays("2022-02-24"),
        deaths: "520,000+",
        damage: "$486B",
        oil: { val: "102.15", change: oilChange, src: "Qatar Marine (QP)" }
      });
      setActiveTab('유럽');
    }
    setLoading(false);
  };

  useEffect(() => {
    setTimeStamp(getCurrentTimeStamp());
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-16 font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* 📡 헤더 전광판 */}
      <div className="max-w-7xl mx-auto flex justify-between items-start mb-12 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-5xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WARBOARD</h1>
          <div className="flex gap-4 mt-4 items-center">
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold animate-pulse rounded">LIVE</span>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.4em]">Conflict Intelligence Module / world-war.kr</p>
          </div>
        </div>
        {stats && <button onClick={() => { setStats(null); setActiveTab('IDLE'); }} className="text-[10px] font-bold border border-slate-700 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">CLOSE Intel</button>}
      </div>

      {!stats ? (
        <div className="max-w-7xl mx-auto h-[450px] bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[50px] flex flex-col items-center justify-center space-y-12">
          <p className="text-slate-600 text-xs font-black uppercase tracking-[0.7em] animate-pulse">상황을 확인하려는 전쟁을 선택하십시오</p>
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => loadConflictData('MIDDLE_EAST')} className="px-12 py-6 bg-red-600 text-white rounded-3xl font-black text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(220,38,38,0.3)]">중동 전쟁 (이란-이스라엘)</button>
            <button onClick={() => loadConflictData('RUSSIA_UKRAINE')} className="px-12 py-6 bg-blue-700 text-white rounded-3xl font-black text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(29,78,216,0.3)]">러우 전쟁</button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
          
          {/* 🗺️ 지도 섹션 (가시성 고도화) */}
          <div className="h-[650px] w-full bg-slate-900 rounded-[50px] overflow-hidden border-2 border-slate-800 shadow-2xl relative">
            {mapLoading && (
              <div className="absolute inset-0 bg-slate-950 z-10 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-600 font-mono">Loading Strat-Map...</p>
              </div>
            )}
            <Map
              initialViewState={stats.type === 'MIDDLE_EAST' ? { longitude: 50, latitude: 25, zoom: 4.5 } : { longitude: 35, latitude: 48, zoom: 4.5 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              onLoad={() => setMapLoading(false)} // 💡 지도 로드 완료 시 로딩창 제거
            >
              <NavigationControl position="top-right" />
              {/* 중동 (호르무즈 해협) 마커 */}
              <Marker longitude={stats.type === 'MIDDLE_EAST' ? 56.3 : 37.6} latitude={stats.type === 'MIDDLE_EAST' ? 26.6 : 48.3}>
                <div className="relative group cursor-pointer">
                  {/* 강렬한 펄스 애니메이션 */}
                  <div className={`w-16 h-16 rounded-full animate-ping absolute -top-5 -left-5 opacity-40 ${stats.type === 'MIDDLE_EAST' ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                  {/* 중앙 마커 점 */}
                  <div className={`w-6 h-6 rounded-full border-4 border-white shadow-2xl relative ${stats.type === 'MIDDLE_EAST' ? 'bg-red-600 shadow-red-600' : 'bg-blue-600 shadow-blue-600'}`}></div>
                  {/* 마커 툴팁 (입문자용) */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    {stats.type === 'MIDDLE_EAST' ? '이란-이스라엘 갈등의 핵: 호르무즈 해협' : '치열한 교전 중인 도네츠크 전선'}
                  </div>
                </div>
              </Marker>
            </Map>
          </div>

          {/* 📊 주요 지표 카드 (화살표 로직 적용) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="교전 기간" value={`${stats.days}일차`} color="text-white" sub="2월 28일 암살 사건 이후" />
            <StatCard title="추정 사망자" value={stats.deaths} color="text-red-500" sub="UN OCHA 공식 집계" />
            <StatCard title="경제적 손실" value={stats.damage} color="text-blue-400" sub="World Bank RDNA 추산" />
            <StatCard 
              title={stats.type === 'MIDDLE_EAST' ? "카타르유 (Qatar Marine)" : "유가 영향 (WTI)"} 
              value={`$${stats.oil.val}`} 
              color="text-yellow-500" 
              extra={`${stats.oil.change}%`} // 💡 화살표 로직은 StatCard 내부에 구현
              sub={`출처: ${stats.oil.src}`}
            />
          </div>

        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, color, extra, sub }: any) {
  // 💡 화살표 및 색상 결정 로직
  const changeValue = extra ? parseFloat(extra) : 0;
  const isPositive = changeValue >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const changeColor = isPositive ? 'text-red-500' : 'text-blue-500';

  return (
    <div className="bg-slate-900/40 border-2 border-slate-800 p-10 rounded-[40px] shadow-xl hover:border-slate-700 transition-all group relative overflow-hidden">
      {/* 백그라운드 그리드 효과 (군사용 느낌) */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      
      <h4 className="text-slate-600 text-[10px] font-bold uppercase mb-5 tracking-[0.3em] font-mono relative z-10">{title}</h4>
      <div className="flex items-baseline gap-3 relative z-10">
        <p className={`text-5xl font-black leading-none ${color} tracking-tighter`}>{value}</p>
        {extra && (
          <span className={`text-sm font-black ${changeColor} flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md`}>
            {arrow} {extra}
          </div>
        )}
      </div>
      <p className="text-slate-400 text-[11px] font-medium italic mt-8 leading-relaxed relative z-10 border-t border-slate-800 pt-6">{sub}</p>
    </div>
  );
}