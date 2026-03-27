'use client';

import { useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 🔑 Mapbox 토큰 (재준님의 실제 토큰으로 교체하세요)
const MAPBOX_TOKEN = "pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q"; 
// 📚 인물 일대기 데이터 (촉한 소열제 유비)
const LIUBEI_CHRONICLE = {
  name: "한 소열제 유비 (劉備)의 발자취",
  summary: "짚신을 팔던 몰락한 황손에서 촉한의 황제까지, 난세를 헤쳐나간 인의(仁義)의 영웅.",
  center: { lon: 112.0, lat: 33.0, zoom: 4.5 },
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
      idiom: "삼고초려(三顧草廬)", generals: ["제갈량", "관우", "장비", "조운"], army: "약 10,000명" 
    },
    { 
      date: "208년", age: 48, title: "적벽대전", location: "형주 적벽", lat: 29.88, lon: 113.62, year: "208", 
      desc: "손권과 연합하여 조조의 대군을 화공으로 격파하고, 마침내 형주 남부 4군을 차지하여 독자적인 세력을 구축합니다.", 
      idiom: "수어지교(水魚之交)", generals: ["제갈량", "관우", "장비", "조운", "황충"], army: "약 20,000명" 
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
      idiom: "-", generals: ["황권", "풍습", "장남", "조운(강주)"], army: "약 40,000 ~ 80,000명" 
    },
    { 
      date: "223년", age: 63, title: "백제성 탁고 (붕어)", location: "백제성", lat: 31.04, lon: 109.56, year: "223", 
      desc: "병세가 악화된 유비는 제갈량에게 후사를 부탁(탁고)하고 63세의 나이로 파란만장한 생을 마감합니다.", 
      idiom: "백제탁고(白帝託孤)", generals: ["제갈량", "이엄", "조운"], army: "촉한 정규군 편제 유지" 
    }
  ]
};
// 🏛️ 삼국지 주요 옛 지명 데이터 (삼국지 11 게임 기반 40여 개 도시)
const ANCIENT_CITIES: any = {
  type: 'FeatureCollection',
  features: [
    // ⚔️ 하북 / 유주 (원소, 공손찬의 무대)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [115.98, 39.48] }, properties: { name: "탁군 (涿郡)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.40, 39.90] }, properties: { name: "계 (薊)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [118.18, 39.63] }, properties: { name: "북평 (北平)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [123.17, 41.27] }, properties: { name: "양평 (襄平)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.49, 36.61] }, properties: { name: "업 (鄴)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.35, 37.16] }, properties: { name: "평원 (平原)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.55, 37.87] }, properties: { name: "진양 (晉陽)" } },
    
    // ⚔️ 중원 (조조의 심장부)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.45, 34.61] }, properties: { name: "낙양 (洛陽)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [108.93, 34.26] }, properties: { name: "장안 (長安)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.88, 34.79] }, properties: { name: "허창 (許昌)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.30, 34.79] }, properties: { name: "진류 (陳留)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [115.03, 35.76] }, properties: { name: "복양 (濮陽)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.93, 34.73] }, properties: { name: "소패 (小沛)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [118.01, 34.33] }, properties: { name: "하비 (下邳)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.78, 32.58] }, properties: { name: "수춘 (壽春)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.02, 32.98] }, properties: { name: "여남 (汝南)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.53, 32.99] }, properties: { name: "완 (宛)" } },

    // ⚔️ 강동 / 오 (손권의 수군 기지)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [118.79, 32.06] }, properties: { name: "건업 (建業)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.58, 31.30] }, properties: { name: "오 (吳)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.58, 30.00] }, properties: { name: "회계 (會稽)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [115.98, 29.71] }, properties: { name: "시상 (柴桑)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [117.03, 30.51] }, properties: { name: "여강 (廬江)" } },

    // ⚔️ 형주 (천하의 요충지)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.14, 32.01] }, properties: { name: "양양 (襄陽)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.30, 30.59] }, properties: { name: "강하 (江夏)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.19, 30.33] }, properties: { name: "강릉 (江陵)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [111.69, 29.03] }, properties: { name: "무릉 (武陵)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.93, 28.22] }, properties: { name: "장사 (長沙)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [111.60, 26.22] }, properties: { name: "영릉 (零陵)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [113.03, 25.79] }, properties: { name: "계양 (桂陽)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [113.62, 29.88] }, properties: { name: "적벽 (赤壁)" } },

    // ⚔️ 익주 / 촉 (유비의 천연 요새)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [107.02, 33.07] }, properties: { name: "한중 (漢中)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [104.73, 31.46] }, properties: { name: "자동 (梓潼)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [104.06, 30.66] }, properties: { name: "성도 (成都)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [106.55, 29.56] }, properties: { name: "강주 (江州)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [103.79, 25.49] }, properties: { name: "건녕 (建寧)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [102.73, 25.04] }, properties: { name: "운남 (雲南)" } },

    // ⚔️ 서북 (마초, 동탁의 고향)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [105.72, 34.58] }, properties: { name: "천수 (天水)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [106.66, 35.54] }, properties: { name: "안정 (安定)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [102.63, 37.92] }, properties: { name: "무위 (武威)" } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [98.50, 39.73] }, properties: { name: "서량 (西涼)" } }
  ]
};
export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(LIUBEI_CHRONICLE.events[0]);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lon, event.lat],
        zoom: 5.5,
        essential: true,
        duration: 2500
      });
    }
  };

