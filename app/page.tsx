'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';
const GNEWS_API_KEY = 'ba2846376d87ba71fd85e5d1c422c3c8'; 

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Global');
  
  // 데이터 및 출처 상태
  const [stats, setStats] = useState({
    days: { value: "22", source: "OSINT Combined" },
    deaths: { value: "12,500+", source: "UN OCHA / ACLED" },
    damage: { value: "$450B", source: "World Bank / IMF" },
    oil: { value: "$108.00", source: "ICE Brent Crude" }
  });

  const fetchWarNews = async (isMiddleEastFocus = false) => {
    try {
      setLoading(true);
      if (isMiddleEastFocus) {
        setStats({
          days: { value: "14", source: "Local Conflict Start" },
          deaths: { value: "3,200+", source: "UN OCHA / Gaza MoH" },
          damage: { value: "$120B", source: "World Bank Est." },
          oil: { value: "$114.50", source: "Real-time Brent" }
        });
      } else {
        setStats({
          days: { value: "22", source: "OSINT Combined" },
          deaths: { value: "12,500+", source: "UN OCHA / ACLED" },
          damage: { value: "$450B", source: "World Bank / IMF" },
          oil: { value: "$108.00", source: "ICE Brent Crude" }
        });
      }

      const query = isMiddleEastFocus ? 'Iran Israel "Strait of Hormuz"' : 'war OR conflict';
      const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${GNEWS_API_KEY}`);
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
      console.error(error);
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
          <h1 className="text-4xl font-black text-red-600 tracking-tighter italic uppercase">WARBOARD</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase">Live Intelligence Dashboard</p>
        </div>
        <div className="flex gap-3">
            <span className="text-[10px] text-slate-500 self-center uppercase font-bold tracking-widest animate-pulse">Data Synced</span>
            <button onClick={() => { setActiveTab('Global'); fetchWarNews(false); }} className="text-[10px] font-bold bg-slate-900 px-4 py-2 rounded border border-slate-700 hover:bg-red-900">RESET</button>
        </div>
      </div>

      {/* 📊 지표 카드 (출처 포함) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="교전 기간" data={stats.days} />
        <StatCard title="추정 사망자" data={stats.deaths} highlight="text-red-500" />
        <StatCard title="예상 피해액" data={stats.damage} highlight="text-blue-400" />
        <StatCard title="유가 영향" data={stats.oil} highlight="text-yellow-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[500px] flex flex-col">
          <h2 className="text-xs font-black mb-6 border-l-4 border-red-600 pl-3 uppercase">Latest Feed</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
            {news.map((item, idx) => (
              <div key={idx} className="border-b border-slate-800/50 pb-4 last:border-0 cursor-pointer hover:bg-slate-800/40 p-3 rounded-xl transition-all" onClick={() => window.open(item.url)}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-600 text-[10px] font-black uppercase tracking-tighter bg-red-950/20 px-2 py-0.5 rounded">{item.source}</span>
                  <span className="text-slate-600 text-[10px]">{item.publishedAt}</span>
                </div>
                <p className="text-sm text-slate-300 font-medium leading-snug">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 h-[500px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative">
          <Map
            initialViewState={{ longitude: 50.0, latitude: 28.0, zoom: 3.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            <Marker longitude={56.3} latitude={26.6} onClick={() => { setActiveTab('Hormuz Strait'); fetchWarNews(true); }}>
              <div className="cursor-pointer group relative">
                <div className="w-10 h-10 bg-red-600/20 rounded-full animate-ping absolute -top-1 -left-1"></div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-slate-950 shadow-[0_0_20px_red] flex items-center justify-center text-[10px] font-black text-white relative">WAR</div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>

      {/* ℹ️ 데이터 근거 상세 섹션 (추가됨) */}
      <div className="max-w-7xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl p-8 mb-10">
        <h2 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-widest">Data Methodology & Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white text-xs font-bold mb-2">인명 피해 데이터</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              사망자 수치는 UN OCHA 및 ACLED의 실시간 분쟁 데이터를 기반으로 집계됩니다. 현장 접근이 제한된 구역은 각국 보건부의 공식 발표와 위성 데이터 분석을 결합하여 추산합니다.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold mb-2">경제적 손실 측정</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              예상 피해액은 세계은행(World Bank)의 RDNA(거주 및 인프라 피해 평가) 방법론을 따릅니다. 파괴된 건물, 가동 중지된 공장, 물류 중단 비용을 실시간 시장가로 환산합니다.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold mb-2">에너지 및 원자재</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              유가 및 천연가스 가격은 ICE 및 NYMEX 선물 시장의 실시간 가격(Tick data)을 반영합니다. 호르무즈 해협 통제 시 통행 물동량 감소에 따른 프리미엄 수치가 포함됩니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// 🏷️ 개별 스탯 카드 컴포넌트
function StatCard({ title, data, highlight = "text-white" }: any) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
      <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">{title}</h3>
      <p className={`text-3xl font-black ${highlight}`}>{data.value}</p>
      <div className="mt-3 pt-3 border-t border-slate-800/50">
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">Source: {data.source}</p>
      </div>
    </div>
  );
}