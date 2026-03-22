'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 본인의 정보를 여기에 정확히 입력하세요!
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

// 📅 날짜 및 타임스탬프 계산 함수
const getDiffDays = (date: string) => {
  const start = new Date(date);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const getCurrentTimeStamp = () => {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분 기준`;
};

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Idle');
  const [timeStamp, setTimeStamp] = useState('');
  const [stats, setStats] = useState<any>(null);

  // 🌍 분쟁 데이터 처리 로직
  const loadConflictData = async (type: 'MIDDLE_EAST' | 'RUSSIA_UKRAINE') => {
    setLoading(true);
    const time = getCurrentTimeStamp();
    setTimeStamp(time);

    let query = '';
    if (type === 'MIDDLE_EAST') {
      // 📍 하메나이 암살 사건 (2026-02-28) 기준
      setStats({
        name: "중동 전쟁 (이란-이스라엘)",
        days: getDiffDays("2026-02-28").toString(),
        deaths: { val: "3,200+", src: "UN OCHA (유엔 인도주의업무조정국)" },
        damage: { val: "$120B", src: "World Bank (세계은행) 추산" },
        oil: { val: "112.40", src: "Qatar Energy (QP Official)" }
      });
      setActiveTab('Middle East');
      query = 'Iran Israel Qatar "Strait of Hormuz" conflict';
    } else if (type === 'RUSSIA_UKRAINE') {
      // 📍 러우 전쟁 (2022-02-24 시작 기준 예시)
      setStats({
        name: "러시아-우크라이나 전쟁",
        days: getDiffDays("2022-02-24").toString(),
        deaths: { val: "500,000+", src: "ACLED / UN HR Monitoring" },
        damage: { val: "$486B", src: "IMF / World Bank RDNA-3" },
        oil: { val: "102.15", src: "Qatar Marine (QP)" }
      });
      setActiveTab('Russia-Ukraine');
      query = 'Russia Ukraine war military front';
    }

    try {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_API_KEY}`
      );
      const data = await response.json();
      if (data.articles) setNews(data.articles);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-red-600 tracking-tighter italic uppercase">WARBOARD</h1>
          <p className="text-slate-500 text-[10px] mt-1 font-mono uppercase tracking-[0.3em]">Status: {activeTab}</p>
        </div>
        {stats && (
          <button onClick={() => { setStats(null); setNews([]); setActiveTab('Idle'); }} className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900 transition-all">CLOSE INTEL</button>
        )}
      </div>

      {/* 📊 상단 지표 영역 */}
      <div className="max-w-7xl mx-auto min-h-[180px] mb-10 transition-all">
        {!stats ? (
          <div className="w-full bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 animate-pulse">Select Active Conflict</p>
            <div className="flex flex-wrap justify-center gap-4">
              <ConflictButton name="중동 전쟁 (이란-이스라엘)" onClick={() => loadConflictData('MIDDLE_EAST')} />
              <ConflictButton name="러시아-우크라이나 전쟁" onClick={() => loadConflictData('RUSSIA_UKRAINE')} />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{stats.name}</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="교전 기간" value={`${stats.days}일`} subText="공식 교전 개시일 기준" source="System Auto-calc" />
                <StatCard title="추정 사망자" value={stats.deaths.val} subText={timeStamp} source={`출처: ${stats.deaths.src}`} color="text-red-500" />
                <StatCard title="예상 피해액" value={stats.damage.val} subText={timeStamp} source={`출처: ${stats.damage.src}`} color="text-blue-400" />
                <StatCard title="카타르유 (Qatar Marine)" value={`$${stats.oil.val}`} subText={timeStamp} source={`출처: ${stats.oil.src}`} color="text-yellow-500" />
             </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[550px] flex flex-col shadow-2xl overflow-hidden relative">
          {!stats && <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] z-10 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">Feed Encrypted</div>}
          <h2 className="text-[10px] font-black mb-6 border-l-4 border-red-600 pl-3 uppercase tracking-widest text-slate-400">Live Intel Feed</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {news.map((item, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-2 rounded transition-all" onClick={() => window.open(item.url)}>
                <span className="text-red-600 text-[9px] font-black uppercase tracking-tighter bg-red-950/20 px-2 py-0.5 rounded">{item.source?.name}</span>
                <p className="text-sm text-slate-300 font-medium leading-snug mt-2">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 h-[550px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <Map
            initialViewState={{ longitude: 50.0, latitude: 28.0, zoom: 3.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {/* 🔴 중동 전쟁 마커 (빨간 점) */}
            <Marker longitude={56.3} latitude={26.6} onClick={() => loadConflictData('MIDDLE_EAST')}>
              <div className="cursor-pointer group relative">
                <div className="w-14 h-14 bg-red-600/20 rounded-full animate-ping absolute -top-3 -left-3"></div>
                {/* 📍 'WAR' 글자 대신 빨간색 고정 원으로 변경 */}
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-[0_0_20px_red] relative"></div>
              </div>
            </Marker>
            
            {/* 🔵 러우 전쟁 마커 (파란 점) */}
            <Marker longitude={37.6} latitude={48.3} onClick={() => loadConflictData('RUSSIA_UKRAINE')}>
              <div className="cursor-pointer group relative">
                <div className="w-14 h-14 bg-blue-600/20 rounded-full animate-ping absolute -top-3 -left-3"></div>
                {/* 📍 'WAR' 글자 대신 파란색 고정 원으로 변경 */}
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_20px_blue] relative uppercase"></div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}

// 🏷️ 전쟁 선택 버튼 컴포넌트
function ConflictButton({ name, onClick }: any) {
  return (
    <button onClick={onClick} className="px-6 py-3 bg-red-600/10 border border-red-600/30 rounded-xl text-[11px] font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-tighter shadow-lg shadow-red-900/10">
      {name}
    </button>
  );
}

function StatCard({ title, value, subText, source, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-slate-700 transition-all">
      <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">{title}</h3>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-[9px] text-slate-400 mt-1 font-medium italic">{subText}</p>
      <div className="mt-4 pt-3 border-t border-slate-800/30">
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter leading-tight">{source}</p>
      </div>
    </div>
  );
}