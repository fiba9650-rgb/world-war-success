'use client';

import { useState, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 📚 위키피디아 고증 기반 칭기즈칸 일대기
const MONGOL_CHRONICLE: any = {
  name: "칭기즈칸: 유라시아를 정복한 푸른 늑대",
  center: { lon: 95.0, lat: 45.0, zoom: 3 },
  events: [
    {
      year: "1162",
      title: "테무친 탄생 (Temüjin Born)",
      location: "델리운 볼닥",
      lat: 49.3, lon: 111.4,
      desc: "훗날 칭기즈칸이 되는 테무친이 몽골 보르지긴 부족에서 태어남. 위키피디아 기준 탄생 연도는 1162년경으로 추정됨.",
      impact: "세계사적 대전환의 시작"
    },
    {
      year: "1206",
      title: "칭기즈칸 즉위 (Proclaimed Genghis Khan)",
      location: "오논강 (Onon R.)",
      lat: 48.0, lon: 110.0,
      desc: "몽골 부족을 통일하고 '칭기즈칸'으로 추대됨. 통일 몽골 제국의 탄생.",
      impact: "분열된 초원의 통일과 정복 전쟁의 서막"
    },
    {
      year: "1215",
      title: "금나라 중도 함락 (Fall of Zhongdu)",
      location: "중도 (베이징)",
      lat: 39.9, lon: 116.4,
      desc: "금나라의 수도 중도를 점령함. 금은 황하 이남 개봉으로 천도하며 세력이 크게 위축됨.",
      impact: "동아시아 패권 장악 및 정착 문명 정복의 신호탄"
    },
    {
      year: "1220",
      title: "호라즘 제국 궤멸 (Conquest of Khwarazm)",
      location: "사마르칸트",
      lat: 39.65, lon: 66.97,
      desc: "오트라르 사건에 대한 보복으로 중앙아시아의 강대국 호라즘을 철저히 파괴함.",
      impact: "실크로드 장악 및 중앙아시아의 몽골화"
    },
    {
      year: "1227",
      title: "칭기즈칸 서거 (Death of Genghis Khan)",
      location: "서하 국경",
      lat: 38.0, lon: 106.0,
      desc: "서하 원정 도중 서거. 사후 몽골 제국은 아들들에게 분할 상속되며 세계 최대 제국으로 성장함.",
      impact: "초대 정복자의 퇴장과 팍스 몽골리카의 기틀"
    }
  ]
};

// 🗺️ 연도별 몽골 영토 (Polygon) 데이터
const MONGOL_TERRITORY_LAYERS: any = {
  "1206": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[[100, 45], [118, 45], [118, 55], [100, 55], [100, 45]]]
    }
  },
  "1215": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[[90, 35], [125, 35], [125, 55], [90, 55], [90, 35]]]
    }
  },
  "1220": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[[60, 32], [125, 32], [125, 55], [60, 55], [60, 32]]]
    }
  },
  "1227": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[[55, 30], [125, 30], [125, 55], [55, 55], [55, 30]]]
    }
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
        zoom: 4.5,
        duration: 2500,
        essential: true
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0c] text-stone-200 font-serif selection:bg-amber-900/50 p-6 md:p-12 overflow-x-hidden">
      {/* 🧭 헤더 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12 border-b-2 border-amber-800/30 pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-amber-600 italic tracking-tighter uppercase leading-none">The Great Khan</h1>
          <p className="text-stone-500 text-[10px] mt-4 font-mono uppercase tracking-[0.5em]">Digital Archive / world-war.kr</p>
        </div>
        <div className="text-right">
          <p className="text-stone-600 text-[9px] font-black uppercase tracking-widest mb-1">Wikipedia Reference</p>
          <span className="text-[10px] font-black text-amber-700 border border-amber-900/30 px-4 py-1.5 rounded-full uppercase">CHRONICLE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 📜 연표 일지 */}
        <div className="lg:col-span-1 bg-stone-900/30 border border-stone-800 rounded-[40px] p-8 h-[650px] flex flex-col overflow-hidden">
          <h3 className="text-amber-700 text-[10px] font-bold uppercase mb-8 tracking-widest border-l-4 border-amber-700 pl-3 italic">Campaign Log</h3>
          <div className="space-y-5 overflow-y-auto flex-1 pr-3 scrollbar-hide">
            {MONGOL_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-6 rounded-[30px] border transition-all cursor-pointer ${selectedEvent?.title === event.title ? 'bg-amber-950/20 border-amber-700/50' : 'bg-stone-900/50 border-transparent hover:border-stone-800'}`}
                onClick={() => handleEventClick(event)}
              >
                <span className="text-[10px] font-mono text-amber-600 font-bold tracking-widest">{event.year} AD</span>
                <h4 className="text-lg font-black text-stone-100 mt-1">{event.title}</h4>
                <p className="text-[10px] text-stone-500 font-bold mb-4 uppercase tracking-tighter italic">{event.location}</p>
                <p className="text-xs text-stone-400 leading-relaxed font-sans normal-case border-t border-stone-800/50 pt-4">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🗺️ 디지털 영토 지도 */}
        <div className="lg:col-span-2 h-[650px] bg-stone-900 rounded-[50px] overflow-hidden border border-stone-800 shadow-2xl relative">
          <Map
            ref={mapRef}
            initialViewState={MONGOL_CHRONICLE.center}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/outdoors-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {/* 💡 영토 확장 시각화 (오타 수정됨) */}
            {selectedEvent && MONGOL_TERRITORY_LAYERS[selectedEvent.year] && (
              <Source id={`mongol-territory-${selectedEvent.year}`} type="geojson" data={MONGOL_TERRITORY_LAYERS[selectedEvent.year]}>
                <Layer
                  id={`mongol-fill-${selectedEvent.year}`}
                  type="fill"
                  paint={{
                    'fill-color': '#b45309', // 앰버 색상
                    'fill-opacity': 0.25      // 지형이 보이도록 반투명 설정
                  }}
                />
                <Layer
                  id={`mongol-outline-${selectedEvent.year}`}
                  type="line"
                  paint={{
                    'line-color': '#d97706',
                    'line-width': 2,
                    'line-opacity': 0.5
                  }}
                />
              </Source>
            )}

            {/* 정복지 마커 */}
            {MONGOL_CHRONICLE.events.map((event: any, idx: number) => (
              <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                <div className="group cursor-pointer" onClick={() => handleEventClick(event)}>
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-2xl transition-all ${selectedEvent?.title === event.title ? 'bg-amber-600 scale-150 animate-pulse' : 'bg-stone-700 opacity-60'}`}></div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-stone-950/95 text-amber-500 text-[10px] font-black px-3 py-1 rounded border border-amber-900/50 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap">
                    {event.location}
                  </div>
                </div>
              </Marker>
            ))}
          </Map>
        </div>
      </div>
    </main>
  );
}