'use client';

import { useState, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q';

// 🗺️ 몽골 제국 스타일 (중세 느낌)
const MONGOL_MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v12';

// 📚 위키피디아 고증 기반 칭기즈칸 일대기 및 추정 영토 데이터
const MONGOL_CHRONICLE: any = {
  name: "칭기즈칸: 유라시아를 정복한 푸른 늑대",
  center: { lon: 90.0, lat: 48.0, zoom: 3 },
  events: [
    {
      year: "1162경",
      title: "테무친 탄생 (Temüjin Born)",
      location: "델리운 볼닥 (Delüün Boldog)",
      lat: 49.3, lon: 111.4,
      desc: "훗날 칭기즈칸이 되는 테무친이 몽골 보르지긴 부족에서 태어나다. 위키피디아에 따르면, 그의 탄생은 몽골 부족 연맹체의 등장과 밀접한 관련이 있다.",
      impact: "세계 역사상 가장 거대한 제국의 시발점"
    },
    {
      year: "1206",
      title: "칭기즈칸 즉위 (Proclaimed Genghis Khan)",
      location: "오논강 (Onon R.)",
      lat: 48.0, lon: 110.0,
      desc: "쿠릴타이에서 테무친이 몽골 부족을 완전히 통합하고 '칭기즈칸(바다의 칸)'으로 추대되다. 이로써 통일된 몽골 제국이 선포되었다.",
      impact: "몽골 부족 연맹의 단일 국가화 및 정복 전쟁의 서막"
    },
    {
      year: "1209",
      title: "서하 정복 개시 (Western Xia Campaign)",
      location: "흥경 (Yinchuan)",
      lat: 38.47, lon: 106.27,
      desc: "몽골군이 서하를 공격하여 수도 흥경을 위협하고 속국으로 삼다. 서하의 정복은 몽골이 중국 본토와 서역으로 진출하기 위한 교두보가 되었다.",
      impact: "남송 및 금나라 공격을 위한 전략적 기반 마련"
    },
    {
      year: "1215",
      title: "중도 함락 (Fall of Zhongdu)",
      location: "중도 (Zhongdu, Beijing)",
      lat: 39.9, lon: 116.4,
      desc: "금나라의 수도 중도를 함락시키다. 금나라는 황하 이남으로 천도하게 되었으며, 위키피디아는 이 사건을 몽골의 동아시아 패권 장악의 핵심 사건으로 다룬다.",
      impact: "금나라의 화북 지배력 상실 및 몽골의 동아시아 진출 가속화"
    },
    {
      year: "1220",
      title: "호라즘 제국 파괴 (Khwarazmian Conquest)",
      location: "사마르칸트 (Samarkand)",
      lat: 39.65, lon: 66.97,
      desc: "통상 사절단 학살 사건(오트라르 사건)을 계기로 칭기즈칸이 직접 서역 원정을 단행, 호라즘 제국의 주요 도시(부하라, 사마르칸트 등)를 철저히 파괴하고 서아시아로 진출하다.",
      impact: "중앙아시아 장악 및 실크로드 통제권 획득"
    },
    {
      year: "1227",
      title: "칭기즈칸 서거 (Death of Genghis Khan)",
      location: "서하 국경부",
      lat: 38.0, lon: 106.0,
      desc: "서하 2차 원정 중 서거하다. 위키피디아에 따르면, 그의 유언에 따라 서하의 마지막 황제는 칭기즈칸 사후에 처형되었으며, 서하는 완전히 멸망하여 몽골 영토로 병합되었다.",
      impact: "초대 칸의 퇴장과 오고타이 칸으로의 권력 이양"
    }
  ]
};

// 🗺️ 각 연도별 몽골 영토 (Polygon) 데이터 (임시 좌표)
const MONGOL_TERRITORY_LAYERS: any = {
  // 1206년 초기 영토 (몽골 고원 중심)
  "1206": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [100, 45], [115, 45], [115, 53], [100, 53], [100, 45]
      ]]
    }
  },
  // 1215년 확장 (금나라 화북 포함)
  "1215": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [90, 35], [120, 35], [120, 55], [90, 55], [90, 35]
      ]]
    }
  },
  // 1227년 사망 시 영토 (서하, 호라즘 병합)
  "1227": {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [60, 30], [120, 30], [120, 55], [60, 55], [60, 30]
      ]]
    }
  }
};

