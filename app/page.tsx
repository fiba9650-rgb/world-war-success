'use client';

import { useState, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 📚 나무위키 및 위키피디아 통합 고증 데이터
const WW1_CHRONICLE: any = {
  name: "제1차 세계 대전 (World War I)",
  summary: "1914년부터 1918년까지 전 세계를 휩쓴 최초의 총력전. 제국주의 열강들의 충돌로 인해 4대 제국이 멸망하고 현대 세계 질서의 기틀이 마련된 거대한 비극입니다.",
  center: { lon: 15.0, lat: 48.0, zoom: 4 },
  events: [
    {
      date: "1914.06.28",
      title: "사라예보 암살 사건",
      location: "사라예보 (Sarajevo)",
      lat: 43.8563, lon: 18.4131,
      desc: "세르비아 민족주의자가 오스트리아-헝가리 제국 황태자를 암살. '유럽의 화약고' 발칸 반도에서 시작된 이 불꽃이 전 세계적인 대전으로 번지는 도화선이 되었습니다.",
      impact: "🔴 전쟁의 서막"
    },
    {
      date: "1914.09.06",
      title: "마른 전투와 참호전의 시작",
      location: "마른강 (Marne R.)",
      lat: 48.9, lon: 3.1,
      desc: "독일의 슐리펜 플랜이 저지당하며 전쟁은 장기전으로 돌입합니다. 스위스부터 북해까지 이어진 거대한 참호선이 형성되었고, 인류는 수년간의 지루하고 처참한 소모전을 마주하게 됩니다.",
      impact: "🟠 교착 상태"
    },
    {
      date: "1916.02.21",
      title: "베르됭 전투 (최악의 소모전)",
      location: "베르됭 (Verdun)",
      lat: 49.16, lon: 5.38,
      desc: "프랑스와 독일군이 맞붙은 대전 중 가장 길고 잔인했던 전투. '베르됭의 도살기'라 불릴 만큼 양측 합산 70만 명 이상의 사상자가 발생하며 소모전의 극치를 보여주었습니다.",
      impact: "🟠 최대 격전"
    },
    {
      date: "1917.04.06",
      title: "미국의 참전 (전세의 역전)",
      location: "대서양/미국 본토",
      lat: 40.0, lon: -40.0, // 대서양 중심 표시
      desc: "독일의 무제한 잠수함 작전과 치머만 전보 사건으로 미국이 연합군 측에 공식 참전합니다. 막대한 자원과 병력을 보유한 미국의 참전은 대전의 승패를 결정짓는 핵심 변곡점이 되었습니다.",
      impact: "🔵 전세 역전"
    },
    {
      date: "1918.11.11",
      title: "종전 협정 (제국의 몰락)",
      location: "콩피에뉴 (Compiègne)",
      lat: 49.4, lon: 2.8,
      desc: "독일 제국의 붕괴와 내부 혁명으로 휴전 협정이 체결되었습니다. 전쟁 결과 독일, 오스트리아, 오스만, 러시아 제국이 해체되었으며 유럽의 지도는 완전히 새롭게 그려졌습니다.",
      impact: "🟢 전쟁 종결"
    }
  ],
  outcome: {
    victors: ["영국", "프랑스", "미국", "이탈리아", "일본", "세르비아"],
    losers: ["독일 제국", "오스트리아-헝가리 제국", "오스만 제국", "불가리아"],
    summary: "베르사유 체제의 성립과 국제 연맹의 창설. 하지만 독일의 가혹한 배상금은 훗날 제2차 세계 대전의 씨앗이 됩니다."
  }
};

export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lon, event.lat],
        zoom: event.title.includes('미국') ? 3 : 6,
        essential: true,
        duration: 2500
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0e0f] text-slate-100 p-6 md:p-12 font-sans selection:bg-red-900/40 overflow-x-hidden">
      {/* 📡 글로벌 헤더 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12 border-b-2 border-slate-800 pb-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WORLD-WAR.KR</h1>
          <p className="text-slate-500 text-xs mt-4 font-mono uppercase tracking-[0.4em] italic leading-none">The Great War Intelligence Archive</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1.5 hover:text-red-500 transition-colors cursor-default underline decoration-red-600/50 underline-offset-4">Verified by Namuwiki & Wikipedia</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 📜 전황 작전 일지 (나무위키 요약 기반) */}
        <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-[50px] p-10 h-[780px] flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-6">{WW1_CHRONICLE.name}</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8 pb-8 border-b border-slate-800">{WW1_CHRONICLE.summary}</p>
          </div>
          
          <div className="space-y-6 overflow-y-auto flex-1 pr-4 custom-scrollbar">
            {WW1_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-7 rounded-[40px] border-2 transition-all cursor-pointer group ${selectedEvent?.title === event.title ? 'bg-red-950/20 border-red-600/60' : 'bg-slate-900/50 border-transparent hover:border-slate-700'}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono text-red-500 font-black tracking-widest">{event.date}</span>
                  <span className="text-[10px] font-black text-white bg-red-600/80 px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">{event.impact}</span>
                </div>
                <h4 className="text-2xl font-black text-white mt-1 leading-tight group-hover:text-red-500 transition-colors">{event.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold mb-5 uppercase italic mt-1">{event.location}</p>
                <p className="text-sm text-slate-300 leading-relaxed font-medium normal-case pt-5 border-t border-slate-800/50">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🗺️ 디지털 작전 지도 및 결과 요약 */}
        <div className="lg:col-span-2 space-y-10">
          <div className="h-[550px] bg-slate-900 rounded-[60px] overflow-hidden border-2 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative">
            <Map
              ref={mapRef}
              initialViewState={WW1_CHRONICLE.center}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              <NavigationControl position="top-right" />
              {WW1_CHRONICLE.events.map((event: any, idx: number) => (
                <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                  <div className="group cursor-pointer relative" onClick={() => handleEventClick(event)}>
                    <div className={`w-6 h-6 rounded-full border-2 border-white shadow-2xl transition-all ${selectedEvent?.title === event.title ? 'bg-red-600 scale-150 animate-pulse shadow-red-600/50' : 'bg-slate-700 opacity-60'}`}></div>
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-950/95 text-red-500 text-[11px] font-black px-4 py-2 rounded-xl border border-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl z-50 whitespace-nowrap">
                      {event.location}
                    </div>
                  </div>
                </Marker>
              ))}
            </Map>
          </div>

          {/* 📊 전쟁의 결과 (Final Report) */}
          <div className="bg-slate-900/30 border-2 border-slate-800 p-10 rounded-[50px] shadow-2xl backdrop-blur-md">
            <h3 className="text-slate-500 text-[10px] font-black uppercase mb-8 tracking-[0.5em] font-mono border-l-4 border-red-600 pl-4 italic">Post-War Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
              <div>
                <p className="text-blue-500 text-sm font-black uppercase tracking-widest mb-4 italic">승전국 (Allied Powers)</p>
                <div className="flex flex-wrap gap-2">
                  {WW1_CHRONICLE.outcome.victors.map((v: string) => (
                    <span key={v} className="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-bold text-white hover:bg-blue-900/50 transition-colors">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-red-500 text-sm font-black uppercase tracking-widest mb-4 italic">패전국 (Central Powers)</p>
                <div className="flex flex-wrap gap-2">
                  {WW1_CHRONICLE.outcome.losers.map((l: string) => (
                    <span key={l} className="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-bold text-white hover:bg-red-900/50 transition-colors">{l}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed border-t border-slate-800 pt-8 italic">
              <span className="text-white font-black not-italic mr-2">요약:</span> {WW1_CHRONICLE.outcome.summary}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}