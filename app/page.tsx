'use client';

import { useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 📚 한국어 역사 연표 (사건별 상세 참전국, 병력, 전사, 부상 데이터 적용)
// 📚 인물 일대기 데이터 (촉한 소열제 유비 편)
const LIUBEI_CHRONICLE: any = {
  name: "한 소열제 유비 (劉備)",
  summary: "짚신을 팔던 몰락한 황손에서 촉한의 황제까지, 난세를 헤쳐나간 인의(仁義)의 영웅.",
  center: { lon: 112.0, lat: 33.0, zoom: 4.5 }, // 중국 대륙 중심
  events: [
    { 
      date: "184년", age: 24, title: "황건적의 난과 도원결의", location: "탁군 탁현", lat: 39.48, lon: 115.98, year: "184", 
      desc: "어머니와 짚신을 팔던 유비는 관우, 장비와 의형제를 맺고 의병을 일으켜 황건적을 토벌합니다.", 
      idiom: "도원결의(桃園結義)", generals: ["관우", "장비", "간옹"], army: "의병 약 500명" 
    },
    { 
      date: "194년", age: 34, title: "서주 입성 및 도겸의 양위", location: "서주 하비", lat: 34.33, lon: 118.01, year: "194", 
      desc: "조조의 서주 대학살을 막기 위해 구원군으로 참전하고, 도겸의 유지를 받아 서주 자사가 됩니다.", 
      idiom: "-", generals: ["관우", "장비", "미축", "손건"], army: "약 10,000명" 
    },
    { 
      date: "201년", age: 41, title: "신야 안착과 비육지탄", location: "형주 신야", lat: 32.52, lon: 112.35, year: "201", 
      desc: "조조에게 패배한 후 유표에게 의탁합니다. 오랜 기간 말을 타지 않아 허벅지에 살이 찐 것을 한탄합니다.", 
      idiom: "비육지탄(髀肉之嘆)", generals: ["관우", "장비", "조운"], army: "수천 명 (객장)" 
    },
    { 
      date: "207년", age: 47, title: "삼고초려와 수어지교", location: "융중", lat: 32.01, lon: 112.14, year: "207", 
      desc: "제갈량의 초가집을 세 번 찾아가 천하삼분지계를 듣고 그를 군사로 맞이합니다.", 
      idiom: "삼고초려(三顧草廬), 수어지교(水魚之交)", generals: ["제갈량", "관우", "장비", "조운"], army: "약 10,000명" 
    },
    { 
      date: "208년", age: 48, title: "적벽대전", location: "형주 적벽", lat: 29.88, lon: 113.62, year: "208", 
      desc: "손권과 연합하여 조조의 대군을 화공으로 격파하고, 마침내 형주 남부 4군을 차지하여 독자적인 세력을 구축합니다.", 
      idiom: "-", generals: ["제갈량", "관우", "장비", "조운", "황충"], army: "약 20,000명 (손권군 3만 별도)" 
    },
    { 
      date: "214년", age: 54, title: "익주 평정과 촉한의 기반", location: "익주 성도", lat: 30.66, lon: 104.06, year: "214", 
      desc: "유장의 항복을 받아내고 익주를 차지하며 제갈량이 구상한 천하삼분지계를 완성합니다.", 
      idiom: "-", generals: ["제갈량", "관우", "장비", "조운", "황충", "마초", "법정"], army: "약 100,000명 이상" 
    },
    { 
      date: "219년", age: 59, title: "한중왕 즉위", location: "한중", lat: 33.07, lon: 107.02, year: "219", 
      desc: "정군산에서 하후연을 베고 한중 공방전에서 조조를 물리친 후, 마침내 한중왕(漢中王)에 오릅니다.", 
      idiom: "-", generals: ["제갈량", "관우", "장비", "조운", "황충", "마초", "위연"], army: "약 150,000명" 
    },
    { 
      date: "222년", age: 62, title: "이릉대전 대패", location: "형주 이릉", lat: 30.75, lon: 111.28, year: "222", 
      desc: "관우와 장비의 복수를 위해 오나라를 침공했으나, 육손의 화공에 대패하며 촉한의 정예병을 잃습니다.", 
      idiom: "-", generals: ["황권", "풍습", "장남", "조운(강주 수비)"], army: "약 40,000 ~ 80,000명" 
    },
    { 
      date: "223년", age: 63, title: "백제성 탁고 (붕어)", location: "백제성", lat: 31.04, lon: 109.56, year: "223", 
      desc: "병세가 악화된 유비는 제갈량에게 후사를 부탁(탁고)하고 63세의 나이로 파란만장한 생을 마감합니다.", 
      idiom: "백제탁고(白帝託孤)", generals: ["제갈량", "이엄", "조운"], army: "촉한 정규군 편제 유지" 
    }
  ]
};
// 👇 --- [여기서부터 복사해서 붙여넣으세요] --- 👇
  const handleMapLoad = (e: any) => {
    const map = e.target;
    map.getStyle().layers.forEach((layer: any) => {
      // 지도 위 글씨(label)들을 찾아서 한국어(name_ko)로 바꿔주는 역할
      if (layer.id.includes('label')) {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name_ko'],
          ['get', 'name']
        ]);
      }
    });
  };
  // 현재 선택된 사건의 연도를 바탕으로 소속국가 배열 생성
 export default function Page() { // 💡 (이름이 Page나 Home이어도 상관없습니다)
  const mapRef = useRef<MapRef>(null);
  
  // 💡 유비 데이터로 시작하도록 변경
  const [selectedEvent, setSelectedEvent] = useState<any>(LIUBEI_CHRONICLE.events[0]);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lon, event.lat],
        zoom: 5.5, // 중국 대륙 스케일
        essential: true,
        duration: 2500
      });
    }
  };

  const handleMapLoad = (e: any) => {
    const map = e.target;
    map.getStyle().layers.forEach((layer: any) => {
      if (layer.id.includes('label')) {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name_ko'],
          ['get', 'name']
        ]);
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-200 overflow-hidden">

          {/* 🗺️ 오른쪽: 메인 지도 */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            <div className="flex-1 bg-slate-200 rounded-[40px] overflow-hidden border border-slate-200 shadow-inner relative">
              <Map
                ref={mapRef}
                initialViewState={WW1_CHRONICLE.center}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11" 
                mapboxAccessToken={MAPBOX_TOKEN}
                onLoad={handleMapLoad}
              >
                <NavigationControl position="top-right" />

                {/* 💡 정밀 국경선 데이터를 항상 띄우고, 색상만 동적으로 바꿉니다. */}
                {selectedEvent && (
                    
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
{/* 📊 인물 스탯 대시보드 (클릭 시 실시간 변경) */}
            <div className="bg-white border border-slate-200 p-6 rounded-[30px] shadow-sm flex-shrink-0 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <p className="text-slate-800 text-[14px] font-black tracking-widest">
                  🐉 {selectedEvent?.title} <span className="text-slate-400 font-medium ml-2">| {selectedEvent?.date} (당시 {selectedEvent?.age}세)</span>
                </p>
                {selectedEvent?.idiom !== "-" && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200 shadow-sm">
                    {selectedEvent?.idiom}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 👥 휘하 주요 장수 */}
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-3">휘하 주요 무장 및 책사</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent?.generals?.map((general: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-sm font-bold border border-slate-200 shadow-sm">
                        {general}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* ⚔️ 동원 병력 */}
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex flex-col justify-center">
                  <p className="text-red-600 text-[11px] font-black uppercase tracking-widest mb-2">당시 세력 규모</p>
                  <p className="text-red-900 font-black text-lg">{selectedEvent?.army}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}