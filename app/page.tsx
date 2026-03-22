'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 본인의 정보를 여기에 정확히 입력하세요!
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');
  
  // 📊 초기 데이터 (글로벌)
  const [stats, setStats] = useState({
    days: "22",
    deaths: "12,500+",
    damage: "$450B",
    oil: "$108.00"
  });

  const fetchWarNews = async (isMiddleEastFocus = false) => {
    try {
      setLoading(true);
      
      // 1. 클릭 시 데이터 즉시 변경 (수동 설정으로 정확도 확보)
      if (isMiddleEastFocus) {
        setStats({
          days: "14", // 중동 국지전 발생일 기준
          deaths: "3,200+",
          damage: "$120B",
          oil: "$114.50 (급등)"
        });
      } else {
        setStats({ days: "22", deaths: "12,500+", damage: "$450B", oil: "$108.00" });
      }

      // 2. 뉴스 API 호출 (GNews)
      const query = isMiddleEastFocus 
        ? 'Iran Israel USA "Strait of Hormuz"' 
        : 'war conflict military';

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
        setNews([{ source: "ALERT", title: "해당 지역의 실시간 기사를 불러올 수 없습니다. API 키를 확인하세요.", url: "#", publishedAt: "-" }]);
      }
    } catch (error) {
      console.error("News Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarNews(); }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-red-500/30">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic text-red-600">WARBOARD</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">
            Monitor: <span className="text-white font-bold">{activeTab} Conflict</span>
          </p>
        </div>
        <button 
          onClick={() => { setActiveTab('Global'); fetchWarNews(false); }} 
          className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900 transition-all uppercase"
        >
          Reset to Global
        </button>
      </div>

      {/* 📊 상단 지표 영역 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase mb-1">교전 기간</h3>
          <p className="text-3xl font-black">{stats.days}일</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase mb-1 text-red-400">추정 사망자</h3>
          <p className="text-3xl font-black text-red-500">{stats.deaths}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase mb-1 text-blue-400">예상 피해액</h3>
          <p className="text-3xl font-black text-blue-400">{stats.damage}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase mb-1 text-yellow-500">유가 변동</h3>
          <p className="text-3xl font-black text-yellow-500">{stats.oil}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 뉴스 섹션 */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[600px] flex flex-col shadow-2xl">
          <h2 className="text-sm font-black mb-6 border-l-4 border-red-600 pl-3 uppercase tracking-tighter">Live Intelligence Feed</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {loading ? (
              <p className="text-slate-600 animate-pulse text-xs uppercase font-mono">Incoming Data...</p>
            ) : (
              news.map((item: any, idx) => (
                <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-3 rounded-xl transition-all" onClick={() => window.open(item.url)}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-600 text-[10px] font-black uppercase tracking-tighter bg-red-950/20 px-2 py-0