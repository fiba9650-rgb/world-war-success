'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 아래 두 곳에 본인의 키를 꼭 넣으세요!
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
      console.error("뉴스 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarNews();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      {/* 상단 헤더 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]"></div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">WARBOARD</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            감시 모드: <span className={activeTab === 'Global' ? 'text-blue-400' : 'text-red-500 font-bold'}>{activeTab} Intelligence</span>
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
        {/* 뉴스 섹션 */}
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl h-[700px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center border-l-4 border-red-600 pl-3 uppercase tracking-tight">
            Live Intelligence Feed
          </h2>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-xl"></div>)}
              </div>
            ) : news.length > 0 ? (
              news.map((item: any, idx) => (
                <div 
                  key={idx} 
                  className="group border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/20 p-2