const handleMapLoad = (e: any) => {
    const map = e.target;
    map.getStyle().layers.forEach((layer: any) => {
      // 💡 현대 지명, 도로, 국경선은 지우되, 우리가 만든 옛 지명('ancient')은 지우지 않고 살려둡니다!
      if (
        (layer.id.includes('label') && !layer.id.includes('ancient')) || 
        layer.id.includes('road') || 
        layer.id.includes('boundary') || 
        layer.id.includes('transit')
      ) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
  };

  // 💡 유비의 발자취를 선으로 잇기 위한 데이터 (점선 궤적용)
  const LIUBEI_PATH: any = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: LIUBEI_CHRONICLE.events.map((e: any) => [e.lon, e.lat])
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-200 overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-screen flex flex-col p-6 md:p-10">
        
        {/* 📡 헤더 영역 */}
        <header className="flex justify-between items-end border-b border-slate-200 pb-4 mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-xl text-xl shadow-sm">인물 일대기</span>
              History's Footsteps
            </h1>
          </div>
        </header>

        {/* 🧩 메인 레이아웃 (좌측 타임라인 / 우측 지도+대시보드) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* 📜 왼쪽: 타임라인 */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{LIUBEI_CHRONICLE.name}</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{LIUBEI_CHRONICLE.summary}</p>
            </div>

            {LIUBEI_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-5 rounded-3xl transition-all cursor-pointer break-keep ${
                  selectedEvent?.title === event.title 
                    ? 'bg-amber-50 border-y-2 border-r-2 border-l-8 border-amber-500 shadow-md' 
                    : 'bg-white border-2 border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-black text-amber-600">{event.date} (당시 {event.age}세)</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{event.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">{event.desc}</p>
              </div>
            ))}
          </div>

          {/* 🗺️ 오른쪽: 메인 지도 & 대시보드 */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            
            {/* 1. 지도 영역 */}
            <div className="flex-1 bg-slate-200 rounded-[40px] overflow-hidden border border-slate-200 shadow-inner relative">
<Map
                ref={mapRef}
                initialViewState={{ ...LIUBEI_CHRONICLE.center, zoom: 4.8 }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken="pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q"
                onLoad={handleMapLoad}
                maxBounds={[[95.0, 18.0], [123.0, 43.0]]}
                minZoom={4.5}
              >
                <NavigationControl position="top-right" />

                {/* 🏷️ 옛 지명 띄우기 (이름 충돌 방지를 위해 id 변경) */}
                <Source id="ancient-cities" type="geojson" data={ANCIENT_CITIES}>
                  <Layer
                    id="ancient-cities-text"
                    type="symbol"
                    layout={{
                      'text-field': ['get', 'name'],
                      'text-font': ['Arial Unicode MS Regular'], // 💡 전 세계 언어를 가장 안정적으로 지원하는 폰트
                      'text-size': 14,
                      'text-anchor': 'bottom',
                      'text-offset': [0, -0.5]
                    }}
                    paint={{
                      'text-color': '#5c2b07', // 고풍스러운 갈색
                      'text-halo-color': '#ffffff',
                      'text-halo-width': 2
                    }}
                  />
                </Source>

                {/* 📍 사건 마커 */}
                {LIUBEI_CHRONICLE.events.map((event: any, idx: number) => (
                  <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                    <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}>
                      <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-md transition-all ${
                        selectedEvent?.title === event.title ? 'bg-amber-500 scale-150 ring-4 ring-amber-500/30' : 'bg-slate-700'
                      }`}></div>
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
            </div>

            {/* 📊 2. 인물 스탯 대시보드 영역 */}
            <div className="bg-white border border-slate-200 p-6 rounded-[30px] shadow-sm flex-shrink-0 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <p className="text-slate-800 text-[14px] font-black tracking-widest break-keep">
                  🐉 {selectedEvent?.title} <span className="text-slate-400 font-medium ml-2">| {selectedEvent?.location}</span>
                </p>
                {selectedEvent?.idiom !== "-" && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-[11px] rounded-full border border-amber-200 shadow-sm shrink-0 ml-2">
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
                  <p className="text-red-900 font-black text-lg break-keep">{selectedEvent?.army}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}