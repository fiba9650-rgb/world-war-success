'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const NEWS_API_KEY = '51ac064dbab6418f93586a06507e6e24'; 

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');

  // 🌍 확장된 키워드 필터링 함수
  const fetchWarNews = async (isMiddleEastFocus = false) => {
    try {
      setLoading(true);
      
      // 💡 전략적 키워드 추가: 호르무즈 해협, 홍해, 원유 가격 등 관련 이슈 포함
      const middleEastQuery = encodeURIComponent(
        '(Iran OR Israel OR USA) AND ("Strait of Hormuz" OR "Red Sea" OR "Houthi" OR "Oil Price" OR "Missile")'
      );
      const globalQuery = encodeURIComponent('war OR conflict OR military');

      const query = isMiddleEastFocus ? middleEastQuery : globalQuery;

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${NEWS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.articles) {
        setNews(data.articles.map((art: any) => ({
          source: art.source.name,
          title: art.title,
          url: art.url,
          publishedAt: new Date(art.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        })));
      }
    } catch (error) {
      console.error("뉴스 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarNews(); }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      {/* 헤더 영역 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]"></div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">WARBOARD</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            현재 모니터링: <span className={activeTab === 'Global' ? 'text-blue-400' : 'text-red-500 font-bold'}>{activeTab} Conflict Area</span>
          </p>
        </div>
        <button 
          onClick={() => { setActiveTab('Global'); fetchWarNews(false); }}
          className="text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:text-white hover:bg-slate-800 transition-all"
        >
          GLOBAL VIEW RESET
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 실시간 뉴스 피드 (스크롤 가능하게 수정) */}
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl h-[700px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center border-l-4 border-red-600 pl-3 tracking-tight">
            INTELLIGENCE FEED
          </h2>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800/50 animate-pulse rounded-xl"></div>)}
              </div>
            ) : (
              news.map((item: any, idx) => (
                <div 
                  key={idx} 
                  className="group border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/20 p-2 rounded-lg transition-all" 
                  onClick={() => window.open(item.url)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-950/30 px-2 py-0.5 rounded">{item.source}</span>
                    <span className="text-slate-600 text-[10px] font-mono">{item.publishedAt}</span>
                  </div>
                  <p className="text-sm text-slate-300 group-hover:text-white leading-relaxed font-medium transition-colors">
                    {item.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 오른쪽: 지도 영역 */}
        <div className="lg:col-span-2 h-[700px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <Map
            initialViewState={{ longitude: 48.0, latitude: 30.0, zoom: 3.2 }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {/* 🔴 중동 마커 (바그다드/이란/이스라엘 중심부) */}
            <Marker 
              longitude={44.36} latitude={33.31}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setActiveTab('Middle East');
                fetchWarNews(true); // 전략적 키워드 필터 활성화
              }}
            >
              <div className="cursor-pointer group relative">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center animate-ping absolute -top-2 -left-2"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-slate-950 shadow-[0_0_30px_red] flex items-center justify-center text-[10px] font-black text-white relative transition-transform group-hover:scale-125">
                  WAR
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                  Hormuz & Middle East Focus
                </div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}