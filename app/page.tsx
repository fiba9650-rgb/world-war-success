'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 아래 두 곳에 본인의 키를 정확히 넣어주세요!
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');

  const fetchWarNews = async (isMiddleEastFocus = false) => {
    try {
      setLoading(true);
      const query = isMiddleEastFocus 
        ? 'Iran AND Israel AND USA AND ("Strait of Hormuz" OR "Red Sea")' 
        : 'war OR conflict OR military';

      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${GNEWS_API_KEY}`
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
      console.error("News Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarNews();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]"></div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">WARBOARD</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            STATUS: <span className={activeTab === 'Global' ? 'text-blue-400' : 'text-red-500 font-bold'}>{activeTab} monitoring</span>
          </p>
        </div>
        <button 
          onClick={() => { setActiveTab('Global'); fetchWarNews(false); }}
          className="text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:text-white hover:bg-slate-800 transition-all"
        >
          GLOBAL RESET
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl h-[700px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 border-l-4 border-red-600 pl-3 uppercase">Live Feed</h2>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-hide">
            {loading ? (
              <p className="text-slate-500 animate-pulse">데이터를 수신 중입니다...</p>
            ) : (
              news.map((item: any, idx) => (
                <div 
                  key={idx} 
                  className="group border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/20 p-2 rounded-lg" 
                  onClick={() => window.open(item.url)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-red-500 text-[10px] font-black uppercase bg-red-950/30 px-2 py-0.5 rounded">{item.source}</span>
                    <span className="text-slate-600 text-[10px]">{item.publishedAt}</span>
                  </div>
                  <p className="text-sm text-slate-300 group-hover:text-white leading-relaxed">{item.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 h-[700px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative">
          <Map
            initialViewState={{ longitude: 48.0, latitude: 30.0, zoom: 3.2 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker 
              longitude={44.36} latitude={33.31}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setActiveTab('Middle East');
                fetchWarNews(true);
              }}
            >
              <div className="cursor-pointer group">
                <div className="w-12 h-12 bg-red-600/20 rounded-full animate-ping absolute -top-2 -left-2"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-slate-950 shadow-[0_0_30px_red] flex items-center justify-center text-[10px] font-black text-white relative">WAR</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}