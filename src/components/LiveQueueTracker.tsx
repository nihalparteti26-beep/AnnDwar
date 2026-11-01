import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Hourglass, 
  QrCode, 
  Check, 
  Microscope, 
  Scale, 
  FileText, 
  CreditCard, 
  CheckCircle,
  Building2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Truck
} from 'lucide-react';
import { Language, MandiSlot, ProcurementStage } from '../types';
import { openRealWhatsApp } from '../utils/whatsapp';

interface LiveQueueTrackerProps {
  lang: Language;
  activeSlot: MandiSlot | null;
  onNavigateToMandiTerminal?: () => void;
  onOpenReceipt?: () => void;
  onOpenDbt?: () => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({
  lang,
  activeSlot,
  onNavigateToMandiTerminal,
  onOpenReceipt,
  onOpenDbt,
}) => {
  const isHi = lang === 'hi';

  const [stages, setStages] = useState<ProcurementStage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Sensible placeholders only — real values arrive from /api/queue/live below.
  const [queueData, setQueueData] = useState({
    tokenNumber: activeSlot?.tokenNumber || 'MP-2409',
    vehicleNumber: activeSlot?.vehicleNumber || 'MP-09-GE-4102',
    cropName: activeSlot?.cropName || 'शरबती गेहूँ (ग्रेड-A)',
    queueOrder: 0,
    totalVehicles: 0,
    waitMinutes: 0,
    rateMin: 0,
    yardLoadPercent: 0,
    yardLoadLevelHi: 'सुगम यातायात',
    yardLoadLevelEn: 'Smooth Flow',
    activeScales: 4,
  });

  const [directive, setDirective] = useState<any>(null);

  const fetchStagesAndDirective = async () => {
    try {
      const res = await fetch('/api/stages');
      const data = await res.json();
      if (Array.isArray(data)) {
        data.sort((a: ProcurementStage, b: ProcurementStage) => a.step - b.step);
        setStages(data);
      }

      const resDir = await fetch('/api/queue/directive');
      const dataDir = await resDir.json();
      if (dataDir.success && dataDir.directive) {
        setDirective(dataDir.directive);
      }

      // Live queue stats (queue position, wait time, yard load, etc.) — dynamic,
      // computed server-side from the actual farmers currently in the queue.
      const resQueue = await fetch('/api/queue/live');
      const dataQueue = await resQueue.json();
      if (dataQueue && !dataQueue.error) {
        setQueueData(prev => ({
          ...prev,
          tokenNumber: dataQueue.tokenNumber ?? prev.tokenNumber,
          vehicleNumber: dataQueue.vehicleNumber ?? prev.vehicleNumber,
          cropName: dataQueue.cropName ?? prev.cropName,
          queueOrder: dataQueue.queueOrder ?? prev.queueOrder,
          totalVehicles: dataQueue.totalVehicles ?? prev.totalVehicles,
          waitMinutes: dataQueue.waitMinutes ?? prev.waitMinutes,
          rateMin: dataQueue.rateMin ?? prev.rateMin,
          yardLoadPercent: dataQueue.yardLoadPercent ?? prev.yardLoadPercent,
          yardLoadLevelHi: dataQueue.yardLoadLevelHi ?? prev.yardLoadLevelHi,
          yardLoadLevelEn: dataQueue.yardLoadLevelEn ?? prev.yardLoadLevelEn,
          activeScales: dataQueue.activeScales ?? prev.activeScales,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch stages/directive/live-queue:', err);
    }
  };

  useEffect(() => {
    fetchStagesAndDirective();
    const interval = setInterval(fetchStagesAndDirective, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchStagesAndDirective();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl">
      {/* Top Header & Token Card */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b7e45] animate-pulse"></span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#143425] tracking-tight">
              {isHi ? 'लाइव कतार एवं टोकन ट्रैकर' : 'Live Queue & Token Tracker'}
            </h2>
            <button
              onClick={handleManualRefresh}
              className="p-1.5 hover:bg-[#eaf1ec] rounded-lg transition-colors cursor-pointer text-[#1b7e45]"
              title={isHi ? 'रिफ्रेश करें' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#4f705f] mt-1 max-w-2xl leading-relaxed">
            {isHi
              ? `${activeSlot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'} — वास्तविक समय लाइव उपार्जन प्रगति ट्रैकर।`
              : `${activeSlot?.mandiCenterName || 'Sanwer Procurement Centre'} — Real-time live procurement progress tracker.`}
          </p>
        </div>

        {/* Top Right Token Badge */}
        <div className="bg-white border-2 border-[#1b4d3e]/30 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xs flex items-center gap-3 shrink-0">
          <div className="w-14 h-14 bg-[#f2f8f4] border border-[#bcdcc9] rounded-xl flex items-center justify-center p-1 relative">
            <QrCode className="w-11 h-11 text-[#1b4d3e]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-2.5 h-2.5 bg-[#1b7e45] rounded-xs opacity-70"></span>
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black font-mono text-[#103222] tracking-wide">
              #{activeSlot?.tokenNumber || queueData.tokenNumber}
            </div>
            <div className="text-[11px] text-[#4d6d5d] font-semibold mt-0.5">
              <span>{isHi ? 'वाहन: ' : 'Vehicle: '}</span>
              <span className="font-mono text-[#183a29]">{activeSlot?.vehicleNumber || queueData.vehicleNumber}</span>
            </div>
            <div className="text-[11px] text-[#4d6d5d] font-semibold">
              <span>{isHi ? 'फसल: ' : 'Crop: '}</span>
              <span className="text-[#1b7e45] font-bold">{activeSlot?.cropName || queueData.cropName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Stat 1: कतार क्रम (Queue Order) */}
        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#5a7767]">
              {isHi ? 'कतार क्रम (Queue Order)' : 'Queue Order'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#e8f5e9] text-[#1b7e45] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#113222]">
                {queueData.queueOrder}
              </span>
              <span className="text-sm font-bold text-[#355f4a]">
                {isHi ? 'किसान आगे' : 'Farmers Ahead'}
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf3ee] text-[11px] text-[#617e6e] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#1b7e45]" />
              <span>
                {isHi
                  ? `कुल ${queueData.totalVehicles} वाहन वर्तमान में मंडी परिसर में`
                  : `Total ${queueData.totalVehicles} vehicles in yard`}
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: अनुमानित प्रतीक्षा समय */}
        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#5a7767]">
              {isHi ? 'अनुमानित प्रतीक्षा समय' : 'Estimated Waiting Time'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#fff3e0] text-[#e65100] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#c96c21]">
                {queueData.waitMinutes}
              </span>
              <span className="text-sm font-bold text-[#8c4915]">
                {isHi ? 'मिनट शेष' : 'Minutes Left'}
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#edf3ee] text-[11px] text-[#617e6e] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c96c21]" />
              <span>
                {isHi
                  ? `औसत प्रक्रमण दर: ${queueData.rateMin} मिनट / ट्रॉली`
                  : `Avg clearance: ${queueData.rateMin} min / trolley`}
              </span>
            </div>
          </div>
        </div>

        {/* Stat 3: वे-ब्रिज व यार्ड भार */}
        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#5a7767]">
              {isHi ? 'वे-ब्रिज व यार्ड भार' : 'Weigh-Bridge & Yard Load'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#e8f5e9] text-[#1b7e45] flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1b7e45]">
                {queueData.yardLoadPercent}%
              </span>
              <span className="text-sm font-bold text-[#1b7e45]">
                {isHi ? queueData.yardLoadLevelHi : queueData.yardLoadLevelEn}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#e8eee9] h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#1b7e45] h-full rounded-full transition-all duration-500"
                style={{ width: `${queueData.yardLoadPercent}%` }}
              ></div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#edf3ee] text-[11px] text-[#617e6e]">
              {isHi
                ? `सभी ${queueData.activeScales} इलेक्ट्रॉनिक वे-स्केल सुचारू कार्यरत`
                : `All ${queueData.activeScales} electronic weigh-scales operational`}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE LIGHT ORANGE DIRECTIVE BOX (Mandi Operator Live Command with Dark Orange Border) */}
      {directive && (
        <div className="bg-[#fff9f4] rounded-3xl p-5 text-[#7c2d12] shadow-md border-2 border-[#ea580c] mb-6 relative overflow-hidden animate-fadeIn">
          {/* Ambient Glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-200/40 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ea580c]"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-[#9a3412] px-3 py-1 rounded-full border border-orange-300 flex items-center gap-1.5">
                <span>📢</span>
                <span>{isHi ? 'मंडी ऑपरेटर लाइव निर्देश' : 'Mandi Operator Live Directive'}</span>
              </span>
              {directive.scaleNumber && (
                <span className="text-xs font-black bg-[#ea580c] text-white px-3 py-1 rounded-full shadow-xs">
                  🎯 {directive.scaleNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#9a3412] font-mono bg-orange-100/90 border border-orange-200 px-2.5 py-0.5 rounded-lg">
                🕒 {directive.time}
              </span>

              {/* REAL WHATSAPP BUTTON */}
              <button
                onClick={() => {
                  const dirText = isHi ? directive.textHi : directive.textEn;
                  const fullMsg = `🌾 AnnDwar - Kisan se Desh Tak 🌾\nनमस्ते ${directive.farmerName || 'किसान भाई'}, लाइव उपार्जन निर्देश:\n\n📢 "${dirText}"\n\nटोकन: ${directive.token}\nकेंद्र: ${activeSlot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'}`;
                  openRealWhatsApp(activeSlot?.farmerId ? undefined : '9826199999', fullMsg);
                }}
                className="text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title={isHi ? 'वास्तविक WhatsApp पर खोलें' : 'Open in Real WhatsApp'}
              >
                <span>📲</span>
                <span>{isHi ? 'असली WhatsApp' : 'Real WhatsApp'}</span>
              </button>
            </div>
          </div>

          <p className="text-base sm:text-lg font-black leading-snug tracking-tight text-[#7c2d12]">
            {isHi ? directive.textHi : directive.textEn}
          </p>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-orange-200 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 bg-white border border-orange-200/90 px-3 py-1 rounded-lg shadow-2xs">
              <span className="text-[#128C7E] font-bold">💬 WhatsApp:</span>
              <span className="text-emerald-700 font-bold">प्रेषित ✓</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-orange-200/90 px-3 py-1 rounded-lg shadow-2xs">
              <span className="text-sky-700 font-bold">📩 SMS (VM-ANNDWR):</span>
              <span className="text-sky-700 font-bold">प्रेषित ✓</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-orange-200/90 px-3 py-1 rounded-lg shadow-2xs font-mono ml-auto text-[#7c2d12]">
              🏷️ टोकन: {directive.token}
            </span>
          </div>
        </div>
      )}

      {/* 7-Stage Procurement Lifecycle Dynamic Tracker */}
      <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4 border-b border-[#edf3ee] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#133726] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b7e45]"></span>
              <span>
                {isHi
                  ? '7-चरणीय पारदर्शी उपार्जन प्रगति (Real-Time Tracker)'
                  : '7-Stage Real-Time Procurement Tracker'}
              </span>
            </h3>
            <p className="text-[11px] text-[#557666] mt-0.5">
              {isHi
                ? 'प्रगति अनुसार स्वतः अद्यतन: संपन्न चरण हरे (Green), प्रगतिरत नारंगी (Orange) व प्रतीक्षारत धूसर।'
                : 'Live progression: Completed stages turn Green, in-progress Orange, and pending Gray.'}
            </p>
          </div>

          {/* Color Status Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-[#147437] font-bold">
              <span className="w-3 h-3 rounded-full bg-[#1b7e45] flex items-center justify-center text-white text-[8px]">✓</span>
              <span>{isHi ? 'सम्पन्न (Completed)' : 'Completed'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#b35912] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c96c21] animate-ping"></span>
              <span>{isHi ? 'प्रक्रियाधीन (In-Progress)' : 'In-Progress'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#7f998c] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd9d1]"></span>
              <span>{isHi ? 'प्रतीक्षारत (Upcoming)' : 'Upcoming'}</span>
            </span>
          </div>
        </div>

        {/* 7 Dynamic Stage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {stages.map((st) => {
            const isCompleted = st.status === 'completed';
            const isInProgress = st.status === 'in_progress';
            const isUpcoming = st.status === 'upcoming';

            return (
              <div
                key={st.id}
                onClick={() => {
                  if (st.step === 7 && onOpenDbt) onOpenDbt();
                  if (st.step === 6 && onOpenReceipt) onOpenReceipt();
                }}
                className={`rounded-2xl p-3.5 border transition-all relative flex flex-col justify-between cursor-pointer hover:shadow-sm ${
                  isCompleted
                    ? 'bg-[#f4fbf6] border-2 border-[#1b7e45] shadow-xs'
                    : isInProgress
                    ? 'bg-[#fef9f2] border-2 border-[#c96c21] shadow-xs ring-2 ring-[#c96c21]/20'
                    : 'bg-[#fafbfa] border-[#e2eae4] opacity-75'
                }`}
              >
                {isInProgress && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#c96c21] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs whitespace-nowrap animate-pulse">
                    {isHi ? 'सक्रिय चरण' : 'Active Step'}
                  </div>
                )}

                {isCompleted && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#1b7e45] text-white text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider shadow-2xs whitespace-nowrap">
                    ✓ {isHi ? 'पूर्ण' : 'Done'}
                  </div>
                )}

                <div>
                  {/* Step icon circle */}
                  <div className="flex justify-center mb-2.5 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                        isCompleted
                          ? 'bg-[#1b7e45] text-white'
                          : isInProgress
                          ? 'bg-[#c96c21] text-white ring-4 ring-[#faeedf]'
                          : 'bg-[#edf3ef] text-[#7b9888] border border-[#d2ded6]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : isInProgress ? (
                        st.step === 4 ? <Microscope className="w-5 h-5" /> : st.step
                      ) : (
                        st.step
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-[#143626] text-center leading-snug">
                    {st.step}. {isHi ? st.titleHi : st.titleEn}
                  </div>
                  <div className="text-[10px] text-[#557666] text-center mt-1 font-medium leading-tight">
                    {st.details}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#e8f0ea] text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${
                      isCompleted
                        ? 'bg-[#e2f7eb] text-[#137333] border border-[#a4e2bd]'
                        : isInProgress
                        ? 'bg-[#faeedd] text-[#b85b14] border border-[#f3d3aa]'
                        : 'bg-[#f1f5f2] text-[#7a9687]'
                    }`}
                  >
                    {isHi ? st.subHi : st.subEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
