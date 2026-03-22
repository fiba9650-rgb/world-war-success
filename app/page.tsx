'use client'; 

import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q'; 

// --- 데이터 정의 (공식 자료 기반 시뮬레이션) ---
const WAR_DATA = {
  default: {
    title: "글로벌 분쟁 현황",
    stats: { days: "22", deaths: "12,500+", refugees: "1.2M", oil: "$108.00" },
    news: [
      { tag: "군사", source: "Reuters", content: "미 국방부, 주요 미사일 기지 정밀 타격 발표" },
      { tag: "외교", source: "AP News", content: "UN 안보리, 중동 지역 휴전안 표결 예정" }
    ]
  },
  middleEast: {
    title: "이란 - 이스라엘 / 미국 분쟁",
    stats: { days: "14", deaths: "3,200+", refugees: "450K", oil: "$112.50 (WTI)" },
    news: [
      { tag: "공식", source: "Reuters", content: "이스라엘 국방부: 이란 본토 미사일 시설 7곳 타격 확인" },
      { tag: "속보", source: "AP", content: "미 해군 5함대, 호르무즈 해협 통행 전면 통제 발표" },
      { tag: "경제", source: "Bloomberg", content: "중동발 공급망 마비로 인한 글로벌 유가 15% 추가 급등 전망" }
    ]
  }
};

export default function Home() {
  // 현재 선택된 전쟁 데이터를 관리하는 '상태'입니다.
  const [selectedWar, setSelectedWar] = useState(WAR_DATA.default);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-black text-white tracking-tighter">WARBOARD</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium italic">{selectedWar.title} 모니터링 중</p>
        </div>
        <button 
          onClick={() => setSelectedWar(WAR_DATA.default)}
          className="text-xs text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800 hover:bg-blue-800/50"
        >
          전체 보기 초기화
        </button>
      </div>

      {/* 상단 지표 카드: 선택된 데이터에 따라 숫자가 변함 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="교전 기간" value={selectedWar.stats.days + "일째"} sub="공식 교전 개시일 기준" color="text-white" />
        <StatCard title="추정 사망자" value={selectedWar.stats.deaths} sub="국제기구(UN) 합산치" color="text-red-500" />
        <StatCard title="난민 발생" value={selectedWar.stats.refugees} sub="주변국 유입 공식 집계" color="text-blue-400" />
        <StatCard title="유가 영향" value={selectedWar.stats.oil} sub="실시간 중동유 등락 반영" color="text-yellow-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 실시간 뉴스 피드 */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center border-l-4 border-red-600 pl-3">
            {selectedWar.title} 관련 뉴스
          </h2>
          <div className="space-y-6">
            {selectedWar.news.map((item, idx) => (
              <div key={idx} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-900 text-red-200 text-[10px] px-2 py-0.5 rounded font-bold">{item.tag}</span>
                  <span className="text-slate-500 text-xs font-mono">{item.source}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 지도 영역 */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[600px] relative">
          <Map
            initialViewState={{ longitude: 35.0, latitude: 35.0, zoom: 2.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11" 
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {/* 📍 이란-이스라엘 마커 클릭 시 데이터 변경 */}
            <Marker 
              longitude={35.21} latitude={31.76} anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedWar(WAR_DATA.middleEast);
              }}
            >
              <div className="cursor-pointer group">
                <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,1)]"></div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                  중동 분쟁 지역 (클릭)
                </div>
              </div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}

// 컴포넌트들
function StatCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string; }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg ring-1 ring-slate-800">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-2">{sub}</p>
    </div>
  );
}