'use client';

import { useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 🗺️ 1차 세계 대전 협상국 vs 동맹국 영토 데이터 (세밀한 폴리곤 적용)
const WW1_ALLIANCES_GEOJSON: any = {
  type: "FeatureCollection",
  features: [
    // 🔵 협상국 (Entente) - 파란색
    { type: "Feature", properties: { alliance: "entente", name: "영국" }, 
      geometry: { type: "Polygon", coordinates: [[[-5.5, 50.0], [1.5, 51.5], [0.0, 55.0], [-3.0, 58.5], [-7.0, 58.0], [-5.5, 50.0]]] } 
    },
    { type: "Feature", properties: { alliance: "entente", name: "프랑스" }, 
      geometry: { type: "Polygon", coordinates: [[[-4.5, 48.5], [2.0, 51.0], [6.0, 49.5], [7.5, 47.5], [7.0, 43.5], [3.0, 42.5], [-1.5, 43.0], [-1.0, 44.5], [-5.0, 48.0], [-4.5, 48.5]]] } 
    },
    { type: "Feature", properties: { alliance: "entente", name: "러시아 제국" }, 
      geometry: { type: "Polygon", coordinates: [[[22.8, 54.8], [19.0, 50.5], [26.0, 48.0], [30.0, 45.0], [30.0, 40.0], [45.0, 40.0], [45.0, 65.0], [20.0, 65.0], [22.8, 54.8]]] } 
    },
    
    // 🔴 동맹국 (Central) - 빨간색
    { type: "Feature", properties: { alliance: "central", name: "독일 제국" }, 
      geometry: { type: "Polygon", coordinates: [[[6.0, 49.5], [14.0, 50.0], [19.0, 50.5], [22.8, 54.8], [14.0, 54.0], [7.0, 53.5], [6.0, 49.5]]] } 
    },
    { type: "Feature", properties: { alliance: "central", name: "오스트리아-헝가리 제국" }, 
      geometry: { type: "Polygon", coordinates: [[[9.5, 47.0], [14.0, 50.0], [26.0, 48.0], [25.0, 45.0], [19.0, 44.5], [14.0, 45.0], [9.5, 47.0]]] } 
    },
    { type: "Feature", properties: { alliance: "central", name: "오스만 제국" }, 
      geometry: { type: "Polygon", coordinates: [[[26.0, 41.0], [44.0, 41.0], [48.0, 30.0], [35.0, 30.0], [26.0, 36.0], [26.0, 41.0]]] } 
    }
  ]
};

const WW1_CHRONICLE: any = {
  name: "제1차 세계 대전 (World War I)",
  summary: "유럽 대륙이 협상국(청색)과 동맹국(적색)으로 양분되어 벌인 인류 최초의 총력전.",
  center: { lon: 15.0, lat: 48.0, zoom: 4.5 },
  events: [
    {
      date: "1914.06.28", title: "사라예보 암살 사건", location: "사라예보 (Sarajevo)",
      lat: 43.8563, lon: 18.4131,
      desc: "세르비아 민족주의자가 오스트리아 황태자를 암살. 동맹국과 협상국의 연쇄 선전포고를 불러온 도화선.",
      impact: "전쟁 발발"
    },
    {
      date: "1914.09.06", title: "마른 전투 (참호전 돌입)", location: "마른강 (Marne R.)",
      lat: 48.9, lon: 3.1,
      desc: "독일의 파리 진격을 프랑스·영국 연합군이 저지. 이후 지루하고 참혹한 참호전 양상으로 굳어짐.",
      impact: "서부 전선 고착"
    },
    {
      date: "1916.02.21", title: "베르됭 전투", location: "베르됭 (Verdun)",
      lat: 49.16, lon: 5.38,
      desc: "'베르됭의 도살기'라 불리며 70만 명 이상의 사상자를 낸 대전 중 가장 끔찍한 소모전.",
      impact: "최대 소모전"
    },
    {
      date: "1917.04.06", title: "미국의 참전", location: "대서양 해역",
      lat: 45.0, lon: -20.0,
      desc: "독일의 무제한 잠수함 작전에 분노한 미국이 협상국 측으로 전격 참전하며 전세의 균형이 깨짐.",
      impact: "전세 역전"
    },
    {
      date: "1918.11.11", title: "종전 협정 (제국의 몰락)", location: "콩피에뉴 (Compiègne)",
      lat: 49.4, lon: 2.8,
      desc: "독일의 항복으로 전쟁 종결. 러시아, 독일, 오스트리아, 오스만 4대 제국이 역사 속으로 사라짐.",
      impact: "전쟁 종결"
    }
  ],
  outcome: {
    victors: ["영국", "프랑스", "미국", "이탈리아", "러시아(도중 이탈)"],
    losers: ["독일 제국", "오스트리아-헝가리 제국", "오스만 제국", "불가리아"]
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
        zoom: event.title.includes('미국') ? 3 : 5.5,
        essential: true,
        duration: 2000
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-12 font-sans selection:bg-red-900/40 overflow-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col h-full">
        
        <div className="flex justify-between items-end mb-8 border-b-2 border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WORLD-WAR.KR</h1>
            <p className="text-slate-500 text-[10px] mt-3 font-mono uppercase tracking-[0.4em] italic leading-none">Global War Interactive Archive</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-black text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">Map Mode: 1914 Alliances</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
          
          <div className="lg:col-span-4 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar pb-10">
            <div className="bg-white border border-slate-200 p-8 rounded-[40px] mb-2 shadow-sm backdrop-blur-sm">
              <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none mb-3">{WW1_CHRONICLE.name}</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{WW1_CHRONICLE.summary}</p>
            </div>

            {WW1_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-6 rounded-[35px] border-2 transition-all cursor-pointer group ${selectedEvent?.title === event.title ? 'bg-red-50 border-red-600 shadow-md' : 'bg-white border-transparent hover:border-slate-300 shadow-sm'}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-red-600 font-black tracking-widest">{event.date}</span>
                  <span className="text-[9px] font-black text-white bg-red-600 px-2 py-0.5 rounded uppercase">{event.impact}</span>
                </div>
                <h4 className={`text-xl font-black mt-1 leading-tight ${selectedEvent?.title === event.title ? 'text-red-600' : 'text-slate-900 group-hover:text-red-600'} transition-colors`}>{event.title}</h4>
                <p className={`text-xs ${selectedEvent?.title === event.title ? 'text-slate-700' : 'text-slate-600'} leading-relaxed font-medium normal-case pt-3 mt-3 border-t border-slate-200`}>{event.desc}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="flex-1 bg-white rounded-[50px] overflow-hidden border-2 border-slate-200 shadow-xl relative">
              <Map
                ref={mapRef}
                initialViewState={WW1_CHRONICLE.center}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <NavigationControl position="top-right" />

                <Source id="ww1-alliances" type="geojson" data={WW1_ALLIANCES_GEOJSON}>
                  <Layer
                    id="alliance-fill"
                    type="fill"
                    paint={{
                      'fill-color': [
                        'match',
                        ['get', 'alliance'],
                        'entente', '#3b82f6', 
                        'central', '#ef4444', 
                        '#cccccc'
                      ],
                      'fill-opacity': 0.35
                    }}
                  />
                  <Layer
                    id="alliance-outline"
                    type="line"
                    paint={{
                      'line-color': [
                        'match',
                        ['get', 'alliance'],
                        'entente', '#2563eb',
                        'central', '#dc2626',
                        '#cccccc'
                      ],
                      'line-width': 3,
                      'line-opacity': 0.8
                    }}
                  />
                </Source>

                {WW1_CHRONICLE.events.map((event: any, idx: number) => (
                  <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                    <div className="group cursor-pointer relative" onClick={() => handleEventClick(event)}>
                      <div className={`w-5 h-5 rounded-full border-[3px] border-slate-900 shadow-2xl transition-all ${selectedEvent?.title === event.title ? 'bg-yellow-400 scale-150 animate-pulse' : 'bg-red-600'}`}></div>
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
                    <div className="p-3 text-slate-900 font-sans max-w-[200px] bg-white rounded-lg shadow-2xl">
                      <span className="text-[10px] font-mono text-red-600 font-black mb-1 block">{selectedEvent.date}</span>
                      <h5 className="text-sm font-black leading-tight">{selectedEvent.title}</h5>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase border-t pt-1 border-slate-200">위치: {selectedEvent.location}</p>
                    </div>
                  </Popup>
                )}
              </Map>

              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl pointer-events-none">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">1914 세력권 판도</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 bg-blue-500/50 border border-blue-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-slate-900">협상국 (Allied Powers)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500/50 border border-red-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-slate-900">동맹국 (Central Powers)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-[40px] shadow-lg backdrop-blur-md flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">협상국 (승전국)</p>
                  <div className="flex flex-wrap gap-2">
                    {WW1_CHRONICLE.outcome.victors.map((v: string) => (
                      <span key={v} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-900 shadow-sm">{v}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">동맹국 (패전국)</p>
                  <div className="flex flex-wrap gap-2">
                    {WW1_CHRONICLE.outcome.losers.map((l: string) => (
                      <span key={l} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-900 shadow-sm">{l}</span>
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