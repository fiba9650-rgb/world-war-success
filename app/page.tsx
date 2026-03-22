'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = '본인의_MAPBOX_토큰';
const ALPHA_VANTAGE_KEY = '본인의_ALPHA_VANTAGE_키';

const getDiffDays = (date: string) => {
  const start = new Date(date);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState(0);

  // 📈 전쟁 위험 지수 계산 로직 (가상 알고리즘)
  const calculateRisk = (oilChange: number, days: number) => {
    let base = 50; // 기본 위험도
    base += Math.abs(oilChange) * 10; // 유가 변동이 클수록 위험
    base += (days / 365) * 5; // 기간이 길어질수록 고착화 위험
    return Math.min(Math.round(base), 100);
  };

  const loadData = async (type: 'MIDDLE_EAST' | 'RUSSIA_UKRAINE') => {
    setLoading(true);
    // 🛢️ 유가 및 리스크 데이터 시뮬레이션 (Alpha Vantage 연동 가능)
    const oilPrice = type === 'MIDDLE_EAST' ? 112.40 : 102.15;
    const oilChange = type === 'MIDDLE_EAST' ? 4.2 : -0.8;
    const days = type === 'MIDDLE_EAST' ? getDiffDays("2026-02-28") : getDiffDays("2022-02-24");
    
    setRiskLevel(calculateRisk(oilChange, days));

    setStats({
      type,
      name: type === 'MIDDLE_EAST' ? "중동 전면전 위기" : "러시아-우크라이나 전쟁",
      days: days,
      deaths: type === 'MIDDLE_EAST' ? "3,200+" : "520,000+",
      damage: type === 'MIDDLE_EAST' ? "$120B" : "$486B",
      brief: type === 'MIDDLE_EAST' 
        ? "2월 28일 하메나이 암살 이후 이란의 보복 선언과 호르무즈 해협 봉쇄 위협으로 긴장 최고조"
        : "동부 전선 고착화 및 에너지 인프라 타격 지속으로 전후 복구 비용 급증 중",
      oil: { val: oilPrice, change: oilChange, src: "Qatar Energy / WTI" }
    });
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 md:p-20 font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* 📡 헤더 전광판 */}
      <div className="max-w-7xl mx-auto flex justify-between items-start mb-16">
        <div>
          <h1 className="text-6xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WARBOARD</h1>
          <div className="flex gap-4 mt-4 items-center">
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold animate-pulse rounded">LIVE</span>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.4em]">Global Conflict Intelligence Service</p>
          </div>
        </div>
        {stats && <button onClick={() => setStats(null)} className="text-[10px] font-bold border border-slate-700 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">CLOSE SYSTEM</button>}
      </div>

      {!stats ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
          <ConflictSelectCard 
            title="MIDDLE EAST" 
            desc="하메나이 암살 사건 이후" 
            color="hover:border-red-600"
            onClick={() => loadData('MIDDLE_EAST')} 
          />
          <ConflictSelectCard 
            title="RUSSIA-UKRAINE" 
            desc="유럽 최대 무력 충돌" 
            color="hover:border-blue-600"
            onClick={() => loadData('RUSSIA_UKRAINE')} 
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
          
          {/* 🚨 위험 지수 섹션 (입문자용) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] flex flex-col justify-center">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-6 tracking-widest">실시간 전황 요약</h3>
              <p className="text-2xl font-bold leading-relaxed text-slate-200">{stats.brief}</p>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] flex flex-col items-center justify-center text-center">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest">전쟁 위험 지수</h3>
              <div className="text-6xl font-black text-red-600 mb-2">{riskLevel}%</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${riskLevel}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-tighter">Current Threat Level: High</p>
            </div>
          </div>

          {/* 📊 주요 지표 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="교전 기간" value={`${stats.days}일`} color="text-white" />
            <StatCard title="추정 사망자" value={stats.deaths} color="text-red-500" />
            <StatCard title="경제적 손실" value={stats.damage} color="text-blue-400" />
            <StatCard 
              title={stats.type === 'MIDDLE_EAST' ? "카타르유 (Price)" : "유가 영향 (WTI)"} 
              value={`$${stats.oil.val}`} 
              color="text-yellow-500" 
              extra={`${stats.oil.change}%`}
            />
          </div>

          {/* 🗺️ 지도 섹션 */}
          <div className="h-[500px] w-full bg-slate-900 rounded-[50px] overflow-hidden border border-slate-800 shadow-2xl relative">
            <Map
              initialViewState={stats.type === 'MIDDLE_EAST' ? { longitude: 50, latitude: 25, zoom: 4 } : { longitude: 35, latitude: 48, zoom: 4 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              <NavigationControl position="top-right" />
              <Marker longitude={stats.type === 'MIDDLE_EAST' ? 56.3 : 37.6} latitude={stats.type === 'MIDDLE_EAST' ? 26.6 : 48.3}>
                <div className={`w-8 h-8 rounded-full border-4 border-white shadow-2xl animate-pulse ${stats.type === 'MIDDLE_EAST' ? 'bg-red-600' : 'bg-blue-600'}`}></div>
              </Marker>
            </Map>
          </div>
        </div>
      )}
    </main>
  );
}

function ConflictSelectCard({ title, desc, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`bg-slate-900/40 border-2 border-slate-800 p-12 rounded-[50px] text-left transition-all ${color} group`}>
      <h3 className="text-4xl font-black tracking-tighter mb-4 group-hover:italic">{title}</h3>
      <p className="text-slate-500 font-medium text-sm">{desc}</p>
      <div className="mt-12 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-t border-slate-800 pt-6">System Initialize →</div>
    </button>
  );
}

function StatCard({ title, value, color, extra }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] shadow-xl">
      <h4 className="text-slate-600 text-[10px] font-bold uppercase mb-4 tracking-widest">{title}</h4>
      <div className="flex items-baseline gap-2">
        <p className={`text-4xl font-black leading-none ${color} tracking-tighter`}>{value}</p>
        {extra && <span className={`text-xs font-bold ${parseFloat(extra) >= 0 ? 'text-red-500' : 'text-blue-500'}`}>{extra}</span>}
      </div>
    </div>
  );
}