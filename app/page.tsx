'use client';

import { useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 🗺️ 1차 세계 대전 협상국 vs 동맹국 영토 데이터
const WW1_ALLIANCES_GEOJSON: any = {
  type: "FeatureCollection",
  features: [
    // 🔵 협상국 (Entente) - 파란색
    { type: "Feature", properties: { alliance: "entente", name: "영국" }, geometry: { type: "Polygon", coordinates: [[[-10, 50], [2, 50], [2, 59], [-10, 59], [-10, 50]]] } },
    { type: "Feature", properties: { alliance: "entente", name: "프랑스" }, geometry: { type: "Polygon", coordinates: [[[-5, 43], [8, 43], [8, 51], [-5, 51], [-5, 43]]] } },
    { type: "Feature", properties: { alliance: "entente", name: "러시아 제국" }, geometry: { type: "Polygon", coordinates: [[[22, 43], [60, 43], [60, 65], [22, 65], [22, 43]]] } },
    
    // 🔴 동맹국 (Central) - 빨간색
    { type: "Feature", properties: { alliance: "central", name: "독일 제국" }, geometry: { type: "Polygon", coordinates: [[[6, 47], [22, 47], [22, 55], [6, 55], [6, 47]]] } },
    { type: "Feature", properties: { alliance: "central", name: "오스트리아-헝가리 제국" }, geometry: { type: "Polygon", coordinates: [[[9, 42], [26, 42], [26, 50], [9, 50], [9, 42]]] } },
    { type: "Feature", properties: { alliance: "central", name: "오스만 제국" }, geometry: { type: "Polygon", coordinates: [[[26, 33], [48, 33], [48, 42], [26, 42], [26, 33]]] } }
  ]
};

const WW1_CHRONICLE: any = {
  name: "제1차 세계 대전 (World War I)",
  summary: "유럽 대륙이 협상국(청색)과 동맹국(적색)으로 양분되어 벌인 인류 최초의 총력전.",
  center: { lon: 15.0, lat: 48.0, zoom: 4 },
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

  // 💡 [마법의 코드] 지도가 로드될 때 모든 현대 글씨와 아이콘을 숨깁니다!
  const handleMapLoad = (e: any) => {
    const map = e.target;
    const layers = map.getStyle().layers;
    
    layers.forEach((layer: any) => {
      // 'symbol' 타입이 바로 지도 위의 글씨와 아이콘입니다.
      if (layer.type === 'symbol') {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
  };

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
    <main className="min-h-screen bg-[#0d0e0f] text-slate-100 p-6 md:p-12 font-sans selection:bg-red-900/40 overflow-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col h-full">
        
        {/* 📡 헤더 */}
        <div className="flex justify-between items-end mb-8 border-b-2 border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-red-600 italic tracking-tighter uppercase leading-none">WORLD-WAR.KR</h1>
            <p className="text-slate-500 text-[10px] mt-3 font-mono uppercase tracking-[0.4em] italic leading-none">Global War Interactive Archive</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-black text-white bg-slate-800 px-4 py-2 rounded-full uppercase tracking-wider">Map Mode: Alliances</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
          
          {/* 📜 왼쪽: 전황 작전 일지 (30%) */}
          <div className="lg:col-span-4 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar pb-10">
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] mb-2 shadow-lg backdrop-blur-sm">
              <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-3">{WW1_CHRONICLE.name}</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{WW1_CHRONICLE.summary}</p>
            </div>

            {WW1_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-6 rounded-[35px] border-2 transition-all cursor-pointer group ${selectedEvent?.title === event.title ? 'bg-red-900/30 border-red-600 shadow-lg' : 'bg-slate-900/30 border-transparent hover:border-slate-700'}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-red-500 font-black tracking-widest">{event.date}</span>
                  <span className="text-[9px] font-black text-white bg-red-600/80 px-2 py-0.5 rounded uppercase">{event.impact}</span>
                </div>
                <h4 className="text-xl font-black text-white mt-1 leading-tight group-hover:text-red-500 transition-colors">{event.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium normal-case pt-3 mt-3 border-t border-slate-800/50">{event.desc}</p>
              </div>
            ))}
          </div>

          {/* 🗺️ 오른쪽: 디지털 작전 지도 및 승패 요약 (70%) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="flex-1 bg-slate-900 rounded-[50px] overflow-hidden border-2 border-slate-800 shadow-2xl relative">
              <Map
                ref={mapRef}
                initialViewState={WW1_CHRONICLE.center}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                onLoad={handleMapLoad} // 💡 여기서 글씨 지우는 함수가 실행됩니다!
              >
                <NavigationControl position="top-right" />

                {/* 💡 국가 세력권(면적) 칠하기 레이어 */}
                <Source id="ww1-alliances" type="geojson" data={WW1_ALLIANCES_GEOJSON}>
                  <Layer
                    id="alliance-fill"
                    type="fill"
                    paint={{
                      'fill-color': [
                        'match',
                        ['get', 'alliance'],
                        'entente', '#3b82f6', // 파란색
                        'central', '#ef4444', // 빨간색
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
                      'line-width': 2,
                      'line-opacity': 0.8
                    }}
                  />
                </Source>

                {/* 📍 사건 마커 (점) 표시 */}
                {WW1_CHRONICLE.events.map((event: any, idx: number) => (
                  <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                    <div className="group cursor-pointer relative" onClick={() => handleEventClick(event)}>
                      <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-2xl transition-all ${selectedEvent?.title === event.title ? 'bg-yellow-500 scale-150 animate-pulse' : 'bg-slate-800'}`}></div>
                    </div>
                  </Marker>
                ))}

                {/* 💬 클릭된 사건의 깔끔한 팝업 */}
                {selectedEvent && (
                  <Popup
                    longitude={selectedEvent.lon}
                    latitude={selectedEvent.lat}
                    anchor="bottom"
                    onClose={() => setSelectedEvent(null)}
                    closeButton={false}
                    className="z-50"
                  >
                    <div className="p-3 text-black font-sans max-w-[200px] bg-white rounded-lg shadow-2xl">
                      <span className="text-[10px] font-mono text-red-600 font-black mb-1 block">{selectedEvent.date}</span>
                      <h5 className="text-sm font-black leading-tight">{selectedEvent.title}</h5>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase border-t pt-1 border-slate-200">위치: {selectedEvent.location}</p>
                    </div>
                  </Popup>
                )}
              </Map>

              {/* 💡 범례 (Legend) */}
              <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl pointer-events-none">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">세력권 (Alliances)</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 bg-blue-500/50 border border-blue-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-white">협상국 (Allied Powers)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500/50 border border-red-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-white">동맹국 (Central Powers)</span>
                </div>
              </div>
            </div>

            {/* 📊 하단: 승전국/패전국 요약 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[40px] shadow-lg backdrop-blur-md flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">협상국 (승전국)</p>
                  <div className="flex flex-wrap gap-2">
                    {WW1_CHRONICLE.outcome.victors.map((v: string) => (
                      <span key={v} className="px-3 py-1.5 bg-blue-950/50 border border-blue-900/50 rounded-full text-[10px] font-bold text-blue-100">{v}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">동맹국 (패전국)</p>
                  <div className="flex flex-wrap gap-2">
                    {WW1_CHRONICLE.outcome.losers.map((l: string) => (
                      <span key={l} className="px-3 py-1.5 bg-red-950/50 border border-red-900/50 rounded-full text-[10px] font-bold text-red-100">{l}</span>
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