'use client'; 

import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'ppk.eyJ1IjoiZmliYTk2NTAiLCJhIjoiY21uMDFyNW5iMGR2dDJzcTJjYzhoMnU0cSJ9.vAKcm5MMnw4NbmKMBtJ49Q; 

interface StatCardProps {
  title: string;
  value: string;
  sub: string;
  color: string;
}

interface NewsItemProps {
  tag: string;
  source: string;
  content: string;
}

function StatCard({ title, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-2">{sub}</p>
    </div>
  );
}

function NewsItem({ tag, source, content }: NewsItemProps) {
  return (
    <div className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-0.5 rounded font-bold">{tag}</span>
        <span className="text-slate-500 text-xs">{source}</span>
      </div>
      <p className="text-sm">{content}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-black text-white tracking-tighter">WARBOARD</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">실시간 전쟁 및 국제 분쟁 상황판 | <span className="text-blue-500">world-war.kr</span></p>
        </div>
        <div className="text-right italic text-xs text-slate-600 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          마지막 업데이트: 실시간
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="전쟁 경과" value="22일째" sub="Epic Fury 작전 개시일 기준" color="text-white" />
        <StatCard title="총 추정 사망자" value="12,500+" sub="국제기구 합산 추정치" color="text-red-500" />
        <StatCard title="난민 발생 (UN)" value="1.2M" sub="국경 이탈 피난민 포함" color="text-blue-400" />
        <StatCard title="유가 영향 (Brent)" value="$108.00" sub="전월 대비 +20% 급등" color="text-yellow-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold mb-6 flex items-center border-l-4 border-blue-500 pl-3">실시간 주요 뉴스</h2>
          <div className="space-y-6">
            <NewsItem tag="군사" source="Reuters" content="미 국방부, 이란 내 주요 미사일 기지 정밀 타격 발표" />
            <NewsItem tag="외교" source="AP News" content="UN 안보리, 중동 지역 인도적 휴전안 표결 예정" />
            <NewsItem tag="경제" source="CNBC" content="호르무즈 해협 긴장 고조로 인한 글로벌 물류 대란 우려" />
            <NewsItem tag="속보" source="Al Jazeera" content="이스라엘-이란 접경 지역 민간인 대피령 발령" />
          </div>
        </div>

        {/* 🗺️ 지도 영역 수정: 높이를 고정(h-[600px])하여 확실히 보이게 함 */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[600px] relative">
          <Map
            initialViewState={{
              longitude: 35.0, 
              latitude: 31.0,  
              zoom: 3
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11" 
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {/* 예시 마커: 우크라이나 지역 */}
            <Marker longitude={30.52} latitude={50.45} anchor="bottom">
              <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white animate-pulse"></div>
            </Marker>

            {/* 예시 마커: 중동 지역 */}
            <Marker longitude={35.21} latitude={31.76} anchor="bottom">
              <div className="w-5 h-5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
            </Marker>
          </Map>
        </div>
      </div>
    </main>
  );
}