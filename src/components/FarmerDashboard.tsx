import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Banknote, 
  Tractor, 
  FileCheck2, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Bell,
  X,
  Send,
  Phone,
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Language, FarmerProfile, MandiSlot } from '../types';
import { openRealWhatsApp } from '../utils/whatsapp';

interface FarmerDashboardProps {
  lang: Language;
  farmer: FarmerProfile | null;
  slot: MandiSlot | null;
  onNavigate: (tab: string) => void;
  onOpenDocuments: () => void;
  onOpenPayments: () => void;
  onOpenReschedule: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  lang,
  farmer,
  slot,
  onNavigate,
  onOpenDocuments,
  onOpenPayments,
  onOpenReschedule,
}) => {
  const isHi = lang === 'hi';

  const [directive, setDirective] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState<boolean>(false);
  const [activeMsgTab, setActiveMsgTab] = useState<'all' | 'whatsapp' | 'sms'>('all');
  const [newAlertToast, setNewAlertToast] = useState<any | null>(null);
  const [autoOpenWhatsApp, setAutoOpenWhatsApp] = useState<boolean>(true);

  // Poll for latest Mandi Operator Directive and WhatsApp/SMS Messages
  const fetchDirectiveAndNotifs = async () => {
    try {
      // 1. Fetch live yard directive (for orange box)
      const resDir = await fetch('/api/queue/directive');
      const dataDir = await resDir.json();
      if (dataDir.success && dataDir.directive) {
        setDirective(dataDir.directive);
      }

      // 2. Fetch notifications for this farmer
      const farmerId = farmer?.id || '';
      const phone = farmer?.phone || '';
      const resNotif = await fetch(`/api/farmer/notifications?farmerId=${farmerId}&phone=${phone}`);
      const dataNotif = await resNotif.json();
      if (dataNotif.success && Array.isArray(dataNotif.notifications)) {
        setNotifications((prev) => {
          if (prev.length > 0 && dataNotif.notifications.length > prev.length) {
            const latest = dataNotif.notifications[0];
            setNewAlertToast(latest);
            setTimeout(() => setNewAlertToast(null), 12000);
            if (autoOpenWhatsApp && latest.type === 'whatsapp') {
              openRealWhatsApp(latest.phone, latest.message);
            }
          }
          return dataNotif.notifications;
        });
      }
    } catch (err) {
      console.error('Failed to fetch directive/notifs:', err);
    }
  };

  useEffect(() => {
    fetchDirectiveAndNotifs();
    const interval = setInterval(fetchDirectiveAndNotifs, 3000);
    return () => clearInterval(interval);
  }, [farmer?.id, farmer?.phone]);

  // Compute dynamic rate and values from actual registered farmer consignment
  const crop = farmer?.registeredCrop || slot?.cropName || 'गेहूँ (शरबती)';
  const qty = farmer?.registeredQuantityLimit || slot?.quantityQuintal || 45;
  let rate = 2600;
  if (crop.includes('चना') || crop.toLowerCase().includes('gram')) rate = 5440;
  else if (crop.includes('सरसों') || crop.toLowerCase().includes('mustard')) rate = 5650;
  else if (crop.includes('धान') || crop.toLowerCase().includes('paddy')) rate = 2400;
  const estimatedVal = rate * qty;

  const filteredNotifs = notifications.filter(n => {
    if (activeMsgTab === 'all') return true;
    return n.type === activeMsgTab;
  });

  return (
    <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl relative">
      {/* Floating incoming notification toast */}
      {newAlertToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-4 animate-bounce">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {newAlertToast.type === 'whatsapp' ? (
                <span className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  💬
                </span>
              ) : (
                <span className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  📩
                </span>
              )}
              <div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>{newAlertToast.sender}</span>
                  <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">नया संदेश</span>
                </h4>
                <span className="text-[10px] text-gray-500">{newAlertToast.timestamp}</span>
              </div>
            </div>
            <button onClick={() => setNewAlertToast(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer">✕</button>
          </div>
          <p className="text-xs text-gray-800 leading-snug font-medium mb-2.5">
            {newAlertToast.message}
          </p>
          <div className="text-[10.5px] text-emerald-700 font-semibold flex items-center justify-between border-t border-gray-100 pt-2 flex-wrap gap-2">
            <span>भेजा गया: <strong>+91 {newAlertToast.phone}</strong></span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openRealWhatsApp(newAlertToast.phone, newAlertToast.message)}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                title="वास्तविक WhatsApp ऐप पर खोलें"
              >
                <span>📲</span>
                <span>WhatsApp खोलें</span>
              </button>
              <button
                onClick={() => {
                  setNewAlertToast(null);
                  setIsMsgModalOpen(true);
                }}
                className="text-xs text-[#1b7e45] underline font-bold cursor-pointer"
              >
                पूरा इनबॉक्स →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Greeting & Date */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b7e45] animate-pulse"></span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#143224] tracking-tight">
            {isHi ? `नमस्ते, ${farmer?.nameHi || 'किसान'} जी` : `Welcome, ${farmer?.nameEn || 'Farmer'}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp & SMS Inbox Trigger Button */}
          <button
            onClick={() => setIsMsgModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>💬 {isHi ? 'किसान संदेश (WhatsApp & SMS)' : 'Farmer Alerts'}</span>
            {notifications.length > 0 && (
              <span className="bg-white text-[#128C7E] text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Registered Mobile Verification & WhatsApp Trigger Bar */}
      <div className="bg-[#eef8f2] border border-[#a8dec0] rounded-2xl p-3 sm:p-3.5 mb-5 flex items-center justify-between flex-wrap gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#14532d]">
                {isHi ? 'पंजीकृत मोबाइल नंबर:' : 'Registered Mobile:'}
              </span>
              <span className="text-xs font-mono font-bold bg-white text-[#14532d] px-2 py-0.5 rounded border border-[#a8dec0]">
                +91 {farmer?.phone || '9826199999'}
              </span>
              <span className="text-[10px] font-bold bg-[#25D366]/20 text-[#065f46] px-1.5 py-0.2 rounded">
                WhatsApp लिंक्ड ✓
              </span>
            </div>
            <p className="text-[10.5px] text-[#2c8352] mt-0.5">
              {isHi
                ? 'मंडी ऑपरेटर द्वारा जारी सभी निर्देश और पावती सीधे इस नंबर के WhatsApp पर प्रेषित होते हैं।'
                : 'All Mandi directives and receipts are dispatched to this WhatsApp number.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-[#14532d] font-semibold cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-[#cfe0d5] shadow-2xs">
            <input
              type="checkbox"
              checked={autoOpenWhatsApp}
              onChange={(e) => setAutoOpenWhatsApp(e.target.checked)}
              className="accent-[#1b7e45] cursor-pointer"
            />
            <span>{isHi ? 'निर्देश आने पर स्वतः WhatsApp खोलें' : 'Auto-launch WhatsApp'}</span>
          </label>

          <button
            onClick={() => {
              const testMsg = `🌾 AnnDwar - Kisan se Desh Tak 🌾\nनमस्ते ${farmer?.nameHi || 'किसान भाई'}, यह आपके पंजीकृत मोबाइल (+91 ${farmer?.phone || '9826199999'}) पर पुष्टि संदेश है। आपका टोकन #${slot?.tokenNumber || 'MP-88210'} सक्रिय है। हेल्पलाइन: 1800-180-1551।`;
              openRealWhatsApp(farmer?.phone || '9826199999', testMsg);
            }}
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            title="पंजीकृत मोबाइल पर तुरंत WhatsApp टेस्ट करें"
          >
            <span>📲</span>
            <span>{isHi ? 'टेस्ट WhatsApp भेजें' : 'Send Test WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* LIVE LIGHT ORANGE DIRECTIVE BOX (Mandi Operator Live Command with Dark Orange Border) */}
      <div className="bg-[#fff9f4] rounded-3xl p-5 sm:p-6 text-[#7c2d12] shadow-md border-2 border-[#ea580c] mb-6 relative overflow-hidden animate-fadeIn">
        {/* Soft Ambient Tint */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-200/40 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ea580c]"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-[#9a3412] px-3 py-1 rounded-full border border-orange-300 flex items-center gap-1.5">
              <span>📢</span>
              <span>{isHi ? 'मंडी ऑपरेटर लाइव निर्देश' : 'Mandi Operator Live Directive'}</span>
            </span>
            {directive?.scaleNumber && (
              <span className="text-xs font-black bg-[#ea580c] text-white px-3 py-1 rounded-full shadow-xs">
                🎯 {directive.scaleNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#9a3412] font-mono bg-orange-100/90 border border-orange-200 px-2.5 py-0.5 rounded-lg">
              🕒 {directive?.time || 'अभी'}
            </span>

            {/* DIRECT REAL WHATSAPP BUTTON */}
            <button
              onClick={() => {
                const directiveText = directive?.textHi || `टोकन #${slot?.tokenNumber || 'MP-88210'}: स्लॉट पुष्ट हुआ! निर्धारित समय पर ${slot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'} के ${slot?.gateNumber || 'गेट क्र. 02'} पर पहुंचें।`;
                const fullMsg = `🌾 AnnDwar - Kisan se Desh Tak 🌾\nनमस्ते ${farmer?.nameHi || 'किसान भाई'}, मंडी ऑपरेटर का लाइव निर्देश:\n\n📢 "${directiveText}"\n\nटोकन: #${slot?.tokenNumber || 'MP-88210'}\nवाहन: ${slot?.vehicleNumber || farmer?.vehicleNumber || 'MP-09-GE-4102'}\nकेंद्र: ${slot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'}`;
                openRealWhatsApp(farmer?.phone || '9826199999', fullMsg);
              }}
              className="text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              title={isHi ? 'वास्तविक WhatsApp पर खोलें' : 'Open in Real WhatsApp'}
            >
              <span>📲</span>
              <span>{isHi ? 'असली WhatsApp पर खोलें' : 'Open in Real WhatsApp'}</span>
            </button>

            <button
              onClick={() => setIsMsgModalOpen(true)}
              className="text-xs font-bold bg-white hover:bg-orange-50 text-[#c2410c] border border-orange-300 px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>💬</span>
              <span>{isHi ? 'संदेश देखें' : 'View Messages'}</span>
              {notifications.length > 0 && (
                <span className="bg-[#ea580c] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg lg:text-xl font-black leading-snug tracking-tight text-[#7c2d12]">
            {directive?.textHi || `टोकन #${slot?.tokenNumber || 'MP-88210'}: स्लॉट पुष्ट हुआ! निर्धारित समय पर ${slot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'} के ${slot?.gateNumber || 'गेट क्र. 02'} पर पहुंचें।`}
          </h3>
          {directive?.textEn && (
            <p className="text-xs text-[#9a3412] font-semibold">
              {directive.textEn}
            </p>
          )}
        </div>

        {/* Live Notification Verification Badges */}
        <div className="flex items-center gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-orange-200 text-xs font-semibold flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-orange-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[#128C7E] font-bold">💬 WhatsApp:</span>
            <span className="text-gray-900 font-mono">+91 {farmer?.phone || '9826199999'}</span>
            <span className="text-emerald-700 text-[11px] font-bold">✓ प्रेषित</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-orange-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-sky-700 font-bold">📩 SMS (VM-ANNDWR):</span>
            <span className="text-gray-900 font-mono">+91 {farmer?.phone || '9826199999'}</span>
            <span className="text-sky-700 text-[11px] font-bold">✓ प्रेषित</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-orange-200/90 px-3 py-1.5 rounded-xl shadow-2xs font-mono ml-auto">
            <span className="text-[#9a3412] font-semibold">🚜 वाहन:</span>
            <span className="text-gray-900 font-bold">{slot?.vehicleNumber || farmer?.vehicleNumber || 'MP-09-GE-4102'}</span>
          </div>
        </div>
      </div>

      {/* Section 1: चयनित: आज का स्लॉट एवं समय विवरण */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#1a3828] mb-3">
          {isHi ? 'चयनित: आज का स्लॉट एवं समय विवरण' : 'Selected: Today Slot & Time Details'}
        </h3>

        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-[#e6ede7]">
            {/* Column 1: Allocated Time */}
            <div className="flex flex-col justify-center">
              <span className="text-[11px] text-[#637d70] font-medium">
                {isHi ? 'आवंटित समय' : 'Allocated Time'}
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-[#113222] mt-0.5">
                {slot?.timeSlot || '11:00 AM – 12:30 PM'}
              </div>
              <p className="text-[11px] text-[#2c8352] font-medium mt-1 flex items-center gap-1">
                <span>{isHi ? '15 मिनट पूर्व पहुंचना सुनिश्चित करें' : 'Ensure arrival 15 min prior'}</span>
              </p>
            </div>

            {/* Column 2: Procurement Center & Gate */}
            <div className="pt-3 md:pt-0 md:pl-6 flex flex-col justify-center">
              <span className="text-[11px] text-[#637d70] font-medium">
                {isHi ? 'उपार्जन केंद्र व गेट' : 'Procurement Centre & Gate'}
              </span>
              <div className="text-base sm:text-lg font-bold text-[#143525] mt-0.5">
                {slot?.mandiCenterName || 'सांवेर उपार्जन केंद्र'}
              </div>
              <p className="text-[11px] text-[#4f6e5e] font-medium mt-0.5">
                {slot?.gateNumber || 'गेट क्र. 02'} ({slot?.laneNumber || 'ट्रॉली लेन'})
              </p>
            </div>

            {/* Column 3: Token ID */}
            <div className="pt-3 md:pt-0 md:pl-6 flex flex-col justify-center">
              <span className="text-[11px] text-[#637d70] font-medium">
                {isHi ? 'टोकन पहचान' : 'Token Identification'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] px-1.5 py-0.5 rounded">
                  {isHi ? 'सत्यापित' : 'Verified'}
                </span>
                <span className="text-sm sm:text-base font-mono font-bold text-[#113222]">
                  {slot?.tokenNumber || 'SAN-88210'}
                </span>
              </div>
              <button
                onClick={() => onNavigate('live_queue')}
                className="text-[11px] text-[#1b7e45] hover:underline font-semibold mt-1 flex items-center gap-1 cursor-pointer"
              >
                <span>{isHi ? 'लाइव कतार में अपनी स्थिति देखें' : 'View live queue position'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: उपार्जन सेवाएं व विवरण */}
      <div>
        <h3 className="text-sm font-bold text-[#1a3828] mb-3">
          {isHi ? 'उपार्जन सेवाएं व विवरण' : 'Procurement Services & Details'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: आज का स्लॉट एवं समय */}
          <div 
            onClick={() => onNavigate('slot_booking')}
            className="bg-white rounded-xl p-4 border border-[#d5e2d9] hover:border-[#1b7e45] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#eaf4ee] text-[#1b4d3e] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#1b7e45]" />
              </div>
              <span className="text-[10px] font-bold bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] px-2 py-0.5 rounded-full">
                {isHi ? 'सक्रिय' : 'Active'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-[#183626] block">
                {isHi ? '१. आज का स्लॉट एवं समय' : '1. Today Slot & Time'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edf3ee]">
                <span className="text-xs font-bold text-[#183626]">
                  {slot?.timeSlot || '11:00 AM – 12:30 PM'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#1b7e45]" />
              </div>
            </div>
          </div>

          {/* Card 2: मूल्य एवं अनुमानित भुगतान */}
          <div 
            onClick={onOpenPayments}
            className="bg-white rounded-xl p-4 border border-[#d5e2d9] hover:border-[#1b7e45] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef7f1] text-[#1b4d3e] flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[#1b7e45]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#7b9887] group-hover:text-[#1b7e45] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#183626] block">
                {isHi ? '२. मूल्य एवं अनुमानित भुगतान' : '2. MSP Rate & Estimated Value'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edf3ee]">
                <span className="text-xs text-[#597566] font-medium">₹{rate.toLocaleString('en-IN')} / क्विंटल</span>
                <span className="text-xs font-bold text-[#113524]">₹{estimatedVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Card 3: फसल एवं वाहन विवरण */}
          <div 
            onClick={() => onNavigate('slot_booking')}
            className="bg-white rounded-xl p-4 border border-[#d5e2d9] hover:border-[#1b7e45] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef7f1] text-[#1b4d3e] flex items-center justify-center">
                <Tractor className="w-5 h-5 text-[#1b7e45]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#7b9887] group-hover:text-[#1b7e45] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#183626] block">
                {isHi ? '३. फसल एवं वाहन विवरण' : '3. Crop & Vehicle Details'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edf3ee]">
                <span className="text-xs font-bold text-[#183626]">
                  {crop} ({qty} क्विंटल)
                </span>
                <span className="text-xs font-mono text-[#526f60]">
                  {slot?.vehicleNumber || farmer?.vehicleNumber || 'MP 09 AB 4512'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: दस्तावेज व चेकलिस्ट */}
          <div 
            onClick={onOpenDocuments}
            className="bg-white rounded-xl p-4 border border-[#d5e2d9] hover:border-[#1b7e45] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef7f1] text-[#1b4d3e] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-[#1b7e45]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#7b9887] group-hover:text-[#1b7e45] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#183626] block">
                {isHi ? '४. दस्तावेज व चेकलिस्ट' : '4. Documents & Checklist'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edf3ee]">
                <span className="text-xs font-bold text-[#1b7e45]">4/4 पूर्ण (सत्यापित)</span>
                <span className="text-xs text-[#526f60]">आधार व RC</span>
              </div>
            </div>
          </div>

          {/* Card 5: नजदीकी मंडी लाइव */}
          <div 
            onClick={() => onNavigate('live_queue')}
            className="bg-white rounded-xl p-4 border border-[#d5e2d9] hover:border-[#1b7e45] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef7f1] text-[#1b4d3e] flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#1b7e45]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#7b9887] group-hover:text-[#1b7e45] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#183626] block">
                {isHi ? '५. नजदीकी मंडी लाइव' : '5. Nearest Mandi Live'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edf3ee]">
                <span className="text-xs font-bold text-[#183626]">
                  {isHi ? '14 वाहन कतार में' : '14 vehicles in queue'}
                </span>
                <span className="text-[10px] font-bold text-[#1b7e45] bg-[#e3f7ec] px-1.5 py-0.5 rounded">
                  {isHi ? 'सुचारू' : 'Smooth'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: त्वरित सहायता / री-शेड्यूल */}
          <div 
            onClick={onOpenReschedule}
            className="bg-gradient-to-br from-[#fbfdfb] to-[#f2f7f3] rounded-xl p-4 border border-[#d2ded5] hover:border-[#1b7e45] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#e3efe6] text-[#1b4d3e] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#1b4d3e]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#7b9887] group-hover:text-[#1b7e45] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#183626] block">
                {isHi ? '६. स्मार्ट री-शेड्यूल इंजन' : '6. Smart Auto-Rescheduling'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e2ece5]">
                <span className="text-xs text-[#486b59]">
                  {isHi ? 'मौसम या स्लॉट परिवर्तन' : 'Weather or slot change'}
                </span>
                <span className="text-xs font-semibold text-[#1b7e45]">
                  {isHi ? 'विकल्प देखें' : 'Options'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp & SMS Messages Modal */}
      {isMsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#1b4d3e] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center text-lg font-bold shadow-xs">
                  💬
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                    <span>{isHi ? 'किसान संदेश अलर्ट' : 'Farmer Alert Messages'}</span>
                    <span className="text-[10px] bg-emerald-700 text-emerald-100 font-semibold px-2 py-0.5 rounded-full border border-emerald-500">
                      AnnDwar - Kisan se Desh Tak
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    पंजीकृत मोबाइल: <strong className="font-mono text-white">+91 {farmer?.phone || '9826199999'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMsgModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Header Tabs */}
            <div className="flex items-center gap-2 p-3 bg-[#f8faf8] border-b border-gray-200 text-xs font-bold">
              <button
                onClick={() => setActiveMsgTab('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeMsgTab === 'all'
                    ? 'bg-[#1b4d3e] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                सभी संदेश ({notifications.length})
              </button>
              <button
                onClick={() => setActiveMsgTab('whatsapp')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  activeMsgTab === 'whatsapp'
                    ? 'bg-[#25D366] text-white shadow-xs'
                    : 'bg-white text-[#128C7E] border border-[#25D366]/40 hover:bg-emerald-50'
                }`}
              >
                <span>💬 WhatsApp</span>
                <span>({notifications.filter(n => n.type === 'whatsapp').length})</span>
              </button>
              <button
                onClick={() => setActiveMsgTab('sms')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  activeMsgTab === 'sms'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-sky-700 border border-sky-300 hover:bg-sky-50'
                }`}
              >
                <span>📩 SMS</span>
                <span>({notifications.filter(n => n.type === 'sms').length})</span>
              </button>
            </div>

            {/* Message Feed Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#f0f4f1]">
              {filteredNotifs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-2">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold">कोई संदेश उपलब्ध नहीं है</p>
                  <p className="text-xs mt-1 text-gray-400">जैसे ही मंडी ऑपरेटर कोई निर्देश जारी करेगा, यहाँ SMS व WhatsApp संदेश दिखाई देगा।</p>
                </div>
              ) : (
                filteredNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-2xl p-4 shadow-xs border transition-all ${
                      n.type === 'whatsapp'
                        ? 'bg-[#e7f7ed] border-[#b9e6c9]'
                        : 'bg-white border-[#d2dfd6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200/60">
                      <div className="flex items-center gap-2">
                        {n.type === 'whatsapp' ? (
                          <span className="text-xs font-bold text-[#128C7E] bg-white px-2 py-0.5 rounded-md border border-[#25D366]/40 flex items-center gap-1">
                            <span>💬 WhatsApp:</span>
                            <strong className="text-gray-900">{n.sender}</strong>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                            <span>📩 SMS Sender:</span>
                            <strong className="text-gray-900">{n.sender}</strong>
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                          वितरित ✓✓
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between flex-wrap gap-2 text-[10.5px] text-gray-500">
                      <span>प्राप्तकर्ता: +91 {n.phone} ({n.farmerName})</span>
                      <div className="flex items-center gap-2">
                        {n.type === 'whatsapp' && (
                          <button
                            onClick={() => openRealWhatsApp(n.phone, n.message)}
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                            title="वास्तविक WhatsApp ऐप पर खोलें"
                          >
                            <span>📲</span>
                            <span>असली WhatsApp पर खोलें</span>
                          </button>
                        )}
                        <span className="font-semibold text-emerald-700">AnnDwar - Kisan se Desh Tak</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>हेल्पलाइन: 1800-180-1551</span>
              <button
                onClick={() => setIsMsgModalOpen(false)}
                className="px-4 py-1.5 bg-[#1b4d3e] text-white font-bold rounded-xl hover:bg-[#153e32] cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
