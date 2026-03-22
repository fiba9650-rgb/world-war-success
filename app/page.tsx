'use client';

import { useState, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 📚 위키피디아 고증 기반 1차 세계 대전 (WW1) 정밀 데이터
const WW1_CHRONICLE: any = {
  name: "제1차 세계 대전 (The Great War)",
  summary: "1914년부터 1918년까지 전 세계적으로 벌어진 사상 초유의 총력전. 유럽을 중심으로 한 동맹국과 연합국의 대결.",
  center: { lon: 15.0, lat: 48.0, zoom: 4 }, // 유럽 중심 뷰포트
  events: [
    {
      date: "1914.06.28",
      title: "사라예보 암살 사건",
      location: "사라예보 (Sarajevo)",
      lat: 43.8563, lon: 18.4131,
      desc: "오스트리아-헝가리 제국 황태자 부부가 세르비아 민족주의자에게 암살당함. 대전 발발의 직접적인 도화선.",
      impact: "🔴 발발 (암살)"
    },
    {
      date: "1914.08.04",
      title: "슐리펜 플랜 발동 및 벨기에 침공",
      location: "리에주 (Liège)",
      lat: 50.64, lon: 5.57,
      desc: "독일군이 벨기에를 침공하며 프랑스로 진격. 영국이 독일에 선전포고하며 대전이 전 유럽으로 확대됨.",
      impact: "🔴 침공"
    },
    {
      date: "1914.09.06",
      title: "제1차 마른 전투 (Battle of the Marne)",
      location: "마른강 (Marne R.)",
      lat: 48.9, lon: 3.1,
      desc: "프랑스·영국 연합군이 독일군의 파리 진격을 저지. 이후 서부 전선은 장기간의 교착된 참호전으로 변모.",
      impact: "🟠 교전 (저지)"
    },
    {
      date: "1916.07.01",
      title: "솜 전투 개시 (Battle of the Somme)",
      location: "솜강 (Somme R.)",
      lat: 49.9, lon: 2.7,
      desc: "연합군의 대규모 공세. 첫날에만 영국군 6만 명 사상. 탱크가 처음 등장한 전투로, 대전 중 가장 처참한 소모전.",
      impact: "🟠 교전 (소모전)"
    },
    {
      date: "1917.04.06",
      title: "미국의 참전 선언 (US Enters War)",
      location: "워싱턴 D.C. (Washington)",
      lat: 38.9, lon: -77.0, // 지도 자동 이동 시 유럽에서 줌아웃됨
      desc: "독일의 무제한 잠수함 작전과 치머만 전보 사건으로 미국이 연합군 측에 참전. 대전의 천칭이 연합군 쪽으로 급격히 기울어짐.",
      impact: "🔵 참전"
    },
    {
      date: "1918.11.11",
      title: "종전 협정 체결 (Armistice Day)",
      location: "콩피에뉴 (Compiègne)",
      lat: 49.4, lon: 2.8,
      desc: "독일이 연합군과 휴전 협정에 서명하며 4년 4개월간의 교전이 종식됨. 전 유럽의 제국들이 몰락하는 계기가 됨.",
      impact: "🟢 종전"
    }
  ],
  outcome: {
    victors: {
      group: "연합국 (Allied Powers)",
      nations: ["영국", "프랑스", "러시아(1917 탈퇴)", "이탈리아(1915 참전)", "미국(1917 참전) 등"]
    },
    losers: {
      group: "동맹국 (Central Powers)",
      nations: ["독일 제국", "오스트리아-헝가리 제국", "오스만 제국", "불가리아 등"]
    },
    impact: "독일, 오스트리아, 오스만, 러시아 등 4대 제국의 멸망 및 베르사유 체제 성립."
  }
};

export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [timeStamp, setTimeStamp] = useState('');

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lon, event.lat],
        zoom: event.title.includes('미국') ? 3 : 6, // 미국의 경우 줌아웃
        essential: true,
        duration: 2500
      });
    }
  };

  useEffect(() => {
    // 💡 위키피디아 최종 고증 날짜 설정
    setTimeStamp("2026.03.22 위키피디아 고증 기준");
  }, []);

  return (
    <main className="min-h-screen bg-[#0f1011] text-stone-100 p-6 md:p-16 font-sans selection:bg-red-900/40 overflow-x-hidden">
      {/* 📡 글로벌 헤더: world-war 로 복귀 및 가독성 강화 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12 border-b-2 border-stone-800 pb-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WORLD-WAR.KR</h1>
          <p className="text-stone-400 text-xs mt-5 font-mono uppercase tracking-[0.5em]">{timeStamp}</p>
        </div>
        <div className="text-right">
          <p className="text-stone-600 text-[9px] font-black uppercase tracking-widest mb-1.5 hover:text-red-500">Source: Wikipedia canon</p>
          <span className="text-xs font-black text-white bg-red-600 px-5 py-2 rounded-full uppercase tracking-wider shadow-inner">INTEL MONITOR</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 📜 전황 작전 일지 (디테일 강화) */}
        <div className="lg:col-span-1 bg-stone-900/30 border border-stone-800 rounded-[40px] p-10 h-[750px] flex flex-col overflow-hidden shadow-inner hover:border-stone-700 transition-all">
          <div className="mb-10 border-b border-stone-800 pb-8">
            <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">{WW1_CHRONICLE.name}</h2>
            <p className="text-xs text-stone-300 mt-5 leading-relaxed font-medium">{WW1_CHRONICLE.summary}</p>
          </div>
          
          <div className="space-y-6 overflow-y-auto flex-1 pr-4 custom-scrollbar">
            {WW1_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-7 rounded-[35px] border-2 transition-all cursor-pointer ${selectedEvent?.title === event.title ? 'bg-red-950/20 border-red-600/60' : 'bg-stone-900 border-transparent hover:border-stone-800'}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-mono text-red-500 font-bold tracking-widest">{event.date}</span>
                  <span className="text-[9px] font-black text-slate-100 bg-red-950 px-2 py-0.5 rounded tracking-tighter uppercase">{event.impact}</span>
                </div>
                <h4 className="text-2xl font-black text-white mt-2 leading-tight tracking-tight">{event.title}</h4>
                <p className="text-xs text-stone-500 font-bold mb-5 uppercase tracking-tighter italic">{event.location}</p>
                <p className="text-sm text-stone-300 leading-relaxed font-medium normal-case border-t border-stone-800/50 pt-5">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🗺️ 디지털 작전 지도 (MapRef 추가 및 스타일 최적화) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[600px] bg-stone-900 rounded-[60px] overflow-hidden border-2 border-stone-800 shadow-2xl relative group">
            <Map
              ref={mapRef}
              initialViewState={WW1_CHRONICLE.center}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
            >
              <NavigationControl position="top-right" />
              
              {/* WW1 주요 사건 마커 */}
              {WW1_CHRONICLE.events.map((event: any, idx: number) => (
                <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                  <div className="group cursor-pointer relative" onClick={() => handleEventClick(event)}>
                    <div className={`w-6 h-6 rounded-full border-2 border-white shadow-2xl transition-all ${selectedEvent?.title === event.title ? 'bg-red-600 scale-150 animate-pulse' : 'bg-stone-700 opacity-60'}`}></div>
                    
                    {/* 지도 위 지명 라벨 */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-stone-950/95 text-red-500 text-[10px] font-black px-3 py-1.5 rounded-md border border-red-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap z-30">
                      {event.location}
                    </div>
                  </div>
                </Marker>
              ))}

              {selectedEvent && (
                <Popup
                  longitude={selectedEvent.lon}
                  latitude={selectedEvent.lat}
                  anchor="bottom"
                  onClose={() => setSelectedEvent(null)}
                  closeButton={false}
                  className="z-50"
                >
                  <div className="p-4 text-black font-sans max-w-[250px] bg-white rounded-xl">
                    <span className="text-[10px] font-mono text-red-600 font-black">{selectedEvent.date} CAMPAIGN</span>
                    <h5 className="text-lg font-black mb-1.5 leading-tight tracking-tight">{selectedEvent.title}</h5>
                    <p className="text-xs leading-snug font-medium text-stone-700">{selectedEvent.desc}</p>
                  </div>
                </Popup>
              )}
            </Map>
          </div>

          {/* 📊 전쟁 결과 요약 섹션 (Outcome Panel) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OutcomeCard 
              title="승전국 (The Allies)" 
              group={WW1_CHRONICLE.outcome.victors.group} 
              nations={WW1_CHRONICLE.outcome.victors.nations} 
              color="text-blue-500"
            />
            <OutcomeCard 
              title="패전국 (Central Powers)" 
              group={WW1_CHRONICLE.outcome.losers.group} 
              nations={WW1_CHRONICLE.outcome.losers.nations} 
              color="text-red-500"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// 🏷️ 결과 요약 카드 컴포넌트
function OutcomeCard({ title, group, nations, color }: any) {
  return (
    <div className="bg-stone-900/60 border border-stone-800 p-8 rounded-[35px] shadow-xl hover:border-stone-700 transition-all">
      <h4 className="text-stone-500 text-[10px] font-bold uppercase mb-4 tracking-[0.3em] font-mono">{title}</h4>
      <div className="flex flex-col gap-1">
        <p className={`text-3xl font-black leading-none ${color} tracking-tighter uppercase mb-4`}>{group}</p>
        <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-800">
          {nations.map((nation: string, idx: number) => (
            <span key={idx} className="text-xs font-bold text-stone-100 bg-stone-800 px-3 py-1.5 rounded-full">{nation}</span>
          ))}
        </div>
      </div>
    </div>
  );
}