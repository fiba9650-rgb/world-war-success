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
  const [activeTab, setActiveTab] = useState('Global');
  const [timeStamp, setTimeStamp] = useState('');

  const [stats, setStats] = useState({
    days: "0",
    deaths: { val: "12,500+", src: "UN OCHA / Reuters" },
    damage: { val: "$450B", src: "IMF / Bloomberg" },
    oil: { val: "102.15", src: "Qatar Marine (QP)" }
  });

  const updateDashboard = async (isMiddleEast = false) => {
    setLoading(true);
    setTimeStamp(getCurrentTimeStamp());
    
    if (isMiddleEast) {
      setStats({
        days: getDiffDays("2026-02-28").toString(),
        deaths: { val: "3,200+", src: "조선일보 / AP 통신" },
        damage: { val: "$120B", src: "World Bank / Bloomberg" },
        oil: { val: "112.40", src: "Qatar Energy (Official Price)" }
      });
      setActiveTab('Hormuz Strait');
    } else {
      setStats({
        days: getDiffDays("2026-02-01").toString(),
        deaths: { val: "12,500+", src: "UN OCHA / Reuters" },
        damage: { val: "$450B", src: "IMF / Bloomberg" },
        oil: { val: "102.15", src: "Qatar Marine (QP)" }
      });
      setActiveTab('Global');
    }

    try {
      const query = isMiddleEast ? 'Iran Israel Qatar "Strait of Hormuz"' : 'war conflict';
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_API_KEY}`
      );
      const data = await response.json();
      if (data.articles) setNews(data.articles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDashboard(false);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-red-600 tracking-tighter italic uppercase">WARBOARD</h1>
          <p className="text-slate-500 text-[10px] mt-1 font-mono uppercase tracking-[0.3em]">Sector: {activeTab}</p>
        </div>
        <button onClick={() => updateDashboard(false)} className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900 transition-all">GLOBAL RESET</button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="교전 기간" value={`${stats.days}일`} subText="2월 28일 사건 이후" source="System Auto-calc" />
        <StatCard title="추정 사망자" value={stats.deaths.val} subText={timeStamp} source={stats.deaths.src} color="text-red-500" />
        <StatCard title="예상 피해액" value={stats.damage.val} subText={timeStamp} source={stats.damage.src} color="text-blue-400" />
        <StatCard title="카타르유 (Qatar Marine)" value={`$${stats.oil.val}`} subText={timeStamp} source={stats.oil.src} color="text-yellow-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[550px] flex flex-col shadow-2xl">
          <h2 className="text-[10px] font-black mb-6 border-l-4 border-red-600 pl-3 uppercase tracking-widest text-slate-400">Intelligence Feed</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {news.map((item: any, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-2 rounded transition-all" onClick={() => window.open(item.url)}>
                <span className="text-red-600 text-[9px] font-black uppercase">{item.source?.name}</span>
                <p className="text-sm text-slate-300 font-medium leading-snug mt-1">{item.title}</p>
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
            <Marker longitude={56.3} latitude={26.6} onClick={() => updateDashboard(true)}>
              <div className="cursor-pointer group relative">
                <div className="w-12 h-12 bg-red-600/20 rounded-full animate-ping absolute -top-2 -left-2"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-[0_0_25px_red] flex items-center justify-center text-[10px] font-black text-white relative">WAR</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}

// 🏷️ 개별 카드 컴포넌트 (함수 외부로 명확히 분리)
function StatCard({ title, value, subText, source, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-slate-700 transition-all">
      <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">{title}</h3>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-[9px] text-slate-400 mt-1 font-medium">{subText}</p>
      <div className="mt-3 pt-3 border-t border-slate-800/30">
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">출처: {source}</p>
      </div>
    </div>
  );
}