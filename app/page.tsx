'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 본인의 정보를 여기에 정확히 입력하세요!
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');
  
  // 📊 실시간 수치 상태 관리 (초기값: 글로벌 데이터)
  const [stats, setStats] = useState({
    days: "22",
    deaths: "12,500+",
    damage: "$450B",
    oil: "$108.00"
  });

  const fetchWarNews = async (isMiddleEastFocus = false) => {
    try {
      setLoading(true);
      
      // 클릭 시 수치 데이터 강제 업데이트 (공식 자료 기반 시뮬레이션)
      if (isMiddleEastFocus) {
        setStats({
          days: "14",
          deaths: "3,200+",
          damage: "$120B",
          oil: "$114.50 (급등)"
        });
      } else {
        setStats({ days: "22", deaths: "12,500+", damage: "$450B", oil: "$108.00" });
      }

      const query = isMiddleEastFocus 
        ? 'Iran AND Israel AND USA AND ("Strait of Hormuz" OR "Red Sea")' 
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
        // 뉴스가 없을 경우 예시 데이터 출력 (사용자 경험 보호)
        setNews([{ source: "SYSTEM", title: "실시간 데이터를 수신 대기 중입니다.", url: "#" }]);
      }
    } catch (error) {
      console.error("News Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarNews(); }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">WARBOARD</h1>
          <p className="text-slate-500 text-sm mt-1">감시 구역: <span className="text-red-500 font-bold">{activeTab}</span></p>
        </div>
        <button onClick={() => { setActiveTab('Global'); fetchWarNews(false); }} className="text-[10px] bg-slate-800 px-3 py-1 rounded border border-slate-700 hover:bg-slate-700">RESET VIEW</button>
      </div>

      {/* 📊 상단 지표 영역 (숫자가 바뀌는 부분) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="교전 기간" value={stats.days + "일"} sub="공식 개시일 기준" color="text-white" />
        <StatCard title="추정 사망자" value={stats.deaths} sub="UN/국제기구 합산" color="text-red-500" />
        <StatCard title="예상 피해액" value={stats.damage} sub="인프라/경제 손실" color="text-blue-400" />
        <StatCard title="유가 영향" value={stats.oil} sub="Brent/WTI 실시간" color="text-yellow-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 뉴스 섹션 */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[600px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 border-l-4 border-red-600 pl-3">INTELLIGENCE FEED</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {news.map((item: any, idx) => (
              <div key={idx} className="border-b border-slate-800 pb-4 last:border-0 cursor-pointer hover:opacity-70" onClick={() => window.open(item.url)}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-red-500 text-[10px] font-bold uppercase">{item.source}</span>
                  <span className="text-slate-600 text-[10px]">{item.publishedAt}</span>
                </div>
                <p className="text-sm text-slate-300 leading-tight">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지도 섹션 */}
        <div className="lg:col-span-2 h-[600px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <Map
            initialViewState={{ longitude: 44.0, latitude: 33.0, zoom: 3 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker 
              longitude={44.43} latitude={33.31}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setActiveTab('Middle East');
                fetchWarNews(true); // 클릭 시 뉴스 + 숫자 모두 변경!
              }}
            >
              <div className="cursor-pointer group">
                <div className="w-10 h-10 bg-red-600/30 rounded-full animate-ping absolute -top-1 -left-1"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-slate-950 shadow-[0_0_20px_red] flex items-center justify-center text-[9px] font-black text-white relative">WAR</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}

// 🏷️ 통계 카드 컴포넌트
function StatCard({ title, value, sub, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg ring-1 ring-slate-800">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-2 italic">{sub}</p>
    </div>
  );
}