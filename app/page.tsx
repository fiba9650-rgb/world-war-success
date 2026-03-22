'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

// 📅 날짜 및 타임스탬프 계산 함수 (2월 28일 기준)
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
  const [activeTab, setActiveTab] = useState('Idle'); // 초기 상태 '대기'
  const [timeStamp, setTimeStamp] = useState('');
  
  // 📊 데이터 상태 (초기값은 비어있거나 대기 상태)
  const [stats, setStats] = useState<any>(null);

  const updateDashboard = async (isMiddleEast = false) => {
    setLoading(true);
    const time = getCurrentTimeStamp();
    setTimeStamp(time);
    
    if (isMiddleEast) {
      // 📍 [WAR 마커 클릭 시] 2월 28일 하메나이 암살 사건 이후 국제 지표
      setStats({
        days: getDiffDays("2026-02-28").toString(), // 3/22 기준 23일차
        deaths: { val: "3,200+", src: "UN OCHA (유엔 인도주의업무조정국)" },
        damage: { val: "$120B", src: "World Bank (세계은행) RDNA 모델" },
        oil: { val: "112.40", src: "Qatar Energy (QP Official Price)" }
      });
      setActiveTab('Hormuz Strait Strategic Monitor');

      try {
        const query = 'Iran Israel Qatar "Strait of Hormuz" conflict';
        const response = await fetch(
          `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_API_KEY}`
        );
        const data = await response.json();
        if (data.articles) setNews(data.articles);
      } catch (err) { console.error(err); }
    } else {
      // 🌐 [메인 화면 초기 상태] 데이터 없음
      setStats(null);
      setNews([]);
      setActiveTab('System Idle');
    }
    setLoading(false);
  };

  useEffect(() => {
    // 초기에는 아무것도 로드하지 않고 대기합니다.
    setTimeStamp(getCurrentTimeStamp());
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-red-600 tracking-tighter italic uppercase">WARBOARD</h1>
          <p className="text-slate-500 text-[10px] mt-1 font-mono uppercase tracking-[0.3em]">System: {activeTab}</p>
        </div>
        {stats && (
          <button onClick={() => updateDashboard(false)} className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900 transition-all uppercase">
            Clear Intel
          </button>
        )}
      </div>

      {/* 📊 지표 영역: 마커 클릭 시에만 나타남 */}
      <div className="max-w-7xl mx-auto min-h-[160px] mb-10">
        {!stats ? (
          <div className="w-full h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center bg-slate-900/20 py-10">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.5em] animate-pulse">
              지도의 마커를 클릭하여 실시간 인텔리전스를 수신하십시오
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <StatCard title="교전 기간" value={`${stats.days}일`} subText="2월 28일 사건 이후" source="System Auto-calc" />
            <StatCard title="추정 사망자" value={stats.deaths.val} subText={timeStamp} source={`출처: ${stats.deaths.src}`} color="text-red-500" />
            <StatCard title="예상 피해액" value={stats.damage.val} subText={timeStamp} source={`출처: ${stats.damage.src}`} color="text-blue-400" />
            <StatCard title="카타르유 (Qatar Marine)" value={`$${stats.oil.val}`} subText={timeStamp} source={`출처: ${stats.oil.src}`} color="text-yellow-500" />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {/* 뉴스피드: 데이터가 있을 때만 활성화 */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[550px] flex flex-col shadow-2xl overflow-hidden relative">
          {!stats && <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center text-[10px] text-slate-700 font-bold uppercase tracking-widest">Feed Locked</div>}
          <h2 className="text-[10px] font-black mb-6 border-l-4 border-red-600 pl-3 uppercase tracking-widest text-slate-400">Live Intel</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {news.map((item: any, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-2 rounded transition-all" onClick={() => window.open(item.url)}>
                <span className="text-red-600 text-[9px] font-black uppercase tracking-tighter bg-red-950/20 px-2 py-0.5 rounded">{item.source?.name}</span>
                <p className="text-sm text-slate-300 font-medium leading-snug mt-2">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지도 영역: 마커는 항상 표시 */}
        <div className="lg:col-span-2 h-[550px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <Map
            initialViewState={{ longitude: 50.0, latitude: 28.0, zoom: 3.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker longitude={56.3} latitude={26.6} onClick={() => updateDashboard(true)}>
              <div className="cursor-pointer group relative">
                <div className="w-14 h-14 bg-red-600/10 rounded-full animate-ping absolute -top-3 -left-3"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-[0_0_30px_red] flex items-center justify-center text-[10px] font-black text-white relative hover:scale-125 transition-all">WAR</div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">분쟁 인텔리전스 보기</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
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