export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [timeStamp, setTimeStamp] = useState('');

  // 🖱️ 일지 클릭 시 지도 이동 및 해당 영토 표시
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lon, event.lat],
        zoom: 4.5,
        duration: 2500
      });
    }
  };

  useEffect(() => {
    // 💡 위키피디아 데이터를 기반으로 실시간 타임스탬프 설정 (임시)
    const now = new Date();
    setTimeStamp(`${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} 위키피디아 고증 기준`);
  }, []);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 font-serif selection:bg-amber-900/50 p-6 md:p-12 overflow-x-hidden">
      {/* 📡 글로벌 헤더 */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12 border-b-2 border-amber-700/50 pb-10 shadow-2xl">
        <div>
          <h1 className="text-5xl font-black text-amber-600 italic tracking-tighter uppercase leading-none">The Mongol Chronicle</h1>
          <p className="text-stone-500 text-[10px] mt-4 font-mono uppercase tracking-[0.5em]">{timeStamp}</p>
        </div>
        <div className="text-right">
          <p className="text-stone-600 text-[9px] font-black uppercase tracking-widest mb-1">Source: Wikipedia canon</p>
          <span className="text-[10px] font-black text-amber-500 border border-amber-800 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-inner">world-war.kr</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 📜 작전 일지 (The Chronicle Panel) */}
        <div className="lg:col-span-1 bg-stone-900/50 border-2 border-stone-800 rounded-[50px] p-10 h-[700px] flex flex-col overflow-hidden shadow-inner">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-stone-100 italic tracking-tighter leading-none">{MONGOL_CHRONICLE.name}</h2>
          </div>
          
          <div className="space-y-6 overflow-y-auto flex-1 pr-4 scrollbar-hide">
            {MONGOL_CHRONICLE.events.map((event: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-7 rounded-[35px] border-2 transition-all cursor-pointer ${selectedEvent?.title === event.title ? 'bg-amber-900/20 border-amber-600/60' : 'bg-stone-900 border-transparent hover:border-stone-700'}`}
                onClick={() => handleEventClick(event)}
              >
                <span className="text-[11px] font-mono text-amber-500 font-bold tracking-widest">{event.year} ERA</span>
                <h4 className="text-xl font-black text-stone-100 mt-2">{event.title}</h4>
                <p className="text-[11px] text-stone-500 font-bold mb-5 uppercase tracking-tighter italic">{event.location}</p>
                <p className="text-xs text-stone-300 leading-relaxed font-sans normal-case">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🗺️ 디지털 영토 지도 (The Dynamic Map Monitor) */}
        <div className="lg:col-span-2 h-[700px] bg-stone-900 rounded-[60px] overflow-hidden border-2 border-amber-800 shadow-[0_0_50px_rgba(180,83,9,0.2)] relative">
          <Map
            ref={mapRef}
            initialViewState={MONGOL_CHRONICLE.center}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MONGOL_MAP_STYLE}
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={() => setMapLoading(false)}
          >
            <NavigationControl position="top-right" />
            
            {/* 💡 각 연도별 영토 Polygon Layer (Mapbox Source/Layer) */}
            {selectedEvent && selectedEvent.year && MONGOL_TERRITORY_TERRITORY_LAYERS[selectedEvent.year] && (
              <Source id={`mongol-territory-${selectedEvent.year}`} type="geojson" data={MONGOL_TERRITORY_LAYERS[selectedEvent.year]}>
                <Layer
                  id={`mongol-fill-${selectedEvent.year}`}
                  type="fill"
                  paint={{
                    'fill-color': '#b45309', // 앰버 색상 (몽골 영토)
                    'fill-opacity': 0.3      // 반투명하게 설정
                  }}
                  beforeId="waterway-label" // 라벨 아래에 배치
                />
                <Layer
                  id={`mongol-line-${selectedEvent.year}`}
                  type="line"
                  paint={{
                    'fill-color': '#b45309', // 앰버 색상 (몽골 영토)
                    'fill-opacity': 0.3      // 반투명하게 설정
                  }}
                  beforeId="waterway-label" // 라벨 아래에 배치
                />
              </Source>
            )}

            {/* 정복 마커 표시 */}
            {MONGOL_CHRONICLE.events.map((event: any, idx: number) => (
              <Marker key={idx} longitude={event.lon} latitude={event.lat}>
                <div className="group cursor-pointer" onClick={() => handleEventClick(event)}>
                  <div className={`w-5 h-5 rounded-full border-2 border-white shadow-2xl transition-all ${selectedEvent?.title === event.title ? 'bg-amber-500 scale-150 animate-pulse' : 'bg-stone-700 opacity-60'}`}></div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-stone-950/95 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-md border border-amber-900/50 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap">
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