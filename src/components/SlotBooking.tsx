import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  Download, 
  RefreshCw, 
  Tractor, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  Radio,
  CheckCircle,
  Sparkles,
  Zap,
  TrendingDown,
  CloudSun,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, MandiSlot } from '../types';
import { generateQrDataUrl } from '../utils/qrGenerator';

interface SlotBookingProps {
  lang: Language;
  activeSlot: MandiSlot | null;
  onSlotBooked: (newSlot: MandiSlot) => void;
  onOpenReceipt: () => void;
  onOpenReschedule: () => void;
  onViewLiveQueue: () => void;
}

export const SlotBooking: React.FC<SlotBookingProps> = ({
  lang,
  activeSlot,
  onSlotBooked,
  onOpenReceipt,
  onOpenReschedule,
  onViewLiveQueue,
}) => {
  const isHi = lang === 'hi';
  const [gateQrUrl, setGateQrUrl] = useState<string>('');

  useEffect(() => {
    if (activeSlot) {
      const qrData = activeSlot.qrCodeData || `ANNDWAR|TOKEN:${activeSlot.tokenNumber}|FARMER:${activeSlot.farmerId}|CROP:${activeSlot.cropName}|QTY:${activeSlot.quantityQuintal}Q|MANDI:${activeSlot.mandiCenterName}`;
      generateQrDataUrl(qrData).then((url) => setGateQrUrl(url));
    }
  }, [activeSlot]);

  const [selectedDate, setSelectedDate] = useState<string>(
    activeSlot ? activeSlot.date.replace(' 2025', '') : '27 Oct'
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    activeSlot ? activeSlot.timeSlot : '11:00 AM - 12:30 PM'
  );
  const [cropType, setCropType] = useState<string>('शरबती गेहूँ (ग्रेड-A)');
  const [quantity, setQuantity] = useState<number>(45);
  const [vehicleNo, setVehicleNo] = useState<string>('MP-09-EA-3142');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const handleSelectDate = (dateId: string) => {
    setSelectedDate(dateId);
    const updatedDate = isHi ? `${dateId.replace('Oct', 'अक्टूबर')} 2025` : `${dateId} 2025`;
    if (activeSlot) {
      const updated = { ...activeSlot, date: updatedDate, timeSlot: selectedTimeSlot };
      onSlotBooked(updated);
      fetch('/api/slots/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDate: updatedDate, newTimeSlot: selectedTimeSlot }),
      }).catch(() => {});
    }
    setBookingSuccessMsg(
      isHi 
        ? `दिनांक रियल-टाइम में बदलकर '${updatedDate}' की गई!`
        : `Date updated in real-time to '${updatedDate}'!`
    );
  };

  const handleSelectTime = (timeRange: string) => {
    setSelectedTimeSlot(timeRange);
    const currentDate = isHi ? `${selectedDate.replace('Oct', 'अक्टूबर')} 2025` : `${selectedDate} 2025`;
    if (activeSlot) {
      const updated = { ...activeSlot, date: currentDate, timeSlot: timeRange };
      onSlotBooked(updated);
      fetch('/api/slots/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDate: currentDate, newTimeSlot: timeRange }),
      }).catch(() => {});
    }
    setBookingSuccessMsg(
      isHi 
        ? `समय स्लॉट रियल-टाइम में बदलकर '${timeRange}' किया गया!`
        : `Time slot updated in real-time to '${timeRange}'!`
    );
  };

  // AI 1-Click Auto Reschedule handler
  const handleApplyAiSuggestion = async () => {
    setIsApplyingAi(true);
    try {
      const optimalDate = '27 अक्टूबर 2025';
      const optimalTime = '09:00 AM - 10:30 AM';
      const optimalMandi = 'सांवेर उपार्जन केंद्र';

      const res = await fetch('/api/slots/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: optimalDate,
          newTimeSlot: optimalTime,
          newMandi: optimalMandi,
          isAiSuggested: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.slot) {
        onSlotBooked(data.slot);
        setSelectedDate('27 Oct');
        setSelectedTimeSlot(optimalTime);
        setBookingSuccessMsg(
          isHi
            ? '✨ AI स्मार्ट स्लॉट सफलतापूर्वक लागू हुआ! कतार में 43 मिनट की बचत होगी। पंजीकृत मोबाइल पर SMS/WhatsApp पुष्टि भेजी गई।'
            : '✨ AI Smart Slot applied! Saves 43 mins wait time. Confirmation SMS/WhatsApp sent to registered mobile.'
        );
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('AI Auto-reschedule failed:', err);
    } finally {
      setIsApplyingAi(false);
    }
  };

  const dates = [
    {
      id: '26 Oct',
      titleHi: 'आज (Today)',
      titleEn: 'Today',
      dayHi: 'शनिवार (Sat)',
      dayEn: 'Saturday',
      dateStr: '26 Oct',
      statusHi: 'पूर्ण (Full)',
      statusEn: 'Full',
      statusBadgeColor: 'bg-[#fbe9e7] text-[#c62828] border-[#ffcdd2]',
      subHi: 'कोई स्लॉट रिक्त नहीं',
      subEn: 'No slots vacant',
      isFull: true,
    },
    {
      id: '27 Oct',
      titleHi: 'कल (Tomorrow)',
      titleEn: 'Tomorrow',
      dayHi: 'सोमवार (Mon)',
      dayEn: 'Monday',
      dateStr: '27 Oct',
      recommendedBadge: isHi ? 'अनुशंसित (Best)' : 'Recommended',
      statusHi: 'सुगम',
      statusEn: 'Clear',
      statusBadgeColor: 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]',
      subHi: '42 स्लॉट उपलब्ध',
      subEn: '42 Slots Available',
      isFull: false,
    },
    {
      id: '28 Oct',
      titleHi: 'दिवस 3',
      titleEn: 'Day 3',
      dayHi: 'मंगलवार (Tue)',
      dayEn: 'Tuesday',
      dateStr: '28 Oct',
      statusHi: 'उपलब्ध',
      statusEn: 'Available',
      statusBadgeColor: 'bg-[#e0f2f1] text-[#00695c] border-[#b2dfdb]',
      subHi: '85 स्लॉट उपलब्ध',
      subEn: '85 Slots Available',
      isFull: false,
    },
    {
      id: '29 Oct',
      titleHi: 'दिवस 4',
      titleEn: 'Day 4',
      dayHi: 'बुधवार (Wed)',
      dayEn: 'Wednesday',
      dateStr: '29 Oct',
      statusHi: 'सीमित (Fast)',
      statusEn: 'Filling Fast',
      statusBadgeColor: 'bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]',
      subHi: '12 स्लॉट शेष',
      subEn: '12 Slots Left',
      isFull: false,
    },
    {
      id: '30 Oct',
      titleHi: 'दिवस 5',
      titleEn: 'Day 5',
      dayHi: 'गुरुवार (Thu)',
      dayEn: 'Thursday',
      dateStr: '30 Oct',
      statusHi: 'उपलब्ध',
      statusEn: 'Available',
      statusBadgeColor: 'bg-[#e0f2f1] text-[#00695c] border-[#b2dfdb]',
      subHi: '80 स्लॉट उपलब्ध',
      subEn: '80 Slots Available',
      isFull: false,
    },
  ];

  const timeSlots = [
    {
      id: '09:00 AM - 10:30 AM',
      sessionHi: 'प्रातः सत्र (AI श्रेष्ठ)',
      sessionEn: 'Morning (AI Best)',
      range: '09:00 AM - 10:30 AM',
      entryHi: 'गेट एंट्री: 08:45 AM',
      entryEn: 'Gate Entry: 08:45 AM',
      waitHi: 'प्रतीक्षा: ~12 मिनट (अल्प)',
      waitEn: 'Wait: ~12 min (Low)',
      vacantHi: '42 स्थान उपलब्ध',
      vacantEn: '42 spots left',
      isAiOptimal: true,
    },
    {
      id: '11:00 AM - 12:30 PM',
      sessionHi: 'मध्याह्न सत्र',
      sessionEn: 'Noon Session',
      range: '11:00 AM - 12:30 PM',
      entryHi: 'गेट एंट्री: 10:45 AM',
      entryEn: 'Gate Entry: 10:45 AM',
      waitHi: 'प्रतीक्षा: ~55 मिनट (भीड़)',
      waitEn: 'Wait: ~55 min (Peak)',
      vacantHi: '18 स्थान शेष',
      vacantEn: '18 spots left',
      isAiOptimal: false,
    },
    {
      id: '02:00 PM - 03:30 PM',
      sessionHi: 'अपराह्न सत्र',
      sessionEn: 'Afternoon Session',
      range: '02:00 PM - 03:30 PM',
      entryHi: 'गेट एंट्री: 01:45 PM',
      entryEn: 'Gate Entry: 01:45 PM',
      waitHi: 'प्रतीक्षा: ~25 मिनट',
      waitEn: 'Wait: ~25 min',
      vacantHi: '11 स्थान शेष',
      vacantEn: '11 spots left',
      isAiOptimal: false,
    },
    {
      id: '04:00 PM - 05:30 PM',
      sessionHi: 'सायं सत्र',
      sessionEn: 'Evening Session',
      range: '04:00 PM - 05:30 PM',
      entryHi: 'गेट एंट्री: 03:45 PM',
      entryEn: 'Gate Entry: 03:45 PM',
      waitHi: 'प्रतीक्षा: ~15 मिनट',
      waitEn: 'Wait: ~15 min',
      vacantHi: '05 स्थान शेष',
      vacantEn: '05 spots left',
      isAiOptimal: false,
    },
  ];

  const handleBookSlot = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/slots/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: `${selectedDate} 2025`,
          timeSlot: selectedTimeSlot,
          mandiCenterName: 'सांवेर उपार्जन केंद्र',
          cropName: cropType,
          quantityQuintal: quantity,
          vehicleNumber: vehicleNo,
        }),
      });
      const data = await response.json();
      if (data.success && data.slot) {
        onSlotBooked(data.slot);
        setBookingSuccessMsg(
          isHi
            ? `स्लॉट सफलतापूर्वक बुक हुआ! टोकन: ${data.slot.tokenNumber}। पंजीकृत मोबाइल पर SMS प्रेषित किया गया।`
            : `Slot booked successfully! Token: ${data.slot.tokenNumber}. SMS sent to registered mobile.`
        );
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Slot booking failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl">
      {/* Header & Server Time */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#143425] tracking-tight">
          {isHi ? 'मंडी स्लॉट बुकिंग एवं ई-टोकन' : 'Mandi Slot Booking & E-Token'}
        </h2>
        <p className="text-xs sm:text-sm text-[#4f705f] mt-0.5">
          {isHi
            ? 'अपनी उपज विक्रय हेतु तिथि, मंडी केंद्र एवं AI सुझाये गए समय स्लॉट चुनें।'
            : 'Select date, procurement centre, and AI-predicted optimal time slot.'}
        </p>
      </div>

      {/* Success Notification Alert */}
      {bookingSuccessMsg && (
        <div className="mb-6 p-4 bg-[#e8f8ee] border border-[#a0e4b8] rounded-2xl flex items-center justify-between text-xs sm:text-sm text-[#136b35] font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#1b7e45] shrink-0" />
            <span>{bookingSuccessMsg}</span>
          </div>
          <button
            onClick={() => setBookingSuccessMsg(null)}
            className="text-[#136b35] hover:text-[#0b4621] text-xs underline cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Confirmed Slot Card (Active Slot Display) */}
      {activeSlot && (
        <div className="bg-linear-to-r from-[#ebf7f0] to-[#f4faf6] border-2 border-[#1b7e45]/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#1b7e45] text-white flex items-center justify-center shrink-0 shadow-md">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] px-2.5 py-0.5 rounded-full">
                    {isHi ? 'सत्यापित स्लॉट (Confirmed Active Slot)' : 'Confirmed Active Slot'}
                  </span>
                  <span className="text-[10.5px] font-bold bg-[#edf7f1] text-[#147437] border border-[#a8e3c1] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1b7e45] animate-pulse"></span>
                    {isHi ? 'रियल-टाइम लाइव सिंक' : 'Live Real-Time Synced'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#5a7969]">
                    {isHi ? `टोकन: ${activeSlot.tokenNumber}` : `Token: ${activeSlot.tokenNumber}`}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#113222] mt-1">
                  {activeSlot.date} • {activeSlot.timeSlot}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#4b6d5c] mt-1 flex-wrap font-medium">
                  <span>🏢 {activeSlot.mandiCenterName} ({activeSlot.gateNumber}, {activeSlot.laneNumber})</span>
                  <span>•</span>
                  <span>🌾 {activeSlot.cropName} • {activeSlot.quantityQuintal} क्विंटल</span>
                  <span>•</span>
                  <span>🚛 {activeSlot.vehicleNumber}</span>
                </div>
              </div>
            </div>

            {/* Actions for Confirmed Slot */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              {/* Gate Pass QR Card */}
              <div 
                onClick={onOpenReceipt}
                className="bg-white border border-[#a8dbc0] rounded-xl p-2 flex items-center gap-2 cursor-pointer hover:bg-[#e6f4ec] transition-colors shadow-2xs"
                title={isHi ? 'गेट पर दिखाने हेतु QR पास' : 'Gate Pass QR'}
              >
                <div className="w-10 h-10 bg-[#f8fdf9] rounded-lg border border-[#bfe2cc] flex items-center justify-center p-0.5 overflow-hidden">
                  {gateQrUrl ? (
                    <img src={gateQrUrl} alt="QR" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-base font-bold">📱</span>
                  )}
                </div>
                <div className="text-left pr-1">
                  <span className="text-[10px] font-extrabold text-[#14532d] block uppercase tracking-wider">
                    {isHi ? 'गेट पास QR' : 'Gate Pass QR'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#1b4d3e]">
                    #{activeSlot.tokenNumber}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenReceipt}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#1b4d3e] hover:bg-[#143e31] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#88f0bc]" />
                <span>{isHi ? 'स्लॉट रसीद (PDF)' : 'Receipt (PDF)'}</span>
              </button>

              <button
                onClick={onOpenReschedule}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white hover:bg-[#f2f7f4] text-[#183928] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#246146]" />
                <span>{isHi ? 'री-शेड्यूल' : 'Reschedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* AI AUTO-RESCHEDULING & CONGESTION PREDICTIONS CARD */}
      {/* ========================================================= */}
      <div className="bg-linear-to-r from-[#0f2e24] via-[#1b4d3e] to-[#256349] text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-xl relative overflow-hidden border border-[#2a7a58]">
        {/* Glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#88f0bc]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#88f0bc]/20 backdrop-blur-xs flex items-center justify-center border border-[#88f0bc]/30">
              <Sparkles className="w-5 h-5 text-[#88f0bc] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  {isHi ? 'AI ऑटो री-शेड्यूलिंग एवं कतार पूर्वानुमान' : 'AI Auto-Rescheduling & Queue Predictions'}
                </h3>
                <span className="text-[10px] font-extrabold bg-[#88f0bc] text-[#0f2e24] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live AI Engine
                </span>
              </div>
              <p className="text-xs text-[#b8e2ce] mt-0.5">
                {isHi
                  ? 'मौसम, यार्ड में कतार व तुलाई गति के आधार पर न्यूनतम प्रतीक्षा वाला सर्वश्रेष्ठ स्लॉट'
                  : 'Automated yard congestion analysis suggests optimal slot for minimum wait time.'}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#88f0bc] animate-ping" />
            <span className="text-[#d7f7e7] font-semibold">
              {isHi ? 'AI सटीकता: 98%' : 'AI Confidence: 98%'}
            </span>
          </div>
        </div>

        {/* Predictive Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 my-4">
          {/* Wait Time Reduction */}
          <div className="bg-black/20 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="text-[11px] text-[#a4d4bc] font-medium flex items-center justify-between">
              <span>{isHi ? 'प्रतीक्षा समय बचत' : 'Wait Time Reduction'}</span>
              <TrendingDown className="w-4 h-4 text-[#88f0bc]" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black text-[#88f0bc]">
                -43 {isHi ? 'मिनट' : 'mins'}
              </div>
              <div className="text-[11px] text-[#e0f5ea]">
                55 min ➔ <span className="font-bold text-white">12 min wait</span>
              </div>
            </div>
            <span className="text-[10px] text-[#9cc9b3]">
              {isHi ? 'प्रातः काल में त्वरित एंट्री' : 'Fast early morning entry'}
            </span>
          </div>

          {/* Yard Congestion Meter */}
          <div className="bg-black/20 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="text-[11px] text-[#a4d4bc] font-medium flex items-center justify-between">
              <span>{isHi ? 'यार्ड भीड़भाड़ इंडेक्स' : 'Yard Congestion'}</span>
              <span className="text-[10px] font-bold bg-[#88f0bc]/20 text-[#88f0bc] px-1.5 py-0.5 rounded">
                18% Low
              </span>
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black text-white">
                18% <span className="text-xs text-[#a4d4bc] font-normal">vs 74% peak</span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-[#88f0bc] h-full w-[18%] rounded-full" />
              </div>
            </div>
            <span className="text-[10px] text-[#9cc9b3]">
              {isHi ? 'ट्रॉली अनलोडिंग 3.4x तेज' : '3.4x faster unloading'}
            </span>
          </div>

          {/* Weather & Grain Safety */}
          <div className="bg-black/20 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="text-[11px] text-[#a4d4bc] font-medium flex items-center justify-between">
              <span>{isHi ? 'मौसम व फसल सुरक्षा' : 'Weather & Moisture'}</span>
              <CloudSun className="w-4 h-4 text-[#fcd34d]" />
            </div>
            <div className="my-1.5">
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>0% {isHi ? 'वर्षा जोखिम' : 'Rain Risk'}</span>
              </div>
              <div className="text-[11px] text-[#e0f5ea]">
                {isHi ? 'खिली धूप • नमी 12% मानक' : 'Sunny • Safe 12% Moisture'}
              </div>
            </div>
            <span className="text-[10px] text-[#9cc9b3]">
              {isHi ? 'अनाज सुरक्षित तुलाई' : 'Safe grain weighment'}
            </span>
          </div>

          {/* Suggested Optimal Slot & 1-Click Action */}
          <div className="bg-[#88f0bc]/15 border border-[#88f0bc]/40 rounded-2xl p-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[10.5px] font-extrabold text-[#88f0bc] uppercase tracking-wider block">
                {isHi ? '🎯 AI सर्वश्रेष्ठ स्लॉट' : '🎯 AI Recommended Slot'}
              </span>
              <div className="text-sm font-extrabold text-white mt-1">
                27 Oct • 09:00 AM - 10:30 AM
              </div>
              <div className="text-[11px] text-[#c9ede0]">
                सांवेर उपार्जन केंद्र (लेन #01)
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <button
                onClick={handleApplyAiSuggestion}
                disabled={isApplyingAi}
                className="w-full bg-[#88f0bc] hover:bg-[#72e2ab] disabled:bg-[#5bb88c] text-[#0f2e24] text-xs font-black py-2 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#0f2e24] fill-current" />
                <span>
                  {isApplyingAi 
                    ? (isHi ? 'लागू हो रहा है...' : 'Applying...') 
                    : (isHi ? 'AI सुझाव तुरंत लागू करें' : 'Apply AI Suggestion')}
                </span>
              </button>

              <button
                onClick={onOpenReschedule}
                className="text-[11px] text-[#c9ede0] hover:text-white underline text-center cursor-pointer"
              >
                {isHi ? 'अन्य विकल्प देखें ➔' : 'View other options ➔'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Flow Stepper */}
      <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e0e9e2] -z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#1b7e45] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-[#183a29] mt-1.5 text-center">
              {isHi ? '१. केंद्र चयन' : '1. Center'}
            </span>
            <span className="text-[10.5px] text-[#1b7e45] font-medium text-center">
              {isHi ? 'सांवेर चयनित' : 'Sanwer Chosen'}
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#c96c21] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-4 ring-[#faeedf]">
              2
            </div>
            <span className="text-xs font-bold text-[#8f4a13] mt-1.5 text-center">
              {isHi ? '२. दिनांक व स्लॉट' : '2. Date & Slot'}
            </span>
            <span className="text-[10.5px] text-[#c96c21] font-semibold text-center">
              {isHi ? 'सक्रिय चयन' : 'Active Selection'}
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#edf2ee] text-[#718b7c] flex items-center justify-center font-bold text-xs border border-[#cfdcd3]">
              3
            </div>
            <span className="text-xs font-medium text-[#718b7c] mt-1.5 text-center">
              {isHi ? '३. विवरण व पुष्टि' : '3. Confirm'}
            </span>
            <span className="text-[10.5px] text-[#93ab9e] text-center">
              {isHi ? 'अंतिम चरण' : 'Final Step'}
            </span>
          </div>
        </div>
      </div>

      {/* Date Selection Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#1a3828] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#1b7e45]" />
            <span>{isHi ? 'दिनांक का चयन करें' : 'Select Date'}</span>
          </h3>
          <span className="text-[11px] text-[#618070]">
            {isHi ? 'आगामी 5 दिनों के लिए अग्रिम बुकिंग खुली है' : 'Advance booking open for next 5 days'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {dates.map((d) => {
            const isSelected = selectedDate === d.id;
            return (
              <div
                key={d.id}
                onClick={() => {
                  if (!d.isFull) handleSelectDate(d.id);
                }}
                className={`rounded-2xl p-3 sm:p-4 border transition-all relative flex flex-col justify-between ${
                  d.isFull
                    ? 'bg-[#fcfdfc] border-[#e8eee9] opacity-65 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#f4fcf6] border-2 border-[#1b7e45] shadow-xs ring-2 ring-[#1b7e45]/15 cursor-pointer'
                    : 'bg-white border-[#d5e2d9] hover:border-[#a0cbaf] cursor-pointer shadow-2xs'
                }`}
              >
                {d.recommendedBadge && (
                  <span className="absolute -top-2.5 right-3 bg-[#1b7e45] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    {d.recommendedBadge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-[#516e60]">
                      {isHi ? d.titleHi : d.titleEn}
                    </span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${d.statusBadgeColor}`}>
                      {isHi ? d.statusHi : d.statusEn}
                    </span>
                  </div>

                  <div className="text-xl sm:text-2xl font-extrabold text-[#143425] my-0.5">
                    {d.dateStr}
                  </div>
                  <div className="text-[11px] text-[#637f71]">
                    {isHi ? d.dayHi : d.dayEn}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#edf4ef] text-[10.5px] font-semibold">
                  <span className={d.isFull ? 'text-[#b71c1c]' : 'text-[#1b7e45]'}>
                    {isHi ? d.subHi : d.subEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#1a3828] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1b7e45]" />
            <span>{isHi ? 'समय स्लॉट चुनें (AI पूर्वानुमान सहित)' : 'Select Time Slot (AI Forecasts)'}</span>
          </h3>
          <span className="text-[11px] text-[#618070]">
            {isHi ? 'प्रति स्लॉट क्षमता: 25 वाहन' : 'Capacity: 25 Vehicles per slot'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeSlots.map((ts) => {
            const isSelected = selectedTimeSlot === ts.range;
            return (
              <div
                key={ts.id}
                onClick={() => handleSelectTime(ts.range)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-[#f4fcf6] border-2 border-[#1b7e45] shadow-sm ring-2 ring-[#1b7e45]/15'
                    : 'bg-white border-[#d5e2d9] hover:border-[#96c9aa] shadow-2xs'
                }`}
              >
                {ts.isAiOptimal && (
                  <span className="absolute -top-2.5 right-3 bg-[#1b7e45] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {isHi ? 'AI न्यूनतम प्रतीक्षा' : 'AI Lowest Wait'}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                      ts.isAiOptimal ? 'bg-[#d8f5e5] text-[#115b33]' : 'bg-[#edf5f0] text-[#335d48]'
                    }`}>
                      {isHi ? ts.sessionHi : ts.sessionEn}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#1b7e45] bg-[#1b7e45]' : 'border-[#b5cdc0] bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className="text-sm sm:text-base font-extrabold text-[#143425] mt-1">
                    {ts.range}
                  </div>
                  <div className="text-[10.5px] text-[#638072] mt-1">
                    {isHi ? ts.entryHi : ts.entryEn}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-[11px]">
                  <span className={`font-medium ${ts.isAiOptimal ? 'text-[#1b7e45] font-bold' : 'text-[#597869]'}`}>
                    {isHi ? ts.waitHi : ts.waitEn}
                  </span>
                  <span className="font-bold text-[#1b7e45]">{isHi ? ts.vacantHi : ts.vacantEn}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Booking Form Bar */}
      <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          {/* Crop details */}
          <div>
            <label className="text-[11px] font-semibold text-[#5c7a6b] block mb-1">
              {isHi ? 'उपज का नाम व किस्म' : 'Crop & Variety'}
            </label>
            <div className="bg-[#f9faf9] border border-[#d5e2d9] rounded-xl px-3 py-2 text-xs font-bold text-[#153a28] flex items-center gap-2">
              <span>🌾</span>
              <span>{cropType}</span>
            </div>
            <span className="text-[10px] text-[#1b7e45] font-semibold mt-1 block">
              {isHi ? 'समर्थन मूल्य: ₹2,400 / क्विंटल' : 'MSP Rate: ₹2,400 / Quintal'}
            </span>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-[11px] font-semibold text-[#5c7a6b] block mb-1">
              {isHi ? 'अनुमानित मात्रा (क्विंटल)' : 'Estimated Quantity (Quintal)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="120"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-[#cadcd1] rounded-xl px-3 py-2 text-sm font-bold text-[#133726] focus:outline-none focus:ring-2 focus:ring-[#1b7e45]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#638072] font-semibold pointer-events-none">
                {isHi ? 'क्विंटल' : 'Quintal'}
              </span>
            </div>
            <span className="text-[10px] text-[#6b8b7a] mt-1 block">
              {isHi ? 'पंजीकृत सीमा: अधिकतम 120 क्विंटल' : 'Registered Cap: Max 120 Q'}
            </span>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="text-[11px] font-semibold text-[#5c7a6b] block mb-1">
              {isHi ? 'ट्रैक्टर / वाहन क्रमांक' : 'Tractor / Vehicle Plate #'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                className="w-full bg-white border border-[#cadcd1] rounded-xl px-3 py-2 text-sm font-bold text-[#133726] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#1b7e45]"
              />
              <Tractor className="w-4 h-4 text-[#638072] absolute right-3 top-2.5" />
            </div>
            <span className="text-[10px] text-[#1b7e45] font-semibold mt-1 block">
              {isHi ? 'ई-परमिट अधिकृत' : 'E-Permit Authorized'}
            </span>
          </div>

          {/* Primary Action Button */}
          <div>
            <button
              onClick={handleBookSlot}
              disabled={isSubmitting}
              className="w-full bg-[#1b4d3e] hover:bg-[#153f33] disabled:bg-[#7b9c8d] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-[#88f0bc]" />
              <span>
                {isSubmitting
                  ? (isHi ? 'स्लॉट बुक हो रहा है...' : 'Booking Slot...')
                  : (isHi ? 'स्लॉट बुक करें एवं टोकन प्राप्त करें' : 'Book Slot & Get E-Token')}
              </span>
            </button>
            <span className="text-[9.5px] text-[#688577] text-center block mt-1">
              {isHi ? 'OTP सत्यापन युक्त पंजीकृत मोबाइल पर प्रेषित होगा' : 'Sent via SMS to registered mobile number'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
