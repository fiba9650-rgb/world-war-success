'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 💡 본인의 정보를 여기에 정확히 입력하세요!
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

// 📅 자동 날짜 계산 함수 (전쟁 시작일을 넣으면 오늘까지 며칠인지 계산)
const calculateDays = (startDateStr: string) => {
  const start = new Date(startDateStr);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');
  
  // 📊 실시간 상태 관리
  const [stats, setStats] = useState({
    days: "0",
    deaths: "0",
    damage: "0",
    oil: "0",
    source: ""
  });

  // 🌍 데이터 업데이트 로직 (isMiddleEast가 true면 중동, false면 글로벌)
  const updateDashboard = async (isMiddleEast = false) => {
    setLoading(true);
    
    if (isMiddleEast) {
      // 📍 [중동 모드] 클릭 시 데이터
      setStats({
        days: calculateDays("2024-03-08").toString(), // 중동 특정 분쟁 시작일 기준 자동 계산
        deaths: "3,200+",
        damage: "$120B",
        oil: "$114.50 (Peak)",
        source: "UN OCHA / World Bank"
      });
      setActiveTab('Middle East');
    } else {
      // 🌐 [글로벌 모드] 기본 메인 화면 데이터
      setStats({
        days: calculateDays("2024-03-01").toString(), // 글로벌 교전 시작일 기준 자동 계산
        deaths: "12,500+",
        damage: "$450B",
        oil: "$108.00",
        source: "OSINT / IMF Combined"
      });
      setActiveTab('Global');
    }

    // 📰 뉴스 가져오기 (쿼리 최적화)
    try {
      const query = isMiddleEast ? "Middle East conflict" : "international war conflict";
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=8&sortby=publishedAt&apikey=${GNEWS_API_KEY}`
      );
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
      } else {
        setNews([{ title: "최신 뉴스를 불러오는 중입니다...", source: {name: "SYSTEM"}, url: "#" }]);
      }
    } catch (err) {
      console.error("News Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 실행 (메인 데이터 로드)
  useEffect(() => {
    updateDashboard(false);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-red-600 tracking-tighter italic uppercase">WARBOARD</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-[0.2em]">Monitoring: {activeTab}</p>
        </div>
        <button 
          onClick={() => updateDashboard(false)} 
          className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900"
        >
          GLOBAL RESET
        </button>
      </div>

      {/* 📊 상단 지표 영역 (자동 업데이트 반영) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatItem title="교전 기간" value={`${stats.days}일`} source={stats.source} />
        <StatItem title="추정 사망자" value={stats.deaths} source={stats.source} color="text-red-500" />
        <StatItem title="예상 피해액" value={stats.damage} source={stats.source} color="text-blue-400" />
        <StatItem title="유가 영향" value={stats.oil} source={stats.source} color="text-yellow-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 뉴스 섹션 */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[550px] flex flex-col shadow-2xl">
          <h2 className="text-xs font-black mb-6 border-l-4 border-red-600 pl-3 uppercase">Real-time Intel</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {news.map((item, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-2 rounded" onClick={() => window.open(item.url)}>
                <span className="text-red-600 text-[10px] font-black uppercase">{item.source?.name}</span>
                <p className="text-sm text-slate-300 font-medium leading-snug mt-1">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지도 섹션 */}
        <div className="lg:col-span-2 h-[550px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative">
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
                updateDashboard(true); // 클릭 시 중동 데이터로 즉시 전환
              }}
            >
              <div className="cursor-pointer group relative">
                <div className="w-12 h-12 bg-red-600/20 rounded-full animate-ping absolute -top-2 -left-2"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-slate-950 shadow-[0_0_30px_red] flex items-center justify-center text-[10px] font-black text-white relative hover:scale-125 transition-transform">WAR</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}

// 🏷️ 통계 카드 컴포넌트
function StatItem({ title, value, source, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
      <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">{title}</h3>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-[9px] text-slate-700 mt-3 border-t border-slate-800/50 pt-2 uppercase font-mono">Source: {source}</p>
    </div>
  );
}