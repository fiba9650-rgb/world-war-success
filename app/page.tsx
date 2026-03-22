'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 아래 본인 키를 꼭 확인해서 넣어주세요!
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');
  const [stats, setStats] = useState({
    days: "22",
    deaths: "12,500+",
    damage: "$450B",
    oil: "$108.00"
  });

  const fetchWarNews = async (isMiddleEastFocus = false) => {
    try {
      setLoading(true);
      // 클릭 시 데이터 즉시 변경
      if (isMiddleEastFocus) {
        setStats({ days: "14", deaths: "3,200+", damage: "$120B", oil: "$114.50 (급등)" });
      } else {
        setStats({ days: "22", deaths: "12,500+", damage: "$450B", oil: "$108.00" });
      }

      const query = isMiddleEastFocus 
        ? 'Iran Israel USA "Strait of Hormuz"' 
        : 'war OR conflict OR military';

      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${GNEWS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        setNews(data.articles.map((art: any) => ({
          source: art.source.name,
          title: art.title,
          url: art.url,
          publishedAt: new Date(art.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        })));
      } else {
        setNews([{ source: "SYSTEM", title: "실시간 데이터를 불러오는 중입니다...", url: "#", publishedAt: "-" }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarNews();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* 상단 섹션 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-red-600 tracking-tighter italic">WARBOARD</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase">Monitor: <span className="text-white font-bold">{activeTab}</span></p>
        </div>
        <button onClick={() => { setActiveTab('Global'); fetchWarNews(false); }} className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900 transition-all">RESET</button>
      </div>

      {/* 통계 카드 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"><h3 className="text-slate-500 text-xs font-bold mb-1">교전 기간</h3><p className="text-3xl font-black">{stats.days}일</p></div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"><h3 className="text-red-400 text-xs font-bold mb-1">추정 사망자</h3><p className="text-3xl font-black text-red-500">{stats.deaths}</p></div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"><h3 className="text-blue-400 text-xs font-bold mb-1">예상 피해액</h3><p className="text-3xl font-black text-blue-400">{stats.damage}</p></div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"><h3 className="text-yellow-500 text-xs font-bold mb-1">유가 변동</h3><p className="text-3xl font-black text-yellow-500">{stats.oil}</p></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 뉴스피드 */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[600px] flex flex-col shadow-2xl">
          <h2 className="text-sm font-black mb-6 border-l-4 border-red-600 pl-3 uppercase">Intelligence Feed</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {news.map((item, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-3 rounded-xl transition-all" onClick={() => window.open(item.url)}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-600 text-[10px] font-black uppercase bg-red-950/20 px-2 py-0.5 rounded">{item.source}</span>
                  <span className="text-slate-600 text-[10px] font-mono">{item.publishedAt}</span>
                </div>
                <p className="text-sm text-slate-300 font-medium leading-snug">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지도 섹션 */}
        <div className="lg:col-span-2 h-[600px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative">
          <Map
            initialViewState={{ longitude: 50.0, latitude: 28.0, zoom: 3.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker 
              longitude={56.3} latitude={26.6} 
              onClick={(e) => { 
                e.originalEvent.stopPropagation(); 
                setActiveTab('Middle East'); 
                fetchWarNews(true); 
              }}
            >
              <div className="cursor-pointer group relative">
                <div className="w-12 h-12 bg-red-600/20 rounded-full animate-ping absolute -top-2 -left-2"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-slate-950 shadow-[0_0_30px_red] flex items-center justify-center text-[10px] font-black text-white relative hover:scale-125 transition-transform">WAR</div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Hormuz Strait Focus</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}