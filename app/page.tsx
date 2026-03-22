'use client';

import { useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 📚 한국어 역사 연표
const WW1_CHRONICLE: any = {
  name: "제1차 세계 대전 (The Great War)",
  summary: "유럽 제국주의 열강들이 협상국(청색)과 동맹국(적색)으로 양분되어 전 세계에서 벌인 사상 초유의 총력전입니다.",
  center: { lon: 15.0, lat: 48.0, zoom: 4.2 },
  events: [
    { date: "1914.06.28", title: "사라예보 암살 사건", location: "사라예보", lat: 43.8563, lon: 18.4131, year: "1914", desc: "세르비아 민족주의자가 오스트리아 황태자를 암살하며 전쟁의 도화선에 불을 붙였습니다.", impact: "전쟁 발발" },
    { date: "1914.08.04", title: "벨기에 침공", location: "벨기에 리에주", lat: 50.64, lon: 5.57, year: "1914", desc: "독일군이 중립국 벨기에를 침공하며 프랑스로 진격, 영국의 참전을 끌어냈습니다.", impact: "전선 확대" },
    { date: "1914.09.06", title: "마른 전투", location: "프랑스 마른강", lat: 48.9, lon: 3.1, year: "1914", desc: "프랑스·영국 연합군이 독일군의 파리 진격을 저지하며, 길고 참혹한 참호전이 시작되었습니다.", impact: "참호전 돌입" },
    { date: "1916.02.21", title: "베르됭 전투", location: "프랑스 베르됭", lat: 49.16, lon: 5.38, year: "1916", desc: "양측 합산 70만 명 이상의 사상자를 낸 대전 중 가장 끔찍한 소모전입니다.", impact: "최대 격전" },
    { date: "1916.07.01", title: "솜 전투", location: "프랑스 솜강", lat: 49.9, lon: 2.7, year: "1916", desc: "탱크가 처음 등장한 연합군의 대규모 공세로, 역사상 가장 처참한 교전 중 하나입니다.", impact: "소모전 격화" },
    { date: "1917.04.06", title: "미국의 참전", location: "미국 워싱턴 D.C.", lat: 38.9, lon: -77.0, year: "1917", desc: "독일의 무제한 잠수함 작전에 분노한 미국이 참전하며 전세의 균형이 무너졌습니다.", impact: "전세 역전" },
    { date: "1918.03.03", title: "브레스트-리토프스크 조약", location: "벨라루스 브레스트", lat: 52.09, lon: 23.68, year: "1918", desc: "러시아 혁명 정부가 독일과 단독 강화를 맺고 이탈하여 동부 전선이 종결되었습니다.", impact: "러시아 이탈" },
    { date: "1918.11.11", title: "컴피뉴 휴전 협정", location: "프랑스 콩피에뉴", lat: 49.4, lon: 2.8, year: "1919", desc: "독일의 항복으로 전쟁이 종결되고 4대 제국이 붕괴하며 유럽의 지도가 다시 그려졌습니다.", impact: "전쟁 종결" }
  ],
  outcome: {
    victors: ["영국", "프랑스", "미국", "이탈리아", "일본"],
    losers: ["독일 제국", "오스트리아-헝가리", "오스만 제국", "불가리아"]
  }
};

export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(WW1_CHRONICLE.events[0]);

  // 💡 선택된 연도에 따라 국가들의 소속(색상)을 실시간으로 바꿔주는 함수
  // 💡 국가 이름 매칭의 '경우의 수'를 모두 포함한 궁극의 로직
  const getAlliancesByYear = (year: string) => {
    // 영국의 정식 명칭, 제국 명칭 등 지도 제작자가 썼을 법한 모든 이름을 다 넣습니다.
    const entente = [
      'United Kingdom', 'Great Britain', 'United Kingdom of Great Britain and Ireland', 
      'France', 'Italy', 'Serbia', 'Belgium', 'Japan', 'Montenegro', 'Greece', 'Romania'
    ];
    const central = [
      'Germany', 'German Empire', 
      'Austria-Hungary', 'Austro-Hungarian Empire', 
      'Ottoman Empire', 'Turkey', 'Bulgaria'
    ];
    const collapsed = ['DUMMY_COUNTRY']; // 에러 방지용

    // 1918년 이전: 러시아 제국 참전
    if (year < "1918") entente.push('Russia', 'Russian Empire');
    // 1917년 이후: 미국 참전
    if (year >= "1917") entente.push('United States', 'United States of America');
    
    // 1919년 (종전): 동맹국 전체와 러시아 제국의 붕괴 (잿빛 처리)
    if (year === "1919") {
      collapsed.push(...central, 'Russia', 'Russian Empire');
      central.length = 0;
      central.push('DUMMY_COUNTRY');
    }

    return { entente, central, collapsed };
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lon, event.lat],
        zoom: event.title.includes('미국') ? 3 : 4.5, // 미국 클릭 시 넓게 보여줌
        essential: true,
        duration: 2500
      });
    }
  };

  // 현재 선택된 사건의 연도를 바탕으로 소속국가 배열 생성
  const { entente, central, collapsed } = getAlliancesByYear(selectedEvent?.year);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-200 overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-screen flex flex-col p-6 md:p-10">
        
        {/* 📡 미니멀 헤더 */}
        <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-4xl font-black text-red-600 tracking-tighter uppercase leading-none">WORLD-WAR.KR</h1>
            <p className="text-slate-500 text-[10px] mt-2 font-mono uppercase tracking-widest">Historical Map Archive</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* 📜 왼쪽: 타임라인 */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{WW1_CHRONICLE.name}</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{WW1_CHRONICLE.summary}</p>
            </div>

            {WW1_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${selectedEvent?.title === event.title ? 'bg-red-50 border-red-500 shadow-md scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-black text-red-600">{event.date}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{event.impact}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">{event.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">{event.desc}</p>
              </div>
            ))}
          </div>

          {/* 🗺️ 오른쪽: 메인 지도 */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            <div className="flex-1 bg-slate-200 rounded-[40px] overflow-hidden border border-slate-200 shadow-inner relative">
              <Map
                ref={mapRef}
                initialViewState={WW1_CHRONICLE.center}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11" 
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <NavigationControl position="top-right" />

                {/* 💡 정밀 국경선 데이터를 항상 띄우고, 색상만 동적으로 바꿉니다. */}
                {selectedEvent && (
                  <Source id="historical-borders" type="geojson" data="https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1914.geojson">
                    
                    <Layer
                      id="alliance-fill"
                      type="fill"
                      paint={{
                        'fill-color': [
                          'match', ['get', 'NAME'], 
                          entente, '#3b82f6', // 연합국 (미국 포함/러시아 제외 등 동적 변경)
                          central, '#ef4444', // 동맹국
                          collapsed, '#475569', // 붕괴된 제국 (잿빛 처리)
                          'transparent'
                        ],
                        'fill-opacity': 0.35,
                        // 색상 전환 시 부드러운 애니메이션 효과
                        'fill-color-transition': { duration: 1000 }
                      }}
                    />

                    <Layer
                      id="world-borders-line"
                      type="line"
                      paint={{
                        'line-color': '#777777',
                        'line-width': 1.0,
                        'line-opacity': 0.6
                      }}
                    />
                  </Source>
                )}

                {/* 📍 사건 마커 */}
                {WW1_CHRONICLE.events.map((event: any, idx: number) => (
                  <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                    <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}>
                      <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-md transition-all ${selectedEvent?.title === event.title ? 'bg-red-600 scale-150 ring-4 ring-red-500/30' : 'bg-slate-800'}`}></div>
                    </div>
                  </Marker>
                ))}

                {/* 💬 말풍선 팝업 */}
                {selectedEvent && (
                  <Popup longitude={selectedEvent.lon} latitude={selectedEvent.lat} anchor="bottom" onClose={() => setSelectedEvent(null)} closeButton={false} className="z-50">
                    <div className="p-3 bg-white rounded-lg shadow-xl text-center">
                      <p className="text-xs font-black text-slate-800">{selectedEvent.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{selectedEvent.location}</p>
                    </div>
                  </Popup>
                )}
              </Map>

              {/* 💡 다이내믹 범례 (연도에 따라 변화) */}
              <div className="absolute bottom-6 left-6 bg-white/95 p-4 rounded-2xl shadow-lg pointer-events-none border border-slate-100 z-10 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">세력권 표시 ({selectedEvent?.year})</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500/60 border border-blue-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-slate-700">협상국 (Allied)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500/60 border border-red-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-slate-700">동맹국 (Central)</span>
                </div>
                {selectedEvent?.year === "1919" && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                    <div className="w-3 h-3 bg-slate-600/60 border border-slate-600 rounded-sm"></div>
                    <span className="text-xs font-bold text-slate-700">제국 붕괴 (Collapsed)</span>
                  </div>
                )}
              </div>
            </div>

            {/* 📊 결과 요약 카드 */}
            <div className="bg-white border border-slate-200 p-6 rounded-[30px] shadow-sm flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-blue-600 text-[11px] font-black uppercase tracking-widest mb-3">승전국 (Allied Powers)</p>
                  <div className="flex flex-wrap gap-2">
                    {WW1_CHRONICLE.outcome.victors.map((v: string) => (
                      <span key={v} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-md text-[11px] font-bold border border-blue-100">{v}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-red-600 text-[11px] font-black uppercase tracking-widest mb-3">패전국 (Central Powers)</p>
                  <div className="flex flex-wrap gap-2">
                    {WW1_CHRONICLE.outcome.losers.map((l: string) => (
                      <span key={l} className="px-3 py-1.5 bg-red-50 text-red-800 rounded-md text-[11px] font-bold border border-red-100">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}