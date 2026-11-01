import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, Clock, CloudSun, CheckCircle2, TrendingDown, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, MandiSlot } from '../types';

interface SmartRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentSlot: MandiSlot | null;
  onRescheduleSuccess: (updatedSlot: MandiSlot) => void;
}

export const SmartRescheduleModal: React.FC<SmartRescheduleModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentSlot,
  onRescheduleSuccess,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const options = [
    {
      id: 1,
      isBest: true,
      badgeHi: '⭐ AI अनुशंसित (न्यूनतम प्रतीक्षा)',
      badgeEn: '⭐ AI Top Recommendation',
      date: '27 अक्टूबर 2025',
      dateEn: '27 October 2025',
      timeSlot: '09:00 AM - 10:30 AM',
      mandi: 'सांवेर उपार्जन केंद्र',
      mandiEn: 'Sanwer Procurement Centre',
      weather: 'खिली धूप (0% वर्षा संभावना)',
      weatherEn: 'Clear Sunny (0% Rain Risk)',
      wait: 'मात्र 12 मिनट',
      waitEn: 'Only 12 min wait',
      timeSaved: '43 मिनट की बचत',
      timeSavedEn: 'Save 43 mins',
      congestion: '18% अति-सुगम',
      congestionEn: '18% Low Congestion',
      vacant: '42 रिक्त स्थान',
      vacantEn: '42 vacant spots',
    },
    {
      id: 2,
      isBest: false,
      badgeHi: 'अनुकूल विकल्प',
      badgeEn: 'Alternate Slot',
      date: '28 अक्टूबर 2025',
      dateEn: '28 October 2025',
      timeSlot: '11:00 AM - 12:30 PM',
      mandi: 'सांवेर उपार्जन केंद्र',
      mandiEn: 'Sanwer Procurement Centre',
      weather: 'साफ मौसम (5% वर्षा)',
      weatherEn: 'Clear Weather (5% Rain)',
      wait: '~20 मिनट',
      waitEn: '~20 min wait',
      timeSaved: '35 मिनट की बचत',
      timeSavedEn: 'Save 35 mins',
      congestion: '28% सुगम',
      congestionEn: '28% Moderate',
      vacant: '85 रिक्त स्थान',
      vacantEn: '85 vacant spots',
    },
    {
      id: 3,
      isBest: false,
      badgeHi: 'नजदीकी केंद्र',
      badgeEn: 'Nearby Hub',
      date: '27 अक्टूबर 2025',
      dateEn: '27 October 2025',
      timeSlot: '02:00 PM - 03:30 PM',
      mandi: 'धार नाका उपार्जन केंद्र (नजदीकी)',
      mandiEn: 'Dhar Naka Centre (Nearby alternate)',
      weather: 'धूप खिली रहेगी',
      weatherEn: 'Sunny Day',
      wait: '~15 मिनट (तत्काल खाली)',
      waitEn: '~15 min wait',
      timeSaved: '40 मिनट की बचत',
      timeSavedEn: 'Save 40 mins',
      congestion: '22% सुगम',
      congestionEn: '22% Moderate',
      vacant: '19 रिक्त स्थान',
      vacantEn: '19 vacant spots',
    },
  ];

  const handleConfirmReschedule = async () => {
    setIsProcessing(true);
    const chosen = options.find((o) => o.id === selectedOption) || options[0];
    try {
      const res = await fetch('/api/slots/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: chosen.date,
          newTimeSlot: chosen.timeSlot,
          newMandi: chosen.mandi,
          isAiSuggested: chosen.isBest,
        }),
      });
      const data = await res.json();
      if (data.success && data.slot) {
        setSuccessMsg(
          isHi 
            ? 'स्लॉट सफलतापूर्वक री-शेड्यूल हुआ! पंजीकृत मोबाइल पर SMS/WhatsApp प्रेषित किया गया।'
            : 'Slot rescheduled successfully! SMS/WhatsApp alert sent to registered mobile.'
        );
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          onRescheduleSuccess(data.slot);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to reschedule:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#cbdcd0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-[#1b4d3e] to-[#256349] text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-[#88f0bc] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">
                  {isHi ? 'AI स्मार्ट री-शेड्यूलिंग एवं पूर्वानुमान' : 'AI Smart Rescheduling & Predictions'}
                </h3>
                <span className="text-[10px] font-extrabold bg-[#88f0bc] text-[#0f3825] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Live
                </span>
              </div>
              <p className="text-xs text-[#b7ded0] mt-0.5">
                {isHi
                  ? 'मौसम, यार्ड भीड़भाड़ व कतार समय के वास्तविक विश्लेषण पर आधारित सुझाव'
                  : 'Predictive suggestions based on weather, yard congestion & wait time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Slot Info Bar */}
        <div className="p-4 bg-[#f4f8f5] border-b border-[#dbe6df] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10.5px] text-[#557766] block font-medium">
              {isHi ? 'वर्तमान में बुक स्लॉट:' : 'Currently Booked Slot:'}
            </span>
            <span className="font-bold text-[#143525]">
              {currentSlot?.date || '27 अक्टूबर 2025'} • {currentSlot?.timeSlot || '11:00 AM - 12:30 PM'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono font-semibold text-[#1b7e45] bg-[#e3f7ec] px-2.5 py-1 rounded-lg border border-[#a8e3c1]">
              टोकन: {currentSlot?.tokenNumber || 'MP-2849'}
            </span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="m-4 mb-0 p-3 bg-[#e8f8ee] border border-[#a0e4b8] rounded-xl flex items-center gap-2 text-xs text-[#136b35] font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#1b7e45] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Recommended Slots List */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#153b28]">
              {isHi ? 'AI सुझाये गए अनुकूल स्लॉट (एक का चयन करें):' : 'AI Suggested Optimal Slots (Select one):'}
            </label>
            <span className="text-[11px] text-[#1b7e45] font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {isHi ? 'तत्काल पुष्टि' : 'Instant Confirmation'}
            </span>
          </div>

          {options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#f4fcf6] border-2 border-[#1b7e45] shadow-md ring-2 ring-[#1b7e45]/20'
                    : 'bg-white border-[#d5e2d9] hover:border-[#a0cbaf] shadow-xs'
                }`}
              >
                {/* Best Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    opt.isBest
                      ? 'bg-[#1b7e45] text-white shadow-2xs'
                      : 'bg-[#eef5f1] text-[#33614a] border border-[#cfded6]'
                  }`}>
                    {isHi ? opt.badgeHi : opt.badgeEn}
                  </span>

                  <span className="text-[11px] font-bold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-[#b45309]" />
                    {isHi ? opt.timeSaved : opt.timeSavedEn}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#1b7e45] bg-[#1b7e45]' : 'border-[#b6cec1]'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="font-extrabold text-sm sm:text-base text-[#143425]">
                      {isHi ? opt.date : opt.dateEn} • {opt.timeSlot}
                    </div>
                    <div className="text-xs text-[#4f6f5f] mt-0.5 font-medium">
                      🏢 {isHi ? opt.mandi : opt.mandiEn}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#edf4ef] text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#719181]">{isHi ? 'मौसम पूर्वानुमान' : 'Weather'}</span>
                        <span className="font-bold text-[#143425] flex items-center gap-1 mt-0.5">
                          <CloudSun className="w-3.5 h-3.5 text-[#d97706]" />
                          <span>{isHi ? opt.weather : opt.weatherEn}</span>
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#719181]">{isHi ? 'कतार प्रतीक्षा' : 'Queue Wait'}</span>
                        <span className="font-bold text-[#1b7e45] mt-0.5">
                          ⏱️ {isHi ? opt.wait : opt.waitEn}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#719181]">{isHi ? 'भीड़भाड़ इंडेक्स' : 'Congestion'}</span>
                        <span className="font-bold text-[#1b7e45] mt-0.5">
                          📉 {isHi ? opt.congestion : opt.congestionEn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#f8faf8] border-t border-[#e3ece6] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-[#527764] hover:underline font-bold cursor-pointer"
          >
            {isHi ? 'रद्द करें (Cancel)' : 'Cancel'}
          </button>

          <button
            onClick={handleConfirmReschedule}
            disabled={isProcessing}
            className="bg-[#1b4d3e] hover:bg-[#153f33] disabled:bg-[#7b9c8d] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#88f0bc] ${isProcessing ? 'animate-spin' : ''}`} />
            <span>
              {isProcessing
                ? (isHi ? 'री-शेड्यूल हो रहा है...' : 'Updating...')
                : (isHi ? 'AI स्लॉट लागू करें (Confirm Reschedule)' : 'Apply AI Reschedule')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
